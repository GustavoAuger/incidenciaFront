import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, map, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { User } from '../../interfaces/user';
import { IncidenciaService } from '../../services/incidencia.service';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Transportista } from '../../interfaces/transportista';
import { Tipo_incidencia } from '../../interfaces/tipo_incidencia';


@Component({
  selector: 'app-crear-incidencia',
  templateUrl: './crear-incidencia.component.html',
  styleUrls: ['./crear-incidencia.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe]
})
export class CrearIncidenciaComponent {
  // Listas para los dropdowns
  lista_bodegas: Bodega[] = [];
  lista_bodegas_original: Bodega[] = [];
  lista_transportistas: Transportista[] = [];
  lista_tipo_incidencia: Tipo_incidencia[] = [];
  isLoading: boolean = true;
  // Constantes para validación de imágenes
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
  private readonly MAX_WIDTH = 1080;
  private readonly MAX_HEIGHT = 720;
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  // Modelo para el formulario de incidencia
  incidencia: Incidencia = {
    id: 0,
    id_bodega: 0,
    origen_id_local: '',
    destino_id_bodega: '',
    ots: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    id_estado: 1,
    id_usuario: 0,
    transportista: '',
    id_transportista: undefined,
    tipo_estado: '',
    id_tipo_incidencia: undefined,
    total_item: 0,
    valorizado: 0,
    d_id_bodega: 0,
    ruta: ''
  };

  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'warning' | 'error' | 'success' = 'warning';
  private toastTimeout: any;

  private showToastMessage(message: string, type: 'warning' | 'error' | 'success' = 'warning') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Ocultar el toast después de 3 segundos
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  closeToast() {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  constructor(
    private router: Router,
    private _userService: UserService,
    private _incidenciaService: IncidenciaService
  ) {
    // Obtener datos del localStorage al inicializar el componente
    const loginData = {
      id: Number(localStorage.getItem('id_usuario')),
      destino_id_bodega: Number(localStorage.getItem('id_bodega'))
    };

    // Verificar si tenemos los datos necesarios
    if (!loginData.id || !loginData.destino_id_bodega) {
      console.error('Datos de login no encontrados');
      this.router.navigate(['/login']);
      return;
    }

    // Asignar los datos a la incidencia
    this.incidencia.id_usuario = loginData.id;
    this.incidencia.destino_id_bodega = loginData.destino_id_bodega.toString();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  ngOnInit() {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    const fechaInput = document.querySelector('input[name="fecha"]');
    if (fechaInput) {
      fechaInput.setAttribute('max', maxDate);
    }

    // Usamos forkJoin para esperar a que todas las peticiones se completen
    forkJoin([
      this.getTransportistas(),
      this.getBodegas(),
      this.getTipoIncidencias()
    ]).pipe(
      catchError(error => {
        console.error('Error al cargar los datos:', error);
        return of(null); // Continuar con el flujo aun si hay errores
      })
    ).subscribe(() => {
      // Todas las peticiones han terminado, ocultar el spinner
      this.isLoading = false;
    });
  }

  getTransportistas() {
    return this._incidenciaService.getTransportistas().pipe(
      catchError(error => {
        console.error('Error al obtener transportistas', error);
        return of([]);
      }),
      tap((transportistas) => {
        this.lista_transportistas = transportistas;
        console.log('Transportistas cargados:', this.lista_transportistas);
      })
    );
  }

  getBodegas() {
    return this._userService.getBodegas().pipe(
      catchError(error => {
        console.error('Error al obtener bodegas', error);
        return of([]);
      }),
      tap((bodegas: Bodega[]) => {
        this.lista_bodegas = [...bodegas];
        this.lista_bodegas_original = [...bodegas]; // Guardar una copia intacta
        console.log('Bodegas cargadas:', this.lista_bodegas);
      })
    );
  }

  getTipoIncidencias() {
    return this._incidenciaService.getTipoIncidencia().pipe(
      catchError(error => {
        console.error('Error al obtener tipos de incidencia', error);
        return of([]);
      }),
      map((tipo_incidencia: Tipo_incidencia[]) => {
        // Aplicar filtros según el rol del usuario
        if (this._userService.isEmisor()) {
          return tipo_incidencia.filter(tipo => tipo.id !== 1 && tipo.id !== 3);
        } else if (this._userService.isTienda()) {
          return tipo_incidencia.filter(tipo => tipo.id !== 2);
        }
        return tipo_incidencia;
      }),
      tap((filteredTipos) => {
        // Asignar los tipos filtrados a la propiedad del componente
        this.lista_tipo_incidencia = filteredTipos;
        console.log('Tipos de incidencia cargados:', this.lista_tipo_incidencia);
      })
    );
  }

  watchTipoIncidencia() {       // Observar cambios en id_tipo_incidencia se ejecuta cuando cambia el select "ngModelChange"
    this.lista_bodegas = [...this.lista_bodegas_original];  // Siempre comienza de la original
    if (this.incidencia.id_tipo_incidencia == 1) {    // Cuando cambie el tipo de incidencia a 1, establecer bodega 21
      this.incidencia.id_bodega = 21;
    }
    else {      // quita bodega central si es transferencia entre local o es devolución
      this.lista_bodegas = this.lista_bodegas.filter(bodega => bodega.id != 21); 
    }
  }
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }



  selectedImages: Array<{file: File, preview: string}> = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0]; // solo la primera imagen
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/') || !this.ALLOWED_TYPES.includes(file.type)) {
      this.showToastMessage('Solo se permiten archivos JPG y PNG', 'error');
      input.value = '';
      return;
    }

    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      this.showToastMessage('El archivo no debe superar los 1MB', 'error');
      input.value = '';
      return;
    }

    // Validar dimensiones
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > this.MAX_WIDTH || img.height > this.MAX_HEIGHT) {
          this.showToastMessage('Las dimensiones máximas son 1080x720 píxeles', 'error');
          input.value = '';
          return;
        }

        // Si todo está bien, actualizar selectedImages y ruta
        this.selectedImages = [{
          file,
          preview: e.target?.result as string
        }];
        this.incidencia.ruta = e.target?.result as string;
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  subirSoloImagen(): void { 
    if (this.selectedImages.length === 0) {
      this.showToastMessage('Debes seleccionar al menos una imagen.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedImages[0].file);

    this._incidenciaService.subirImagenes(formData).subscribe({
      next: (res) => {
        console.log('Imagen subida:', res);
        this.showToastMessage('Imagen subida correctamente.', 'success');
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
        this.showToastMessage('Error al subir la imagen. Inténtalo de nuevo.', 'error');
      }
    });
  }
  onSubmit() {
    

    this.watchTipoIncidencia(); // llamos la funcion para asignar bodega 21 si es tipo incidencia 1, parte de soulucion de bug
    // Encontrar los nombres correspondientes
    const bodegaSeleccionada = this.lista_bodegas.find(b => b.id == this.incidencia.id_bodega); // borre === para solucionar bug bodega central comparacion number/string
    const bodDestino = this.incidencia.destino_id_bodega
    console.log(bodDestino);  
    const bodDestinoNum = parseInt(bodDestino, 10);  // base 10
    console.log(bodDestinoNum);
    const bodegaUsuario = this.lista_bodegas.find(b => b.id == bodDestinoNum);
    console.log("bodegaUsuario", bodegaUsuario);
    const transportistaSeleccionado = this.lista_transportistas.find(t => t.id === Number(this.incidencia.id_transportista));
    //Si el transporte es head, por detrás debemos enviar la incidencia con OTS = "".

    if(this.incidencia.id_transportista === 4){
      this.incidencia.ots = " ";
    }
    if (this.incidencia.id_tipo_incidencia == 1) {
      this.incidencia.id_bodega = 21;
    }
    
    // Navegar al siguiente componente con los datos
    const navigationExtras = {
      state: {
        incidencia: {
          id_bodega: this.incidencia.d_id_bodega,
          bodOrigen: this.incidencia.id_bodega,
          bodOrigenNombre: bodegaSeleccionada ? bodegaSeleccionada.nombre : '',
          transportista: this.incidencia.id_transportista,
          transportistaNombre: transportistaSeleccionado ? transportistaSeleccionado.nombre : '',
          ots: this.incidencia.ots,
          fechaRecepcion: this.incidencia.fecha,
          bodDestino: bodegaUsuario? bodegaUsuario.id_bodega : '',        
          tipo_estado: "nuevo",
          observaciones: this.incidencia.observaciones,
          file: this.selectedImages.length > 0 ? this.selectedImages[0].file : null
        },
        fromRoute: 'crear-incidencia'
      }
    };
     // Guardar los datos en el servicio
    console.log(navigationExtras);
    this._incidenciaService.setIncidenciaParcial(this.incidencia);
    this.router.navigate(['/crear-detalle-incidencia'], navigationExtras);
}

  // Método para validar que la fecha no sea futura
  validateDate(event: any) {
    const selectedDate = new Date(event.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparar solo fechas
    
    if (selectedDate > today) {
      // Si la fecha es futura, establecer la fecha actual
      this.incidencia.fecha = today.toISOString().split('T')[0];
      
      // Mostrar toast
      this.showToastMessage('La fecha no puede ser futura', 'warning');
      
      // Ocultar el toast después de 3 segundos
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      this.toastTimeout = setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  }

  getUserId() {
    const usernameStorage = localStorage.getItem('username');

    this._userService.getUsuarios().subscribe({
      next: (users: User[]) => {
        const fullUserObject = users.find(user => 
          user.email === usernameStorage && user.estado === true
        );
        if (fullUserObject && fullUserObject.id !== undefined) {
          this.incidencia.id_usuario = fullUserObject.id;
        } else {
          console.error('No active user found matching the stored user');
        }
      },
      error: (error) => {
        console.error('Error fetching users', error);
      }
    });
  }

  getUserId2() {
    // Obtener directamente el ID del usuario del localStorage
    const userId = Number(localStorage.getItem('id'));
    if (userId) {
        this.incidencia.id_usuario = userId;
    } else {
        console.error('No se encontró el ID del usuario en localStorage');
    }
}

  debugForm() {
    console.log('Valores de la incidencia:', this.incidencia);
    console.log('Estado de los campos:', {
      id_bodega: this.incidencia.id_bodega,
      ots: this.incidencia.ots,
      fecha: this.incidencia.fecha,
      observaciones: this.incidencia.observaciones,
      id_estado: this.incidencia.id_estado,
      id_usuario: this.incidencia.id_usuario,
      id_transportista: this.incidencia.id_transportista,
      id_tipo_incidencia: this.incidencia.id_tipo_incidencia
    });
  }

  // Método para limitar la longitud de las observaciones a 250 caracteres
  limitObservationsLength() {
    if (this.incidencia.observaciones && this.incidencia.observaciones.length > 250) {
      // Si se supera el límite, mostrar mensaje de error
      this.showToastMessage('El límite de caracteres es de 250', 'error');
      // Cortar el texto a 250 caracteres
      this.incidencia.observaciones = this.incidencia.observaciones.substring(0, 250);
    }
  }
}
