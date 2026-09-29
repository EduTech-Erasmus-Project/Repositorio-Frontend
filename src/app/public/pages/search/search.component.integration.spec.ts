import {
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
  Pipe,
  PipeTransform,
} from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { QuerySearchService } from "src/app/services/query-search.service";
import { SearchService } from "src/app/services/search.service";
import { SearchComponent } from "./search.component";

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Component({
    selector: "app-header",
    template: "",
    standalone: false
})
class HeaderStubComponent {
  @Input() header_title: string;
}

@Component({
    selector: "app-sidebar-search",
    template: "",
    standalone: false
})
class SidebarSearchStubComponent {}

@Component({
    selector: "app-card",
    template: `<div class="card-stub">{{ object?.general_title }}</div>`,
    standalone: false
})
class CardStubComponent {
  @Input() object: any;
  @Input() expertOptions = false;
  @Input() studentOptions = false;
}

@Component({
    selector: "p-button",
    template: `<button type="button">{{ label }}</button>`,
    standalone: false
})
class ButtonStubComponent {
  @Input() label: string;
  @Input() icon: string;
  @Input() iconPos: string;
}

@Component({
    selector: "p-paginator",
    template: "",
    standalone: false
})
class PaginatorStubComponent {
  @Input() rows: number;
  @Input() totalRecords: number;
  @Output() onPageChange = new EventEmitter<any>();
}

describe("SearchComponent Integracion", () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let queryParams$: BehaviorSubject<any>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let querySearchService: QuerySearchService;
  let roles: { expert: boolean; student: boolean; teacher: boolean };

  const traducciones = {
    "menu.search": "Busqueda",
    "menu.sideMenu.qualified": "Calificados",
    "menu.sideMenu.noneQualification": "No calificados",
    "object.labelPopulars": "Populares",
    "object.labelLikes": "Me gusta",
    "object.labelMostRecent": "Mas recientes",
  };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<any>({});
    roles = {
      expert: false,
      student: false,
      teacher: false,
    };

    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "search",
      "searchPagePaginator",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["validateRole"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    loginServiceSpy.validateRole.and.callFake((role: string) => !!roles[role]);
    searchServiceSpy.search.and.returnValue(
      of({
        results: [{ id: 1, general_title: "Algebra lineal", source_file: null, is_adapted_oer: false }],
        pages: 1,
        count: 1,
        links: { next: null, previous: null },
      })
    );
    searchServiceSpy.searchPagePaginator.and.returnValue(
      of({
        results: [{ id: 2, general_title: "Quimica organica", source_file: null, is_adapted_oer: false }],
        pages: 2,
        count: 2,
        links: { next: null, previous: "page=1" },
      })
    );

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        SearchComponent,
        TranslatePipeMock,
        HeaderStubComponent,
        SidebarSearchStubComponent,
        CardStubComponent,
        ButtonStubComponent,
        PaginatorStubComponent,
      ],
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
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    querySearchService = TestBed.inject(QuerySearchService);
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  async function emitirQueryParams(params: any) {
    queryParams$.next(params);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it("debe buscar desde el input real al presionar Enter", async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input[type='text']");

    input.value = "Fisica";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: jasmine.objectContaining({
        general_title: "Fisica",
      }),
    });
  });

  it("debe renderizar el boton de limpiar filtros y vaciar la busqueda al hacer click", async () => {
    await emitirQueryParams({
      general_title: "Algebra",
      liked: "True",
    });

    const botones = fixture.debugElement.queryAll(By.directive(ButtonStubComponent));
    const botonLimpiar = botones.find(
      (button) => button.componentInstance.label === "search.filterClean"
    );

    expect(botonLimpiar).toBeTruthy();

    botonLimpiar?.triggerEventHandler("click", new MouseEvent("click"));
    fixture.detectChanges();

    expect(querySearchService.queryParams).toEqual({});
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: {},
    });
  });

  it("debe renderizar el chip traducido y permitir eliminarlo desde el template", async () => {
    await emitirQueryParams({
      general_title: "Algebra",
      liked: "True",
    });

    const chipTexto = fixture.nativeElement.textContent;
    expect(chipTexto).toContain("Me gusta");

    const chip = Array.from(fixture.nativeElement.querySelectorAll(".chip")).find(
      (element: any) => element.textContent.includes("Me gusta")
    ) as HTMLElement;
    const closeButton: HTMLElement | null = chip?.querySelector(".closebtn");
    expect(closeButton).toBeTruthy();

    await component.removeChip({ value: "Me gusta" });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/search"], {
      queryParams: {
        general_title: "Algebra",
      },
    });
  });

  it("debe actualizar la lista al disparar el paginador desde el template", async () => {
    searchServiceSpy.search.and.returnValue(
      of({
        results: [{ id: 1, general_title: "Algebra lineal", source_file: null, is_adapted_oer: false }],
        pages: 2,
        count: 2,
        links: { next: "page=2", previous: null },
      })
    );

    await emitirQueryParams({
      general_title: "Algebra",
    });

    const paginator = fixture.debugElement.query(By.directive(PaginatorStubComponent));
    expect(paginator).toBeTruthy();

    paginator.componentInstance.onPageChange.emit({ page: 1 });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(searchServiceSpy.searchPagePaginator).toHaveBeenCalledWith(2, {
      general_title: "Algebra",
    });
    expect(component.objects).toEqual([
      { id: 2, general_title: "Quimica organica", source_file: null, is_adapted_oer: false },
    ] as any);
    expect(fixture.nativeElement.textContent).toContain("Quimica organica");
  });

  it("debe renderizar las tarjetas del experto con la opcion correspondiente", async () => {
    roles.expert = true;

    await emitirQueryParams({
      general_title: "Algebra",
    });

    const cards = fixture.debugElement.queryAll(By.directive(CardStubComponent));

    expect(cards.length).toBe(1);
    expect(cards[0].componentInstance.expertOptions).toBeTrue();
    expect(cards[0].componentInstance.studentOptions).toBeFalse();
  });
});
