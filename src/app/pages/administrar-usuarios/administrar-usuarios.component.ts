import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { InitCapFirstPipe } from '../../pipes/init-cap-first.pipe';
import { Rol } from '../../interfaces/rol';
import { UserUpdate } from '../../interfaces/user_update';

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

  constructor(private router: Router, private _userService: UserService) {}

  ngOnInit(): void {
    if (this.users_list.length === 0) {
      this.getUsuarios();
    }
    this.username = localStorage.getItem('username') || '';
    this.getRoles();
  }
  
  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }  

  getUsuarios(): void {
    this._userService.getUsuarios().subscribe((users) => {
      this.users_list = users.map(user => ({
        ...user, 
        isEditing: false
      }));
    });
  }

  getRoles(): void {
    this._userService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });
  }

  startEditing(user: User): void {
    this.users_list.forEach(u => u.isEditing = false);
    user.isEditing = true;
  }

  saveUser(user: User): void {
    if (!this.validateUserData(user)) {
      return;
    }

    const userUpdate: UserUpdate = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      id_bodega: user.id_bodega,
      estado: user.estado,
      id_rol: user.id_rol
    };

    this._userService.updateUser(userUpdate).subscribe({
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

  private validateUserData(user: User): boolean {
    if (!user.nombre || !user.email) {
      return false;
    }
    return true;
  }
}
