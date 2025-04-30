import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initCapFirst'
})
export class InitCapFirstPipe implements PipeTransform {

  transform(text: string): string {
    text = text.toLowerCase();
    return text.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  }

}
