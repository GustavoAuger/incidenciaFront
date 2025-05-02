import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Incidencia } from '../../interfaces/incidencia';
import { UserService } from '../../services/user.service';
import { Bodega } from '../../interfaces/bodega';
import { User } from '../../interfaces/user';
import { IncidenciaService } from '../../services/incidencia.service';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Transportista } from '../../interfaces/transportista';
import { EstadoIncidencia } from '../../interfaces/estado-incidencia';

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

  transportistas: Transportista[] = [
    {
      id: 1,
      nombre: 'Transportes Rápidos'
    },
    {
      id: 2,
      nombre: 'Logística Express'
    },
    {
      id: 3,
      nombre: 'Cargas Nacionales'
    },
    {
      id: 4,
      nombre: 'Distribuidora Global'
    }
  ];

  lista_estado_incidencia: EstadoIncidencia[] = [
    {
      id: 1,
      nombre: 'Pendiente'
    },
    {
      id: 2,
      nombre: 'En Proceso'
    },
    {
      id: 3,
      nombre: 'Finalizada'
    }
  ];

  // Modelo para el formulario de incidencia
  incidencia: Incidencia = {
    id: 0,
    id_bodega: 0,
    ots: '',
    fecha: '' ,
    observaciones: '',
    id_estado: 1,
    id_usuario: 0,
    id_transportista: 0
  };

  nombre_usuario: string = '';
  

  constructor(private _userService: UserService, private _incidenciaService: IncidenciaService){}

  ngOnInit(): void {
    this.getUserData();
    this.getBodegas();
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    console.log('Incidencia a enviar:', this.incidencia);
    this._incidenciaService.createIncidencia(this.incidencia).subscribe({
      next: (response: boolean) => {
        if(response){
          console.log('Incidencia creada exitosamente');
        }
      },
      error: (error) => {
        console.error('Error creating user', error);
      }
    });
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name);
      // Aquí puedes agregar lógica adicional para manejar el archivo
      // Por ejemplo, subir el archivo, mostrar vista previa, etc.
    }
  }

  getBodegas() {
    this._userService.getBodegas().subscribe({
      next: (bodegas: Bodega[]) => {
        this.lista_bodegas = bodegas;
      },
      error: (error: Error) => {
        console.error('Error fetching bodegas', error);
      }
    });
  }

  getUserData() {
    const usernameStorage = localStorage.getItem('username');

    // Set initial nombre_usuario from localStorage
    this.nombre_usuario = usernameStorage || 'Usuario Desconocido';

    // Fetch all active users and find the matching user
    this._userService.getUsuarios().subscribe({
      next: (users: User[]) => {
        const fullUserObject = users.find(user => 
          user.email === usernameStorage && user.estado === true
        );
        if (fullUserObject && fullUserObject.id !== undefined) {
          this.incidencia.id_usuario = fullUserObject.id;
          this.incidencia.id_bodega = fullUserObject.id_bodega!;
          this.nombre_usuario = fullUserObject.nombre!;
        } else {
          // Log error if no matching user found
          console.error('No active user found matching the stored user');
        }
      },
      error: (error) => {
        console.error('Error fetching users', error);
      }
    });
  }
}
