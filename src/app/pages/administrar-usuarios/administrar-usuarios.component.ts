import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Rol } from '../../interfaces/rol';
import { Bodega } from '../../interfaces/bodega';

@Component({
  selector: 'app-administrar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, InitCapFirstPipe],
  templateUrl: './administrar-usuarios.component.html',
  styleUrls: ['./administrar-usuarios.component.css']
})
export class AdministrarUsuariosComponent {

  username: string = '';
  users_list: User[] = [];
  roles: Rol[] = [];
  bodegas: Bodega[] = [];
  showCreateUserForm: boolean = false;
  isLoading: boolean = true;
  newUser: User = {
    nombre: '',
    email: '',
    password: '',
    id_rol: 0,
    id_bodega: 0,
    estado: true
  };

  constructor(private router: Router, private _userService: UserService) {}

  ngOnInit(): void {
    if (this.users_list.length === 0) {
      this.getUsuarios();
    }
    this.username = localStorage.getItem('username') || '';
    this.getRoles();
    this.getBodegas();
  }
  
  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }  

  //Obtener usuarios
  getUsuarios(): void {
    this.isLoading = true;
    this._userService.getUsuarios().subscribe((users) => {
      this.users_list = users
        .filter(user => user.estado === true)
        .map(user => ({
          ...user, 
          isEditing: false
        }));
        this.isLoading = false;
    });
  }

  //Obtener roles
  getRoles(): void {
    this._userService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });
  }

  //Obtener bodegas
  getBodegas(): void {
    this._userService.getBodegas().subscribe((bodegas) => {
      this.bodegas = bodegas;
    });
  }

  //Iniciar edicion
  startEditing(user: User): void {
    this.users_list.forEach(u => u.isEditing = false);
    user.isEditing = true;
  }

  //Actualizar usuario
  saveUser(user: User): void {
    if (!this.validateUserData(user)) {
      return;
    }

    this._userService.updateUser(user).subscribe({
      next: (response: boolean) => {
        if(response){
          this.getUsuarios();
          user.isEditing = false;
        }
      },
      error: (error) => {
        console.error('Error updating user', error);
      }
    });
  }

  //Validar datos del usuario
  private validateUserData(user: User): boolean {
    if (!user.nombre || !user.email) {
      return false;
    }
    return true;
  }

  //Eliminar usuario
  deleteUser(user: User): void {
    if (!user.id) {
      throw new Error('User ID is required for deleting');
    }

    const userUpdate: User = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      id_bodega: user.id_bodega,
      estado: false,
      id_rol: user.id_rol
    };
    
    this._userService.updateUser(userUpdate).subscribe({
      next: (response: boolean) => {
        if(response){
          this.getUsuarios();
        }
      },
      error: (error) => {
        console.error('Error deleting user', error);
      }
    });
  }

  //Mostrar/ocultar formulario de creacion de usuario
  toggleCreateUserForm(): void {
    this.showCreateUserForm = !this.showCreateUserForm;
    if (!this.showCreateUserForm) {
      this.resetNewUserForm();
    }
  }

  //Reiniciar formulario de creacion de usuario
  resetNewUserForm(): void {
    this.newUser = {
      nombre: '',
      email: '',
      password: '',
      id_rol: 0,
      id_bodega: 0,
      estado: true
    };
  }

  //Crear usuario
  createUser(): void {

    if (!this.validateNewUser()) {
      return;
    }

    this._userService.createUser(this.newUser).subscribe({
      next: (response: boolean) => {
        if (response) {
          this.getUsuarios();
          this.toggleCreateUserForm();
          this.resetNewUserForm();
        }
      },
      error: (error) => {
        console.error('Error creating user', error);
      }
    });
  }

  private validateNewUser(): boolean {
    if (!this.newUser.nombre || !this.newUser.email || !this.newUser.password) {
      return false;
    }
    if (!this.newUser.id_rol || !this.newUser.id_bodega) {
      return false;
    }
    return true;
  }
}
