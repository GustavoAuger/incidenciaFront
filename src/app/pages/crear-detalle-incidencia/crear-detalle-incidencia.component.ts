import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetalleIncidencia } from '../../interfaces/detalleIncidencia';
import { Guia } from '../../interfaces/guia';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { IncidenciaService } from '../../services/incidencia.service';

@Component({
  selector: 'app-crear-detalle-incidencia',
  templateUrl: './crear-detalle-incidencia.component.html',
  styleUrl: './crear-detalle-incidencia.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe]
})
export class CrearDetalleIncidenciaComponent implements OnInit {
  modoVisualizacion: boolean = false;
  incidenciaId: number = 0;
  detalles: DetalleIncidencia[] = [];
  searchTerm: string = '';
  guias: Guia[] = [];
  
  incidencia: any = {
    bodOrigen: '',
    bodDestino: '',
    bodOrigenNombre: '',
    transportista: '',
    transportistaNombre: '',
    ots: '',
    fechaRecepcion: null,
    tipo_estado:''
  };

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

  constructor(
    private router: Router,
    private incidenciaService: IncidenciaService,
    private route: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const incidenciaData = navigation.extras.state['incidencia'];
      this.incidencia = {
        bodOrigen: incidenciaData?.bodOrigen || '',
        bodOrigenNombre: incidenciaData?.bodOrigenNombre || '',
        transportista: incidenciaData?.transportista || '',
        transportistaNombre: incidenciaData?.transportistaNombre || '',
        ots: incidenciaData?.ots || '',
        fechaRecepcion: incidenciaData?.fechaRecepcion || null,
        tipo_estado: incidenciaData.tipo_estado || '',
        bodDestino: incidenciaData?.bodDestino || ''
      };
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.modoVisualizacion = params['modo'] === 'visualizacion';
      const idIncidencia = params['id'];
      
      // Cargar las guías al iniciar el componente
      this.incidenciaService.getGuias().subscribe({
        next: (guias) => {
          this.guias = guias;
          console.log('Guías cargadas:', this.guias);
        },
        error: (error) => {
          console.error('Error al cargar guías:', error);
          alert('Error al cargar las guías');
        }
      });

      if (this.modoVisualizacion && idIncidencia) {
        this.incidenciaService.getDetallesIncidencia(idIncidencia).subscribe({
          next: (detalles) => {
            this.detalles = detalles;
          },
          error: (error) => {
            console.error('Error al obtener detalles:', error);
            alert('Error al cargar los detalles de la incidencia');
          }
        });
      } else {
        const incidenciaParcial = this.incidenciaService.getIncidenciaParcial();
        if (incidenciaParcial) {
          this.incidenciaId = incidenciaParcial.id || 0;
          this.detalleIncidencia.idIncidencia = this.incidenciaId;
        } else {
          this.router.navigate(['/crear-incidencia']);
        }
      }
    });
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

  // Variables para controlar el estado de los campos
  skuEnabled: boolean = false;
  fieldsEnabled: boolean = false;



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
        destino_id_bodega: incidenciaParcial.destino_id_bodega || '',
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

  // Método que se ejecuta cuando cambia el número de guía
  onGuiaChange(): void {
    if (this.detalleIncidencia.numGuia) {
      const numGuiaBuscado = String(this.detalleIncidencia.numGuia).trim();
      console.log('Número de guía buscado:', numGuiaBuscado);
  
      // Paso 1: buscar la guía con el número
      const guiaEncontrada = this.guias.find(guia => {
        const numGuiaActual = String(guia.numguia).trim();
        return numGuiaActual === numGuiaBuscado;
      });
  
      if (guiaEncontrada) {
        // Paso 2: comparar la bodega de destino
        const idBodegaDestino = String(guiaEncontrada.id_bod_destino).trim();
        const bodegaUsuario = String(this.incidencia.bodDestino).trim();
       
        console.log('Bodega encontrada:', idBodegaDestino);
        console.log('Bodega del usuario:', bodegaUsuario);
  
        if (idBodegaDestino === bodegaUsuario) {
          console.log('¡Guía encontrada y pertenece a la bodega!');
          this.skuEnabled = true;
        } else {
          console.log('La guía no pertenece a la bodega del usuario');
          alert('La guía encontrada no pertenece a su bodega');
          this.detalleIncidencia.numGuia = null;
          this.skuEnabled = false;
        }
      } else {
        console.log('Guía no encontrada');
        alert('El número de guía ingresado no existe');
        this.detalleIncidencia.numGuia = null;
        this.skuEnabled = false;
      }
    } else {
      this.skuEnabled = false;
      this.fieldsEnabled = false;
      this.detalleIncidencia.sku = null;
      this.detalleIncidencia.descripcion = '';
    }
  }
  
  

  // Método que se ejecuta después de buscar el producto


  buscarProducto() {
    if (!this.detalleIncidencia.sku) {
      alert('Ingrese un SKU para buscar');
      return;
    }

    if (!this.detalleIncidencia.numGuia) {
      alert('Primero debe seleccionar una guía');
      return;
    }

    // Buscar la guía seleccionada
    const guiaSeleccionada = this.guias.find(guia => 
      String(guia.numguia).trim() === String(this.detalleIncidencia.numGuia).trim()
    );

    if (!guiaSeleccionada) {
      alert('No se encontró la guía seleccionada');
      return;
    }

    // Verificar si el SKU existe en la guía
    const skuEnGuia = guiaSeleccionada.sku_total.find(item => 
      String(item.sku).trim() === String(this.detalleIncidencia.sku).trim()
    );

    if (!skuEnGuia) {
      alert('El SKU ingresado no existe en la guía seleccionada');
      this.detalleIncidencia.sku = null;
      this.detalleIncidencia.descripcion = '';
      this.fieldsEnabled = false;
      return;
    }

    // Buscar la descripción del producto
    this.incidenciaService.getProductos().subscribe({
      next: (productos) => {
        const productoEncontrado = productos.find((producto: any) => 
          String(producto.sku).trim() === String(this.detalleIncidencia.sku).trim()
        );

        if (productoEncontrado) {
          this.detalleIncidencia.descripcion = productoEncontrado.descripcion;
          this.fieldsEnabled = true;
        } else {
          alert('No se encontró la descripción del producto');
          this.detalleIncidencia.descripcion = '';
          this.fieldsEnabled = false;
        }
      },
      error: (error) => {
        console.error('Error al buscar el producto:', error);
        alert('Error al buscar el producto');
        this.fieldsEnabled = false;
      }
    });
  }
}