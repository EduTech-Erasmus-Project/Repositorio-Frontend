import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LearningObjectPreviewItem, ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { buildLegacyManifestUrl, isLegacyManifestCandidate } from 'src/app/core/utils/learning-object-preview';

interface MenuTreeItem extends LearningObjectPreviewItem {
  nodeKey: string;
  children: MenuTreeItem[];
}

/**
 * Construye el indice navegable del OA para recursos SCORM, HTML o manifiestos legacy.
 *
 * Responsabilidades:
 * - Priorizar `preview.toc` cuando el backend ya expone el arbol del recurso.
 * - Hacer fallback a `imsmanifest.xml` para paquetes legacy.
 * - Sincronizar el recurso actualmente seleccionado con el iframe del OA.
 */
@Component({
    selector: 'app-drop-down-menu-learning-object',
    templateUrl: './drop-down-menu-learning-object.component.html',
    styleUrls: ['./drop-down-menu-learning-object.component.scss'],
    imports: [CommonModule, TranslateModule]
})
export class DropDownMenuLearningObjectComponent implements OnInit, OnChanges {
  public objectCollectionMenu: {
    title: string,
    items: MenuTreeItem[]
  } | null = null;
  public menuLoadError: boolean = false;
  public isLoadingMenu: boolean = false;
  public selectedResourcePath: string = '';
  public expandedNodeKeys = new Set<string>();
  @Input() object: ObjectLearning;
  private buildRequestId = 0;
  private legacyManifestUrl: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.buildMenu();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['object']) {
      void this.buildMenu();
    }
  }

  public onActivateItem(item: MenuTreeItem) {
    const hasChildren = !!item.children?.length;
    const hasResource = !!item.resource_path;

    if (hasChildren) {
      if (!hasResource) {
        this.toggleNode(item);
        return;
      }

      this.expandNode(item.nodeKey);
    }

    if (!hasResource) {
      return;
    }

    const previewUrl = this.buildPreviewUrl(item.resource_path);
    if (previewUrl && this.object?.learning_object_file) {
      this.object.learning_object_file.url = previewUrl;
      this.selectedResourcePath = item.resource_path;
      this.expandNode(item.nodeKey);
      this.cdr.detectChanges();
    }
  }

  public onToggleBranch(event: Event, item: MenuTreeItem) {
    event.stopPropagation();
    this.toggleNode(item);
    this.cdr.detectChanges();
  }

  public trackByResourcePath(index: number, item: MenuTreeItem) {
    return item.nodeKey || item.resource_path || `${item.title}-${index}`;
  }

  public isSelectedResource(resourcePath: string) {
    return !!resourcePath && resourcePath === this.selectedResourcePath;
  }

  public isExpanded(item: MenuTreeItem) {
    return this.expandedNodeKeys.has(item.nodeKey);
  }

  public hasSelectedDescendant(item: MenuTreeItem): boolean {
    if (!item.children?.length) {
      return false;
    }

    return item.children.some((child) => {
      return this.isSelectedResource(child.resource_path) || this.hasSelectedDescendant(child);
    });
  }

  private async buildMenu() {
    const currentRequestId = ++this.buildRequestId;
    const toc = this.object?.preview?.toc;
    const previewMode = (this.object?.preview?.mode || '').toLowerCase();
    this.legacyManifestUrl = null;
    this.menuLoadError = false;
    this.isLoadingMenu = true;
    this.expandedNodeKeys.clear();

    if (Array.isArray(toc) && toc.length > 0) {
      const menuItems = this.buildMenuItems(toc);
      this.objectCollectionMenu = {
        title: this.object?.general_title?.trim() || 'Indice del recurso',
        items: menuItems
      };
      this.syncSelectedResource(menuItems);
      this.menuLoadError = false;
      this.isLoadingMenu = false;
      this.cdr.detectChanges();
      return;
    }

    const manifestUrl = buildLegacyManifestUrl(this.object?.learning_object_file?.url);

    if (manifestUrl) {
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          throw new Error(`Manifest request failed with status ${response.status}`);
        }

        const manifestContent = await response.text();
        if (currentRequestId !== this.buildRequestId) {
          return;
        }

        const manifestMenu = this.parseManifestMenu(manifestContent);
        if (manifestMenu) {
          const menuItems = this.buildMenuItems(manifestMenu.items);
          this.legacyManifestUrl = manifestUrl;
          this.objectCollectionMenu = {
            title: manifestMenu.title,
            items: menuItems
          };
          this.syncSelectedResource(menuItems);
          this.menuLoadError = false;
          this.isLoadingMenu = false;
          this.cdr.detectChanges();
          return;
        }
      } catch {
        if (currentRequestId !== this.buildRequestId) {
          return;
        }
      }
    }

    this.objectCollectionMenu = null;
    this.selectedResourcePath = '';
    this.expandedNodeKeys.clear();
    this.menuLoadError = previewMode === 'scorm' || isLegacyManifestCandidate(this.object?.learning_object_file?.url);
    this.isLoadingMenu = false;
    this.cdr.detectChanges();
  }

  private buildPreviewUrl(resourcePath?: string): string | null {
    const baseUrl = this.object?.preview?.base_url;
    const fallbackUrl = this.object?.learning_object_file?.url;

    if (baseUrl) {
      const resourceTarget = resourcePath || this.object?.preview?.entrypoint || 'index.html';
      return new URL(resourceTarget, baseUrl).toString();
    }

    if (this.legacyManifestUrl) {
      const resourceTarget = resourcePath || 'index.html';
      return new URL(resourceTarget, this.legacyManifestUrl).toString();
    }

    if (!fallbackUrl) {
      return null;
    }

    if (!resourcePath) {
      return fallbackUrl;
    }

    const currentUrl = new URL(fallbackUrl, window.location.origin);
    const currentPath = currentUrl.pathname;
    const separatorIndex = currentPath.lastIndexOf('/');
    const basePath = separatorIndex >= 0 ? currentPath.slice(0, separatorIndex + 1) : '/';

    currentUrl.pathname = `${basePath}${resourcePath}`;
    return currentUrl.toString();
  }

  private parseManifestMenu(manifestContent: string) {
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(manifestContent, 'application/xml');
    const parserErrors = xmlDocument.getElementsByTagName('parsererror');

    if (parserErrors.length > 0) {
      return null;
    }

    const organizations = this.getElementsByTagName(xmlDocument, 'organization');
    const organization = organizations[0];

    if (!organization) {
      return null;
    }

    const manifestTitle =
      this.getDirectChildTextContent(organization, 'title') ||
      this.object?.general_title?.trim() ||
      'Indice del recurso';

    const resourceMap = this.buildManifestResourceMap(xmlDocument);
    const items = this.getDirectChildElements(organization, 'item')
      .map((item) => this.parseManifestItem(item, resourceMap))
      .filter((item): item is LearningObjectPreviewItem => item !== null);

    if (items.length === 0) {
      return null;
    }

    return {
      title: manifestTitle,
      items
    };
  }

  private syncSelectedResource(items: MenuTreeItem[]) {
    const currentUrl = this.object?.learning_object_file?.url;
    const flattenedItems = this.flattenItems(items).filter((item) => !!item.resource_path);

    if (!currentUrl) {
      this.selectedResourcePath = flattenedItems[0]?.resource_path || '';
      this.syncExpandedBranch(flattenedItems[0]?.nodeKey || '');
      return;
    }

    const currentNormalizedUrl = this.normalizeUrlForComparison(currentUrl);
    const currentItem = flattenedItems.find((item) => {
      const previewUrl = this.buildPreviewUrl(item.resource_path);
      return previewUrl && this.normalizeUrlForComparison(previewUrl) === currentNormalizedUrl;
    });

    this.selectedResourcePath = currentItem?.resource_path || flattenedItems[0]?.resource_path || '';
    this.syncExpandedBranch(currentItem?.nodeKey || flattenedItems[0]?.nodeKey || '');
  }

  private flattenItems(items: MenuTreeItem[]): MenuTreeItem[] {
    return items.reduce<MenuTreeItem[]>((accumulator, item) => {
      return accumulator.concat(item, this.flattenItems(item.children || []));
    }, []);
  }

  private buildMenuItems(items: LearningObjectPreviewItem[], parentKey: string = ''): MenuTreeItem[] {
    return items.map((item, index) => {
      const nodeKey = parentKey ? `${parentKey}-${index}` : `${index}`;
      return {
        ...item,
        nodeKey,
        children: this.buildMenuItems(item.children || [], nodeKey)
      };
    });
  }

  private toggleNode(item: MenuTreeItem) {
    if (!item.children?.length) {
      return;
    }

    if (this.expandedNodeKeys.has(item.nodeKey)) {
      this.collapseBranch(item.nodeKey);
      return;
    }

    this.expandNode(item.nodeKey);
  }

  private expandNode(nodeKey: string) {
    if (!nodeKey) {
      return;
    }

    this.expandNodePath(nodeKey);
  }

  private syncExpandedBranch(nodeKey: string) {
    this.expandedNodeKeys.clear();
    this.expandNodePath(nodeKey);
  }

  private expandNodePath(nodeKey: string) {
    const segments = nodeKey.split('-').filter((segment) => segment !== '');
    let currentKey = '';

    segments.forEach((segment, index) => {
      currentKey = index === 0 ? segment : `${currentKey}-${segment}`;
      this.closeSiblingBranches(currentKey);
      this.expandedNodeKeys.add(currentKey);
    });
  }

  private closeSiblingBranches(nodeKey: string) {
    const parentKey = this.getParentNodeKey(nodeKey);
    Array.from(this.expandedNodeKeys).forEach((expandedKey) => {
      if (expandedKey !== nodeKey && this.getParentNodeKey(expandedKey) === parentKey) {
        this.collapseBranch(expandedKey);
      }
    });
  }

  private collapseBranch(nodeKey: string) {
    Array.from(this.expandedNodeKeys).forEach((expandedKey) => {
      if (expandedKey === nodeKey || expandedKey.startsWith(`${nodeKey}-`)) {
        this.expandedNodeKeys.delete(expandedKey);
      }
    });
  }

  private getParentNodeKey(nodeKey: string) {
    const separatorIndex = nodeKey.lastIndexOf('-');
    return separatorIndex >= 0 ? nodeKey.slice(0, separatorIndex) : '';
  }

  private normalizeUrlForComparison(url: string) {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      return `${parsedUrl.origin}${parsedUrl.pathname}`.replace(/\/+$/, '');
    } catch {
      return url;
    }
  }

  private buildManifestResourceMap(xmlDocument: XMLDocument) {
    const resources = this.getElementsByTagName(xmlDocument, 'resource');
    const resourceMap = new Map<string, string>();

    resources.forEach((resource) => {
      const identifier = resource.getAttribute('identifier');
      const href = resource.getAttribute('href') || this.getFirstFileHref(resource);

      if (identifier && href) {
        resourceMap.set(identifier, href);
      }
    });

    return resourceMap;
  }

  private parseManifestItem(item: Element, resourceMap: Map<string, string>): LearningObjectPreviewItem | null {
    const title =
      this.getDirectChildTextContent(item, 'title') ||
      item.getAttribute('identifier') ||
      'Recurso';
    const identifierRef = item.getAttribute('identifierref') || '';
    const resourcePath = resourceMap.get(identifierRef) || '';
    const children = this.getDirectChildElements(item, 'item')
      .map((child) => this.parseManifestItem(child, resourceMap))
      .filter((child): child is LearningObjectPreviewItem => child !== null);

    if (!title && !resourcePath && children.length === 0) {
      return null;
    }

    return {
      title,
      resource_path: resourcePath,
      children
    };
  }

  private getFirstFileHref(resource: Element) {
    const fileElements = this.getElementsByTagName(resource, 'file');
    return fileElements[0]?.getAttribute('href') || '';
  }

  private getDirectChildTextContent(element: Element, tagName: string) {
    const directChild = this.getDirectChildElements(element, tagName)[0];
    return directChild?.textContent?.trim() || '';
  }

  private getDirectChildElements(element: Element, tagName: string) {
    return Array.from(element.children).filter((child) => child.localName === tagName);
  }

  private getElementsByTagName(parent: XMLDocument | Element, tagName: string) {
    return Array.from(parent.getElementsByTagNameNS('*', tagName));
  }
}
