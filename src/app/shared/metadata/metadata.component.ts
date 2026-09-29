import { Component, Input } from "@angular/core";
import { ObjectLearning } from "../../core/interfaces/ObjectLearning";
import { hasValidDateValue } from "src/app/core/utils/date.utils";
import { normalizeText } from "src/app/core/utils/string.utils";

interface MetadataRow {
  label: string;
  value: unknown;
  fallback?: string;
  emphasis?: boolean;
  date?: unknown;
}

interface MetadataSection {
  key: string;
  title: string;
  rows: MetadataRow[];
}

@Component({
    selector: "app-metadata",
    templateUrl: "./metadata.component.html",
    styleUrls: ["./metadata.component.scss"],
    standalone: false
})
/**
 * Vista compartida para presentar el bloque completo de metadatos de un OA.
 *
 * Normaliza secciones heterogeneas del modelo `ObjectLearning` en una estructura
 * uniforme para que public y admin reutilicen el mismo layout de lectura.
 */
export class MetadataComponent {
  @Input() learningobjectdetail!: ObjectLearning;

  /**
   * Convierte el detalle del OA en secciones visuales estables para el template.
   */
  get metadataSections(): MetadataSection[] {
    const metadata = this.learningobjectdetail ?? ({} as ObjectLearning);

    return [
      {
        key: "general",
        title: "General",
        rows: [
          { label: "Catalog", value: metadata.general_catalog },
          { label: "Coverage", value: metadata.general_coverage },
          { label: "Entry", value: metadata.general_entry },
          { label: "Keyword", value: metadata.general_keyword },
          { label: "Language", value: metadata.general_language },
          { label: "Structure", value: metadata.general_structure },
        ],
      },
      {
        key: "life-cycle",
        title: "Life Cycle",
        rows: [
          {
            label: "Description",
            value: metadata.life_cycle_description,
            emphasis: true,
            date: metadata.life_cycle_dateTime,
          },
          { label: "Role", value: metadata.life_cycle_role },
          { label: "Version", value: metadata.life_cycle_version },
        ],
      },
      {
        key: "meta-metadata",
        title: "Meta-Metadata",
        rows: [
          { label: "Catalog", value: metadata.meta_metadata_catalog },
          {
            label: "Description",
            value: metadata.meta_metadata_description,
            emphasis: true,
            date: metadata.meta_metadata_dateTime,
          },
        ],
      },
      {
        key: "technical",
        title: "Technical",
        rows: [
          { label: "Description", value: metadata.technical_description },
          { label: "Format", value: metadata.technical_format },
          {
            label: "Installation remarks",
            value: metadata.technical_installationRremarks,
          },
          { label: "Location", value: metadata.technical_location },
        ],
      },
      {
        key: "educational",
        title: "Educational",
        rows: [
          { label: "Description", value: metadata.educational_description },
          { label: "Difficulty", value: metadata.educational_difficulty },
          { label: "Language", value: metadata.educational_language },
          {
            label: "Learning resource type",
            value: metadata.educational_learningResourceType,
          },
          {
            label: "Procces cognitve",
            value: metadata.educational_procces_cognitve,
          },
          {
            label: "Typical age range",
            value: metadata.educational_typicalAgeRange,
          },
          {
            label: "Typical learning time",
            value: metadata.educational_typicalLearningTime_description,
          },
        ],
      },
      {
        key: "rights",
        title: "Rights",
        rows: [
          {
            label: "Copyright and other restrictions",
            value: metadata.rights_copyrightAndOtherRestrictions,
          },
          { label: "Cost", value: metadata.rights_cost },
        ],
      },
      {
        key: "annotation",
        title: "Annotation",
        rows: [
          {
            label: "Annotation date",
            value: metadata.annotation_date_description,
            emphasis: true,
            date: metadata.annotation_date_dateTime,
          },
          { label: "Description", value: metadata.annotation_description },
          { label: "Entity", value: metadata.annotation_entity },
          { label: "Modeaccess", value: metadata.annotation_modeaccess },
          {
            label: "Modeaccess sufficient",
            value: metadata.annotation_modeaccesssufficient,
          },
          { label: "Rol", value: metadata.annotation_rol },
        ],
      },
      {
        key: "relation",
        title: "Relation",
        rows: [
          { label: "Catalog", value: metadata.relation_catalog },
          { label: "Description", value: metadata.relation_description },
          { label: "Kind", value: metadata.relation_kind },
          { label: "Entry", value: metadata.relation_entry },
        ],
      },
      {
        key: "classification",
        title: "Classification",
        rows: [
          { label: "Description", value: metadata.classification_description },
          { label: "Keyword", value: metadata.classification_keyword },
          { label: "Purpose", value: metadata.classification_purpose },
          {
            label: "TaxonPath_source",
            value: metadata.classification_taxonPath_source,
          },
          {
            label: "TaxonPath_taxon",
            value: metadata.classification_taxonPath_taxon,
          },
        ],
      },
      {
        key: "accessibility",
        title: "Accessibility",
        rows: [
          { label: "Summary", value: metadata.accesibility_summary },
          { label: "Features", value: metadata.accesibility_features },
          { label: "Hazard", value: metadata.accesibility_hazard },
          { label: "Control", value: metadata.accesibility_control },
          { label: "Api", value: metadata.accesibility_api },
        ],
      },
    ];
  }

  /**
   * Normaliza el valor mostrado en una fila de metadatos, aplicando fallback legible.
   */
  displayValue(value: unknown, fallback = "unknown"): string {
    return normalizeText(value, fallback);
  }

  /**
   * Indica si la fila debe mostrar una fecha secundaria asociada al valor principal.
   */
  hasDisplayDate(value: unknown): boolean {
    return hasValidDateValue(value);
  }
}
