import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Incidencia } from '../../interfaces/incidencia';

@Component({
  selector: 'app-crear-detalle-incidencia',
  imports: [],
  templateUrl: './crear-detalle-incidencia.component.html',
  styleUrl: './crear-detalle-incidencia.component.css'
})
export class CrearDetalleIncidenciaComponent implements OnInit, OnDestroy {
  incidencia: Incidencia | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve incidencia data from localStorage
    const storedIncidencia = localStorage.getItem('incidenciaData');
    if (storedIncidencia) {
      this.incidencia = JSON.parse(storedIncidencia);
    } else {
      // If no data, redirect back to crear-incidencia
      this.router.navigate(['/crear-incidencia']);
    }
  }

  ngOnDestroy(): void {
    // Clear the localStorage when leaving the component
    localStorage.removeItem('incidenciaData');
  }
}
