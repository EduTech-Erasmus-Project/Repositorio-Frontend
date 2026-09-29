import { discardPeriodicTasks, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { AuthTokenResponse } from "../core/interfaces/api-contracts";
import { SessionRefreshService } from "./session-refresh.service";
import { TokenService } from "./token.service";

describe("SessionRefreshService", () => {
  let service: SessionRefreshService;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj("TokenService", ["refreshToken"]);

    TestBed.configureTestingModule({
      providers: [
        SessionRefreshService,
        { provide: TokenService, useValue: tokenServiceSpy },
      ],
    });

    service = TestBed.inject(SessionRefreshService);
  });

  it("debe compartir una sola renovacion entre consumidores concurrentes", () => {
    const refreshSubject = new Subject<AuthTokenResponse>();
    const responses: AuthTokenResponse[] = [];
    tokenServiceSpy.refreshToken.and.returnValue(refreshSubject.asObservable());

    service.refreshOnce().subscribe((response) => responses.push(response));
    service.refreshOnce().subscribe((response) => responses.push(response));

    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(1);

    refreshSubject.next({ access: "new-access-token" } as AuthTokenResponse);
    refreshSubject.complete();

    expect(responses).toEqual([
      { access: "new-access-token" } as AuthTokenResponse,
      { access: "new-access-token" } as AuthTokenResponse,
    ]);
  });

  it("debe permitir una nueva renovacion despues de completar la anterior", () => {
    const firstRefresh = new Subject<AuthTokenResponse>();
    const secondRefresh = new Subject<AuthTokenResponse>();
    tokenServiceSpy.refreshToken.and.returnValues(
      firstRefresh.asObservable(),
      secondRefresh.asObservable()
    );

    service.refreshOnce().subscribe();
    firstRefresh.complete();

    service.refreshOnce().subscribe();

    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(2);
  });

  it("debe liberar el lock despues de un error de renovacion", () => {
    const firstRefresh = new Subject<AuthTokenResponse>();
    const secondRefresh = new Subject<AuthTokenResponse>();
    tokenServiceSpy.refreshToken.and.returnValues(
      firstRefresh.asObservable(),
      secondRefresh.asObservable()
    );

    service.refreshOnce().subscribe({ error: () => undefined });
    firstRefresh.error(new Error("refresh failed"));

    service.refreshOnce().subscribe();

    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(2);
  });

  it("debe ejecutar refresh preventivo segun el intervalo configurado", fakeAsync(() => {
    tokenServiceSpy.refreshToken.and.returnValue(of({} as AuthTokenResponse));

    service.startPreventiveRefresh(1000);

    tick(999);
    expect(tokenServiceSpy.refreshToken).not.toHaveBeenCalled();

    tick(1);
    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(1);
    expect(service.getLastSuccessfulRefreshAt()).not.toBeNull();

    service.stopPreventiveRefresh();
    discardPeriodicTasks();
  }));

  it("no debe crear timers preventivos duplicados", fakeAsync(() => {
    tokenServiceSpy.refreshToken.and.returnValue(of({} as AuthTokenResponse));

    service.startPreventiveRefresh(1000);
    service.startPreventiveRefresh(1000);

    tick(1000);
    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(1);

    service.stopPreventiveRefresh();
    discardPeriodicTasks();
  }));

  it("debe detener el timer preventivo", fakeAsync(() => {
    tokenServiceSpy.refreshToken.and.returnValue(of({} as AuthTokenResponse));

    service.startPreventiveRefresh(1000);
    service.stopPreventiveRefresh();
    tick(1000);

    expect(tokenServiceSpy.refreshToken).not.toHaveBeenCalled();
  }));

  it("no debe propagar errores del refresh preventivo", fakeAsync(() => {
    tokenServiceSpy.refreshToken.and.returnValue(
      throwError(() => new Error("refresh failed"))
    );

    service.startPreventiveRefresh(1000);
    tick(1000);

    expect(tokenServiceSpy.refreshToken).toHaveBeenCalledTimes(1);
    expect(service.getLastSuccessfulRefreshAt()).toBeNull();

    service.stopPreventiveRefresh();
    discardPeriodicTasks();
  }));
});
