import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  styleUrl: './crear-incidencia.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe]
})
export class CrearIncidenciaComponent {
  // Listas para los dropdowns
  lista_bodegas: Bodega[] = [];
  lista_transportistas: Transportista[] = [];
  lista_tipo_incidencia: Tipo_incidencia[] = [];

  // Modelo para el formulario de incidencia
  incidencia: Incidencia = {
    id: 0,
    id_bodega: 0,
    origen_id_local: '',
    destino_id_bodega: '',
    ots: '',
    fecha: '',
    observaciones: '',
    id_estado: 1,
    id_usuario: 0,
    transportista: '',
    id_transportista: 0,
    tipo_estado: '',
    id_tipo_incidencia: 0,
    total_item: 0,
    valorizado: 0
  };

  constructor(
    private _userService: UserService,
    private _incidenciaService: IncidenciaService,
    private router: Router
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

  ngOnInit() {
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    const fechaInput = document.querySelector('input[name="fecha"]');
    if (fechaInput) {
      fechaInput.setAttribute('max', maxDate);
    }
    this.getTransportistas();
    this.getBodegas();
    this.getTipoIncidencias();
        // Observar cambios en id_tipo_incidencia
    this.watchTipoIncidencia();

    
  }
    watchTipoIncidencia() {
      // Cuando cambie el tipo de incidencia a 1, establecer bodega 21
      if (this.incidencia.id_tipo_incidencia == 1) {
        this.incidencia.id_bodega = 21;
      }
    }
    removeImage(index: number) {
      this.selectedImages.splice(index, 1);
    }



    selectedImages: Array<{file: File, preview: string}> = [];

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      // Limitar a 2 imágenes
      const remainingSlots = 2 - this.selectedImages.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);

      filesToAdd.forEach((file: any) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push({
              file: file,
              preview: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      });

      // Limpiar input si ya hay 2 imágenes
      if (this.selectedImages.length >= 2) {
        event.target.value = '';
      }
    }
  }
  onSubmit() {
    
    if (this.selectedImages.length > 0) {
      // Manejo de enviío de imagenes
      const formData = new FormData();
      this.selectedImages.forEach((image, index) => {
        formData.append(`imagen${index + 1}`, image.file);
      });

    }
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
          bodOrigen: this.incidencia.id_bodega,
          bodOrigenNombre: bodegaSeleccionada ? bodegaSeleccionada.nombre : '',
          transportista: this.incidencia.id_transportista,
          transportistaNombre: transportistaSeleccionado ? transportistaSeleccionado.nombre : '',
          ots: this.incidencia.ots,
          fechaRecepcion: this.incidencia.fecha,
          bodDestino: bodegaUsuario? bodegaUsuario.id_bodega : '',        
          tipo_estado: "nuevo"
        }
      }
    };
     // Guardar los datos en el servicio
    this._incidenciaService.setIncidenciaParcial(this.incidencia);
    this.router.navigate(['/crear-detalle-incidencia'], navigationExtras);
}







  getTransportistas() {
    this._incidenciaService.getTransportistas().subscribe({
      next: (transportistas) => {
        this.lista_transportistas = transportistas;
      },
      error: (err) => {
        console.error('Error al obtener transportistas', err);
      }
    });
  }

  getBodegas(){
    this._userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        this.lista_bodegas = bodegas;
      },
      error: (error: Error) => {
        console.error('Error fetching bodegas', error);
      }
    })
  }
  getTipoIncidencias(){  //refactor para que muestre tipo de incidencia de acuerdo a su rol
    this._incidenciaService.getTipoIncidencia().subscribe({
      next: (tipo_incidencia: Tipo_incidencia[]) => {
        
        this.lista_tipo_incidencia = tipo_incidencia;
        if (this._userService.isEmisor()) {
          this.lista_tipo_incidencia = this.lista_tipo_incidencia.filter(tipo => tipo.id !== 1 && tipo.id!== 3);
          console.log(this.lista_tipo_incidencia);
        }
        else if (this._userService.isTienda()) {
          this.lista_tipo_incidencia = this.lista_tipo_incidencia.filter(tipo => tipo.id !== 2);
          console.log(this.lista_tipo_incidencia);
        }
        else{
          this.lista_tipo_incidencia = this.lista_tipo_incidencia;
          console.log(this.lista_tipo_incidencia);
        }
      },
      error: (error: Error) => {
        console.error('Error fetching bodegas', error);
      }
    })
  }

      //validar rol de usuario para permitir opciones de tipo incidencia
    validarTipo(){

      if (this._userService.isEmisor()) {
          this.lista_tipo_incidencia = this.lista_tipo_incidencia.filter(tipo => tipo.id !== 1);
          console.log(this.lista_tipo_incidencia);
      }
      else if (this._userService.isTienda()) {
        this.lista_tipo_incidencia = this.lista_tipo_incidencia.filter(tipo => tipo.id !== 1);
        console.log(this.lista_tipo_incidencia);
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
}

