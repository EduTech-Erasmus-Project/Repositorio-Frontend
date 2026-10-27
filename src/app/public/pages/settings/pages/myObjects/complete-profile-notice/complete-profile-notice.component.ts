import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { OwnPublicProfile } from "src/app/core/interfaces/PublicProfile";
import { PublicProfileService } from "src/app/services/public-profile.service";

/** Clave en `localStorage` cuando el docente cierra el aviso. */
export const COMPLETE_PROFILE_NOTICE_KEY = "roa.completeProfileNoticeDismissed";

/**
 * Aviso para que el docente complete su perfil publico. Solo aparece mientras
 * el perfil no tenga ningun dato propio y el docente no lo haya cerrado.
 */
@Component({
  selector: "app-complete-profile-notice",
  templateUrl: "./complete-profile-notice.component.html",
  styleUrls: ["./complete-profile-notice.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CompleteProfileNoticeComponent implements OnInit {
  readonly visible = signal(false);

  private readonly publicProfileService = inject(PublicProfileService);

  ngOnInit(): void {
    if (!this.isDismissed()) {
      void this.checkProfile();
    }
  }

  dismiss(): void {
    this.visible.set(false);
    try {
      localStorage.setItem(COMPLETE_PROFILE_NOTICE_KEY, "1");
    } catch {
      // Sin almacenamiento (modo privado): el aviso solo se oculta en esta visita.
    }
  }

  private async checkProfile(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.publicProfileService.getOwnProfile());
      this.visible.set(isProfileEmpty(profile));
    } catch {
      // Si no se puede consultar, no se molesta con el aviso.
    }
  }

  private isDismissed(): boolean {
    try {
      return localStorage.getItem(COMPLETE_PROFILE_NOTICE_KEY) === "1";
    } catch {
      return false;
    }
  }
}

function isProfileEmpty(profile: OwnPublicProfile): boolean {
  return !(
    profile.headline?.trim() ||
    profile.bio?.trim() ||
    profile.faculty?.trim() ||
    profile.research_group?.trim() ||
    profile.research_lines?.length ||
    profile.subjects?.length ||
    profile.links?.length ||
    profile.degrees?.length
  );
}
