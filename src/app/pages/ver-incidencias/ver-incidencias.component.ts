import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { Filtros } from '../../interfaces/filtros';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe, DateFormatPipe],
  templateUrl: './ver-incidencias.component.html',
  styleUrl: './ver-incidencias.component.css'
})
export class VerIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  // Lista filtrada de incidencias
  incidenciasFiltradas: Incidencia[] = [];
  isLoading: boolean = true;
  
  // Datos de bodegas
  bodegas: Bodega[] = [ ];

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

  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;

  Math = Math;

  constructor(
      private router: Router, 
      private _incidenciaService: IncidenciaService,
      private _userService: UserService
  ) {}

  ngOnInit() {
    const userIdString = localStorage.getItem('id_usuario');
    const id_usuario = userIdString ? parseInt(userIdString, 10) : 0;
    this.cargarIncidencias(id_usuario);
    this.getBodegas(); // Añadir esta línea
}

getBodegas() {
    this._userService.getBodegas().subscribe({
        next: (bodegas: Bodega[]) => {
            this.bodegas = bodegas;
        },
        error: (error: Error) => {
            console.error('Error al obtener bodegas', error);
        }
    });
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

  verDetalle(incidencia: Incidencia) {
    // Guardar la incidencia en el servicio
    this._incidenciaService.setIncidenciaParcial(incidencia);
    
    // Preparar los datos para la navegación
    const navigationExtras = {
      state: {
        incidencia: {
          bodOrigen: incidencia.id_bodega,
          bodOrigenNombre: incidencia.origen_id_local || 'Origen no disponible',
          transportista: incidencia.id_transportista,
          transportistaNombre: incidencia.transportista || '',
          ots: incidencia.ots,
          fechaRecepcion: incidencia.fecha_recepcion
        }
      }
    };
    
    // Navegar a la vista de detalle con modo visualización y el ID de la incidencia
    this.router.navigate(['/crear-detalle-incidencia'], {
      ...navigationExtras,
      queryParams: {
        modo: 'visualizacion',
        id: incidencia.id
      }
    });
}
 
  // Getter para obtener las incidencias paginadas
  get paginatedIncidencias(): Incidencia[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.incidenciasFiltradas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Método para cambiar de página
  pageChanged(event: number): void {
    this.currentPage = event;
  }

  // Método para actualizar la paginación cuando se filtran resultados
  private updatePagination(): void {
    this.totalItems = this.incidenciasFiltradas.length;
    this.currentPage = 1; // Volver a la primera página al aplicar filtros
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

    // Actualizar la paginación después de aplicar los filtros
    this.updatePagination();
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
    this.updatePagination();
  }

}
