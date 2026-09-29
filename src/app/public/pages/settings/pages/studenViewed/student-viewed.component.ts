import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { firstValueFrom } from "rxjs";
import { LearningObjectService } from "../../../../../services/learning-object.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { ApiPaginatedResponse } from "src/app/core/interfaces/api-contracts";

interface ViewedLearningObjectItem {
  learning_object?: ObjectLearning | null;
  rating?: number;
}

@Component({
    selector: "app-student-viewed",
    templateUrl: "./student-viewed.component.html",
    styleUrls: ["./student-viewed.component.scss"],
    standalone: false
})
/**
 * Muestra el historial de OAs vistos por el usuario autenticado.
 *
 * El endpoint historicamente ha sido fragil porque puede devolver registros
 * envueltos en `results` o una lista plana; por eso el componente normaliza
 * ambas formas antes de pintar tarjetas.
 */
export class StudentViewedComponent implements OnInit {
  public objects: ObjectLearning[] = [];
  public isLoading = true;
  public loadError = false;
  public readonly skeletonItems = [1, 2, 3];

  constructor(private learningObjectService: LearningObjectService,
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
    ) {
      this.configureBreadcrumb();
    }
  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.loadError = false;
    this.cdr.detectChanges();

    try {
      const response = await firstValueFrom(this.learningObjectService.getObjectsViewed());
      this.objects = this.extractViewedEntries(response).map((item) => {
        return {
          ...item.learning_object,
          rating: item.rating,
        };
      });
    } catch (error) {
      this.objects = [];
      this.loadError = true;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async configureBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings"))},
      { label: await firstValueFrom(this.languageService.translate.get("recommended.viewed")), routerLink: ["/settings/my-views"] },
    ]);
  }

  /**
   * Normaliza respuestas legacy y paginadas del historial de vistos.
   */
  private extractViewedEntries(
    response:
      | ViewedLearningObjectItem[]
      | ApiPaginatedResponse<ViewedLearningObjectItem>
      | null
      | undefined
  ): ViewedLearningObjectItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.results ?? [];
  }

}
