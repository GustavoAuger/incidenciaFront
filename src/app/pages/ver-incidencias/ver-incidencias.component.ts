import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';

interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  numeroIncidencia: string;
  tipoIncidencia: string;
  destino: string;
  ots: string;
  transporte: string;
  estado: string;
}

interface Bodega {
  id: string;
  nombre: string;
}


@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-incidencias.component.html',
  styleUrl: './ver-incidencias.component.css'
})
export class VerIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  // Lista filtrada de incidencias
  incidenciasFiltradas: Incidencia[] = [];
  isLoading: boolean = true;
  
  // Datos de bodegas
  bodegas: Bodega[] = [
    { id: 'BC-001', nombre: 'B. Central' },
    { id: 'LO-001', nombre: 'L. M. Cousino' },
    { id: 'LO-003', nombre: 'L. M. Arauco' },
    { id: 'LO-007', nombre: 'L. Sol' },
    { id: 'LO-008', nombre: 'L. P. Montt' },
    { id: 'LO-005', nombre: 'L. Melipilla' },
    { id: 'LO-011', nombre: 'L. Valdivia' },
    { id: 'LO-026', nombre: 'L. Maipu' },
    { id: 'LO-002', nombre: 'L. Belloto' },
  ];

  // Tipos de incidencia
  tiposIncidencia = [
    'Recepción de Bodega Central',
    'Traspaso entre locales',
    'Devoluciones'
  ];

  // Estados
  estados = [
    'Aceptada',
    'Rechazada',
    'En Revisión'
  ];

  // Transportes
  transportes = [
    'Fedex',
    'Head',
    'Otro'
  ];

  // Objeto para almacenar los filtros
  filtros: Filtros = {
    fechaDesde: '',
    fechaHasta: '',
    numeroIncidencia: '',
    tipoIncidencia: '',
    destino: '',
    ots: '',
    transporte: '',
    estado: ''
  };

  constructor(private router: Router, private _incidenciaService: IncidenciaService) {}

  ngOnInit() {
    const userIdString = localStorage.getItem('id_usuario');
    const id_usuario= userIdString ? parseInt(userIdString, 10) : 0;
    // Aquí cargarías las incidencias desde tu servicio
    this.cargarIncidencias(id_usuario);
    console.log('dasdsa',userIdString);
    console.log(this.incidencias);
  }

  cargarIncidencias(id_usuario: number) {
    this.isLoading = true;
    this._incidenciaService.getIncidencias(id_usuario).subscribe(
      (incidencias) => {
        console.log('dasdsa',incidencias);
        this.incidencias = incidencias;
        this.incidenciasFiltradas = [...this.incidencias];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar las incidencias:', error);
        this.isLoading = false;
      }
    );
  }

  verDetalle(){
   

  }
 
  aplicarFiltros() {
    // Comenzamos con todas las incidencias
    this.incidenciasFiltradas = [...this.incidencias];

    // Aplicamos cada filtro solo si tiene un valor
    if (this.filtros.fechaDesde) {
      const fechaDesde = new String(this.filtros.fechaDesde);
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia => {
        const fechaIncidencia = new String(incidencia.fecha_recepcion);
        return fechaIncidencia >= fechaDesde;
      });
    }

    if (this.filtros.fechaHasta) {
      const fechaHasta = new String(this.filtros.fechaHasta);
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia => {
        const fechaIncidencia = new String(incidencia.fecha_recepcion);
        return fechaIncidencia <= fechaHasta;
      });
    }

    if (this.filtros.numeroIncidencia) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id?.toString().toLowerCase().includes(this.filtros.numeroIncidencia.toLowerCase())
      );
    }

    if (this.filtros.tipoIncidencia) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id?.toString().toLowerCase().includes(this.filtros.tipoIncidencia.toLowerCase())
      );
    }

    if (this.filtros.destino) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id_bodega?.toString().toLowerCase().includes(this.filtros.destino.toLowerCase())
      );
    }

    if (this.filtros.ots) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.ots?.toLowerCase().includes(this.filtros.ots.toLowerCase())
      );
    }

    if (this.filtros.transporte) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id_estado?.toString().toLowerCase().includes(this.filtros.transporte.toLowerCase())
      );
    }

    if (this.filtros.estado) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id_estado?.toString().toLowerCase().includes(this.filtros.estado.toLowerCase())
      );
    }
  }

  limpiarFiltros() {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      numeroIncidencia: '',
      tipoIncidencia: '',
      destino: '',
      ots: '',
      transporte: '',
      estado: ''
    };
    this.incidenciasFiltradas = [...this.incidencias];
  }
  
}
