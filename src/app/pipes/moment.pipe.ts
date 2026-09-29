import { Pipe, PipeTransform } from "@angular/core";
import { LanguageService } from "../services/language.service";
import * as moment from "moment";

@Pipe({
    name: "moment",
    standalone: false
})
export class MomentPipe implements PipeTransform {
  constructor(private languageService: LanguageService) {
    moment.locale("es-us");
  }

  transform(value: string | number | Date | null | undefined): string {
    return moment(value).startOf('second').fromNow();
  }
}
