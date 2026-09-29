export interface FocusOrigin {
  element: HTMLElement | null;
  id: string | null;
}

const FOCUSABLE_SELECTOR =
  "button, a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1']), [role='button']";

const INVALID_CONTROL_SELECTOR = [
  "input.ng-invalid",
  "select.ng-invalid",
  "textarea.ng-invalid",
  ".p-select.ng-invalid",
  ".p-radiobutton.ng-invalid input",
].join(", ");

/**
 * Captura el mejor candidato para devolver el foco después de cerrar un dialog.
 */
export function captureFocusOrigin(
  event?: Event,
  triggerId?: string
): FocusOrigin {
  const activeElement = document.activeElement as HTMLElement | null;
  const currentTarget = event?.currentTarget as HTMLElement | null;
  const eventTarget = event?.target as HTMLElement | null;

  const trigger =
    (activeElement && activeElement !== document.body ? activeElement : null) ||
    (eventTarget?.closest(FOCUSABLE_SELECTOR) as HTMLElement | null) ||
    (currentTarget?.closest(FOCUSABLE_SELECTOR) as HTMLElement | null) ||
    (currentTarget?.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null) ||
    currentTarget;

  return {
    element: trigger ?? null,
    id: triggerId ?? trigger?.id ?? currentTarget?.id ?? null,
  };
}

/**
 * Restaura el foco al elemento que abrió una interacción modal o popover.
 */
export function restoreFocusOrigin(origin: FocusOrigin | null, attempt = 0) {
  if (!origin?.element && !origin?.id) {
    return;
  }

  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nextTrigger = resolveFocusOrigin(origin);

        if (nextTrigger) {
          nextTrigger.focus();
          return;
        }

        if (attempt < 4) {
          restoreFocusOrigin(origin, attempt + 1);
        }
      });
    });
  }, attempt === 0 ? 120 : 180);
}

/**
 * Lleva el foco al primer control inválido visible dentro de un contenedor.
 */
export function focusFirstInvalidControl(
  root?: ParentNode | null,
  fallbackSelector?: string | null
): boolean {
  const invalidElement =
    root?.querySelector<HTMLElement>(INVALID_CONTROL_SELECTOR) ??
    document.querySelector<HTMLElement>(INVALID_CONTROL_SELECTOR);

  if (invalidElement) {
    invalidElement.focus();
    return true;
  }

  if (!fallbackSelector) {
    return false;
  }

  const fallbackElement =
    root?.querySelector<HTMLElement>(fallbackSelector) ??
    document.querySelector<HTMLElement>(fallbackSelector);

  fallbackElement?.focus();
  return !!fallbackElement;
}

/**
 * Reconstituye un origen de foco a partir de id o referencia viva al nodo.
 */
function resolveFocusOrigin(origin: FocusOrigin): HTMLElement | null {
  if (origin.id) {
    const directElement = document.getElementById(origin.id);
    const focusableDirect = getFocusableElement(directElement);

    if (focusableDirect) {
      return focusableDirect;
    }
  }

  if (origin.element?.isConnected) {
    return getFocusableElement(origin.element);
  }

  return null;
}

/**
 * Devuelve el propio elemento si es enfocable o el primer descendiente válido.
 */
function getFocusableElement(element: HTMLElement | null): HTMLElement | null {
  if (!element) {
    return null;
  }

  if (isFocusableElement(element)) {
    return element;
  }

  return element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

/**
 * Determina si un elemento puede recibir foco por sí mismo.
 */
function isFocusableElement(element: HTMLElement): boolean {
  const focusableTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];

  return (
    focusableTags.includes(element.tagName) ||
    element.tabIndex >= 0 ||
    element.getAttribute("role") === "button"
  );
}
