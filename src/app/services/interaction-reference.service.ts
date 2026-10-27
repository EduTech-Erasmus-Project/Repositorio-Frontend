import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiReferenceResponse } from "../core/interfaces/api-contracts";

const baseUrl = environment.baseUrl;
const STORAGE_KEY = "interaction_reference";
/** Claves del flujo anterior: guardaban un token sin firma y la lista de OA vistos. */
const LEGACY_STORAGE_KEYS = ["key_ref", "array_view"];

@Injectable({
  providedIn: "root",
})
/**
 * Referencia firmada del navegador para contar vistas y descargas.
 *
 * El backend la emite en `interaction-ref/` y cuenta una vista y una descarga
 * por referencia, por OA y por dia; sin ella (o con una alterada) no suma.
 * Se pide una sola vez y se guarda en `localStorage`; si el almacenamiento no
 * esta disponible (modo privado), vale solo mientras dure la pagina.
 */
export class InteractionReferenceService {
  private reference: string | null = null;
  private pending: Promise<string | null> | null = null;

  constructor(private readonly http: HttpClient) {}

  /**
   * Devuelve la referencia guardada o pide una nueva. Varias llamadas a la vez
   * comparten la misma peticion. Devuelve `null` si el backend no la entrega.
   */
  get(): Promise<string | null> {
    this.reference ??= this.readStored();
    if (this.reference) {
      return Promise.resolve(this.reference);
    }
    this.pending ??= this.request().finally(() => {
      this.pending = null;
    });
    return this.pending;
  }

  private async request(): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiReferenceResponse>(`${baseUrl}/interaction-ref/`, {
          key_ref: environment.key_ref,
        })
      );
      if (!response?.reference) {
        return null;
      }
      this.reference = response.reference;
      this.store(response.reference);
      return response.reference;
    } catch {
      return null;
    }
  }

  private readStored(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private store(reference: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, reference);
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Sin almacenamiento la referencia vive solo en memoria.
    }
  }
}
