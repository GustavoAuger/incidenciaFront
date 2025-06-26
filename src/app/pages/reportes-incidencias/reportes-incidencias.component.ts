import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { IncidenciaService } from '../../services/incidencia.service';
import { Incidencia } from '../../interfaces/incidencia';
import { MetricasResumenIncidencia } from '../../interfaces/metricas-resumen-incidencia';

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
      data: [
        this.metricasResumen.nuevasResumen,
        this.metricasResumen.enRevisionResumen,
        this.metricasResumen.aprobadasResumen,
        this.metricasResumen.rechazadasResumen
      ],
      backgroundColor: [
        'rgba(126, 34, 206, 1)',   // Morado sólido
        'rgba(251, 146, 60, 1)',  // Naranja sólido
        'rgba(20, 184, 166, 1)',  // Turquesa sólido
        'rgba(248, 56, 56, 1)'  // Rojo sólido
      ],
      borderColor: [
        'rgba(126, 34, 206, 1)',    // Borde morado sólido
        'rgba(251, 146, 60, 1)',    // Borde naranja sólido
        'rgba(20, 184, 166, 1)',    // Borde turquesa sólido
        'rgba(248, 56, 56, 1)'    // Borde rojo sólido
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        'rgba(126, 34, 206, 0.8)',    // Morado con opacidad
        'rgba(251, 146, 60, 0.8)',    // Naranja con opacidad
        'rgba(20, 184, 166, 0.8)',    // Turquesa con opacidad
        'rgba(248, 113, 113, 0.8)'    // Rojo con opacidad
      ],
      hoverBorderWidth: 3,
      hoverBorderColor: [
        'rgba(126, 34, 206, 0.8)',    // Borde morado en hover
        'rgba(251, 146, 60, 0.8)',    // Borde naranja en hover
        'rgba(20, 184, 166, 0.8)',    // Borde turquesa en hover
        'rgba(248, 113, 113, 0.8)'       // Borde rojo en hover
      ]
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
    return this.metricasResumen[key as keyof MetricasResumenIncidencia] as number;
  }

  // Actualizar los datos del gráfico cuando cambien las métricas
  actualizarGrafico(): void {
    if (this.chart && this.chart.chart) {
      this.pieChartData.datasets[0].data = [
        this.metricasResumen.nuevasResumen,
        this.metricasResumen.enRevisionResumen,
        this.metricasResumen.aprobadasResumen,
        this.metricasResumen.rechazadasResumen,
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
