import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    bodOrigenNombre: '',
    transportista: '',
    transportistaNombre: '',
    ots: '',
    fechaRecepcion: null
  };

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
        bodOrigenNombre: incidenciaData?.bodOrigenNombre || '',
        transportista: incidenciaData?.transportista || '',
        transportistaNombre: incidenciaData?.transportistaNombre || '',
        ots: incidenciaData?.ots || '',
        fechaRecepcion: incidenciaData?.fechaRecepcion || null
      };
    } else {
      // Si no hay datos, redirigir al formulario anterior
      this.router.navigate(['/crear-incidencia']);
    }
  }
  detalleIncidencia: any = {
    numGuia: null,
    tipoDiferencia: '',
    numBulto: '',
    pesoOrigen: null,
    pesoRecepcion: null,
    cantidad: null,
    sku: null,
    descripcion: '',
    idIncidencia: null
  };

  tiposDiferencia = [
    'faltante',
    'sobrante',
  ];

  searchTerm: string = '';
  detalles: DetalleIncidencia[] = [];
  incidenciaId: number = 0;


  ngOnInit() {
    // Solo obtener el ID de la incidencia
    const incidenciaParcial = this.incidenciaService.getIncidenciaParcial();
    if (incidenciaParcial) {
      this.incidenciaId = incidenciaParcial.id || 0;
    } else {
      this.router.navigate(['/crear-incidencia']);
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

    // Calcular la cantidad final basada en el tipo de diferencia
    const cantidadFinal = this.detalleIncidencia.tipoDiferencia === 'faltante' 
      ? Math.floor(Number(this.detalleIncidencia.cantidad)) * -1 
      : Math.floor(Number(this.detalleIncidencia.cantidad));

    // Crear una copia del detalle actual y procesar los números
    const nuevoDetalle = { 
      ...this.detalleIncidencia,
      idIncidencia: this.incidenciaId,
      // Asignar la cantidad calculada
      cantidad: cantidadFinal,
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

    // Obtener la incidencia parcial del servicio
    const incidenciaParcial = this.incidenciaService.getIncidenciaParcial();
    
    if (!incidenciaParcial) {
      alert('Error: No se encontraron los datos de la incidencia');
      return;
    }

    // Crear el objeto para enviar al backend
    const datosParaEnviar = {
      incidencia: {
        id_bodega: incidenciaParcial.id_bodega,
        ots: incidenciaParcial.ots,
        fecha: incidenciaParcial.fecha,
        observaciones: incidenciaParcial.observaciones,
        id_estado: incidenciaParcial.id_estado,
        id_usuario: incidenciaParcial.id_usuario,
        id_transportista: incidenciaParcial.id_transportista,
        id_tipo_incidencia: incidenciaParcial.id_tipo_incidencia,
        // Agregamos las propiedades faltantes
        origen_id_local: incidenciaParcial.origen_id_local || '',
        destino_id_local: incidenciaParcial.destino_id_local || '',
        tipo_estado: incidenciaParcial.tipo_estado || ''
      },
      detalles: this.detalles
    };
    console.log(datosParaEnviar);
    // Llamar al servicio para crear la incidencia
    this.incidenciaService.createIncidenciaCompleta(datosParaEnviar).subscribe({
      next: (response) => {
        if (response) {
          alert('Incidencia creada con éxito');
          this.navigateTo('/home');
        } else {
          alert('Error al crear la incidencia');
        }
      },
      error: (error) => {
        console.error('Error al crear la incidencia:', error);
        alert('Error al crear la incidencia');
      }
    });
}

  onSubmit() {
    this.agregarDetalle();
  }
}