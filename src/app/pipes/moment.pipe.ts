import { Pipe, PipeTransform } from "@angular/core";
import { LanguageService } from "../services/language.service";
import * as moment from "moment";

@Pipe({
  name: "moment",
})
export class MomentPipe implements PipeTransform {
  //private moment:any;

  constructor(private languageService: LanguageService) {
    //this.moment = this.languageService.momentjs();
    moment.locale("es-us");
  }

  transform(value: any): string {
    //console.log(value);
    return moment(value).startOf('second').fromNow();
  }
}
