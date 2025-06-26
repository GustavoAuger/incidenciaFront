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

@Component({
  selector: 'app-reportes-incidencias',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
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
  bodegaSeleccionada: number | 'todos' = 'todos';
  
  // Métricas por bodega
  metricasPorBodega: { [key: number]: MetricasBodegaIncidencia } = {};
  metricasTotalesBodega: MetricasBodegaIncidencia = {
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

  // Estado general
  isLoading = true;
  error: string | null = null;

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
            const label = context.label || '';
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

  public pieChartType: ChartType = 'pie';

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
    
    // Cargar datos iniciales
    this.cargarDatosIniciales();
  }

  // ===== MÉTODOS DE GESTIÓN DE PESTAÑAS =====
  cambiarTab(tab: string): void {
    this.activeTab = tab;
    localStorage.setItem('reportesIncidencias_activeTab', tab);
    
    // Si se cambia a la pestaña de bodegas y no se han cargado las bodegas, cargarlas
    if (tab === 'bodegas' && this.bodegas.length === 0) {
      this.cargarBodegas();
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
    const idUsuario = parseInt(localStorage.getItem('id_usuario') || '0', 10);
    
    this.incidenciaService.getIncidencias(idUsuario).subscribe({
      next: (incidencias) => {
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

  private calcularMetricasResumen(incidencias: Incidencia[]): void {
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
    this.userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        this.bodegas = bodegas;
        this.cargarMetricasBodega();
      },
      error: (error: any) => {
        console.error('Error al cargar las bodegas:', error);
        this.error = 'Error al cargar las bodegas';
        this.isLoading = false;
      }
    });
  }

  cargarMetricasBodega(): void {
    this.cargandoBodega = true;
    const idUsuario = parseInt(localStorage.getItem('id_usuario') || '0', 10);
    
    this.incidenciaService.getIncidencias(idUsuario).subscribe({
      next: (incidencias) => {
        const incidenciasFiltradas = this.filtrarIncidenciasPorFecha(
          incidencias,
          this.fechaDesdeBodega,
          this.fechaHastaBodega
        );
        this.procesarMetricasPorBodega(incidenciasFiltradas);
        this.actualizarGrafico();
        this.cargandoBodega = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar las incidencias:', error);
        this.error = 'Error al cargar las incidencias por bodega';
        this.cargandoBodega = false;
        this.isLoading = false;
      }
    });
  }

  private procesarMetricasPorBodega(incidencias: Incidencia[]): void {
    // Reiniciar métricas
    this.metricasPorBodega = {};
    this.reiniciarMetricasBodega(this.metricasTotalesBodega);

    // Agrupar incidencias por bodega
    const incidenciasPorBodega: { [key: number]: Incidencia[] } = {};

    incidencias.forEach(incidencia => {
      const idBodega = incidencia.id_bodega || 0;
      
      if (!incidenciasPorBodega[idBodega]) {
        incidenciasPorBodega[idBodega] = [];
      }
      
      incidenciasPorBodega[idBodega].push(incidencia);
    });

    // Calcular métricas para cada bodega
    Object.keys(incidenciasPorBodega).forEach(idBodega => {
      const id = parseInt(idBodega, 10);
      const incidenciasBodega = incidenciasPorBodega[id];
      
      this.metricasPorBodega[id] = this.calcularMetricasBodega(incidenciasBodega);
      
      // Sumar al total
      this.sumarAMetricasTotalesBodega(this.metricasPorBodega[id]);
    });

    // Calcular porcentajes para el total
    this.calcularPorcentajesBodega(this.metricasTotalesBodega);
  }

  private reiniciarMetricasBodega(metricas: MetricasBodegaIncidencia): void {
    metricas.totalBodega = 0;
    metricas.totalValorizadoBodega = 0;
    metricas.nuevasBodega = 0;
    metricas.nuevasValorizadoBodega = 0;
    metricas.enRevisionBodega = 0;
    metricas.enRevisionValorizadoBodega = 0;
    metricas.aprobadasBodega = 0;
    metricas.aprobadasValorizadoBodega = 0;
    metricas.rechazadasBodega = 0;
    metricas.rechazadasValorizadoBodega = 0;
    metricas.porcentajeNuevasBodega = 0;
    metricas.porcentajeEnRevisionBodega = 0;
    metricas.porcentajeAprobadasBodega = 0;
    metricas.porcentajeRechazadasBodega = 0;
  }

  private calcularMetricasBodega(incidencias: Incidencia[]): MetricasBodegaIncidencia {
    const metricas: MetricasBodegaIncidencia = {
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
      metricas.totalValorizadoBodega += valorizado;

      switch (incidencia.id_estado) {
        case 1: // Nuevas
          metricas.nuevasBodega++;
          metricas.nuevasValorizadoBodega += valorizado;
          break;
        case 2: // En Revisión
          metricas.enRevisionBodega++;
          metricas.enRevisionValorizadoBodega += valorizado;
          break;
        case 3: // Rechazadas
          metricas.rechazadasBodega++;
          metricas.rechazadasValorizadoBodega += valorizado;
          break;
        case 4: // Aprobadas
          metricas.aprobadasBodega++;
          metricas.aprobadasValorizadoBodega += valorizado;
          break;
      }
    });

    // Calcular porcentajes
    this.calcularPorcentajesBodega(metricas);

    return metricas;
  }

  private sumarAMetricasTotalesBodega(metricas: MetricasBodegaIncidencia): void {
    this.metricasTotalesBodega.totalBodega += metricas.totalBodega;
    this.metricasTotalesBodega.totalValorizadoBodega += metricas.totalValorizadoBodega;
    this.metricasTotalesBodega.nuevasBodega += metricas.nuevasBodega;
    this.metricasTotalesBodega.nuevasValorizadoBodega += metricas.nuevasValorizadoBodega;
    this.metricasTotalesBodega.enRevisionBodega += metricas.enRevisionBodega;
    this.metricasTotalesBodega.enRevisionValorizadoBodega += metricas.enRevisionValorizadoBodega;
    this.metricasTotalesBodega.aprobadasBodega += metricas.aprobadasBodega;
    this.metricasTotalesBodega.aprobadasValorizadoBodega += metricas.aprobadasValorizadoBodega;
    this.metricasTotalesBodega.rechazadasBodega += metricas.rechazadasBodega;
    this.metricasTotalesBodega.rechazadasValorizadoBodega += metricas.rechazadasValorizadoBodega;
  }

  private calcularPorcentajesBodega(metricas: MetricasBodegaIncidencia): void {
    const total = metricas.totalBodega || 1; // Evitar división por cero
    
    metricas.porcentajeNuevasBodega = Math.round((metricas.nuevasBodega / total) * 100);
    metricas.porcentajeEnRevisionBodega = Math.round((metricas.enRevisionBodega / total) * 100);
    metricas.porcentajeAprobadasBodega = Math.round((metricas.aprobadasBodega / total) * 100);
    metricas.porcentajeRechazadasBodega = Math.round((metricas.rechazadasBodega / total) * 100);
  }

  // ===== MÉTODOS DE AYUDA COMPARTIDOS =====
  private filtrarIncidenciasPorFecha(incidencias: Incidencia[], fechaDesde: string, fechaHasta: string): Incidencia[] {
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

  // ===== MÉTODOS DE ACTUALIZACIÓN DE VISTA =====
  actualizarGrafico(): void {
    if (!this.chart?.chart) return;

    if (this.activeTab === 'resumen') {
      this.actualizarGraficoResumen();
    } else if (this.activeTab === 'bodegas') {
      this.actualizarGraficoBodega();
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

  private actualizarGraficoBodega(): void {
    if (!this.chart?.chart) return;

    const metricas = this.bodegaSeleccionada === 'todos' 
      ? this.metricasTotalesBodega 
      : this.metricasPorBodega[this.bodegaSeleccionada] || this.crearMetricasBodegaVacias();

    this.pieChartData.datasets[0].data = [
      metricas.nuevasBodega,
      metricas.enRevisionBodega,
      metricas.aprobadasBodega,
      metricas.rechazadasBodega,
    ];

    this.chart.chart.update();
  }

  private crearMetricasBodegaVacias(): MetricasBodegaIncidencia {
    return {
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
  }

  // ===== MÉTODOS DE INTERFAZ DE USUARIO =====
  getMetricasBodegaActuales(): MetricasBodegaIncidencia {
    if (this.bodegaSeleccionada === 'todos') {
      return this.metricasTotalesBodega;
    }
    return this.metricasPorBodega[this.bodegaSeleccionada] || this.crearMetricasBodegaVacias();
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

  onFechaBodegaCambiada(): void {
    if (this.fechaDesdeBodega && this.fechaHastaBodega) {
      this.cargarMetricasBodega();
    }
  }

  onBodegaSeleccionadaCambiada(): void {
    if (this.activeTab === 'bodegas') {
      this.actualizarGraficoBodega();
    }
  }

  cargarDatosResumen() {
    if (this.fechaDesdeResumen && this.fechaHastaResumen) {
      this.cargarMetricasResumen();
    }
  }
}