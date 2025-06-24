import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { EstadoIncidencia } from '../../interfaces/estado-incidencia';
import { Filtros } from '../../interfaces/filtros';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Transportista } from '../../interfaces/transportista';

@Component({
  selector: 'app-resolver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe],
  templateUrl: './resolver-incidencias.component.html',
  styleUrls: ['./resolver-incidencias.component.css']
})
export class ResolverIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  incidenciasFiltradas: Incidencia[] = [];
  usuarios: any[] = [];
  isLoading: boolean = true;
  isDestinoOpen = false;
  isTransporteOpen = false;
  isEstadoOpen = false;

  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  bodegas: Bodega[] = [];
  bodegasDestino: Bodega[] = [];
  estadosIncidencia: EstadoIncidencia[] = [];
  transportistas: Transportista[] = [];

  filtros: Filtros = {
    fechaDesde: '',
    fechaHasta: '',
    numeroIncidencia: '',
    origen: '',
    destino: '',
    ots: '',
    transporte: '',
    estado: '',
    tipoIncidencia: ''
  };

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;

  Math = Math;

  showResolveModal: boolean = false;
  selectedIncidencia: any = null;
  selectedEstado: number | null = null;
  isUpdating: boolean = false;

  constructor(
    private router: Router,
    private _incidenciaService: IncidenciaService,
    private _userService: UserService
  ) {
    this.cargarEstadosIncidencia();
  }

  ngOnInit() {
    this.isLoading = true;
    const userIdString = localStorage.getItem('id_usuario');
    const id_usuario = userIdString ? parseInt(userIdString, 10) : 0;

    this._userService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargarIncidencias(id_usuario);
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
        this.cargarIncidencias(id_usuario);
      }
    });

    this._incidenciaService.getTransportistas().subscribe({
      next: (transportistas) => {
        this.transportistas = transportistas;
      },
      error: (error) => {
        console.error('Error al cargar transportistas', error);
      }
    });

    this.cargarBodegas();
  }

  private cargarEstadosIncidencia() {
    this._incidenciaService.getEstadoIncidencias().subscribe({
      next: (estados) => {
        this.estadosIncidencia = estados;
      },
      error: (error) => {
        console.error('Error al cargar los estados de incidencia:', error);
      }
    });
  }

  cargarBodegas() {
    this._userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        this.bodegas = bodegas;
        
        // Filtrar bodegas para el dropdown de destino (excluir BC-001 y LO-000)
        this.bodegasDestino = bodegas.filter(bodega => 
          bodega.id_bodega !== 'BC-001' && bodega.id_bodega !== 'LO-000'
        );
        
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar bodegas', error);
      }
    });
  }

  cargarIncidencias(id_usuario: number) {
    const id_bodega_ls = localStorage.getItem('id_bodega');
    
    if (!id_bodega_ls) {
      this.isLoading = false;
      return;
    }

    try {
      const bodegaEncontrada = this.bodegas.find(bodega => bodega.id.toString() === id_bodega_ls);
      const userBodegaId = bodegaEncontrada?.id_bodega;

      if (!userBodegaId) {
        console.error('No se pudo obtener el id_bodega del usuario');
        this.isLoading = false;
        return;
      }

      this._incidenciaService.getIncidencias(id_usuario).subscribe({
        next: (data: Incidencia[]) => {
          console.log('Datos crudos de incidencias:', data);
          
          // Filtrar solo incidencias con id_estado 1 (Nuevo) o 2 (En Revisión)
          // y que coincidan con la bodega del usuario
          const incidenciasFiltradas = data.filter(incidencia => {
            const cumpleFiltro = (incidencia.id_estado === 1 || incidencia.id_estado === 2) &&
                             incidencia.origen_id_local === userBodegaId;
            console.log('Incidencia:', incidencia.id, 'cumple filtro:', cumpleFiltro, 'origen_id_local:', incidencia.origen_id_local, 'userBodegaId:', userBodegaId);
            console.log(cumpleFiltro);
            return cumpleFiltro;
          });

          console.log('Incidencias filtradas:', incidenciasFiltradas);

          // Ordenar los datos por ID de forma descendente
          this.incidencias = incidenciasFiltradas.sort((a, b) => {
            const idA = Number(a.id) || 0;
            const idB = Number(b.id) || 0;
            return idB - idA; // Orden descendente
          });
          
          this.incidenciasFiltradas = [...this.incidencias];
          console.log('Incidencias finales:', this.incidenciasFiltradas);
          this.isLoading = false;
          
          // Actualizar las variables de ordenamiento
          this.sortColumn = 'id';
          this.sortDirection = 'desc';
        },
        error: (error) => {
          console.error('Error al cargar las incidencias:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error al procesar la bodega:', error);
      this.isLoading = false;
    }
  }

  getNombreUsuario(id: number | undefined): string {
    if (id === undefined) return 'Usuario no encontrado';
    const usuario = this.usuarios.find(u => u.id === id);
    return usuario ? usuario.nombre : 'Usuario no encontrado';
  }

  aplicarFiltros() {
    this.currentPage = 1;
    
    this.incidenciasFiltradas = this.incidencias.filter(incidencia => {
      // Filtro por número de incidencia (búsqueda parcial insensible a mayúsculas/minúsculas)
      const searchTerm = (this.filtros.numeroIncidencia || '').toLowerCase().trim();
      const idStr = incidencia.id?.toString() || '';
      const formattedId = `inc${idStr}`; // Formato: 'inc78'
      const formattedIdWithDash = `inc-${idStr}`; // Formato: 'inc-78'
      
      const cumpleNumeroIncidencia = !searchTerm || 
        idStr.toLowerCase().includes(searchTerm) ||
        formattedId.includes(searchTerm) ||
        formattedIdWithDash.includes(searchTerm);
      
      // Aplicar los demás filtros
      return (
        cumpleNumeroIncidencia &&
        (!this.filtros.destino || 
          incidencia.destino_id_bodega?.toString() === this.filtros.destino) &&
        (!this.filtros.transporte || 
          incidencia.id_transportista?.toString() === this.filtros.transporte) &&
        (!this.filtros.estado || 
          incidencia.id_estado?.toString() === this.filtros.estado)
      );
    });
    
    this.totalItems = this.incidenciasFiltradas.length;
  }

  sortTable(column: string) {
    // Si es la misma columna, cambiamos la dirección
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una columna diferente, la establecemos y ordenamos descendente por defecto
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }

    this.incidenciasFiltradas.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];

      // Manejar valores undefined o null
      if (valueA === undefined || valueA === null) valueA = '';
      if (valueB === undefined || valueB === null) valueB = '';

      // Manejo especial para columnas numéricas (como 'id')
      if (column === 'id') {
        const numA = Number(valueA);
        const numB = Number(valueB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return this.sortDirection === 'asc' ? numA - numB : numB - numA;
        }
      }

      // Comparación por defecto para cadenas
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      if (strA < strB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (strA > strB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  verDetalle(incidencia: Incidencia) {
    // Guardar la incidencia en el servicio
    this._incidenciaService.setIncidenciaParcial(incidencia);
    console.log(incidencia);
    
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
          id_bodega: incidencia.d_id_bodega,
        },
        // Agregar información de la ruta de origen
        fromRoute: 'resolver-incidencias'
      }
    };
    
    // Navegar a la vista de detalle con modo visualización y el ID de la incidencia
    this.router.navigate(['/crear-detalle-incidencia'], {
      ...navigationExtras,
      queryParams: {
        modo: 'visualizacion',
        id: incidencia.id,
        from: 'resolver-incidencias' // Agregar parámetro de consulta para identificar la ruta de origen
      }
    });
  }

  get paginatedIncidencias(): Incidencia[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.incidenciasFiltradas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSelectOpen(select: string) {
    switch(select) {
      case 'destino':
        this.isDestinoOpen = !this.isDestinoOpen;
        break;  
      case 'transporte':
        this.isTransporteOpen = !this.isTransporteOpen;
        break;
      case 'estado':
        this.isEstadoOpen = !this.isEstadoOpen;
        break;
    }
  }

  resolverIncidencia(incidencia: any) {
    this.selectedIncidencia = { ...incidencia };
    
    // Si el estado actual es 'Nuevo' (id 1), cambiar a 'En Revisión' (id 2) sin mostrar alertas
    if (this.selectedIncidencia.id_estado === 1) {
      this._incidenciaService.updateEstadoIncidencia({
        id_incidencia: this.selectedIncidencia.id,
        id_estado: 2 // Estado 'En Revisión'
      }).subscribe({
        next: (response) => {
          if (response) {
            // Actualizar el estado localmente
            const index = this.incidencias.findIndex(i => i.id === this.selectedIncidencia.id);
            if (index !== -1) {
              this.incidencias[index].id_estado = 2;
              this.incidencias[index].tipo_estado = 'En Revisión';
              this.aplicarFiltros();
            }
            // Abrir el modal después de actualizar el estado
            this.showResolveModal = true;
          }
        },
        error: (error) => {
          console.error('Error al actualizar el estado a En Revisión:', error);
          // Aún así abrir el modal aunque falle la actualización
          this.showResolveModal = true;
        }
      });
    } else {
      // Si no es estado 'Nuevo', simplemente abrir el modal
      this.showResolveModal = true;
    }
  }

  closeResolveModal() {
    this.showResolveModal = false;
    this.selectedEstado = null;
    this.selectedIncidencia = null;
  }

  confirmarResolucion() {
    if (this.selectedEstado && this.selectedIncidencia) {
      this.actualizarEstadoIncidencia(this.selectedEstado);
    }
  }

  private actualizarEstadoIncidencia(nuevoEstadoId: number) {
    if (!this.selectedIncidencia) return;
    
    this.isUpdating = true;
    const userIdString = localStorage.getItem('id_usuario');
    const id_usuario = userIdString ? parseInt(userIdString, 10) : 0;
    
    // Primero generar el movimiento
    this._incidenciaService.generarMovimiento(this.selectedIncidencia.id).subscribe({
      next: (movimientoResponse) => {
        if (movimientoResponse) {
          // Si el movimiento se generó correctamente, proceder con la actualización del estado
          // Llamar al servicio para actualizar el estado de la incidencia
          this._incidenciaService.updateEstadoIncidencia({
            id_incidencia: this.selectedIncidencia.id,
            id_estado: nuevoEstadoId
          }).subscribe({
            next: (response) => {
              if (response) {
                // Actualizar el estado de la incidencia antes de enviar correo
                this.selectedIncidencia.id_estado = nuevoEstadoId;
                
                // Enviar correo con la incidencia actualizada
                console.log("Enviando correo con incidencia:", this.selectedIncidencia);
                this._incidenciaService.enviarCorreo(this.selectedIncidencia).subscribe({
                  next: (correoResponse) => {
                    if (correoResponse) {
                      console.log('Correo enviado exitosamente');
                    } else {
                      console.error('Error al enviar correo');
                    }
                  },
                  error: (error) => {
                    console.error('Error al enviar correo:', error);
                  }
                });

                // Cerrar el modal y resetear el estado
                this.showResolveModal = false;
                this.selectedEstado = null;
                
                // Guardar el estado actual de paginación y ordenamiento
                const currentPage = this.currentPage;
                const currentSortColumn = this.sortColumn;
                const currentSortDirection = this.sortDirection;
                
                alert('Incidencia actualizada correctamente');
                
                // Recargar las incidencias
                this.cargarIncidencias(id_usuario);
              }
            },
            error: (error) => {
              console.error('Error al actualizar la incidencia:', error);
              alert('Ocurrió un error al actualizar la incidencia. Por favor, intente nuevamente.');
              this.isUpdating = false;
            },
            complete: () => {
              this.isUpdating = false;
            }
          });
        } else {
          console.error('No se pudo generar el movimiento');
          alert('No se pudo generar el movimiento. Por favor, intente nuevamente.');
          this.isUpdating = false;
          // Cerrar el modal y resetear el estado
          this.showResolveModal = false;
          this.selectedEstado = null;
          
          // Guardar el estado actual de paginación y ordenamiento
          const currentPage = this.currentPage;
          const currentSortColumn = this.sortColumn;
          const currentSortDirection = this.sortDirection;
          
        
          
          // Recargar las incidencias
          this.cargarIncidencias(id_usuario);
        }
      },
      error: (error) => {
        console.error('Error al actualizar la incidencia:', error);
        alert('Ocurrió un error al actualizar la incidencia. Por favor, intente nuevamente.');
        this.isUpdating = false;
      },
      complete: () => {
        this.isUpdating = false;
      }
    });
  }
  
  private getEstadoNombre(estadoId: number): string {
    const estado = this.estadosIncidencia.find(e => e.id === estadoId);
    return estado ? estado.tipo_estado : 'Desconocido';
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      numeroIncidencia: '',
      origen: '',
      destino: '',
      ots: '',
      transporte: '',
      estado: '',
      tipoIncidencia: ''
    };
    
    this.currentPage = 1;
    this.incidenciasFiltradas = [...this.incidencias];
    this.totalItems = this.incidenciasFiltradas.length;
  }
}
