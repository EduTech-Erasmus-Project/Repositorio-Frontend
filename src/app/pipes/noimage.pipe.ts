import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'noimage',
    standalone: false
})
export class NoimagePipe implements PipeTransform {

  transform(images: { length?: number; image?: string } | null | undefined): string {
    if(!images){
      return 'assets/img/noimage.png';
    }
    if (images.length>0){
      return images.image;
    }else{
      return 'assets/img/noimage.png';
    }
  }

}
