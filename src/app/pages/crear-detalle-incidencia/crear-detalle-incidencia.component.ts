import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidencia } from '../../interfaces/incidencia';
import { DetalleIncidencia } from '../../interfaces/detalleIncidencia';

@Component({
  selector: 'app-crear-detalle-incidencia',
  templateUrl: './crear-detalle-incidencia.component.html',
  styleUrl: './crear-detalle-incidencia.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class CrearDetalleIncidenciaComponent implements OnInit {
  incidencia?: Incidencia;
  detalleIncidencia: DetalleIncidencia = {
    numGuia: 0,
    tipoDiferencia: '',
    numBulto: '',
    pesoOrigen: 0,
    pesoRecepcion: 0,
    cantidad: 0,
    sku: 0,
    ean13: 0,
    descripcion: ''
  };

  searchTerm: string = '';
  detalles: DetalleIncidencia[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí recuperarías la incidencia del servicio o estado
    this.incidencia = {
      origen: 'LOCAL MATIAS CUSIÑO',
      tipoTransporte: 'BLUEXPRESS',
      ots: '562478745',
      fechaRecepcion: '26/03/2025',
      observaciones: '',
      imagen1: null,
      imagen2: null
    };
  }

  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }

  buscarProducto() {
    // Aquí implementarías la lógica de búsqueda
    console.log('Buscando producto:', this.searchTerm);
  }

  agregarDetalle() {
    // Validar datos antes de agregar
    if (this.detalleIncidencia.numGuia && this.detalleIncidencia.tipoDiferencia) {
      this.detalles.push({...this.detalleIncidencia});
      
      // Limpiar el formulario
      this.detalleIncidencia = {
        numGuia: 0,
        tipoDiferencia: '',
        numBulto: '',
        pesoOrigen: 0,
        pesoRecepcion: 0,
        cantidad: 0,
        sku: 0,
        ean13: 0,
        descripcion: ''
      };
    }
  }

  generarIncidencia() {
    // Aquí implementarías la lógica para guardar todo
    console.log('Detalles a guardar:', this.detalles);
    this.navigateTo('/crear-incidencia');
  }

  onSubmit() {
    this.agregarDetalle();
  }
}
