import {
  isBackendApiRequest,
  isCookieSessionEndpoint,
  isMutableBackendRequest,
  readCookieValue,
} from "./auth-cookie.utils";

describe("auth-cookie.utils", () => {
  const baseUrl = "http://localhost:8000/api/v1";

  it("debe identificar requests dirigidas al backend principal", () => {
    expect(isBackendApiRequest(`${baseUrl}/login/`, baseUrl)).toBeTrue();
    expect(isBackendApiRequest("https://example.com/file.pdf", baseUrl)).toBeFalse();
  });

  it("debe identificar endpoints del flujo de sesion por cookie", () => {
    expect(isCookieSessionEndpoint(`${baseUrl}/csrf/`, baseUrl)).toBeTrue();
    expect(isCookieSessionEndpoint(`${baseUrl}/login/`, baseUrl)).toBeTrue();
    expect(isCookieSessionEndpoint(`${baseUrl}/token/refresh/`, baseUrl)).toBeTrue();
    expect(isCookieSessionEndpoint(`${baseUrl}/logout/`, baseUrl)).toBeTrue();
    expect(isCookieSessionEndpoint(`${baseUrl}/user/`, baseUrl)).toBeFalse();
  });

  it("debe marcar como mutables solo las mutaciones contra el backend principal", () => {
    expect(isMutableBackendRequest("POST", `${baseUrl}/logout/`, baseUrl)).toBeTrue();
    expect(isMutableBackendRequest("PATCH", `${baseUrl}/user/1/`, baseUrl)).toBeTrue();
    expect(isMutableBackendRequest("GET", `${baseUrl}/user/`, baseUrl)).toBeFalse();
    expect(isMutableBackendRequest("POST", "https://example.com/upload", baseUrl)).toBeFalse();
  });

  it("debe leer cookies puntuales desde document.cookie serializado", () => {
    const cookieSource = "foo=bar; csrftoken=csrf-123; session=abc";

    expect(readCookieValue("csrftoken", cookieSource)).toBe("csrf-123");
    expect(readCookieValue("foo", cookieSource)).toBe("bar");
    expect(readCookieValue("missing", cookieSource)).toBeNull();
  });
});
