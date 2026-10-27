import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from "@angular/core/testing";
import { ActivatedRoute, Router, Scroll, NavigationEnd } from "@angular/router";
import { ViewportScroller } from "@angular/common";
import { of, Subject, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { QuerySearchService } from "src/app/services/query-search.service";
import { SearchService } from "src/app/services/search.service";
import { SearchComponent } from "./search.component";

describe("SearchComponent", () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let queryParams$: Subject<any>;
  let routerEvents$: Subject<any>;
  let activatedRoute: { queryParams: any };
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let querySearchService: QuerySearchService;

  const traducciones = {
    "menu.search": "Busqueda",
    "menu.sideMenu.qualified": "Calificados",
    "menu.sideMenu.noneQualification": "No calificados",
    "object.labelPopulars": "Populares",
    "object.labelLikes": "Me gusta",
    "object.labelMostRecent": "Mas recientes",
  };

  beforeEach(async () => {
    queryParams$ = new Subject<any>();
    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "search",
    ]);
    routerEvents$ = new Subject<any>();
    routerSpy = jasmine.createSpyObj("Router", ["navigate"], { events: routerEvents$.asObservable() });
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      providers: [
        QuerySearchService,
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: ActivatedRoute,
          useFactory: () => {
            activatedRoute = { queryParams: queryParams$.asObservable() };
            return activatedRoute;
          },
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: (key: string) => of(traducciones[key] || key),
            },
          },
        },
      ],
    })
      .overrideComponent(SearchComponent, {
        set: {
          template: "",
        },
      })
      .compileComponents();

    querySearchService = TestBed.inject(QuerySearchService);
    loginServiceSpy.validateRole.and.returnValue(false);
    searchServiceSpy.search.and.returnValue(
      of({
        results: [],
        pages: 0,
        count: 0,
        links: { next: null, previous: null },
      })
    );

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("debe traducir filtros booleanos y ejecutar la busqueda al recibir query params", fakeAsync(() => {
    searchServiceSpy.search.and.returnValue(
      of({
        results: [{ id: 1, general_title: "Algebra", source_file: null, is_adapted_oer: false }],
        pages: 3,
        count: 1,
        links: { next: "page=2", previous: null },
      })
    );

    queryParams$.next({
      general_title: "Algebra",
      liked: "True",
    });
    flushMicrotasks();

    expect(component.chipsSearch).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({ value: "Algebra" }),
        jasmine.objectContaining({ value: "Me gusta" }),
      ])
    );
    expect(searchServiceSpy.search).toHaveBeenCalledWith({
      ...querySearchService.queryParams,
      page_size: "15",
    });
    expect(component.objects.length).toBe(1);
    expect(component.totalRecords).toBe(1);
    expect(component.loading).toBeFalse();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalled();
  }));

  it("debe marcar que no existen resultados cuando la busqueda regresa vacia", async () => {
    searchServiceSpy.search.and.returnValue(
      of({
        results: [],
        pages: 0,
        count: 0,
        links: { next: null, previous: null },
      })
    );
    querySearchService.queryParams = { general_title: "Sin resultados" };

    await component.searchData();

    expect(component.resultOAsNone).toBeTrue();
    expect(component.hasResults).toBeFalse();
    expect(component.showEmptyResults).toBeTrue();
    expect(component.showPaginator).toBeFalse();
    expect(component.totalRecords).toBe(0);
    expect(component.rows).toBe(0);
    expect(component.loading).toBeFalse();
  });

  it("debe navegar a /search cuando se ejecuta una busqueda con titulo", () => {
    querySearchService.queryParams = { general_title: "Fisica" };

    component.onSearch();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: querySearchService.queryParams,
    });
  });

  it("no debe navegar cuando el titulo de busqueda esta vacio", () => {
    querySearchService.queryParams = { general_title: "" };

    component.onSearch();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it("debe limpiar filtros y navegar sin query params", () => {
    component.chipsSearch = [{ value: "Matematica" }];
    querySearchService.queryParams = { general_title: "Matematica" };

    component.onClearFilters();

    expect(component.chipsSearch).toEqual([]);
    expect(querySearchService.queryParams).toEqual({});
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: {},
    });
  });

  it("debe eliminar un filtro de relevancia traducido y actualizar la ruta", async () => {
    querySearchService.queryParams = {
      liked: "True",
      general_title: "Algebra",
    };

    await component.removeChip({ value: "Me gusta" });

    expect(querySearchService.queryParams).toEqual({
      general_title: "Algebra",
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: {
        general_title: "Algebra",
      },
    });
  });

  it("debe escribir la pagina en la URL al paginar, reemplazando el historial", () => {
    component.paginate({ page: 1, first: 15, rows: 15 });

    expect(routerSpy.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRoute as any,
      queryParams: { page: 2, page_size: null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  });

  it("debe pedir la pagina de la URL sin convertirla en chip", fakeAsync(() => {
    queryParams$.next({ general_title: "Algebra", page: "3", page_size: "20" });
    flushMicrotasks();

    expect(searchServiceSpy.search).toHaveBeenCalledWith({
      general_title: "Algebra",
      page_size: "20",
      page: "3",
    });
    expect(querySearchService.queryParams).toEqual({ general_title: "Algebra" });
    expect(component.chipsSearch).toEqual([{ value: "Algebra" }]);
    expect(component.rowsPerPage).toBe(20);
    expect(component.first).toBe(40);
  }));

  it("debe volver a la pagina 1 si la pagina de la URL ya no existe", fakeAsync(() => {
    searchServiceSpy.search.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    queryParams$.next({ general_title: "Algebra", page: "20" });
    flushMicrotasks();

    expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { page: null, page_size: null },
      replaceUrl: true,
    }));
  }));

  it("debe restaurar el scroll guardado al volver atras cuando llegan los resultados", fakeAsync(() => {
    const scroller = TestBed.inject(ViewportScroller);
    spyOn(scroller, "scrollToPosition");
    spyOn(window, "requestAnimationFrame").and.callFake((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    searchServiceSpy.search.and.returnValue(
      of({ results: [{ id: 1 }], pages: 1, count: 1, links: { next: null, previous: null } } as any)
    );

    routerEvents$.next(new Scroll(new NavigationEnd(2, "/search", "/search"), [0, 1800], null));
    queryParams$.next({ general_title: "Algebra" });
    flushMicrotasks();

    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 1800]);
  }));

  it("debe mostrar paginador mientras haya mas registros que la opcion minima de filas", () => {
    component.objects = [{ id: 1 } as any, { id: 2 } as any];
    component.totalRecords = 11;

    expect(component.hasResults).toBeTrue();
    expect(component.showPaginator).toBeTrue();

    component.totalRecords = 10;

    expect(component.showPaginator).toBeFalse();
  });

  it("debe volver a la primera pagina al cambiar las filas", () => {
    component.paginate({ page: 3, first: 45, rows: 50 });

    expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { page: null, page_size: 50 },
    }));
  });

  it("debe reponer page_size en la URL cuando un filtro navega sin el", fakeAsync(() => {
    querySearchService.pageSize = 20;
    searchServiceSpy.search.calls.reset();

    queryParams$.next({ general_title: "Algebra" });
    flushMicrotasks();

    expect(routerSpy.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRoute as any,
      queryParams: { page_size: 20 },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
    expect(searchServiceSpy.search).not.toHaveBeenCalled();
  }));

  it("no debe reponer page_size al volver a 15 filas", fakeAsync(() => {
    querySearchService.pageSize = 20;

    component.paginate({ page: 0, first: 0, rows: 15 });
    routerSpy.navigate.calls.reset();
    queryParams$.next({ general_title: "Algebra" });
    flushMicrotasks();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.rowsPerPage).toBe(15);
  }));
});
