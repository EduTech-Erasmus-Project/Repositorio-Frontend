import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";

import {
  AutomaticEvaluationView,
  ExpertEvaluationSummaryView,
  StudentEvaluationView,
} from "src/app/core/interfaces/evaluation-view";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";

type ChartMode = "experto" | "student" | "automatic" | null;

/**
 * Proyecta a grafico radar los resultados de evaluacion del OA segun el origen activo.
 *
 * Responsabilidades:
 * - Adaptar resultados experto, estudiante o automaticos a la estructura del chart.
 * - Mantener las metricas derivadas de porcentaje mostradas junto al grafico.
 * - Navegar al detalle del reporte cuando la vista lo requiere.
 */
@Component({
  selector: "app-evaluation-chart",
  templateUrl: "./evaluation-chart.component.html",
  styleUrls: ["./evaluation-chart.component.scss"],
  standalone: false
})
export class EvaluationChartComponent implements OnInit, OnChanges {
  @Input() resultEv?: ExpertEvaluationSummaryView[];
  @Input() resultsEvAut?: AutomaticEvaluationView[];
  @Input() resultsEvStudent?: StudentEvaluationView[];
  @Input() rating?: number;
  @Input() idexpe?: string;
  @Input() object!: ObjectLearning;

  public data_graf: unknown;
  public data_options: unknown;
  public ratingAutomatic = 0;
  public valueratingAutomatic = 0;
  public ratingStudent = 0;
  public valueratingStudent = 0;
  public valueratingExpert = 0;
  public valid: ChartMode = null;
  public displayWindowSchema = false;
  public valor_Intermedio = 2.5;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.rebuildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["resultEv"] ||
      changes["resultsEvAut"] ||
      changes["resultsEvStudent"] ||
      changes["rating"] ||
      changes["idexpe"]
    ) {
      this.rebuildChart();
    }
  }

  get hasExpertResults(): boolean {
    return !!this.resultEv?.length;
  }

  get hasStudentResults(): boolean {
    return !!this.resultsEvStudent?.length;
  }

  get hasAutomaticResults(): boolean {
    return !!this.resultsEvAut?.length;
  }

  get chartHeight(): string {
    return this.valid === "automatic" ? "59vh" : "51vh";
  }

  get isAutomaticChart(): boolean {
    return this.valid === "automatic";
  }

  get chartStyle() {
    return { height: this.chartHeight, width: "100%", display: "block" };
  }

  showBasicDialogSchema(): void {
    this.displayWindowSchema = true;
  }

  navigateToReport(valid: boolean): void {
    if (valid) {
      const extras: NavigationExtras = {
        queryParams: { rstudent: true },
      };
      this.router.navigate(["/object", this.object.slug], extras);
      return;
    }

    this.router.navigate(["/object", this.object.slug]);
  }

  navigateTo(): void {
    this.router.navigate(["/object", this.object.slug]);
  }

  get is_adapted_oer() {
    return this.object.is_adapted_oer;
  }

  /**
   * Recalcula el dataset del radar cuando cambian resultados o modo de evaluacion.
   */
  private rebuildChart(): void {
    if (this.idexpe === "docente" && this.resultEv?.length) {
      this.loadExpertChart();
      return;
    }

    if (this.idexpe === "estudiante" && this.resultsEvStudent?.length) {
      this.loadStudentChart();
      return;
    }

    if (this.idexpe === "automatic" && this.resultsEvAut?.length) {
      this.loadAutomaticChart();
      return;
    }

    this.valid = null;
    this.data_graf = null;
    this.data_options = null;
  }

  private loadExpertChart(): void {
    const firstBatch = this.resultEv?.[0];
    if (!firstBatch) {
      return;
    }

    this.valid = "experto";
    this.valueratingExpert = Math.round(((this.rating || 0) * 100) / 5);
    this.data_graf = {
      labels: firstBatch.concepts.map((concept) => concept.concepto?.concept || ""),
      datasets: [
        {
          label: "Evaluacion de Accesibilidad",
          data: firstBatch.concepts.map((concept) => concept.total),
          fill: true,
          backgroundColor: "rgba(96, 127, 162, 0.2)",
          borderColor: "rgb(96, 127, 162)",
          pointBackgroundColor: "rgb(96, 127, 162)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(96, 127, 162)"
        },
      ]
    };
    this.data_options = this.buildChartOptions();
  }

  private loadStudentChart(): void {
    const firstBatch = this.resultsEvStudent?.[0];
    if (!firstBatch) {
      return;
    }

    this.valid = "student";
    this.ratingStudent = firstBatch.rating_student || 0;
    this.valueratingStudent = Math.round((this.ratingStudent * 100) / 5);
    this.data_graf = {
      labels: firstBatch.evaluation_students.map(
        (evaluation) => evaluation.evaluation_principle?.principle || ""
      ),
      datasets: [
        {
          label: "Evaluacion de Adaptabilidad",
          data: firstBatch.evaluation_students.map((evaluation) => evaluation.average_principle),
          fill: true,
          backgroundColor: "rgba(96, 127, 162, 0.2)",
          borderColor: "rgb(96, 127, 162)",
          pointBackgroundColor: "rgb(96, 127, 162)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(96, 127, 162)"
        },
      ]
    };
    this.data_options = this.buildChartOptions();
  }

  private loadAutomaticChart(): void {
    const firstBatch = this.resultsEvAut?.[0];
    if (!firstBatch) {
      return;
    }

    this.valid = "automatic";
    this.ratingAutomatic = firstBatch.rating || 0;
    this.valueratingAutomatic = Math.round((this.ratingAutomatic * 100) / 5);
    this.data_graf = {
      labels: firstBatch.metadata_concept_evaluations.map((result) => result.evaluationConcept),
      datasets: [
        {
          label: "Evaluacion Preliminar",
          data: firstBatch.metadata_concept_evaluations.map((concept) => concept.average),
          fill: true,
          backgroundColor: "rgba(96, 127, 162, 0.2)",
          borderColor: "rgb(96, 127, 162)",
          pointBackgroundColor: "rgb(96, 127, 162)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(96, 127, 162)"
        },
      ]
    };
    this.data_options = this.buildChartOptions();
  }

  private buildChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: !this.isAutomaticChart,
      scale: {
        ticks: {
          min: 0,
          max: 5,
        },
        pointLabels: {
          fontSize: 15
        }
      }
    };
  }
}
