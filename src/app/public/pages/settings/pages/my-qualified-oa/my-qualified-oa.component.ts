import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import { QuerySearch } from 'src/app/core/interfaces/Search';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { LanguageService } from 'src/app/services/language.service';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from 'src/app/services/login.service';
import { QuerySearchService } from 'src/app/services/query-search.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
    selector: 'app-my-qualified-oa',
    templateUrl: './my-qualified-oa.component.html',
    styleUrls: ['./my-qualified-oa.component.scss'],
    standalone: false
})
/**
 * Lista los OAs que el usuario ya califico dentro del sistema.
 *
 * El origen de datos cambia segun rol:
 * - estudiante: historial de calificaciones propias
 * - experto: busqueda filtrada por `is_evaluated=True`
 */
export class MyQualifiedOaComponent implements OnInit {

  public objects: ObjectLearning[] = [];
  public isLoading = true;
  public loadError = false;
  public readonly skeletonItems = [1, 2, 3];

  constructor(
    private searchService: SearchService,
    private loginService: LoginService,
    public querySearchService: QuerySearchService,
    private learningObjectService: LearningObjectService,
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) { 
    this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.loadData();
  }


  /**
   * Publica el breadcrumb de la bandeja de objetos calificados.
   */
  private async configureBreadcrumb() {
    const qualifiedLabelKey = this.roleExpert
      ? "menu.sideMenu.OAQualificate"
      : "menu.sideMenu.ratedMe";

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings"))},
      { label: await firstValueFrom(this.languageService.translate.get(qualifiedLabelKey)), routerLink: ["/settings/objects-qualified"] },
    ]);
  }

  /**
   * Resuelve la fuente correcta del listado segun el rol visible del usuario.
   */
  async loadData() {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.detectChanges();

    try {
      this.objects = await this.resolveQualifiedObjects();
    } catch (err) {
      this.objects = [];
      this.loadError = true;
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private async resolveQualifiedObjects(): Promise<ObjectLearning[]> {
    if (this.roleStudent) {
      const response = await firstValueFrom(this.learningObjectService.getMyObjectQualifications());
      return response.results ?? [];
    }

    if (this.roleExpert) {
      const response = await firstValueFrom(
        this.searchService.searchExpert(this.buildExpertEvaluatedQuery())
      );
      return response.results ?? [];
    }

    return [];
  }

  /**
   * Evita mutar el estado global compartido de `QuerySearchService` solo para
   * este listado derivado.
   */
  private buildExpertEvaluatedQuery(): QuerySearch {
    return {
      ...this.querySearchService.queryParams,
      is_evaluated: "True",
    };
  }

  get roleStudent() {
    return this.loginService.validateRole("student");
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

}
