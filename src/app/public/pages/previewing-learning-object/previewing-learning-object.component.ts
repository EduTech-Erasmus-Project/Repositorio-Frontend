import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProgressSpinnerModule } from "primeng/progressspinner";

import { SharedModule } from "../../../shared/shared.module";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { IframeIntegratedMenuComponent } from "../../components/iframe-integrated-menu/iframe-integrated-menu.component";

/**
 * Renderiza el modo de previsualizacion aislada del OA, con o sin menu lateral integrado.
 *
 * Responsabilidades:
 * - Resolver el `slug` desde la ruta y cargar el detalle del OA.
 * - Exponer el estado minimo de carga para el iframe de preview.
 * - Ajustar el ancho del visor cuando la experiencia requiere menu lateral.
 */
@Component({
  selector: "app-previewing-learning-object",
  templateUrl: "./previewing-learning-object.component.html",
  styleUrls: ["./previewing-learning-object.component.scss"],
  standalone: true,
  imports: [SharedModule, ProgressSpinnerModule, IframeIntegratedMenuComponent]
})
export class PreviewingLearningObjectComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public buttonMenuBoolean = false;
  public youNeedMenu = true;
  public object?: ObjectLearning;
  public spinnerFlag = false;

  constructor(
    private route: ActivatedRoute,
    private objectService: LearningObjectService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params["slug"];

      if (!slug) {
        this.router.navigate(["/"]);
        return;
      }

      void this.loadDataLearningObject(slug);
    });
  }

  /**
   * Carga el OA que se va a previsualizar y habilita el spinner del visor.
   */
  private async loadDataLearningObject(slug: string): Promise<void> {
    this.spinnerFlag = false;

    try {
      this.object = await firstValueFrom(this.objectService.getObjectDetail(slug));
      this.spinnerFlag = true;
      this.cdr.detectChanges();
    } catch (err) {
      this.handleDetailError(err as HttpErrorResponse);
    }
  }

  private handleDetailError(err: HttpErrorResponse): void {
    this.router.navigate([err?.status === 404 ? "/notfound" : "/error"]);
  }

  /**
   * Mantiene el ancho historico del preview desktop cuando el OA necesita menu integrado.
   */
  public sizeWindowMaxValue(): string {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 1300) {
      return "";
    }

    if (!this.buttonMenuBoolean && this.youNeedMenu) {
      return "width:75%";
    }

    return "width:100%; height:100%";
  }
}
