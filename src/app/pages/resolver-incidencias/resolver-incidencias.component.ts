import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { Tipo_incidencia } from '../../interfaces/tipo_incidencia';
import { Filtros } from '../../interfaces/filtros';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Transportista } from '../../interfaces/transportista';
import { EstadoIncidencia } from '../../interfaces/estado-incidencia';

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
  isOrigenOpen = false;
  isDestinoOpen = false;
  isTransporteOpen = false;
  isTipoIncidenciaOpen = false;
  isEstadoOpen = false;

  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  bodegas: Bodega[] = [];
  bodegasOrigen: Bodega[] = [];
  bodegasDestino: Bodega[] = [];
  tiposIncidencia: Tipo_incidencia[] = [];
  estados: EstadoIncidencia[] = [];
  transportistas: Transportista[] = [];

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

    this._incidenciaService.getEstadoIncidencias().subscribe({
      next: (estados) => {
        this.estados = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados de incidencias', error);
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

    this.getBodegas();
    this.getTipoIncidencia();
  }

  getBodegas() {
    this._userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        this.bodegas = bodegas;
        this.bodegasOrigen = bodegas.filter(bodega => 
          bodega.id_bodega !== 'BDE-001' && bodega.id_bodega !== 'LO-000'
        );
        this.bodegasDestino = bodegas.filter(bodega => 
          bodega.id_bodega !== 'BDE-001'
        );
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al obtener las bodegas:', error);
      }
    });
  }

  getTipoIncidencia() {
    this._incidenciaService.getTipoIncidencia().subscribe({
      next: (tipos: Tipo_incidencia[]) => {
        this.tiposIncidencia = tipos;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al obtener los tipos de incidencia:', error);
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
      // Verificar si incidencia.id existe antes de usarlo
      if (this.filtros.numeroIncidencia && 
          (!incidencia.id || !incidencia.id.toString().includes(this.filtros.numeroIncidencia))) {
        return false;
      }
      
      if (this.filtros.tipoIncidencia && 
          (!incidencia.id_tipo_incidencia || incidencia.id_tipo_incidencia.toString() !== this.filtros.tipoIncidencia)) {
        return false;
      }
      
      if (this.filtros.origen && 
          incidencia.origen_id_local !== this.filtros.origen) {
        return false;
      }
      
      if (this.filtros.destino && 
          incidencia.destino_id_bodega !== this.filtros.destino) {
        return false;
      }
      
      return true;
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
      case 'tipoIncidencia':
        this.isTipoIncidenciaOpen = !this.isTipoIncidenciaOpen;
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
        this.isEstadoOpen = !this.isEstadoOpen;
        break;
    }
  }

  resolverIncidencia(incidencia: any) {
    console.log('Resolviendo incidencia:', incidencia);
    // Add your resolver logic here
  }
}