import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { Tipo_incidencia} from '../../interfaces/tipo_incidencia';
import { Filtros } from '../../interfaces/filtros';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe],
  templateUrl: './ver-incidencias.component.html',
  styleUrl: './ver-incidencias.component.css'
})
export class VerIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  // Lista filtrada de incidencias
  incidenciasFiltradas: Incidencia[] = [];
  // Lista de usuarios para mapear ID a nombre
  usuarios: any[] = [];
  isLoading: boolean = true;
  //para los colores grises
  isOrigenOpen = false;
  isDestinoOpen = false;
  isTransporteOpen = false;
  isFechaDesdeOpen = false;
  isFechaHastaOpen = false;
  isTipoIncidenciaOpen = false;
  isEstadoOpen = false;

  // Propiedades para ordenamiento
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Función para controlar la apertura de los selects
  onSelectOpen(select: string) {
    switch(select) {
      case 'fechaDesde':
        this.isFechaDesdeOpen = !this.isFechaDesdeOpen;
        break;
      case 'fechaHasta':
        this.isFechaHastaOpen = !this.isFechaHastaOpen;
        break;
      case 'tipoIncidencia':
        this.isTipoIncidenciaOpen =!this.isTipoIncidenciaOpen;
        break;  
      case 'origen':
        this.isOrigenOpen = !this.isOrigenOpen;
        break;
      case 'destino':
        this.isDestinoOpen = !this.isDestinoOpen;
        break;
      case 'transporte':
        this.isTransporteOpen = !this.isTransporteOpen;
        break;
      case 'estado':
        this.isEstadoOpen =!this.isEstadoOpen;
        break;
    }
  }
  // Datos de bodegas
  bodegas: Bodega[] = [ ];

  // Tipos de incidencia
  tiposIncidencia: Tipo_incidencia[] = [ ];

  // Estados (POR AHORA ESTO SE DEBE TRAER DE LA BD)
  estados = [
    'Nuevo',
    'En Revisión',
    'Aceptada',
    'Rechazada'
  ];

  // Transportes (POR AHORA ESTO SE DEBE TRAER DE LA BD)
  transportes = [
    'FEDEX',
    'BlueExpress',
    'HEAD',
    'Starken',
    'Otro'
  ];

  // Objeto para almacenar los filtros
  filtros: Filtros = {
    fechaDesde: '',
    fechaHasta: '',
    numeroIncidencia: '',
    tipoIncidencia: '',
    origen: '',
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
    
    // Cargar usuarios primero
    this._userService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        // Una vez cargados los usuarios, cargar las incidencias
        this.cargarIncidencias(id_usuario);
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
        // Intentar cargar incidencias de todos modos
        this.cargarIncidencias(id_usuario);
      }
    });

    //manejo de fechas
    const today = new Date();
    const today30 = new Date(today);
    const maxDate = today.toISOString().split('T')[0];
    const fechaInput = document.querySelector('input[name="fecha"]');
    const fechaInput2 = document.querySelector('input[name="fecha2"]');
    today30.setDate(today30.getDate() - 30);
    const minDate = today30.toISOString().split('T')[0]; // Formato yyyy-mm-dd

    // Establecer los valores iniciales de los filtros de fecha
    this.filtros.fechaHasta = maxDate;
    this.filtros.fechaDesde = minDate;

    if (fechaInput && fechaInput2) {
      fechaInput.setAttribute('max', maxDate);
      fechaInput2.setAttribute('max', maxDate);

      // Configurar eventos para actualizar los límites de las fechas
      fechaInput.addEventListener('change', (e) => {
        const fecha1Value = (e.target as HTMLInputElement).value;
        if (fecha1Value) {
          fechaInput2.setAttribute('min', fecha1Value);
        } else {
          // Si se borra la fecha, se restablecen los límites #arreglado el bug del borrar fecha
          fechaInput2.removeAttribute('min');
        }
      });

      fechaInput2.addEventListener('change', (e) => {
        const fecha2Value = (e.target as HTMLInputElement).value;
        if (fecha2Value) {
          fechaInput.setAttribute('max', fecha2Value);
        } else {
          fechaInput.setAttribute('max', maxDate);
        }
      });
    }
    
    this.getBodegas();
    this.getTipoIncidencia();
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

getTipoIncidencia() { 
  this._incidenciaService.getTipoIncidencia().subscribe({ 
    next: (tiposIncidencia: Tipo_incidencia[]) => { 
      this.tiposIncidencia = tiposIncidencia.map(tipo => ({
        id: tipo.id,
        nombre: tipo.nombre
      }));
    }, 
    error: (error: Error) => { 
      console.error('Error al obtener tipos de incidencia', error); 
    } 
  }); 
}
  cargarIncidencias(id_usuario: number) {
    this.isLoading = true;
    this._incidenciaService.getIncidencias(id_usuario).subscribe(
      (incidencias) => {
        // Ordenar incidencias por ID de forma descendente
        this.incidencias = incidencias.sort((a, b) => (b.id || 0) - (a.id || 0));
        this.incidenciasFiltradas = [...this.incidencias];
        
        // Aplicar filtros después de cargar las incidencias
        this.aplicarFiltros();
        
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
          fechaRecepcion: incidencia.fecha_recepcion,
          tipo_estado: incidencia.tipo_estado,
          bodDestino: incidencia.destino_id_bodega || '',      
             
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

  // Metodo para aplicar los filtros
  aplicarFiltros() {
    this.incidenciasFiltradas = this.incidencias.filter(incidencia => {
      const cumpleFechaDesde = !this.filtros.fechaDesde || 
        (incidencia.fecha_recepcion && new Date(incidencia.fecha_recepcion) >= new Date(this.filtros.fechaDesde));
      const cumpleFechaHasta = !this.filtros.fechaHasta || 
        (incidencia.fecha_recepcion && new Date(incidencia.fecha_recepcion) <= new Date(this.filtros.fechaHasta));

      const cumpleNumeroIncidencia = !this.filtros.numeroIncidencia || 
        (incidencia.id?.toString().toLowerCase() || '').includes(this.filtros.numeroIncidencia.toLowerCase()) ||
        (incidencia.id?.toString().toLowerCase() || '').includes(this.filtros.numeroIncidencia.replace('inc', '').toLowerCase()) ||
        ('inc' + (incidencia.id?.toString() || '').toLowerCase()).includes(this.filtros.numeroIncidencia.toLowerCase());
      
      const cumpleTipoIncidencia = !this.filtros.tipoIncidencia || 
        incidencia.id_tipo_incidencia?.toString() === this.filtros.tipoIncidencia;
      const cumpleOrigen = !this.filtros.origen || 
        incidencia.origen_id_local === this.filtros.origen;
      const cumpleDestino = !this.filtros.destino || 
        incidencia.destino! === this.filtros.destino;
      const cumpleOTS = !this.filtros.ots || 
        (incidencia.ots?.toLowerCase() || '').includes(this.filtros.ots.toLowerCase());
      const cumpleTransporte = !this.filtros.transporte || 
        incidencia.transportista === this.filtros.transporte;
      const cumpleEstado = !this.filtros.estado || 
        (incidencia.tipo_estado.toLowerCase() || '').includes(this.filtros.estado.toLowerCase());
      
      return cumpleFechaDesde && cumpleFechaHasta && cumpleNumeroIncidencia && 
             cumpleTipoIncidencia && cumpleOrigen && cumpleDestino && cumpleOTS && 
             cumpleTransporte && cumpleEstado;
    });

    // Aplicar el ordenamiento actual después de filtrar
    this.sortTable(this.sortColumn);
    
    this.updatePagination();
  }

  limpiarFiltros() {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      numeroIncidencia: '',
      tipoIncidencia: '',
      origen:'',
      destino: '',
      ots: '',
      transporte: '',
      estado: ''
    };
    this.incidenciasFiltradas = [...this.incidencias];
    this.updatePagination();
  }
// Método para exportar a Excel todas las incidencias
  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.incidenciasFiltradas);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'Incidencias.xlsx');
  }

  exportToExcel2(): void {
    const incidenciasExpandidas: any[] = [];
    let incidenciasProcesadas = 0;
    
    this.incidenciasFiltradas.forEach(incidencia => {
      if (incidencia.id === undefined) {
        // Si no hay ID, agregamos la incidencia sin detalles
        incidenciasExpandidas.push(incidencia);
        incidenciasProcesadas++;
        
        if (incidenciasProcesadas === this.incidenciasFiltradas.length) {
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(incidenciasExpandidas);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          XLSX.writeFile(workbook, 'Incidencias_con_detalles.xlsx');
        }
        return;
      }

      this._incidenciaService.getDetallesIncidencia(incidencia.id).subscribe({
        next: (detalles) => {
          if (detalles.length === 0) {
            incidenciasExpandidas.push(incidencia);
          } else {
            detalles.forEach(detalle => {
              incidenciasExpandidas.push({
                ...incidencia,
                detalle_producto: detalle.sku,
                detalle_cantidad: detalle.cantidad
              });
            });
          }
          
          incidenciasProcesadas++;
          
          if (incidenciasProcesadas === this.incidenciasFiltradas.length) {
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(incidenciasExpandidas);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            XLSX.writeFile(workbook, 'Incidencias_con_detalles.xlsx');
          }
        },
        error: (error) => {
          console.error('Error al obtener detalles:', error);
          // En caso de error, agregamos la incidencia sin detalles
          incidenciasExpandidas.push(incidencia);
          incidenciasProcesadas++;
          
          if (incidenciasProcesadas === this.incidenciasFiltradas.length) {
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(incidenciasExpandidas);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            XLSX.writeFile(workbook, 'Incidencias_con_detalles.xlsx');
          }
        }
      });
    });
  }

  // Método para obtener el nombre del usuario por su ID
  getNombreUsuario(idUsuario: number | undefined): string {
    if (!idUsuario) return 'N/A';
    const usuario = this.usuarios.find(u => u.id === idUsuario);
    return usuario ? usuario.nombre : 'N/A';
  }

  // Método para ordenar la tabla
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Si ya está ordenado por esta columna, invertir la dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una columna nueva, ordenar en orden ascendente por defecto
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.incidenciasFiltradas.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Manejar el caso especial para el número de incidencia
      if (column === 'id') {
        valueA = a.id || 0;
        valueB = b.id || 0;
      } else if (column === 'usuario') {
        // Ordenar por nombre de usuario
        valueA = this.getNombreUsuario(a.id_usuario).toLowerCase();
        valueB = this.getNombreUsuario(b.id_usuario).toLowerCase();
      } else if (column === 'fecha_emision' || column === 'fecha_recepcion') {
        // Para fechas, convertir a timestamp para comparar
        valueA = a[column] ? new Date(a[column] as string).getTime() : 0;
        valueB = b[column] ? new Date(b[column] as string).getTime() : 0;
      } else {
        // Para otros campos, usar el valor directamente
        valueA = a[column as keyof Incidencia] || '';
        valueB = b[column as keyof Incidencia] || '';
      }

      // Comparar los valores
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Método para obtener el ícono de ordenamiento
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
