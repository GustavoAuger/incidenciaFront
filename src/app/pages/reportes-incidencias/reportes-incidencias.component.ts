import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { MetricasResumenIncidencia } from '../../interfaces/metricas-resumen-incidencia';
import { MetricasBodegaIncidencia } from '../../interfaces/metricas-bodega-incidencia';
import { Bodega } from '../../interfaces/bodega';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { switchMap, map, catchError } from 'rxjs/operators';
import { forkJoin, of, Observable } from 'rxjs';
import { GetIncidencia } from '../../interfaces/get-incidencia';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Transportista } from '../../interfaces/transportista';

@Component({
  selector: 'app-reportes-incidencias',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, InitCapFirstPipe],
  templateUrl: './reportes-incidencias.component.html',
  styleUrls: ['./reportes-incidencias.component.css']
})
export class ReportesIncidenciasComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  // Gestión de pestañas
  activeTab: string = 'resumen';
  
  // ===== SECCIÓN DE RESÚMEN =====
  // Fecha actual para el input date
  todayDate: string;
  metricasResumen: MetricasResumenIncidencia = {
    totalResumen: 0,
    totalValorizadoResumen: 0,
    nuevasResumen: 0,
    nuevasValorizadoResumen: 0,
    enRevisionResumen: 0,
    enRevisionValorizadoResumen: 0,
    aprobadasResumen: 0,
    aprobadasValorizadoResumen: 0,
    rechazadasResumen: 0,
    rechazadasValorizadoResumen: 0,
    porcentajeNuevasResumen: 0,
    porcentajeEnRevisionResumen: 0,
    porcentajeAprobadasResumen: 0,
    porcentajeRechazadasResumen: 0
  };
  
  // Filtros para el resumen
  public fechaDesdeResumen: string;
  public fechaHastaResumen: string;
  public cargandoResumen: boolean = false;

  // ===== SECCIÓN DE BODEGAS =====
  // Datos de bodegas
  bodegas: Bodega[] = [];
  bodegaSeleccionada: Bodega | null = null;
  
  // Métricas por bodega
  metricasBodega: MetricasBodegaIncidencia = {
    totalBodega: 0,
    totalValorizadoBodega: 0,
    nuevasBodega: 0,
    nuevasValorizadoBodega: 0,
    enRevisionBodega: 0,
    enRevisionValorizadoBodega: 0,
    aprobadasBodega: 0,
    aprobadasValorizadoBodega: 0,
    rechazadasBodega: 0,
    rechazadasValorizadoBodega: 0,
    porcentajeNuevasBodega: 0,
    porcentajeEnRevisionBodega: 0,
    porcentajeAprobadasBodega: 0,
    porcentajeRechazadasBodega: 0
  };

  // Filtros para bodegas
  public fechaDesdeBodega: string;
  public fechaHastaBodega: string;
  public cargandoBodega: boolean = false;

  // Configuración del gráfico de bodega
  public pieChartDataBodega = {
    labels: ['Nuevas', 'En Revisión', 'Aprobadas', 'Rechazadas'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(147, 51, 234, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(13, 148, 136, 0.7)',
        'rgba(220, 38, 38, 0.7)'
      ],
      hoverBackgroundColor: [
        'rgba(147, 51, 234, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(13, 148, 136, 0.9)',
        'rgba(220, 38, 38, 0.9)'
      ],
      borderWidth: 1
    }]
  };

  public pieChartOptionsBodega: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.dataset.data as (number | null)[]).reduce((sum, current) => {
              return sum! + (current || 0);
            }, 0);
            const percentage = total! > 0 ? Math.round((value / total!) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  public pieChartType: ChartType = 'pie';

  // Configuración del gráfico
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((a, b) => (a || 0) + (b || 0), 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  public pieChartLabels: string[] = ['Nuevas', 'En Revisión', 'Aprobadas', 'Rechazadas'];
  public pieChartData: ChartData<'pie'> = {
    labels: this.pieChartLabels,
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(126, 34, 206, 1)',   // Morado
        'rgba(251, 146, 60, 1)',   // Naranja
        'rgba(20, 184, 166, 1)',   // Turquesa
        'rgba(248, 56, 56, 1)'     // Rojo
      ],
      borderColor: [
        'rgba(126, 34, 206, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(20, 184, 166, 1)',
        'rgba(248, 56, 56, 1)'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        'rgba(126, 34, 206, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(248, 113, 113, 0.8)'
      ],
      hoverBorderWidth: 3,
      hoverBorderColor: [
        'rgba(126, 34, 206, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(248, 113, 113, 0.8)'
      ]
    }]
  };

  isLoading: boolean = true;  // Initialize as true since you're showing a loading state initially
  error: string | null = null;

  // ===== PROPIEDADES PARA EL RANKING DE BODEGAS =====
  public rankingBodegas: Array<{
    id_bodega: number;
    nombre: string;
    totalIncidencias: number;
    porcentaje: number;
    incidenciasPorEstado: { [key: string]: number };
  }> = [];
  
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de incidencias'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Bodegas'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  
  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Total de incidencias', backgroundColor: 'rgba(20, 184, 166, 0.7)' }
    ]
  };
  
  public fechaDesdeRanking: string = '';
  public fechaHastaRanking: string = '';
  public cargandoRanking: boolean = false;

  constructor(
    private incidenciaService: IncidenciaService,
    private userService: UserService
  ) {
    // Inicializar fechas
    const fechaHasta = new Date();
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 30);
    
    this.fechaHastaResumen = fechaHasta.toISOString().split('T')[0];
    this.fechaDesdeResumen = fechaDesde.toISOString().split('T')[0];
    this.fechaHastaBodega = this.fechaHastaResumen;
    this.fechaDesdeBodega = this.fechaDesdeResumen;
    this.todayDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Cargar la pestaña activa guardada o usar 'resumen' por defecto
    const savedTab = localStorage.getItem('reportesIncidencias_activeTab');
    if (savedTab) {
      this.activeTab = savedTab;
    }
    
    // Cargar datos iniciales según la pestaña activa
    if (this.activeTab === 'detalle') {
      this.cargarBodegas();
    } else if (this.activeTab === 'graficos') {
      this.cargarRankingBodegas();
    } else {
      this.cargarDatosIniciales();
    }
  }

  // ===== MÉTODOS DE GESTIÓN DE PESTAÑAS =====
  cambiarTab(tab: string): void {
    this.activeTab = tab;
    localStorage.setItem('reportesIncidencias_activeTab', tab);
    
    // Cargar datos específicos de la pestaña
    if (tab === 'resumen') {
      this.cargarMetricasResumen();
    } else if (tab === 'detalle' && this.bodegas.length === 0) {
      this.cargarBodegas();
    } else if (tab === 'graficos') {
      this.cargarRankingBodegas();
    } else if (tab === 'transportistas') {
      this.cargarRankingTransportistas();
    }
    
    // Actualizar el gráfico según la pestaña activa
    this.actualizarGrafico();
  }

  // ===== MÉTODOS DE CARGA INICIAL =====
  private cargarDatosIniciales(): void {
    this.isLoading = true;
    
    // Cargar datos del resumen
    this.cargarMetricasResumen();
    
    // Si la pestaña activa es bodegas, cargar también las bodegas
    if (this.activeTab === 'bodegas') {
      this.cargarBodegas();
    } else {
      this.isLoading = false;
    }
  }

  // ===== MÉTODOS DE LA SECCIÓN DE RESÚMEN =====
  cargarMetricasResumen(): void {
    this.cargandoResumen = true;
    this.isLoading = true;
    this.error = null; // Limpiar errores previos
    
    this.incidenciaService.getAllIncidencias().subscribe({
      next: (incidencias: GetIncidencia[]) => {
        const incidenciasFiltradas = this.filtrarIncidenciasPorFecha(
          incidencias, 
          this.fechaDesdeResumen, 
          this.fechaHastaResumen
        );
        this.calcularMetricasResumen(incidenciasFiltradas);
        this.actualizarGrafico();
        this.cargandoResumen = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las incidencias:', error);
        this.error = 'Error al cargar las métricas de incidencias';
        this.cargandoResumen = false;
        this.isLoading = false;
      }
    });
  }

  private calcularMetricasResumen(incidencias: GetIncidencia[]): void {
    const total = incidencias.length;
    const nuevas = incidencias.filter(i => i.id_estado === 1).length;
    const enRevision = incidencias.filter(i => i.id_estado === 2).length;
    const rechazadas = incidencias.filter(i => i.id_estado === 3).length;
    const aprobadas = incidencias.filter(i => i.id_estado === 4).length;

    const totalValorizado = incidencias.reduce((acc, incidencia) => acc + (incidencia.valorizado || 0), 0);
    const nuevasValorizado = incidencias
      .filter(i => i.id_estado === 1)
      .reduce((acc, incidencia) => acc + (incidencia.valorizado || 0), 0);
    const enRevisionValorizado = incidencias
      .filter(i => i.id_estado === 2)
      .reduce((acc, incidencia) => acc + (incidencia.valorizado || 0), 0);
    const aprobadasValorizado = incidencias
      .filter(i => i.id_estado === 4)
      .reduce((acc, incidencia) => acc + (incidencia.valorizado || 0), 0);
    const rechazadasValorizado = incidencias
      .filter(i => i.id_estado === 3)
      .reduce((acc, incidencia) => acc + (incidencia.valorizado || 0), 0);

    this.metricasResumen = {
      totalResumen: total,
      totalValorizadoResumen: totalValorizado,
      nuevasResumen: nuevas,
      nuevasValorizadoResumen: nuevasValorizado,
      enRevisionResumen: enRevision,
      enRevisionValorizadoResumen: enRevisionValorizado,
      aprobadasResumen: aprobadas,
      aprobadasValorizadoResumen: aprobadasValorizado,
      rechazadasResumen: rechazadas,
      rechazadasValorizadoResumen: rechazadasValorizado,
      porcentajeNuevasResumen: total > 0 ? Math.round((nuevas / total) * 100) : 0,
      porcentajeEnRevisionResumen: total > 0 ? Math.round((enRevision / total) * 100) : 0,
      porcentajeAprobadasResumen: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
      porcentajeRechazadasResumen: total > 0 ? Math.round((rechazadas / total) * 100) : 0
    };
  }

  // ===== MÉTODOS DE LA SECCIÓN DE BODEGAS =====
  cargarBodegas(): void {
    console.log('Cargando bodegas...');
    this.isLoading = true;
    this.error = null; // Limpiar errores previos
    
    this.userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        console.log('Bodegas recibidas:', bodegas);
        this.bodegas = bodegas;
        if (bodegas.length > 0) {
          console.log('Seleccionando primera bodega:', bodegas[0]);
          this.bodegaSeleccionada = bodegas[0];
          this.cargarDatosBodega();
        } else {
          console.warn('No se encontraron bodegas');
          this.error = 'No se encontraron bodegas disponibles';
          this.isLoading = false; // Asegurarse de desactivar el loading
        }
      },
      error: (error: any) => {
        console.error('Error al cargar las bodegas:', error);
        this.error = 'No se pudieron cargar las bodegas';
        this.isLoading = false; // Asegurarse de desactivar el loading
      }
    });
  }

  cambiarBodega(): void {
    if (this.bodegaSeleccionada) {
      this.cargarDatosBodega();
    }
  }

  cargarDatosBodega(): void {
    if (!this.bodegaSeleccionada) {
      this.isLoading = false; // Asegurarse de desactivar el loading
      return;
    }
    
    this.cargandoBodega = true;
    
    // Si no hay fechas seleccionadas, usar las del resumen
    const fechaDesde = this.fechaDesdeBodega || this.fechaDesdeResumen;
    const fechaHasta = this.fechaHastaBodega || this.fechaHastaResumen;
    
    this.obtenerIncidenciasPorBodega(
      this.bodegaSeleccionada.id,
      fechaDesde,
      fechaHasta
    ).subscribe({
      next: (incidencias) => {
        this.procesarDatosBodega(incidencias);
        this.cargandoBodega = false;
        this.isLoading = false; // Asegurarse de desactivar el loading
      },
      error: (error) => {
        console.error('Error al cargar incidencias por bodega:', error);
        this.error = 'No se pudieron cargar las incidencias de la bodega';
        this.cargandoBodega = false;
        this.isLoading = false; // Asegurarse de desactivar el loading
      }
    });
  }

  obtenerIncidenciasPorBodega(idBodega: number, fechaDesde?: string, fechaHasta?: string): Observable<GetIncidencia[]> {
    console.log('Obteniendo incidencias para bodega:', idBodega);
    
    return this.incidenciaService.getAllIncidencias().pipe(
      map((incidencias: GetIncidencia[]) => {
        console.log('Todas las incidencias cargadas:', incidencias);
        
        // Filtrar por bodega
        const incidenciasFiltradas = incidencias.filter(incidencia => 
          incidencia.destino == idBodega.toString()
        );
        
        console.log(`Incidencias para bodega ${idBodega}:`, incidenciasFiltradas);
        
        // Si hay fechas, filtrar por rango
        if (fechaDesde && fechaHasta) {
          const desde = new Date(fechaDesde);
          const hasta = new Date(fechaHasta);
          hasta.setDate(hasta.getDate() + 1); // Incluir el día completo
          
          const incidenciasFiltradasPorFecha = incidenciasFiltradas.filter(incidencia => {
            if (!incidencia.fecha_recepcion) {
              console.log('Incidencia sin fecha_recepcion:', incidencia);
              return false;
            }
            
            const fechaIncidencia = new Date(incidencia.fecha_recepcion);
            const cumpleFiltro = fechaIncidencia >= desde && fechaIncidencia <= hasta;
            
            if (!cumpleFiltro) {
              console.log('Incidencia fuera de rango:', {
                incidencia,
                fechaIncidencia,
                desde,
                hasta
              });
            }
            
            return cumpleFiltro;
          });
          
          console.log(`Incidencias después de filtrar por fecha (${fechaDesde} - ${fechaHasta}):`, 
            incidenciasFiltradasPorFecha.length);
            
          return incidenciasFiltradasPorFecha;
        }
        
        return incidenciasFiltradas;
      }),
      catchError(error => {
        console.error('Error en obtenerIncidenciasPorBodega:', error);
        return of([]);
      })
    );
  }

  procesarDatosBodega(incidencias: GetIncidencia[]): void {
    try {
      // Inicializar métricas
      this.metricasBodega = {
        totalBodega: incidencias.length,
        totalValorizadoBodega: 0,
        nuevasBodega: 0,
        nuevasValorizadoBodega: 0,
        enRevisionBodega: 0,
        enRevisionValorizadoBodega: 0,
        aprobadasBodega: 0,
        aprobadasValorizadoBodega: 0,
        rechazadasBodega: 0,
        rechazadasValorizadoBodega: 0,
        porcentajeNuevasBodega: 0,
        porcentajeEnRevisionBodega: 0,
        porcentajeAprobadasBodega: 0,
        porcentajeRechazadasBodega: 0
      };

      // Calcular totales por estado
      incidencias.forEach(incidencia => {
        const valorizado = incidencia.valorizado || 0;
        this.metricasBodega.totalValorizadoBodega += valorizado;

        switch (incidencia.id_estado) {
          case 1: // Nuevas
            this.metricasBodega.nuevasBodega++;
            this.metricasBodega.nuevasValorizadoBodega += valorizado;
            break;
          case 2: // En revisión
            this.metricasBodega.enRevisionBodega++;
            this.metricasBodega.enRevisionValorizadoBodega += valorizado;
            break;
          case 4: // Aprobadas
            this.metricasBodega.aprobadasBodega++;
            this.metricasBodega.aprobadasValorizadoBodega += valorizado;
            break;
          case 3: // Rechazadas
            this.metricasBodega.rechazadasBodega++;
            this.metricasBodega.rechazadasValorizadoBodega += valorizado;
            break;
        }
    });

      // Calcular porcentajes
      if (this.metricasBodega.totalBodega > 0) {
        this.metricasBodega.porcentajeNuevasBodega = Math.round((this.metricasBodega.nuevasBodega / this.metricasBodega.totalBodega) * 100);
        this.metricasBodega.porcentajeEnRevisionBodega = Math.round((this.metricasBodega.enRevisionBodega / this.metricasBodega.totalBodega) * 100);
        this.metricasBodega.porcentajeAprobadasBodega = Math.round((this.metricasBodega.aprobadasBodega / this.metricasBodega.totalBodega) * 100);
        this.metricasBodega.porcentajeRechazadasBodega = Math.round((this.metricasBodega.rechazadasBodega / this.metricasBodega.totalBodega) * 100);
      }

      // Actualizar gráfico
      this.actualizarGraficoBodega();
    } catch (error) {
      console.error('Error al procesar datos de bodega:', error);
      this.error = 'Error al procesar los datos de la bodega';
    } finally {
      // Asegurarse de que el indicador de carga se desactive
      this.isLoading = false;
      this.cargandoBodega = false;
    }
  }

  actualizarGraficoBodega(): void {
    if (this.pieChartDataBodega.datasets[0]) {
      this.pieChartDataBodega.datasets[0].data = [
        this.metricasBodega.nuevasBodega,
        this.metricasBodega.enRevisionBodega,
        this.metricasBodega.aprobadasBodega,
        this.metricasBodega.rechazadasBodega
      ];
      this.chart?.update();
    }
  }

  onFechaBodegaCambiada(): void {
    if (this.fechaDesdeBodega && this.fechaHastaBodega) {
      this.cargarDatosBodega();
    }
  }

  // ===== MÉTODOS DE AYUDA COMPARTIDOS =====
  private filtrarIncidenciasPorFecha(incidencias: GetIncidencia[], fechaDesde: string, fechaHasta: string): GetIncidencia[] {
    if (!fechaDesde && !fechaHasta) {
      return incidencias;
    }

    return incidencias.filter(incidencia => {
      if (!incidencia.fecha_recepcion) return false;
      
      const fechaIncidencia = new Date(incidencia.fecha_recepcion);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;
      
      if (desde) desde.setHours(0, 0, 0, 0);
      if (hasta) hasta.setHours(23, 59, 59, 999);
      
      return (!desde || fechaIncidencia >= desde) && 
             (!hasta || fechaIncidencia <= hasta);
    });
  }

  // Helper method to get minimum value (can be used in template)
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ===== MÉTODOS DE ACTUALIZACIÓN DE VISTA =====
  actualizarGrafico(): void {
    if (!this.chart?.chart) return;

    if (this.activeTab === 'resumen') {
      this.actualizarGraficoResumen();
    } else if (this.activeTab === 'bodegas') {
      this.actualizarGraficoBodega();
    } else if (this.activeTab === 'graficos') {
      this.actualizarGraficoRanking();
    } else if (this.activeTab === 'transportistas') {
      this.actualizarGraficoTransportistas();
    }
  }

  private actualizarGraficoResumen(): void {
    if (!this.chart?.chart) return;

    this.pieChartData.datasets[0].data = [
      this.metricasResumen.nuevasResumen,
      this.metricasResumen.enRevisionResumen,
      this.metricasResumen.aprobadasResumen,
      this.metricasResumen.rechazadasResumen,
    ];

    this.chart.chart.update();
  }

  // ===== MÉTODOS DE INTERFAZ DE USUARIO =====
  getMetricasBodegaActuales(): MetricasBodegaIncidencia {
    return this.metricasBodega;
  }

  getNombreBodega(idBodega: number): string {
    const bodega = this.bodegas.find(b => b.id === idBodega);
    return bodega ? bodega.nombre : `Bodega ${idBodega}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'nuevas':
        return 'bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300';
      case 'enRevision':
        return 'bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300';
      case 'aprobadas':
        return 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300';
      case 'rechazadas':
        return 'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getProgressBarClass(estado: string): string {
    switch (estado) {
      case 'nuevas':
        return 'bg-purple-600';
      case 'enRevision':
        return 'bg-yellow-400';
      case 'aprobadas':
        return 'bg-green-600';
      case 'rechazadas':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  }

  getIcon(estado: string): string {
    switch (estado) {
      case 'nuevas':
        return 'add_circle_outline';
      case 'enRevision':
        return 'hourglass_empty';
      case 'aprobadas':
        return 'check_circle_outline';
      case 'rechazadas':
        return 'cancel';
      default:
        return 'info';
    }
  }

  // ===== MANEJADORES DE EVENTOS =====
  onFechaResumenCambiada(): void {
    if (this.fechaDesdeResumen && this.fechaHastaResumen) {
      this.cargarMetricasResumen();
    }
  }

  cargarDatosResumen() {
    if (this.fechaDesdeResumen && this.fechaHastaResumen) {
      this.cargarMetricasResumen();
    }
  }

  // ===== MÉTODOS PARA EL RANKING DE BODEGAS =====
  cargarRankingBodegas(): void {
    if (this.cargandoRanking) return;
    
    this.cargandoRanking = true;
    this.isLoading = true;
    this.error = null;
    
    // Si no hay fechas definidas, usamos los últimos 30 días
    if (!this.fechaDesdeRanking || !this.fechaHastaRanking) {
      const fechaHasta = new Date();
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - 30);
      
      this.fechaHastaRanking = fechaHasta.toISOString().split('T')[0];
      this.fechaDesdeRanking = fechaDesde.toISOString().split('T')[0];
    }
    
    // Obtener todas las bodegas
    this.userService.getBodegas().pipe(
      switchMap(bodegas => {
        if (bodegas.length === 0) {
          return of([]);
        }
        
        // Para cada bodega, obtener sus incidencias
        const requests = bodegas.map(bodega => 
          this.obtenerIncidenciasPorBodega(
            bodega.id,
            this.fechaDesdeRanking, 
            this.fechaHastaRanking
          ).pipe(
            map(incidencias => ({
              bodega,
              incidencias
            }))
          )
        );
        
        return forkJoin(requests);
      })
    ).subscribe({
      next: (resultados) => {
        this.procesarRankingBodegas(resultados);
        this.cargandoRanking = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el ranking de bodegas:', error);
        this.error = 'Error al cargar el ranking de bodegas';
        this.cargandoRanking = false;
        this.isLoading = false;
      }
    });
  }
  
  private procesarRankingBodegas(
    resultados: Array<{ bodega: Bodega; incidencias: GetIncidencia[] }>
  ): void {
    // Calcular totales por bodega
    this.rankingBodegas = resultados.map(({ bodega, incidencias }) => {
      const incidenciasPorEstado = {
        'Nuevas': 0,
        'En Revisión': 0,
        'Aprobadas': 0,
        'Rechazadas': 0
      };
      
      incidencias.forEach(incidencia => {
        switch (incidencia.id_estado) {
          case 1: incidenciasPorEstado['Nuevas']++; break;
          case 2: incidenciasPorEstado['En Revisión']++; break;
          case 4: incidenciasPorEstado['Aprobadas']++; break;
          case 3: incidenciasPorEstado['Rechazadas']++; break;
        }
      });
      
      const totalIncidencias = incidencias.length;
      
      return {
        id_bodega: bodega.id,
        nombre: bodega.nombre,
        totalIncidencias,
        porcentaje: 0, // Se calculará después
        incidenciasPorEstado
      };
    });
    
    // Ordenar por total de incidencias (de mayor a menor)
    this.rankingBodegas.sort((a, b) => b.totalIncidencias - a.totalIncidencias);
    
    // Calcular porcentajes
    const totalGeneral = this.rankingBodegas.reduce((sum, b) => sum + b.totalIncidencias, 0);
    this.rankingBodegas = this.rankingBodegas.map(bodega => ({
      ...bodega,
      porcentaje: totalGeneral > 0 ? Math.round((bodega.totalIncidencias / totalGeneral) * 100) : 0
    }));
    
    // Actualizar gráfico
    this.actualizarGraficoRanking();
  }
  
  private actualizarGraficoRanking(): void {
    // Tomar las primeras 10 bodegas para el gráfico
    const topBodegas = [...this.rankingBodegas].slice(0, 10);
    
    // Actualizar etiquetas y datos del gráfico
    this.barChartLabels = topBodegas.map(b => `${b.nombre} (${b.totalIncidencias})`);
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: topBodegas.map(b => b.totalIncidencias),
          label: 'Total de incidencias',
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Forzar actualización del gráfico
    if (this.chart) {
      this.chart.update();
    }
  }
  
  onFechaRankingCambiada(): void {
    this.cargarRankingBodegas();
  }

  /**
   * Calcula la altura del gráfico basado en la cantidad de elementos
   * @param length Cantidad de elementos a mostrar
   * @param isTransportistas Indica si es el gráfico de transportistas
   * @returns Altura en píxeles
   */
  calculateChartHeight(length: number, isTransportistas: boolean = false): number {
    if (isTransportistas) {
      // Para transportistas, hacemos el gráfico más compacto
      const baseHeight = 200; // Altura base más pequeña
      const itemHeight = 30;  // Altura por ítem más pequeña
      const maxHeight = 350;  // Altura máxima más pequeña
      
      const calculatedHeight = baseHeight + (length * itemHeight);
      return Math.min(calculatedHeight, maxHeight);
    } else {
      // Configuración original para otros gráficos
      const baseHeight = 250;
      const itemHeight = 40;
      const maxHeight = 500;
      
      const calculatedHeight = baseHeight + (length * itemHeight);
      return Math.min(calculatedHeight, maxHeight);
    }
  }

  public rankingTransportistas: Array<{
    id_transportista: number;
    nombre: string;
    totalIncidencias: number;
    porcentaje: number;
    incidenciasPorEstado: { [key: string]: number };
  }> = [];

  public barChartOptionsTransportistas: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de incidencias'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Transportistas'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };
  
  public barChartDataTransportistas: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Total de incidencias', 
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        hoverBackgroundColor: 'rgba(13, 148, 136, 0.9)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 1,
        borderRadius: 2,
        borderSkipped: false
      }
    ]
  };

  cargarRankingTransportistas(): void {
    if (this.cargandoRanking) return;
    
    this.cargandoRanking = true;
    this.isLoading = true;
    this.error = null;
    
    // Set default date range if not set
    if (!this.fechaDesdeRanking || !this.fechaHastaRanking) {
      const fechaHasta = new Date();
      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - 30);
      
      this.fechaHastaRanking = fechaHasta.toISOString().split('T')[0];
      this.fechaDesdeRanking = fechaDesde.toISOString().split('T')[0];
    }
    
    // Get all transportistas
    this.incidenciaService.getTransportistas().pipe(
      switchMap(transportistas => {
        if (!transportistas || transportistas.length === 0) {
          this.error = 'No se encontraron transportistas para el ranking';
          this.cargandoRanking = false;
          this.isLoading = false;
          return of([]);
        }
        
        // For each transportista, get their incidences
        const requests = transportistas.map(transportista => 
          this.incidenciaService.getAllIncidencias().pipe(
            map(incidencias => 
              incidencias.filter(i => 
                i.id_transportista == transportista.id && 
                this.filtrarIncidenciasPorFecha(
                  [i], 
                  this.fechaDesdeRanking, 
                  this.fechaHastaRanking
                ).length > 0
              )
            ),
            map(incidencias => ({
              transportista,
              incidencias
            }))
          )
        );
        
        return forkJoin(requests);
      })
    ).subscribe({
      next: (resultados) => {
        this.procesarRankingTransportistas(resultados);
        this.cargandoRanking = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el ranking de transportistas:', error);
        this.error = 'Error al cargar el ranking de transportistas';
        this.cargandoRanking = false;
        this.isLoading = false;
      }
    });
  }

  private procesarRankingTransportistas(
    resultados: Array<{ transportista: Transportista; incidencias: GetIncidencia[] }>
  ): void {
    // Calculate totals per transportista
    this.rankingTransportistas = resultados
      .filter(({ incidencias }) => incidencias.length > 0) // Only include transportistas with incidences
      .map(({ transportista, incidencias }) => {
        const incidenciasPorEstado = {
          'Nuevas': 0,
          'En Revisión': 0,
          'Aprobadas': 0,
          'Rechazadas': 0
        };
        
        incidencias.forEach(incidencia => {
          switch (incidencia.id_estado) {
            case 1: incidenciasPorEstado['Nuevas']++; break;
            case 2: incidenciasPorEstado['En Revisión']++; break;
            case 4: incidenciasPorEstado['Aprobadas']++; break;
            case 3: incidenciasPorEstado['Rechazadas']++; break;
          }
        });
        
        const totalIncidencias = incidencias.length;
        
        return {
          id_transportista: transportista.id,
          nombre: transportista.nombre,
          totalIncidencias,
          porcentaje: 0, // Will be calculated later
          incidenciasPorEstado
        };
      });
    
    // Sort by total incidences (descending)
    this.rankingTransportistas.sort((a, b) => b.totalIncidencias - a.totalIncidencias);
    
    // Calculate percentages
    const totalGeneral = this.rankingTransportistas.reduce((sum, t) => sum + t.totalIncidencias, 0);
    this.rankingTransportistas = this.rankingTransportistas.map(transportista => ({
      ...transportista,
      porcentaje: totalGeneral > 0 ? Math.round((transportista.totalIncidencias / totalGeneral) * 100) : 0
    }));
    
    // Update chart
    this.actualizarGraficoTransportistas();
  }

  actualizarGraficoTransportistas(): void {
    if (!this.rankingTransportistas || this.rankingTransportistas.length === 0) {
      return;
    }

    // Tomar los primeros 10 transportistas o menos
    const topTransportistas = [...this.rankingTransportistas]
      .sort((a, b) => b.totalIncidencias - a.totalIncidencias)
      .slice(0, 10);

    // Actualizar datos del gráfico
    this.barChartDataTransportistas = {
      labels: topTransportistas.map(t => t.nombre),
      datasets: [
        {
          data: topTransportistas.map(t => t.totalIncidencias),
          label: 'Total de incidencias',
          backgroundColor: 'rgba(20, 184, 166, 0.7)',
          hoverBackgroundColor: 'rgba(13, 148, 136, 0.9)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 1,
          borderRadius: 2,
          borderSkipped: false
        }
      ]
    };

    // Forzar actualización del gráfico
    if (this.chart) {
      this.chart.update();
    }
  }
  
}