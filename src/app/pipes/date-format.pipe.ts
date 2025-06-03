import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    // Si el valor es nulo o indefinido, retornar un string vacío
    if (!value) return '';
    
    try {
      // Crear un objeto Date a partir del string
      const date = new Date(value);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return value; // Retornar el valor original si no es una fecha válida
      }
      
      // Obtener día, mes y año
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      // Retornar la fecha formateada
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return value; // En caso de error, retornar el valor original
    }
  }
}
