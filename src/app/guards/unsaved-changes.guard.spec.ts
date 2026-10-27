import { LoginService } from "../services/login.service";
import { UnsavedChangesGuard } from "./unsaved-changes.guard";

describe("UnsavedChangesGuard", () => {
  function createGuard(user: object | null): UnsavedChangesGuard {
    return new UnsavedChangesGuard({ user } as LoginService);
  }

  it("debe dejar salir si la pagina no pregunta nada", () => {
    expect(createGuard({ id: 1 }).canDeactivate(null)).toBeTrue();
  });

  it("debe usar la respuesta de la pagina", async () => {
    const guard = createGuard({ id: 1 });

    expect(guard.canDeactivate({ confirmLeave: () => true })).toBeTrue();
    await expectAsync(guard.canDeactivate({ confirmLeave: () => Promise.resolve(false) }) as Promise<boolean>)
      .toBeResolvedTo(false);
  });

  it("no debe preguntar si la sesion ya se cerro", () => {
    const confirmLeave = jasmine.createSpy("confirmLeave").and.returnValue(false);

    expect(createGuard(null).canDeactivate({ confirmLeave })).toBeTrue();
    expect(confirmLeave).not.toHaveBeenCalled();
  });
});
