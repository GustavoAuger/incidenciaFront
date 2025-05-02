import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Incidencia } from '../../interfaces/incidencia';



@Component({
  selector: 'app-crear-incidencia',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './crear-incidencia.component.html',
  styleUrl: './crear-incidencia.component.css'
})


export class CrearIncidenciaComponent {
  fieldsLocked = false;
  maxDate: string;

  constructor(private router: Router) {
    // Establecer la fecha máxima como la fecha actual
    const hoy = new Date();
    this.maxDate = hoy.toISOString().split('T')[0];
  }

  navigateTo(route: string): void {    
    if (route === '/crear-detalle-incidencia') {
      // Validar campos requeridos
      if (!this.incidencia.bodOrigen || !this.incidencia.transportista) {
        alert('Debe completar el origen y transportista antes de continuar');
        return;
      }

      // Validar fecha de recepción
      if (!this.incidencia.fechaRecepcion) {
        alert('Debe seleccionar una fecha de recepción');
        return;
      }

      // Validar que la fecha no sea mayor a la actual
      const fechaRecepcion = new Date(this.incidencia.fechaRecepcion);
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Resetear la hora a 00:00:00
      
      if (fechaRecepcion > fechaActual) {
        alert('La fecha de recepción no puede ser mayor a la fecha actual');
        return;
      }

      // Validar OTS si el transportista no es HEAD
      if (this.incidencia.transportista.toUpperCase() !== 'HEAD' && !this.incidencia.ots) {
        alert('Debe ingresar el número de OTS cuando el transportista no es HEAD');
        return;
      }

      // Navegar con los datos de la incidencia
      this.router.navigate([route], {
        state: { incidencia: this.incidencia }
      });
    } else {
      this.router.navigate([route]);
    }
  }  

  onFileChange(event: any, field: 'imagen1' | 'imagen2') {
    const file = event.target.files[0];
    this.incidencia[field] = file;
  }

  incidencia: Incidencia = {
    bodOrigen: '',
    transportista: '',
    ots: '',
    fechaRecepcion: '',
    observaciones: '',
    imagen1: null,
    imagen2: null
  };
  

  // Método para bloquear campos después de su selección
  onFieldChange(field: keyof Incidencia, value: string | File | null) {
    if (field === 'bodOrigen' || field === 'transportista') {
      if (value && !this.fieldsLocked && typeof value === 'string') {
        (this.incidencia[field] as string) = value;
        if (this.incidencia.bodOrigen && this.incidencia.transportista) {
          this.fieldsLocked = true;
        }
      }
    } else if (typeof this.incidencia[field] === typeof value) {
      // Asegurarse de que los tipos coincidan antes de asignar
      (this.incidencia[field] as typeof value) = value;
    }
  }

  

  onSubmit() {
    console.log('Incidencia submitted:', this.incidencia);
    // Aquí puedes agregar la lógica para enviar los datos al backend
  }

  resetForm(form: NgForm) {
    form.resetForm(); // esto resetea también las validaciones del formulario
    this.fieldsLocked = false; // Desbloquear campos
    this.incidencia = {
      bodOrigen: '',
      transportista: '',
      ots: '',
      fechaRecepcion: '',
      imagen1: null,
      imagen2: null,
      observaciones: ''
    };
  }
  

}
