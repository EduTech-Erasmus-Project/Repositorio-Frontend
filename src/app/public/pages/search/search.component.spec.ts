import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject } from "rxjs";
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
      "searchPagePaginator",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
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
          useValue: {
            queryParams: queryParams$.asObservable(),
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
    searchServiceSpy.searchPagePaginator.and.returnValue(
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
    expect(searchServiceSpy.search).toHaveBeenCalledWith(
      querySearchService.queryParams
    );
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

  it("debe actualizar los resultados al paginar", async () => {
    searchServiceSpy.searchPagePaginator.and.returnValue(
      of({
        results: [{ id: 8, general_title: "Quimica", source_file: null, is_adapted_oer: false }],
        pages: 2,
        count: 2,
        links: { next: null, previous: "page=1" },
      })
    );
    querySearchService.queryParams = { general_title: "Algebra" };

    await component.paginate({ page: 1, first: 10 });

    expect(searchServiceSpy.searchPagePaginator).toHaveBeenCalledWith(2, {
      general_title: "Algebra",
    });
    expect(component.objects).toEqual([
      { id: 8, general_title: "Quimica", source_file: null, is_adapted_oer: false },
    ] as any);
    expect(component.loading).toBeFalse();
  });

  it("debe mostrar paginador solo cuando hay mas registros que resultados visibles", () => {
    component.objects = [{ id: 1 } as any, { id: 2 } as any];
    component.rows = 2;
    component.totalRecords = 5;

    expect(component.hasResults).toBeTrue();
    expect(component.showPaginator).toBeTrue();

    component.totalRecords = 2;

    expect(component.showPaginator).toBeFalse();
  });
});
