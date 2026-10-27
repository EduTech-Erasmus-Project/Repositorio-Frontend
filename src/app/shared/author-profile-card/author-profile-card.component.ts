import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import {
  AcademicDegree,
  ProfileFieldVisibility,
  ProfileLink,
  ProfileVisibilityField,
  PublicAuthor,
} from "src/app/core/interfaces/PublicProfile";
import { LanguageService } from "src/app/services/language.service";

/**
 * Datos que dibuja la ficha. Cubre el perfil publico (`PublicAuthor`) y el
 * perfil completo que ve el admin, donde links y titulos traen `is_visible`.
 */
export type AuthorProfileCardData = Omit<Partial<PublicAuthor>, "links" | "degrees"> & {
  links?: ProfileLink[];
  degrees?: AcademicDegree[];
};

interface ProfileInfoItem {
  labelKey: string;
  value: string;
  hidden: boolean;
}

/**
 * Ficha visual del perfil publico del docente.
 *
 * Solo dibuja lo que recibe: no pide datos ni decide privacidad. En el perfil
 * publico el backend ya omite lo oculto; en el admin se pasa
 * `fieldVisibility` y la ficha marca lo que el publico no ve.
 */
@Component({
  selector: "app-author-profile-card",
  templateUrl: "./author-profile-card.component.html",
  styleUrls: ["./author-profile-card.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorProfileCardComponent {
  readonly profile = input.required<AuthorProfileCardData>();
  /** Visibilidad por campo; solo en el admin, para marcar lo oculto. */
  readonly fieldVisibility = input<ProfileFieldVisibility | null>(null);
  /** `false` muestra el aviso de perfil fuera del publico (admin). */
  readonly isPublic = input<boolean | null>(null);
  /** Cabecera con foto, nombre e institucion; el admin ya tiene la suya. */
  readonly showHeader = input(true);

  private readonly translate = inject(LanguageService).translate;
  private readonly currentLang = toSignal(
    this.translate.onLangChange.pipe(map((event) => event.lang)),
    { initialValue: this.translate.currentLang }
  );

  readonly fullName = computed(() => {
    const { first_name = "", last_name = "" } = this.profile();
    return `${first_name.trim()} ${last_name.trim()}`.trim();
  });

  readonly initials = computed(() => {
    const { first_name = "", last_name = "" } = this.profile();
    const initials = `${first_name.trim().charAt(0)}${last_name.trim().charAt(0)}`;
    return initials.toUpperCase() || "U";
  });

  readonly institution = computed(() =>
    [this.profile().university?.name, this.profile().campus?.name].filter(Boolean).join(" · ")
  );

  readonly knowledgeAreas = computed(() => {
    const useEnglish = this.currentLang() === "en";
    return (this.profile().knowledge_areas ?? []).map((area) =>
      useEnglish ? area.name_en || area.name_es : area.name_es || area.name_en
    );
  });

  readonly professions = computed(() =>
    (this.profile().professions ?? []).map((profession) => profession.description).filter(Boolean)
  );

  readonly infoItems = computed<ProfileInfoItem[]>(() => {
    const profile = this.profile();
    // Sin ubicacion: la universidad y el campus de la cabecera ya la indican.
    const items: Array<[ProfileVisibilityField | null, string, string | undefined]> = [
      ["faculty", "authorProfile.faculty", profile.faculty],
      ["research_group", "authorProfile.researchGroup", profile.research_group],
    ];

    return items
      .filter(([, , value]) => !!value?.trim())
      .map(([field, labelKey, value]) => ({
        labelKey,
        value: value as string,
        hidden: field !== null && this.isHidden(field),
      }));
  });

  readonly researchLines = computed(() => this.profile().research_lines ?? []);
  readonly subjects = computed(() => this.profile().subjects ?? []);

  readonly links = computed(() =>
    [...(this.profile().links ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  readonly degrees = computed(() => this.profile().degrees ?? []);

  readonly hasAcademicContent = computed(() => {
    const profile = this.profile();
    return !!(
      profile.headline ||
      profile.bio ||
      profile.highest_degree ||
      this.infoItems().length ||
      this.researchLines().length ||
      this.subjects().length ||
      this.links().length ||
      this.degrees().length ||
      this.professions().length ||
      this.knowledgeAreas().length
    );
  });

  /**
   * Indica si un campo opcional esta en "Solo yo" (solo aplica en el admin).
   */
  isHidden(field: ProfileVisibilityField): boolean {
    return this.fieldVisibility()?.[field] === "private";
  }
}
