import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";

// PrimeNG Components for demos
import { AccordionModule } from "primeng/accordion";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ChartModule } from "primeng/chart";
import { CheckboxModule } from "primeng/checkbox";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { ColorPickerModule } from "primeng/colorpicker";
import { ContextMenuModule } from "primeng/contextmenu";
import { DataViewModule } from "primeng/dataview";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { FieldsetModule } from "primeng/fieldset";
import { FileUploadModule } from "primeng/fileupload";
import { TextareaModule } from "primeng/textarea";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { ScrollerModule } from "primeng/scroller";

// Application Components //** */
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

// Application services
import { BreadcrumbService } from "./services/breadcrumb.service";
import { MenuService } from "./services/app.menu.service";
import { AdminModule } from "./admin/admin.module";
import { SharedModule } from "./shared/shared.module";
import { PublicModule } from "./public/public.module";
import { QuicklinkModule } from "ngx-quicklink";
import { MessageService, ConfirmationService } from 'primeng/api';
import { providePrimeNG } from "primeng/config";
import { CookieService } from "ngx-cookie-service";
import { AuthInterceptor } from './services/auth.interceptor';
import { definePreset } from "@primeng/themes";
import Lara from "@primeng/themes/lara";


import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { UntypedFormBuilder } from "@angular/forms";

const RoaPrimePreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: "#f3f7f8",
      100: "#dce8ec",
      200: "#bad1d9",
      300: "#91b3c0",
      400: "#6b95a6",
      500: "#3B5B68",
      600: "#344f5b",
      700: "#2a404a",
      800: "#213239",
      900: "#17242a",
      950: "#0e171b",
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.500}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.600}",
          activeColor: "{primary.700}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.700}",
          focusColor: "{primary.800}",
        },
      },
      dark: {
        primary: {
          color: "{primary.400}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
      },
    },
  },
});

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AccordionModule,
    AutoCompleteModule,
    ChartModule,
    CheckboxModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ColorPickerModule,
    ContextMenuModule,
    DataViewModule,
    DialogModule,
    DividerModule,
    FieldsetModule,
    FileUploadModule,
    TextareaModule,
    PaginatorModule,
    TableModule,
    ScrollerModule,
    SharedModule,
    AdminModule,
    PublicModule,
    QuicklinkModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [AppComponent],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }, //HashLocationStrategy
    {
      provide : HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi   : true,
    },
    MenuService,
    BreadcrumbService,
    MessageService,
    CookieService,
    UntypedFormBuilder,
    ConfirmationService,
    providePrimeNG({
      ripple: true,
      inputStyle: "outlined",
      theme: {
        preset: RoaPrimePreset,
        options: {
          darkModeSelector: ".layout-dark",
          cssLayer: false,
        },
      },
    })

  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
