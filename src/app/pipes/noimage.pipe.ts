import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noimage'
})
export class NoimagePipe implements PipeTransform {

  transform(images:any): string {
    if(!images){
      return 'assets/images/noimage.png';
    }
    if (images.length>0){
      return images.image;
    }else{
      return 'assets/images/noimage.png';
    }
  }

}
