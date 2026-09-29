import { Component, Input } from "@angular/core";
import {
  ExpertEvaluationDetailView,
  ExpertEvaluationSummaryView,
} from "src/app/core/interfaces/evaluation-view";

interface EvaluationSummaryItem {
  concept: string;
  average: number;
}

@Component({
    selector: "app-view-evaluacions",
    templateUrl: "./view-evaluacions.component.html",
    styleUrls: ["./view-evaluacions.component.css"],
    standalone: false
})
export class ViewEvaluacionsComponent {
  @Input() resultsEv: Array<ExpertEvaluationDetailView | ExpertEvaluationSummaryView> = [];
  @Input() roleExpert = false;

  get evaluationItems(): EvaluationSummaryItem[] {
    if (!Array.isArray(this.resultsEv) || this.resultsEv.length === 0) {
      return [];
    }

    if (this.roleExpert) {
      return this.resultsEv.reduce((acc: EvaluationSummaryItem[], item) => {
        const concepts = this.isExpertEvaluationDetail(item)
          ? item.conceptEvaluations.map((concept) => ({
              concept: concept.evaluationConcept ?? "",
              average: Number(concept.average ?? 0),
            }))
          : [];

        return acc.concat(concepts);
      }, []);
    }

    return this.resultsEv.reduce((acc: EvaluationSummaryItem[], item) => {
      const concepts = this.isExpertEvaluationSummary(item)
        ? item.concepts.map((concept) => ({
            concept: concept?.concepto?.concept ?? "",
            average: Number(concept?.total ?? 0),
          }))
        : [];

      return acc.concat(concepts);
    }, []);
  }

  trackByConcept(index: number, item: EvaluationSummaryItem): string {
    return `${item.concept}-${index}`;
  }

  private isExpertEvaluationDetail(
    item: ExpertEvaluationDetailView | ExpertEvaluationSummaryView
  ): item is ExpertEvaluationDetailView {
    return "conceptEvaluations" in item;
  }

  private isExpertEvaluationSummary(
    item: ExpertEvaluationDetailView | ExpertEvaluationSummaryView
  ): item is ExpertEvaluationSummaryView {
    return "concepts" in item;
  }
}
