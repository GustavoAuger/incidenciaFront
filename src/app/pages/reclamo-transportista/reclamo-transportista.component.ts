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
import { Transportista } from '../../interfaces/transportista';
import { ReclamoTransportistaService } from '../../services/reclamo-transportista.service';
import { EstadoReclamo } from '../../interfaces/estado-reclamo';
import { ReclamoTransportista } from '../../interfaces/reclamo-transportista';

@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe],
  templateUrl: './reclamo-transportista.component.html',
  styleUrl: './reclamo-transportista.component.css'
})
export class ReclamoTransportistaComponent implements OnInit {
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

  // Propiedades para ordenamiento
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Propiedad para controlar la pestaña activa
  activeTab: 'reclamadas' | 'ingresar_reclamo' = 'reclamadas';
  
  // Modificar las propiedades de incidencias para manejar ambos estados
  incidenciasReclamadas: Incidencia[] = [];
  ingresarReclamo: Incidencia[] = [];

  // Propiedades para el modal de estados de reclamo
  ingresarReclamoModal: boolean = false;
  selectedEstadoReclamo: string = '';
  estadosReclamo: EstadoReclamo[] = [];
  incidenciaSeleccionada: Incidencia | null = null;

  // Propiedades para el formulario de reclamo
  reclamoForm = {
    fdr: '',
    fechaReclamo: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    observacion: ''
  };

  // Getter para verificar si mostrar campos adicionales
  get mostrarCamposAdicionales(): boolean {
    return this.selectedEstadoReclamo === '1'; // 1 es el ID para "Reclamado"
  }

  // Propiedad para almacenar la fecha actual
  fechaActual: string = new Date().toISOString().split('T')[0];

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
    }
  }
  // Datos de bodegas
  bodegas: Bodega[] = [ ];
  bodegasDestino: Bodega[] = [];

  // Tipos de incidencia
  tiposIncidencia: Tipo_incidencia[] = [ ];

  // Transportes (ahora se obtienen del servicio)
  transportistas: Transportista[] = [];

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
      private _userService: UserService,
      private reclamoTransportistaService: ReclamoTransportistaService
  ) {}

  ngOnInit() {
    // Mostrar loader
    this.isLoading = true;
    
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

    // Cargar transportistas
    this._incidenciaService.getTransportistas().subscribe({
      next: (transportistas) => {
        this.transportistas = transportistas;
      },
      error: (error) => {
        console.error('Error al cargar transportistas', error);
      }
    });

    // Configurar fechas
    const today = new Date();
    const today30 = new Date(today);
    const maxDate = today.toISOString().split('T')[0];
    const fechaInput = document.querySelector('input[name="fecha"]');
    const fechaInput2 = document.querySelector('input[name="fecha2"]');
    today30.setDate(today30.getDate() - 30);
    const minDate = today30.toISOString().split('T')[0];

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
    this.loadEstadosReclamo();
  }

  getBodegas() {
    this._userService.getBodegas().subscribe({
        next: (bodegas: Bodega[]) => {
            this.bodegas = bodegas;
            
            // Filtrar bodegas para el dropdown de destino (excluir BC-001 y LO-000)
            this.bodegasDestino = bodegas.filter(bodega => 
              bodega.id_bodega !== 'BC-001' && bodega.id_bodega !== 'LO-000'
            );
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

  // Método para cargar los estados de reclamo
  loadEstadosReclamo(): void {
    this.reclamoTransportistaService.getEstadosReclamo().subscribe({
      next: (estados) => {
        this.estadosReclamo = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados de reclamo:', error);
      }
    });
  }

  // Método para abrir el modal de estado de reclamo
  editarReclamo(incidencia: Incidencia): void {
    this.incidenciaSeleccionada = incidencia;
    this.selectedEstadoReclamo = ''; // Reiniciar selección
    
    // Reiniciar el formulario
    this.reclamoForm = {
      fdr: '',
      fechaReclamo: new Date().toISOString().split('T')[0],
      observacion: ''
    };
    
    this.ingresarReclamoModal = true;
  }

  // Método para cerrar el modal
  closeIngresarReclamoModal(): void {
    this.ingresarReclamoModal = false;
    this.incidenciaSeleccionada = null;
  }

  // Método para cambiar entre pestañas
  cambiarTab(tab: 'reclamadas' | 'ingresar_reclamo') {
    this.activeTab = tab;
    this.aplicarFiltros();
  }

  cargarIncidencias(id_usuario: number) {
    this.isLoading = true;
    this._incidenciaService.getIncidencias(id_usuario).subscribe(
      (incidencias) => {
        const todasLasIncidencias = [...incidencias].sort((a, b) => (b.id || 0) - (a.id || 0));
        let incidenciasFiltradas = [...todasLasIncidencias];
        
        if (localStorage.getItem('id_rol') == '2') {
          incidenciasFiltradas = incidenciasFiltradas.filter((inc) => inc.destino_id_bodega == 'BDE-001');
        } else if (localStorage.getItem('id_rol') == '4') {
          const id_bodega = 'LO-' + (localStorage.getItem('id_bodega')!.padStart(3, '0'));
          incidenciasFiltradas = incidenciasFiltradas.filter((inc) => 
            inc.destino_id_bodega === id_bodega || 
            inc.origen_id_local === id_bodega
          );
        }
        
        this.incidenciasReclamadas = incidenciasFiltradas.filter(inc => 
          inc.id_estado === 4
        );
        
        this.ingresarReclamo = incidenciasFiltradas.filter(inc => 
          inc.id_estado === 4
        );
        
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
    console.log(incidencia)
    // Preparar los datos para la navegación
    const navigationExtras = {
      state: {
        fromRoute: 'reclamo-transportista', 
        incidencia: {
          bodOrigen: incidencia.id_bodega,
          bodOrigenNombre: incidencia.origen_id_local || 'Origen no disponible',
          transportista: incidencia.id_transportista,
          transportistaNombre: incidencia.transportista || '',
          ots: incidencia.ots,
          fechaRecepcion: incidencia.fecha_recepcion,
          tipo_estado: incidencia.tipo_estado,
          bodDestino: incidencia.destino_id_bodega || '',      
          id_bodega: incidencia.d_id_bodega,     
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
    // Seleccionar el conjunto de datos según la pestaña activa
    const dataSource = this.activeTab === 'reclamadas' 
      ? [...this.incidenciasReclamadas] 
      : [...this.ingresarReclamo];
    
    this.incidenciasFiltradas = dataSource.filter(incidencia => {
      // Filtro por fechas
      const cumpleFechaDesde = !this.filtros.fechaDesde || 
        (incidencia.fecha_recepcion && new Date(incidencia.fecha_recepcion) >= new Date(this.filtros.fechaDesde));
      
      const cumpleFechaHasta = !this.filtros.fechaHasta || 
        (incidencia.fecha_recepcion && new Date(incidencia.fecha_recepcion) <= new Date(this.filtros.fechaHasta));

      // Filtro por número de incidencia
      const cumpleNumeroIncidencia = !this.filtros.numeroIncidencia || 
        (incidencia.id?.toString().toLowerCase() || '').includes(this.filtros.numeroIncidencia.toLowerCase()) ||
        (incidencia.id?.toString().toLowerCase() || '').includes(this.filtros.numeroIncidencia.replace('inc', '').toLowerCase()) ||
        ('inc' + (incidencia.id?.toString() || '').toLowerCase()).includes(this.filtros.numeroIncidencia.toLowerCase());
      
      // Filtro por tipo de incidencia
      const cumpleTipoIncidencia = !this.filtros.tipoIncidencia || 
        incidencia.id_tipo_incidencia?.toString() === this.filtros.tipoIncidencia;
      
      // Filtro por destino
      const cumpleDestino = !this.filtros.destino || 
        incidencia.destino === this.filtros.destino;
      
      // Filtro por OTS
      const cumpleOTS = !this.filtros.ots || 
        (incidencia.ots?.toLowerCase() || '').includes(this.filtros.ots.toLowerCase());
      
      // Filtro por transportista (comparando el nombre)
      const cumpleTransporte = !this.filtros.transporte || 
        (incidencia.transportista?.toLowerCase() === this.filtros.transporte.toLowerCase());
      
      // Aplicar todos los filtros
      return cumpleFechaDesde && 
             cumpleFechaHasta && 
             cumpleNumeroIncidencia && 
             cumpleTipoIncidencia && 
             cumpleDestino && 
             cumpleOTS && 
             cumpleTransporte;
    });

    // Ordenar por ID descendente después de filtrar
    this.incidenciasFiltradas.sort((a, b) => (b.id || 0) - (a.id || 0));
    
    // Actualizar la paginación
    this.updatePagination();
  }

  limpiarFiltros() {
    this.filtros = {
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
    this.incidenciasFiltradas = [...this.incidencias];
    this.updatePagination();
  }

  // Método para navegar a una ruta específica
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Método para ordenar la tabla
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.incidenciasFiltradas.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Manejar diferentes tipos de columnas
      if (column === 'numero_reclamo') {
        valueA = this.getNumeroReclamo(a);
        valueB = this.getNumeroReclamo(b);
      } else if (column === 'fecha_emision' || column === 'fecha_recepcion') {
        // Para fechas, convertir a timestamp para comparar
        valueA = a[column] ? new Date(a[column] as string).getTime() : 0;
        valueB = b[column] ? new Date(b[column] as string).getTime() : 0;
      } else if (column === 'valorizado' || column === 'total_item') {
        // Para valores numéricos
        valueA = Number(a[column as keyof Incidencia]) || 0;
        valueB = Number(b[column as keyof Incidencia]) || 0;
      } else {
        // Para otros campos, usar el valor directamente
        valueA = a[column as keyof Incidencia] || '';
        valueB = b[column as keyof Incidencia] || '';
      }

      // Manejar valores nulos o indefinidos
      if (valueA == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueB == null) return this.sortDirection === 'asc' ? 1 : -1;

      // Comparar valores
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

  // Método para obtener el número de reclamo
  getNumeroReclamo(incidencia: Incidencia): string {
    // Lógica temporal con valor fijo - reemplazar con lógica real cuando esté disponible
    // Formato: R-{id_incidencia}
    const idIncidencia = incidencia.id?.toString().padStart(4, '0') || '0000';
    
    return `R-${idIncidencia}`;
  }

  // Método para obtener el estado del reclamo con formato
  getEstadoReclamo(incidencia: Incidencia): string {
    if (incidencia.tipo_estado?.toLowerCase() === 'resuelto') {
      return 'Pagado';
    } else if (incidencia.tipo_estado?.toLowerCase() === 'rechazado') {
      return 'Rechazado';
    }
    return 'Reclamado';
  }

  // Método para obtener la clase CSS según el estado
  getEstadoClass(estado: string | undefined): string {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch(estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en proceso':
        return 'bg-blue-100 text-blue-800';
      case 'resuelto':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getMontoPagado(incidencia: any): number {
    //Logica para obtener el monto pagado
    return 0;
  }

  getFDR(incidencia: Incidencia): string {
    // Implement your FDR logic here
    // For example, if FDR is a property of incidencia:
    // return incidencia.fdr || 'N/A';
    
    // Or if you need to calculate it:
    // return `FDR-${incidencia.id || '0000'}`;
    
    // For now, returning an empty string as a placeholder
    return '';
  }

  getFechaReclamo(incidencia: Incidencia): string {
    //Logica para obtener la fecha de reclamo
    return '';
  }

  guardarReclamo() {
    // Validar que haya una incidencia seleccionada
    if (!this.incidenciaSeleccionada?.id) {
      alert('No se ha seleccionado una incidencia válida');
      return;
    }

    // Validar que la fecha no sea posterior a hoy
    const fechaReclamo = new Date(this.reclamoForm.fechaReclamo);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReclamo > hoy) {
      alert('La fecha de reclamo no puede ser posterior a la fecha actual');
      return;
    }

    // Validar campos requeridos
    if (!this.reclamoForm.fdr) {
      alert('El campo FDR es requerido');
      return;
    }

    // Crear el objeto ReclamoTransportista
    const nuevoReclamo: ReclamoTransportista = {
      id_incidencia: this.incidenciaSeleccionada.id,
      monto_pagado: 0, // Valor por defecto
      fdr: this.reclamoForm.fdr,
      fecha_reclamo: new Date(this.reclamoForm.fechaReclamo),
      observacion: this.reclamoForm.observacion || '',
      id_estado: 1 // Siempre 1 según el requerimiento
    };

    // Llamar al servicio para guardar el reclamo
    this.reclamoTransportistaService.createReclamoTransportista(nuevoReclamo).subscribe({
      next: (response) => {
        console.log('Reclamo guardado exitosamente', response);
        alert('Reclamo guardado correctamente');
        this.closeIngresarReclamoModal();
        // Aquí podrías recargar la lista de reclamos o actualizar la vista según sea necesario
      },
      error: (error) => {
        console.error('Error al guardar el reclamo', error);
        alert('Error al guardar el reclamo. Por favor intente nuevamente.');
      }
    });
  }
}
