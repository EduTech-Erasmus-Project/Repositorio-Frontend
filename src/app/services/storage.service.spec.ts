import { StorageService } from "./storage.service";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("debe guardar y recuperar valores serializados en localStorage", () => {
    const value = { email: "user@example.com", roles: ["teacher"] };

    service.saveLocalItem("current_user", value as any);

    expect(localStorage.getItem("current_user")).toBeTruthy();
    expect(service.getLocalItem("current_user") as any).toEqual(value);
  });

  it("debe devolver null cuando la clave no existe", () => {
    expect(service.getLocalItem("missing_key")).toBeNull();
  });

  it("debe eliminar valores almacenados", () => {
    service.saveLocalItem("data_acc", "token-value" as any);

    service.removeLocalItem("data_acc");

    expect(localStorage.getItem("data_acc")).toBeNull();
    expect(service.getLocalItem("data_acc")).toBeNull();
  });
});
