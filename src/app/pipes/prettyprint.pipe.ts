import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "prettyprint",
  standalone: false,
})
export class PrettyprintPipe implements PipeTransform {
  /**
   * Serializa la metadata tecnica como texto JSON legible para renderizarla
   * dentro de un `<pre>` sin depender de `innerHTML`.
   */
  transform(val: unknown): string {
    return JSON.stringify(val, undefined, 4) ?? "";
  }
}
