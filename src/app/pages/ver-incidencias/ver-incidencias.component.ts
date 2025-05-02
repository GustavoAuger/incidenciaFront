import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface Incidencia {
  id: number;
  fecha: string;
  tipo: string;
  idOrigen: string;
  idDestino: string;
  destino: string;
  unidades: number;
  valorizado: number;
  ots: string;
  transporte: string;
  estado: string;
}

@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-incidencias.component.html',
  styleUrl: './ver-incidencias.component.css'
})
export class VerIncidenciasComponent implements OnInit {
  // Lista completa de incidencias
  incidencias: Incidencia[] = [];
  // Lista filtrada de incidencias
  incidenciasFiltradas: Incidencia[] = [];
  
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

  constructor(private router: Router) {}

  ngOnInit() {
    // Aquí cargarías las incidencias desde tu servicio
    this.cargarIncidencias();
  }

  cargarIncidencias() {
    // Simular datos de ejemplo - Reemplazar con llamada a tu servicio
    this.incidencias = [
      {
        id: 1,
        fecha: '01/01/2025',
        tipo: 'Recepción de Bodega Central',
        idOrigen: 'BC-001',
        idDestino: 'LO-001',
        destino: 'L. M. Cousino',
        unidades: -5,
        valorizado: -154.355,
        ots: '8884847126',
        transporte: 'Fedex',
        estado: 'Rechazada'
      },
      {
        id: 1,
        fecha: '02/01/2025',
        tipo: 'Recepción de Bodega Central',
        idOrigen: 'BC-001',
        idDestino: 'LO-003',
        destino: 'L. M. Arauco',
        unidades: -10,
        valorizado: -300.000,
        ots: '8812847126',
        transporte: 'Fedex',
        estado: 'Aceptada'
      },
      {
        id: 2,
        fecha: '03/01/2025',
        tipo: 'Traspaso entre locales',
        idOrigen: 'LO-001',
        idDestino: 'LO-007',
        destino: 'L. Sol',
        unidades: -1,
        valorizado: -15.247,
        ots: '8989898989',
        transporte: 'Head',
        estado: 'En Revisión'
      },
      {
        id: 2,
        fecha: '04/01/2025',
        tipo: 'Devoluciones',
        idOrigen: 'LO-005',
        idDestino: 'BC-001',
        destino: 'B. Central',
        unidades: -3,
        valorizado: -45.247,
        ots: '8989898990',
        transporte: 'Otro',
        estado: 'Aceptada'
      }
    ];
    this.incidenciasFiltradas = [...this.incidencias];
  }

  aplicarFiltros() {
    // Comenzamos con todas las incidencias
    this.incidenciasFiltradas = [...this.incidencias];

    // Aplicamos cada filtro solo si tiene un valor
    if (this.filtros.fechaDesde) {
      const fechaDesde = new Date(this.filtros.fechaDesde);
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia => {
        const fechaIncidencia = new Date(incidencia.fecha);
        return fechaIncidencia >= fechaDesde;
      });
    }

    if (this.filtros.fechaHasta) {
      const fechaHasta = new Date(this.filtros.fechaHasta);
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia => {
        const fechaIncidencia = new Date(incidencia.fecha);
        return fechaIncidencia <= fechaHasta;
      });
    }

    if (this.filtros.numeroIncidencia) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.id.toString().toLowerCase().includes(this.filtros.numeroIncidencia.toLowerCase())
      );
    }

    if (this.filtros.tipoIncidencia) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.tipo === this.filtros.tipoIncidencia
      );
    }

    if (this.filtros.destino) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.idDestino === this.filtros.destino
      );
    }

    if (this.filtros.ots) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.ots.toLowerCase().includes(this.filtros.ots.toLowerCase())
      );
    }

    if (this.filtros.transporte) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.transporte === this.filtros.transporte
      );
    }

    if (this.filtros.estado) {
      this.incidenciasFiltradas = this.incidenciasFiltradas.filter(incidencia =>
        incidencia.estado === this.filtros.estado
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
