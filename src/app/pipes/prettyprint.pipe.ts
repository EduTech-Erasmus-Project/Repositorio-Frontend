import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyprint'
})
export class PrettyprintPipe implements PipeTransform {

  transform(val) {
    return JSON.stringify(val, undefined, 4)
      .replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<br/>');
  }

}
