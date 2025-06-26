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
import ExcelJS from 'exceljs'; // para los estilos del excel
import { Transportista } from '../../interfaces/transportista';
import { EstadoIncidencia } from '../../interfaces/estado-incidencia';

@Component({
  selector: 'app-ver-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe],
  templateUrl: './ver-incidencias.component.html',
  styleUrls: ['./ver-incidencias.component.css']
})
export class VerIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  // Lista filtrada de incidencias
  incidenciasFiltradas: Incidencia[] = [];
  // Lista de usuarios para mapear ID a nombre
  usuarios: any[] = [];
  isLoading: boolean = true;
  isLoadingExcel: boolean = false;
  isLoadingExcel2: boolean = false;
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
  bodegasOrigen: Bodega[] = [];
  bodegasDestino: Bodega[] = [];

  // Tipos de incidencia
  tiposIncidencia: Tipo_incidencia[] = [ ];

  // Estados (ahora se obtienen del servicio)
  estados: EstadoIncidencia[] = [];

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
      private _userService: UserService
  ) {
    this.incidenciasFiltradas = this.incidencias;
    this.isLoadingExcel = false;
    this.isLoadingExcel2 = false;
  }

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

    // Cargar estados de incidencias
    this._incidenciaService.getEstadoIncidencias().subscribe({
      next: (estados) => {
        console.log('Estados recibidos:', estados);
        this.estados = estados;
      },
      error: (error) => {
        console.error('Error al cargar estados de incidencias', error);
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
  }

  getBodegas() {
    this._userService.getBodegas().subscribe({
        next: (bodegas: Bodega[]) => {
            this.bodegas = bodegas;
            
            // Filtrar bodegas para el dropdown de origen (excluir BDE-001 y LO-000)
            this.bodegasOrigen = bodegas.filter(bodega => 
              bodega.id_bodega !== 'BDE-001' && bodega.id_bodega !== 'LO-000'
            );
            
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
  cargarIncidencias(id_usuario: number) {
    this.isLoading = true;
    this._incidenciaService.getIncidencias(id_usuario).subscribe(
      (incidencias) => {
        // Ordenar incidencias por ID de forma descendente
        this.incidencias = incidencias.sort((a, b) => (b.id || 0) - (a.id || 0));
        
        // Establecer la columna de ordenación y dirección por defecto
        this.sortColumn = 'id';
        this.sortDirection = 'desc';
        
        if (localStorage.getItem('id_rol') == '2') {
          this.incidencias = this.incidencias.filter((inc) => inc.destino_id_bodega == 'BDE-001');
        } else if (localStorage.getItem('id_rol') == '4') {
          const id_bodega = 'LO-' + (localStorage.getItem('id_bodega')!.padStart(3, '0'));
          this.incidencias = this.incidencias.filter((inc) => 
            inc.destino_id_bodega === id_bodega || 
            inc.origen_id_local === id_bodega
          );
        }        

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
    console.log(incidencia);
    console.log(incidencia.ruta);
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
          ruta: incidencia.ruta,
          observaciones: incidencia.observaciones
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
      
      // Filtro por origen
      const cumpleOrigen = !this.filtros.origen || 
        incidencia.origen_id_local === this.filtros.origen;
      
      // Filtro por destino
      const cumpleDestino = !this.filtros.destino || 
        incidencia.destino === this.filtros.destino;
      
      // Filtro por OTS
      const cumpleOTS = !this.filtros.ots || 
        (incidencia.ots?.toLowerCase() || '').includes(this.filtros.ots.toLowerCase());
      
      // Filtro por transportista (comparando el nombre)
      const cumpleTransporte = !this.filtros.transporte || 
        (incidencia.transportista?.toLowerCase() === this.filtros.transporte.toLowerCase());
      
      // Logs de depuración (puedes eliminarlos después de verificar que funcione)
      if (this.filtros.transporte) {
        console.log('Filtrando transportista - Nombre seleccionado:', this.filtros.transporte);
        console.log('Transportista en incidencia:', incidencia.transportista);
        console.log('¿Coincide?', incidencia.transportista?.toLowerCase() === this.filtros.transporte.toLowerCase());
      }
      
      // Filtro por estado (comparando el tipo_estado)
      const cumpleEstado = !this.filtros.estado || 
        (incidencia.tipo_estado?.toLowerCase() === this.filtros.estado.toLowerCase());
      
      // Aplicar todos los filtros
      return cumpleFechaDesde && 
             cumpleFechaHasta && 
             cumpleNumeroIncidencia && 
             cumpleTipoIncidencia && 
             cumpleOrigen && 
             cumpleDestino && 
             cumpleOTS && 
             cumpleTransporte && 
             cumpleEstado;
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
async exportToExcel(): Promise<void> {
  this.isLoadingExcel = true;
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    // Definir encabezados
    const columnas = [
      { header: 'Número de incidencia', key: 'id' },
      { header: 'Fecha de recepción', key: 'fecha_recepcion' },
      { header: 'Fecha emisión', key: 'fecha_emision' },
      { header: 'Estado', key: 'tipo_estado' },
      { header: 'Transportista', key: 'transportista' },
      { header: 'Código Bodega Origen', key: 'origen_id_local' },
      { header: 'Código Bodega Destino', key: 'destino_id_bodega' },
      { header: 'Bodega de destino', key: 'destino' },
      { header: 'OTS', key: 'ots' },
      { header: 'Valorizado', key: 'valorizado' },
      { header: 'Total item', key: 'total_item' }
    ];
    worksheet.columns = columnas.map(col => ({
      header: col.header,
      key: col.key,
      width: 17
    }));

    // Agregar datos
    this.incidenciasFiltradas.forEach(incidencia => {
      worksheet.addRow({
        id: incidencia.id || '',
        fecha_recepcion: incidencia.fecha_recepcion?.split('T')[0] || '',
        fecha_emision: incidencia.fecha_emision?.split('T')[0] || '',
        tipo_estado: this.toInitCap(incidencia.tipo_estado || ''),
        transportista: this.toInitCap(incidencia.transportista || ''),
        origen_id_local: incidencia.origen_id_local || '',
        destino_id_bodega: incidencia.destino_id_bodega || '',
        destino: this.toInitCap(incidencia.destino || ''),
        ots: incidencia.ots || '',
        valorizado: incidencia.valorizado || '',
        total_item: incidencia.total_item || ''
      });
    });

    // Agregar 5 filas en blanco
    for (let i = 0; i < 5; i++) {
      worksheet.addRow([]);
    }

    // Agregar fila de confidencialidad
    const mensaje = 'INFORMACIÓN CONFIDENCIAL. NO DISTRIBUIR. SOLO PARA USO INTERNO.';
    const lastRowIndex = worksheet.lastRow?.number ?? worksheet.rowCount;
    const confidRowIndex = lastRowIndex + 1;

    const row = worksheet.getRow(confidRowIndex);
    row.getCell(1).value = mensaje;

    // Combinar las celdas de la fila de confidencialidad (de A a K)
    const lastColLetter = String.fromCharCode(64 + columnas.length); // 'K' si son 11 columnas
    worksheet.mergeCells(`A${confidRowIndex}:${lastColLetter}${confidRowIndex}`);

    // Aplicar estilo a la celda combinada
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    row.getCell(1).font = {
      bold: true
    };
    row.getCell(1).alignment = {
      horizontal: 'center'
    };

    row.commit(); // Aplicar cambios a la fila

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'Incidencias.xlsx';
    link.click();
  } catch (error) {
    console.error('Error en exportToExcel:', error);
  } finally {
    this.isLoadingExcel = false;
  }
}

  // Función auxiliar para convertir cada palabra en mayúscula
  private toInitCap(str: string): string {
    if (!str) return '';
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  async exportToExcel2(): Promise<void> {
    this.isLoadingExcel2 = true;
    const incidenciasExpandidas: any[] = [];
    let incidenciasProcesadas = 0;

    try {
      for (const incidencia of this.incidenciasFiltradas) {
        if (incidencia.id === undefined) {
          incidenciasExpandidas.push(incidencia);
          incidenciasProcesadas++;
          continue;
        }

        try {
          const detalles = await this._incidenciaService.getDetallesIncidencia(incidencia.id).toPromise();
          
          if (!detalles || detalles.length === 0) {
            incidenciasExpandidas.push(incidencia);
          } else {
            detalles.forEach(detalle => {
              const obj: Record<string, string | number> = {
                'Número de incidencia': incidencia.id || '',
                'Fecha de recepción': incidencia.fecha_recepcion ? incidencia.fecha_recepcion.split('T')[0] : '',
                'Fecha emisión': incidencia.fecha_emision ? incidencia.fecha_emision.split('T')[0] : '',
                'Estado': this.toInitCap(incidencia.tipo_estado || ''),
                'OTS': incidencia.ots || '',
                'Transportista': this.toInitCap(incidencia.transportista || ''),
                'Código Bodega Origen': incidencia.origen_id_local || '',
                'Código Bodega Destino': incidencia.destino_id_bodega || '',
                'Bodega de destino': this.toInitCap(incidencia.destino || ''),
                'Valorizado': incidencia.valorizado || '',
                'Total item': incidencia.total_item || '',
                'SKU': detalle.sku || '',
                'Cantidad': detalle.cantidad || '',
                'Guía': detalle.numGuia || '',
                'Tipo de diferencia': this.toInitCap(detalle.tipoDiferencia || ''),
                'Número de bulto': detalle.numBulto || '',
                'Peso de origen': detalle.pesoOrigen || '',
                'Peso de recepción': detalle.pesoRecepcion || ''
              };
              incidenciasExpandidas.push(obj);
            });
          }
        } catch (error) {
          console.error('Error al obtener detalles:', error);
          incidenciasExpandidas.push(incidencia);
        }

        incidenciasProcesadas++;
      }

      await this.generarExcelConDetalles(incidenciasExpandidas);
    } catch (error) {
      console.error('Error en exportToExcel2:', error);
    } finally {
      this.isLoadingExcel2 = false;
    }
  }
  
  // Nueva función para generar Excel usando exceljs
  private generarExcelConDetalles(data: any[]): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');
  
    // Encabezados dinámicos desde las claves del primer objeto
    const columnas = Object.keys(data[0] || {});
    worksheet.columns = columnas.map(col => ({
      header: col,
      key: col,
      width: 20
    }));
  
    // Agregar datos
    data.forEach(item => {
      worksheet.addRow(item);
    });
  
    // Agregar 5 filas en blanco
    for (let i = 0; i < 5; i++) {
      worksheet.addRow([]);
    }
  
    // Agregar fila de confidencialidad
    const mensaje = 'INFORMACIÓN CONFIDENCIAL. NO DISTRIBUIR. SOLO PARA USO INTERNO.';
    const confidRowIndex = worksheet.lastRow?.number! + 1;
    const row = worksheet.getRow(confidRowIndex);
    row.getCell(1).value = mensaje;
  
    // Combinar desde A hasta la última columna
    const lastColLetter = worksheet.getColumn(columnas.length).letter; // ej: "R"
    worksheet.mergeCells(`A${confidRowIndex}:${lastColLetter}${confidRowIndex}`);
  
    // Aplicar estilo
    const cell = row.getCell(1);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center' };
    row.commit();
  
    // Exportar archivo
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Incidencias_con_detalles.xlsx';
      link.click();
    });
  }

  // Método para navegar a una ruta específica
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Método para obtener el nombre del usuario por su ID
  getNombreUsuario(idUsuario: number | undefined): string {
    if (!idUsuario) return '';
    const usuario = this.usuarios.find(u => u.id === idUsuario);
    return usuario ? usuario.nombre : '';
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
