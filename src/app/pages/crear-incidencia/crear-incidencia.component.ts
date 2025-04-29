import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  constructor(private router: Router) {}

  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }  

  incidencia: Incidencia = {
    origen: '',
    tipoTransporte: '',
    ots: '',
    fechaRecepcion: '',
    observaciones: '',
    imagen1: null,
    imagen2: null
  };

  onSubmit() {
    console.log('Incidencia submitted:', this.incidencia);
    // Aquí puedes agregar la lógica para enviar los datos al backend
  }

}
