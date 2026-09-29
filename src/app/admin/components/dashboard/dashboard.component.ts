import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdministratorService } from "src/app/services/administrator.service";
import {
  AdminDashboardLearningObjectSummary,
  AdminDashboardUserSummary,
} from "src/app/core/interfaces/api-contracts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  standalone: false,
})
/**
 * Dashboard principal de administracion.
 * Reune los contadores operativos del modulo y redirige a los listados
 * administrativos mas usados.
 */
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public total_oa_approved = 0;
  public total_oa_disapproved = 0;
  public total_expert_approved = 0;
  public total_expert_disapproved = 0;
  public total_teacher_approved = 0;
  public total_teacher_disapproved = 0;
  public total_student = 0;
  public isReady = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.loadAdminData();
  }

  /**
   * Recupera en paralelo los resumenes de objetos y usuarios del dashboard.
   */
  loadAdminData(): void {
    this.isReady = false;

    forkJoin({
      learningObjects: this.administratorService.getTotalLearningObjectApprovedAndDisapproved(),
      users: this.administratorService.getTotalTeacherAndExpert(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ learningObjects, users }) => {
          this.applyLearningObjectSummary(learningObjects);
          this.applyUserSummary(users);
          this.isReady = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.resetDashboardCounters();
          this.isReady = true;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Navega al listado asociado a cada tarjeta del tablero administrativo.
   */
  learningObjectToAprove(id: number): void {
    switch (id) {
      case 1:
        this.router.navigate(["/admin/learning-object/pending"]);
        break;
      case 2:
        this.router.navigate(["/admin/learning-object/approved"]);
        break;
      case 3:
        this.router.navigate(["/admin/teacher/request/pending"]);
        break;
      case 4:
        this.router.navigate(["/admin/teacher/request/approved"]);
        break;
      case 5:
        this.router.navigate(["/admin/student/"]);
        break;
      case 6:
        this.router.navigate(["/admin/learning-object/all"]);
        break;
      case 7:
        this.router.navigate(["/admin/expert/request/pending"]);
        break;
      case 8:
        this.router.navigate(["/admin/expert/request/approved"]);
        break;
      default:
        break;
    }
  }

  private configureBreadcrumb(): void {
    this.breadcrumbService.setItems([{ label: "Home" }]);
  }

  private applyLearningObjectSummary(summary: AdminDashboardLearningObjectSummary): void {
    this.total_oa_approved = summary?.total_oa_aproved ?? 0;
    this.total_oa_disapproved = summary?.toatal_oa_disapproved ?? 0;
  }

  private applyUserSummary(summary: AdminDashboardUserSummary): void {
    this.total_expert_approved = summary?.total_expert_approved ?? 0;
    this.total_expert_disapproved = summary?.total_expert_disapproved ?? 0;
    this.total_teacher_approved = summary?.total_teacher_approved ?? 0;
    this.total_teacher_disapproved = summary?.total_teacher_disapproved ?? 0;
    this.total_student = summary?.total_student ?? 0;
  }

  private resetDashboardCounters(): void {
    this.total_oa_approved = 0;
    this.total_oa_disapproved = 0;
    this.total_expert_approved = 0;
    this.total_expert_disapproved = 0;
    this.total_teacher_approved = 0;
    this.total_teacher_disapproved = 0;
    this.total_student = 0;
  }
}
