import { ConfirmationService } from "primeng/api";
import { translateInstant } from "./i18n.utils";

/** Clave del `p-confirmDialog` que cada pagina con formulario debe renderizar. */
export const UNSAVED_CHANGES_DIALOG_KEY = "unsavedChanges";

type InstantTranslator = Parameters<typeof translateInstant>[0];

/**
 * Pregunta si se descartan los cambios sin guardar. Resuelve `true` solo si el
 * usuario elige salir; cerrar el dialogo o "Seguir editando" resuelve `false`.
 */
export function confirmDiscardChanges(
  confirmationService: ConfirmationService,
  translator: InstantTranslator
): Promise<boolean> {
  return new Promise((resolve) => {
    confirmationService.confirm({
      key: UNSAVED_CHANGES_DIALOG_KEY,
      header: translateInstant(translator, "unsavedChanges.title", "¿Salir sin guardar?"),
      message: translateInstant(
        translator,
        "unsavedChanges.message",
        "Tienes cambios sin guardar. Si sales ahora, se perderán."
      ),
      icon: "pi pi-info-circle",
      acceptLabel: translateInstant(translator, "unsavedChanges.leave", "Salir sin guardar"),
      rejectLabel: translateInstant(translator, "unsavedChanges.stay", "Seguir editando"),
      acceptButtonStyleClass: "p-button-outlined",
      rejectButtonStyleClass: "settings-confirm-dialog__stay",
      defaultFocus: "reject",
      accept: () => resolve(true),
      reject: () => resolve(false),
    });
  });
}
