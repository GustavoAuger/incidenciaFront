import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidencia } from '../../interfaces/incidencia';
import { DetalleIncidencia } from '../../interfaces/detalleIncidencia';
import { IncidenciaService } from '../../services/incidencia.service';

@Component({
  selector: 'app-crear-detalle-incidencia',
  templateUrl: './crear-detalle-incidencia.component.html',
  styleUrl: './crear-detalle-incidencia.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class CrearDetalleIncidenciaComponent implements OnInit {
  incidencia: any = {
    bodOrigen: '',
    transportista: '',
    ots: '',
    fechaRecepcion: null
  };
  detalleIncidencia: any = {
    numGuia: null,
    tipoDiferencia: '',
    numBulto: '',
    pesoOrigen: null,
    pesoRecepcion: null,
    cantidad: null,
    sku: null,
    ean13: null,
    descripcion: '',
    idIncidencia: null
  };

  tiposDiferencia = [
    'Faltante',
    'Sobrante',
  ];

  searchTerm: string = '';
  detalles: DetalleIncidencia[] = [];
  incidenciaId: number = 0;

  constructor(
    private router: Router,
    private incidenciaService: IncidenciaService,
    private route: ActivatedRoute
  ) {
    // Obtener los datos de la incidencia del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const incidenciaData = navigation.extras.state['incidencia'];
      this.incidencia = {
        bodOrigen: incidenciaData?.bodOrigen || '',
        transportista: incidenciaData?.transportista || '',
        ots: incidenciaData?.ots || '',
        fechaRecepcion: incidenciaData?.fechaRecepcion || null
      };
    } else {
      // Si no hay datos, redirigir al formulario anterior
      this.router.navigate(['/crear-incidencia']);
    }
  }

  ngOnInit() {
    // Si no hay datos de incidencia, redirigir
    if (!this.incidencia) {
      this.router.navigate(['/crear-incidencia']);
      return;
    }
  }

  navigateTo(route: string): void {    
    if (route === '/crear-incidencia' && (this.detalles.length > 0 || this.hayDatosIngresados())) {
      if (confirm('¿Estás seguro de volver? Se perderán todos los datos ingresados.')) {
        this.router.navigate([route]);
      }
    } else {
      this.router.navigate([route]);
    }
  }

  private hayDatosIngresados(): boolean {
    // Verifica si hay datos ingresados en el formulario
    return !!(this.detalleIncidencia.tipoDiferencia ||
      this.detalleIncidencia.sku ||
      this.detalleIncidencia.cantidad ||
      this.detalleIncidencia.numGuia ||
      this.detalleIncidencia.numBulto ||
      this.detalleIncidencia.pesoOrigen ||
      this.detalleIncidencia.pesoRecepcion);
  }

  buscarProducto() {
    if (!this.detalleIncidencia.sku) {
      alert('Ingrese un SKU para buscar');
      return;
    }

    // Aquí implementarías la llamada al servicio de búsqueda
    // Por ahora simularemos una búsqueda
    console.log('Buscando SKU:', this.detalleIncidencia.sku);
    
    // Simulación de producto encontrado
    setTimeout(() => {
      this.detalleIncidencia.descripcion = `Producto SKU ${this.detalleIncidencia.sku}`;
    }, 500);
  }

  agregarDetalle() {
    // Validar campos requeridos
    if (!this.detalleIncidencia.tipoDiferencia) {
      alert('Seleccione un tipo de diferencia');
      return;
    }
    if (!this.detalleIncidencia.sku) {
      alert('Ingrese un SKU');
      return;
    }
    // Validar que la cantidad sea un número entero positivo
    const cantidad = Number(this.detalleIncidencia.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      alert('La cantidad debe ser un número entero positivo');
      return;
    }
    if (!this.detalleIncidencia.descripcion) {
      alert('Busque el producto para obtener la descripción');
      return;
    }

    // Crear una copia del detalle actual y procesar los números
    const nuevoDetalle = { 
      ...this.detalleIncidencia,
      idIncidencia: this.incidenciaId,
      // Convertir a entero y eliminar ceros a la izquierda
      cantidad: Math.floor(Number(this.detalleIncidencia.cantidad)),
      sku: this.detalleIncidencia.sku ? Number(this.detalleIncidencia.sku).toString() : null,
      numGuia: this.detalleIncidencia.numGuia ? Number(this.detalleIncidencia.numGuia).toString() : null
    };
    
    // Agregar a la lista local
    this.detalles.push(nuevoDetalle);
    
    // Limpiar el formulario
    this.detalleIncidencia = {
      numGuia: null,
      tipoDiferencia: '',
      numBulto: '',
      pesoOrigen: null,
      pesoRecepcion: null,
      cantidad: null,
      sku: null,
      ean13: null,
      descripcion: '',
      idIncidencia: this.incidenciaId
    };
  }

  eliminarDetalle(index: number) {
    this.detalles.splice(index, 1);
  }

  generarIncidencia() {
    if (this.detalles.length === 0) {
      alert('Debe agregar al menos un detalle antes de generar la incidencia');
      return;
    }

    // Crear todos los detalles en el backend
    const promises = this.detalles.map(detalle =>
      this.incidenciaService.createDetalleIncidencia(detalle).toPromise()
    );

    Promise.all(promises)
      .then(() => {
        alert('Incidencia generada con éxito');
        this.navigateTo('/home');
      })
      .catch(error => {
        console.error('Error al generar la incidencia:', error);
        alert('Error al generar la incidencia');
      });
  }

  onSubmit() {
    this.agregarDetalle();
  }
}
