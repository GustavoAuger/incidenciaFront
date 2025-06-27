import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class CrearDetalleIncidenciaComponent implements OnInit, AfterViewInit {
  modoVisualizacion: boolean = false;
  incidenciaId: number = 0;
  detalles: DetalleIncidencia[] = [];
  searchTerm: string = '';
  guias: Guia[] = [];
  originalIdBodega: string = '';
  fromRoute: string = 'ver-incidencias'; // Valor por defecto
  isLoading: boolean = true;
  movimientoNumero: string | null = null;
  
  incidencia: any = {
    bodOrigen: '',
    bodDestino: '',
    bodOrigenNombre: '',
    transportista: '',
    transportistaNombre: '',
    ots: '',
    fechaRecepcion: null,
    tipo_estado:'',
    total_item:0,
    valorizado:0,
    destino_id_bodega: 0,
    d_id_bodega: 0,
    ruta: '',
    file: null,
    observaciones: ''
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

  // Variable para controlar la visibilidad del modal
  showImageModal: boolean = false;
  modalImageUrl: string = '';

  // Método para abrir la imagen en el modal
  openImageModal(imageUrl: string): void {
    this.modalImageUrl = imageUrl;
    this.showImageModal = true;
    // Deshabilitar el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Método para cerrar el modal
  closeImageModal(): void {
    this.showImageModal = false;
    // Restaurar el scroll del body
    document.body.style.overflow = 'auto';
  }

  // Variable para el toast
  toast: any = null;

  // Método para mostrar toast
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning', callback?: () => void) {
    this.toast = {
      mensaje: mensaje,
      tipo: tipo,
      visible: true
    };
    
    // Ocultar después de 5 segundos y ejecutar callback si existe
    setTimeout(() => {
      this.toast = null;
      if (callback) {
        callback();
      }
    }, 25000);
  }

  // Método para obtener la clase del toast según el tipo
  getToastClass(tipo: 'success' | 'error' | 'warning'): string {
    switch (tipo) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-info';
    }
  }

  constructor(
    private router: Router,
    private incidenciaService: IncidenciaService,
    private route: ActivatedRoute,
  ) {
    // Deshabilitar el scroll de restauración del navegador
    if (typeof window !== 'undefined') {
      history.scrollRestoration = 'manual';
    }
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      if (state.incidencia) {
        const incidenciaData = state.incidencia;
        this.incidencia = {
          destino_id_bodega: incidenciaData.id_bodega || 0,
          bodOrigen: incidenciaData?.bodOrigen || '',
          bodOrigenNombre: incidenciaData?.bodOrigenNombre || '',
          transportista: incidenciaData?.transportista || '',
          transportistaNombre: incidenciaData?.transportistaNombre || '',
          ots: incidenciaData?.ots || '',
          fechaRecepcion: incidenciaData?.fechaRecepcion || null,
          tipo_estado: incidenciaData?.tipo_estado || '',
          d_id_bodega: incidenciaData?.d_id_bodega || 0,
          bodDestino: incidenciaData?.bodDestino || '',
          file: incidenciaData?.file || null,
          ruta: incidenciaData?.ruta || '',
          observaciones: incidenciaData?.observaciones || ''
        };
      }
      // Obtener la ruta de origen del estado de navegación
      this.fromRoute = state.fromRoute;
    }

    // También verificar el parámetro de consulta 'from' como respaldo
    this.route.queryParams.subscribe(params => {
      if (params['from']) {
        this.fromRoute = params['from'];
      }
    });
  }

  ngOnInit() {
    // Forzar scroll al inicio cuando se inicia el componente
    window.scrollTo(0, 0);
    
    this.originalIdBodega = localStorage.getItem('id_bodega') ?? '';
    console.log('Original bodega ID:', this.originalIdBodega);
    console.log(this.incidencia.ruta);
    // Subscribe to queryParams once
    this.route.queryParams.subscribe(params => {
      this.modoVisualizacion = params['modo'] === 'visualizacion';
      this.incidenciaId = params['id'] ? Number(params['id']) : 0;
      this.isLoading = true;
      // solo mostrar el movimiento de la incidencia si existe y esta en modo visualizacion
      if (this.incidenciaId && this.modoVisualizacion) {
        this.incidenciaService.getMovimiento(this.incidenciaId).subscribe({
          next: (response: any) => {
            console.log('Movement number response:', response);
            if (response) {
              this.movimientoNumero = response;
              console.log('movimiento', this.movimientoNumero);
            }
          },
          error: (error: any) => {
            console.error('Error al obtener el número de movimiento:', error);
          }
        });
      } else {
        console.log('no esta en modo visualizacion');
      }

      // Cargar las guías al iniciar el componente
      this.incidenciaService.getGuias().subscribe({
        next: (guias) => {
          this.guias = guias;
          console.log('Guías cargadas:', this.guias);
          if (!this.modoVisualizacion) {
            this.completeLoading();
          }
        },
        error: (error) => {
          console.error('Error al cargar guías:', error);
          this.mostrarToast('Error al cargar las guías', 'error');
          this.completeLoading();
        }
      });
      
      // si estamos en modo visualización, cargar los detalles de la incidencia
      if (this.modoVisualizacion && this.incidenciaId) {
        this.incidenciaService.getDetallesIncidencia(this.incidenciaId).subscribe({
          next: (detalles) => {
            this.detalles = detalles;
          },
          error: (error) => {
            console.error('Error al obtener detalles:', error);
            this.mostrarToast('Error al cargar los detalles de la incidencia', 'error');
            this.completeLoading();
          },
          complete: () => {
            console.log('Detalles cargados:', this.detalles);
            if (this.detalles.length > 0) {
              this.incidencia.id = this.detalles[0].idIncidencia;

              // Obtener todos los productos una vez
              this.incidenciaService.getProductos().subscribe({
                next: (productos) => {
                  // Asignar la descripción a cada detalle cargado
                  this.detalles.forEach(detalle => {
                    const productoEncontrado = productos.find((producto: any) =>
                      String(producto.sku).trim() === String(detalle.sku).trim()
                    );
                    if (productoEncontrado) {
                      detalle.descripcion = productoEncontrado.descripcion;
                    }
                  });
                  this.completeLoading();
                },
                error: (error) => {
                  console.error('Error al obtener productos para detalles:', error);
                  this.completeLoading();
                }
              });
            } else {
              this.completeLoading();
            }
            console.log('idIncidencia:', this.incidencia.id);
          }
        });
      } else {
        // Modo creación de nueva incidencia
        const incidenciaParcial = this.incidenciaService.getIncidenciaParcial();
        if (incidenciaParcial) {
          this.incidenciaId = incidenciaParcial.id || 0;
          this.detalleIncidencia.idIncidencia = this.incidenciaId;
          this.router.navigate(['/crear-incidencia']);
        } else {
          this.fromRoute = this.router.url;
        }
      }
    });
  }

  ngAfterViewInit() {
    // Asegurar que el scroll esté en la parte superior después de la renderización
    window.scrollTo(0, 0);
    // Forzar scroll después de un pequeño retraso para asegurar que todo esté renderizado
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
  }

  private completeLoading() {
    this.isLoading = false;
  }

  // se almacena la ruta desde la que venimos, antes de navegar
  navigateTo(route: string): void {
    this.fromRoute = this.router.url; // Guarda la ruta actual antes de redirigir
    
    if (route === '/crear-incidencia' && (this.detalles.length > 0 || this.hayDatosIngresados())) {
      if (confirm('¿Estás seguro de volver? Se perderán todos los datos ingresados.')) {
        this.router.navigate([route]);
      }
    } else {
      this.router.navigate([route]);
    }
  }
  
  // Si la ruta es la de creación, luego de terminar rediriges a la ruta almacenada
  goBack(): void {
    if (this.fromRoute) {
      // Dividir la URL en baseRoute y queryParamsString
      const [baseRoute, queryParamsString] = this.fromRoute.split('?');
      
      // Si hay parámetros de consulta, convertirlos en un objeto
      const queryParams: { [key: string]: string } = queryParamsString
        ? queryParamsString.split('&').reduce((acc, param) => {
            const [key, value] = param.split('=');
            acc[key] = decodeURIComponent(value); // Decodificar los valores
            return acc;
          }, {} as { [key: string]: string }) // Definir el tipo explícitamente aquí
        : {};
  
      // Redirigir a la baseRoute con los queryParams
      this.router.navigate([baseRoute], { queryParams });
    } else {
      // Si no hay ruta guardada, redirigir a una ruta por defecto (por ejemplo, la página principal)
      this.router.navigate(['/']);
    }
  }

  private hayDatosIngresados(): boolean {
    // Verifica si hay datos ingresados en el formulario
    return !!(this.detalleIncidencia.tipoDiferencia ||
      this.detalleIncidencia.sku ||
      this.detalleIncidencia.descripcion||
      this.detalleIncidencia.cantidad ||
      this.detalleIncidencia.numGuia ||
      this.detalleIncidencia.numBulto ||
      this.detalleIncidencia.pesoOrigen ||
      this.detalleIncidencia.pesoRecepcion);
  }

  // Variables para controlar el estado de los campos
  skuEnabled: boolean = false;
  fieldsEnabled: boolean = false;

  limpiarErrores() { //limpia el recuadro rojo de los campos
    const tipoDiferencia = document.getElementsByClassName("tipoDiferencia");
    const sku = document.getElementsByClassName("sku");
    const cantidad = document.getElementsByClassName("cantidad");
    const numGuia = document.getElementsByClassName("numGuia");

    // Remover la clase de error de todos los elementos
    for (let i = 0; i < tipoDiferencia.length; i++) {
      tipoDiferencia[i].classList.remove("campo-obligatorio-error");
    }
    for (let i = 0; i < sku.length; i++) {
      sku[i].classList.remove("campo-obligatorio-error");
    }
    for (let i = 0; i < cantidad.length; i++) {
      cantidad[i].classList.remove("campo-obligatorio-error");
    }
    for (let i = 0; i < numGuia.length; i++) {
      numGuia[i].classList.remove("campo-obligatorio-error");
    }
  }

  agregarDetalle() {
    this.limpiarErrores();
    // Validar campos requeridos
    if (!this.detalleIncidencia.tipoDiferencia || !this.detalleIncidencia.sku || !this.detalleIncidencia.cantidad || !this.detalleIncidencia.numGuia) {
      this.mostrarToast('Completar campos obligatorios', 'warning');
          // Marcar los campos que no están completos
      if (!this.detalleIncidencia.tipoDiferencia) {
        const elementos = document.getElementsByClassName("tipoDiferencia");
        for (let i = 0; i < elementos.length; i++) {
          elementos[i].classList.add("campo-obligatorio-error");
        }
      }
      if (!this.detalleIncidencia.sku) {
        const elementos = document.getElementsByClassName("sku");
        for (let i = 0; i < elementos.length; i++) {
          elementos[i].classList.add("campo-obligatorio-error");
        }
      }
      if (!this.detalleIncidencia.cantidad) {
        const elementos = document.getElementsByClassName("cantidad");
        for (let i = 0; i < elementos.length; i++) {
          elementos[i].classList.add("campo-obligatorio-error");
        }
      }
      if (!this.detalleIncidencia.numGuia) {
        const elementos = document.getElementsByClassName("numGuia");
        for (let i = 0; i < elementos.length; i++) {
          elementos[i].classList.add("campo-obligatorio-error");
        }
      }
      return;
    }

    // Validar la cantidad según el tipo de diferencia
    if (!this.validarCantidad()) {
      return;
    }

    if (!this.detalleIncidencia.descripcion) {
      this.mostrarToast('Busque el producto para obtener la descripción', 'warning');
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
    console.log(this.detalles);
    console.log(this.incidencia);
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
  validarCantidad() {
    if (this.detalleIncidencia.tipoDiferencia === 'faltante') {
      // Buscar la guía actual
      const guiaSeleccionada = this.guias.find(guia => 
        String(guia.numguia).trim() === String(this.detalleIncidencia.numGuia).trim()
      );
  
      if (guiaSeleccionada) {
        // Buscar el SKU en la guía
        const skuEnGuia = guiaSeleccionada.sku_total.find(item => 
          String(item.sku).trim() === String(this.detalleIncidencia.sku).trim()
        );
  
        if (skuEnGuia) {
          const cantidadIngresada = Number(this.detalleIncidencia.cantidad);
          const cantidadEnGuia = Number(skuEnGuia.total);
  
          if (cantidadIngresada > cantidadEnGuia) {
            this.mostrarToast(`La cantidad faltante no puede ser mayor a la cantidad en la guía: ${cantidadEnGuia}`, 'error');
            this.detalleIncidencia.cantidad = null;
            const elementos = document.getElementsByClassName("cantidad");
            for (let i = 0; i < elementos.length; i++) {
              elementos[i].classList.add("campo-obligatorio-error");
            }
            return false;
          
          }
          else {
            const cantidad = document.getElementsByClassName("cantidad");
            for (let i = 0; i < cantidad.length; i++) {
              cantidad[i].classList.remove("campo-obligatorio-error");
            }
            return true;
          }
        }
        
      }
    }
    return true;
  }
  eliminarDetalle(index: number) {
    this.detalles.splice(index, 1);
    console.log(this.detalles);
    console.log(this.incidencia);
    console.log(this.incidencia.id);
  }

  generarIncidencia() {
    this.isLoading = true;
    if (this.detalles.length === 0) {
      this.mostrarToast('Debe agregar al menos un detalle antes de generar la incidencia', 'warning');
      this.isLoading = false;
      return;
    }

    // Obtener la incidencia parcial del servicio
    const incidenciaParcial = this.incidenciaService.getIncidenciaParcial();
    
    if (!incidenciaParcial) {
      this.mostrarToast('Error: No se encontraron los datos de la incidencia', 'error');
      this.isLoading = false;
      return;
    }
    // Calcular totales
    const tot_item = this.incidenciaService.calcularTotalItems(this.detalles);
    const totalizado = this.incidenciaService.calcularValorizado(this.detalles, this.guias);
    
    // Crear el objeto para enviar al backend
    const datosParaEnviar = {
      detalles: this.detalles,
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
        tipo_estado: incidenciaParcial.tipo_estado || '',
        total_item: tot_item,
        valorizado: totalizado,
        d_id_bodega: incidenciaParcial.d_id_bodega || 0,
        ruta:''
      }
      
    };
    console.log(datosParaEnviar);
    // Obtener el archivo si existe
    const file = this.incidencia.file;

    // Llamar al servicio para crear la incidencia
    this.incidenciaService.createIncidenciaCompleta(datosParaEnviar, file).subscribe({
      next: (response) => {
        this.mostrarToast(response.mensaje, 'success', () => {
          this.navigateTo(this.fromRoute);
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error al crear la incidencia:', error);
        this.mostrarToast('Error al crear la incidencia', 'error');
        this.isLoading = false;
      }
    });
}

  onSubmit() {
    this.agregarDetalle();
    console.log(this.detalles);
  }

  // Método que se ejecuta cuando cambia el número de guía
  onGuiaChange(): void {
    this.limpiarErrores();
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
          console.log(idBodegaDestino);
          console.log(bodegaUsuario);
          this.mostrarToast('La guía ingresada no tiene como destino su bodega', 'error');
          this.detalleIncidencia.numGuia = null;
          this.skuEnabled = false;
        }
      } else {
        console.log('Guía no encontrada');
        this.mostrarToast('El número de guía ingresado no existe', 'error');
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
      this.mostrarToast('Ingrese un SKU para buscar', 'warning');
      return;
    }

    if (!this.detalleIncidencia.numGuia) {
      this.mostrarToast('Primero debe seleccionar una guía', 'warning');
      return;
    }

    // Verificar si el SKU ya existe en los detalles
    const skuExistente = this.detalles.find(detalle => 
      String(detalle.sku).trim() === String(this.detalleIncidencia.sku).trim()
    );

    if (skuExistente) {
      this.mostrarToast('Este SKU ya ha sido agregado a los detalles', 'warning');
      return;
    }

    // Buscar la guía seleccionada
    const guiaSeleccionada = this.guias.find(guia => 
      String(guia.numguia).trim() === String(this.detalleIncidencia.numGuia).trim()
    );

    if (!guiaSeleccionada) {
      this.mostrarToast('No se encontró la guía seleccionada', 'error');
      return;
    }

    // Verificar si el SKU existe en la guía
    const skuEnGuia = guiaSeleccionada.sku_total.find(item => 
      String(item.sku).trim() === String(this.detalleIncidencia.sku).trim()
    );

    if (!skuEnGuia && this.detalleIncidencia.tipoDiferencia === 'faltante') {
      this.mostrarToast('El SKU ingresado no existe en la guía seleccionada', 'error');
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
          this.limpiarErrores();
          this.detalleIncidencia.descripcion = productoEncontrado.descripcion;
          this.fieldsEnabled = true;
        } else {
          this.mostrarToast('No se encontró la descripción del producto', 'error');
          this.detalleIncidencia.descripcion = '';
          this.fieldsEnabled = false;
        }
      },
      error: (error) => {
        console.error('Error al buscar el producto:', error);
        this.mostrarToast('Error al buscar el producto', 'error');
        this.fieldsEnabled = false;
      }
    });
  }
    // Método que se ejecuta en el evento keydown
    validateNumberInput(event: KeyboardEvent): void {
      const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
      const charCode = event.charCode || event.keyCode;
  
      // Permitir las teclas de borrado, navegación, etc.
      if (allowedKeys.indexOf(event.key) !== -1) {
        return;
      }
  
      // Verificar si el carácter ingresado es un número
      if (event.key && !/[0-9]/.test(event.key)) {
        event.preventDefault(); // Bloquear si no es un número
      }
  
      // Validar que no se ingresen números negativos (con signo '-')
      if (charCode === 45) {
        event.preventDefault(); // Bloquear el signo '-'
      }
    } //validaciones varias para campos numericos detalle


 // metodo para actualizar el detalle de incidencia
  actualizarIncidencia() {
    if (this.detalles.length === 0) {
      this.mostrarToast('Debe tener al menos un detalle en la incidencia', 'warning');
      return;
    }

    // Calcular totales
    const tot_item = this.incidenciaService.calcularTotalItems(this.detalles);
    const totalizado = this.incidenciaService.calcularValorizado(this.detalles, this.guias);

    // Preparar los datos para actualizar
    const datosActualizados = {
      incidencia: this.incidencia.id,
      total_item: tot_item,
      valorizado: totalizado,
      detalles: this.detalles.map(detalle => ({
        ...detalle,
        estado: true // Campo para softDelete, true significa activo
      }))
    };

    // Llamar al servicio para actualizar la incidencia
    this.incidenciaService.actualizarDetallesIncidencia(datosActualizados).subscribe({
      next: (response) => {
        if (response) {
          this.mostrarToast('Incidencia actualizada con éxito', 'success');
          this.router.navigate(['/home']);
        } else {
          this.mostrarToast('Error al actualizar la incidencia', 'error');
        }
      },
      error: (error) => {
        console.error('Error al actualizar la incidencia:', error);
        this.mostrarToast('Error al actualizar la incidencia', 'error');
      }
    });
  }
}
