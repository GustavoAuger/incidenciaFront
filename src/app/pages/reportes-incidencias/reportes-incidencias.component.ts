import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IncidenciaService } from '../../services/incidencia.service';
import { EstadoIncidencia } from '../../interfaces/estado-incidencia';
import { Incidencia } from '../../interfaces/incidencia';

interface MetricasIncidencia {
  total: number;
  totalValorizado: number;
  nuevas: number;
  nuevasValorizado: number;
  enRevision: number;
  enRevisionValorizado: number;
  aprobadas: number;
  aprobadasValorizado: number;
  rechazadas: number;
  rechazadasValorizado: number;
  porcentajeNuevas: number;
  porcentajeEnRevision: number;
  porcentajeAprobadas: number;
  porcentajeRechazadas: number;
}

@Component({
  selector: 'app-reportes-incidencias',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './reportes-incidencias.component.html',
  styleUrls: ['./reportes-incidencias.component.css']
})
export class ReportesIncidenciasComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  
  // Gestión de pestañas
  activeTab: string = 'resumen';
  
  metricas: MetricasIncidencia = {
    total: 0,
    totalValorizado: 0,
    nuevas: 0,
    nuevasValorizado: 0,
    enRevision: 0,
    enRevisionValorizado: 0,
    aprobadas: 0,
    aprobadasValorizado: 0,
    rechazadas: 0,
    rechazadasValorizado: 0,
    porcentajeNuevas: 0,
    porcentajeEnRevision: 0,
    porcentajeAprobadas: 0,
    porcentajeRechazadas: 0
  };
  
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

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Nuevas', 'En Revisión', 'Aprobadas', 'Rechazadas'],
    datasets: [{
      data: [
        this.metricas.nuevas,
        this.metricas.enRevision,
        this.metricas.aprobadas,
        this.metricas.rechazadas
      ],
      backgroundColor: [
        'rgb(59, 130, 246)',    // Azul 500 (bg-blue-500)
        'rgb(234, 179, 8)',     // Amarillo 500 (bg-yellow-500)
        'rgb(34, 197, 94)',     // Verde 500 (bg-green-500)
        'rgb(239, 68, 68)'      // Rojo 500 (bg-red-500)
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(234, 179, 8)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  public pieChartType: ChartType = 'pie';

  constructor(private incidenciaService: IncidenciaService) {}

  ngOnInit(): void {
    this.cargarMetricas();
    // Cargar la pestaña activa guardada o usar 'resumen' por defecto
    const savedTab = localStorage.getItem('reportesIncidencias_activeTab');
    if (savedTab) {
      this.activeTab = savedTab;
    }
  }

  // Método para cambiar de pestaña
  cambiarTab(tab: string): void {
    this.activeTab = tab;
    // Guardar la pestaña activa
    localStorage.setItem('reportesIncidencias_activeTab', tab);
  }

  private cargarMetricas(): void {
    const idUsuario = parseInt(localStorage.getItem('id_usuario') || '0', 10);
    
    this.incidenciaService.getIncidencias(idUsuario).subscribe({
      next: (incidencias) => {
        this.calcularMetricas(incidencias);
        this.isLoading = false;
        this.actualizarGrafico();
      },
      error: (error) => {
        console.error('Error al cargar las incidencias:', error);
        this.error = 'Error al cargar las métricas de incidencias';
        this.isLoading = false;
      }
    });
  }

  private calcularMetricas(incidencias: Incidencia[]): void {
    const total = incidencias.length;
    const nuevas = incidencias.filter(i => i.id_estado === 1).length;
    const enRevision = incidencias.filter(i => i.id_estado === 2).length;
    const rechazadas = incidencias.filter(i => i.id_estado === 3).length;
    const aprobadas = incidencias.filter(i => i.id_estado === 4).length;

    const totalValorizado = incidencias.reduce((acc, incidencia) => acc + incidencia.valorizado, 0);
    const nuevasValorizado = incidencias.filter(i => i.id_estado === 1).reduce((acc, incidencia) => acc + incidencia.valorizado, 0);
    const enRevisionValorizado = incidencias.filter(i => i.id_estado === 2).reduce((acc, incidencia) => acc + incidencia.valorizado, 0);
    const aprobadasValorizado = incidencias.filter(i => i.id_estado === 4).reduce((acc, incidencia) => acc + incidencia.valorizado, 0);
    const rechazadasValorizado = incidencias.filter(i => i.id_estado === 3).reduce((acc, incidencia) => acc + incidencia.valorizado, 0);

    this.metricas = {
      total,
      totalValorizado,
      nuevas,
      nuevasValorizado,
      enRevision,
      enRevisionValorizado,
      aprobadas,
      aprobadasValorizado,
      rechazadas,
      rechazadasValorizado,
      porcentajeNuevas: total > 0 ? Math.round((nuevas / total) * 100) : 0,
      porcentajeEnRevision: total > 0 ? Math.round((enRevision / total) * 100) : 0,
      porcentajeAprobadas: total > 0 ? Math.round((aprobadas / total) * 100) : 0,
      porcentajeRechazadas: total > 0 ? Math.round((rechazadas / total) * 100) : 0
    };
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'nuevas':
        return 'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300';
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
        return 'bg-blue-600';
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

  getMetricaValue(key: string): number {
    return this.metricas[key as keyof MetricasIncidencia] as number;
  }

  // Actualizar los datos del gráfico cuando cambien las métricas
  actualizarGrafico(): void {
    if (this.chart && this.chart.chart) {
      this.pieChartData.datasets[0].data = [
        this.metricas.nuevas,
        this.metricas.enRevision,
        this.metricas.aprobadas,
        this.metricas.rechazadas,
      ];
      this.chart.chart.update();
    }
  }

  // Función para formatear números como moneda chilena
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
