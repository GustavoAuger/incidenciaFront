import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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

  lista_transportistas: Transportista[] = [];

  lista_estado_incidencia: EstadoIncidencia[] = [];

  // Modelo para el formulario de incidencia
  
  incidencia: Incidencia = {
    id: 0,
    id_bodega: 0,
    origen_id_local: '',
    destino_id_local: '',
    ots: '',
    fecha: '' ,
    observaciones: '',
    id_estado: 1,
    id_usuario: 0,
    transportista: '',
    id_transportista: 0,
    tipo_estado: ''
  };


  constructor(  
    private _userService: UserService, 
    private _incidenciaService: IncidenciaService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getUserId();
    this.getTransportistas();
    this.getBodegas();
  }

  onSubmit() {
    // Crear la incidencia primero
    this.createIncidencia();
  
  }

  createIncidencia() {
    // Convertir id_bodega y id_transportista a números
    const incidenciaToCreate = {
      ...this.incidencia,
      id_bodega: Number(this.incidencia.id_bodega),
      id_transportista: Number(this.incidencia.transportista)
    };

    this._incidenciaService.createIncidencia(incidenciaToCreate).subscribe({
      next: (incidencia) => {
        console.log('Incidencia creada: ' + JSON.stringify(incidencia));
        
        // Guardar los datos de la incidencia en localStorage
        localStorage.setItem('incidenciaData', JSON.stringify(incidencia));
        
        // Navegar a la siguiente página
        this.router.navigate(['/crear-detalle-incidencia']);
      },
      error: (error: Error) => {
        console.error('Error creating incidencia', error);
        // Opcional: mostrar un mensaje de error al usuario
      }
    });
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

}
