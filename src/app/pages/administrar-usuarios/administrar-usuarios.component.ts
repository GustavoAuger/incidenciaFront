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
  emailInvalid: boolean = false;
  
  // Propiedades para validación de contraseña
  passwordInvalid: boolean = false;
  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasValidLength: boolean = false;
  
  newUser: User = {
    nombre: '',
    email: '',
    password: '',
    id_rol: 0,
    id_bodega: 0,
    estado: true,
    bodega: ''
  };

  filtroUsuario: string = '';
  filtroEmail: string = '';
  usuariosFiltrados: User[] = [];

  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.usuariosFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
  }

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
    this._userService.getUsuarios().subscribe({
      next: (users) => {
      this.users_list = users
        .filter(user => user.estado === true)
        .map(user => ({
          ...user, 
            id_bodega: Number(user.id_bodega), // Asegurar que sea un número
          isEditing: false
        }));
        this.usuariosFiltrados = [...this.users_list];
        this.totalItems = this.usuariosFiltrados.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading = false;
      }
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
  // Mostrar mensaje de confirmación
  const confirmar = window.confirm(`¿Estás seguro que deseas eliminar al usuario ${user.nombre}?`);
  
  if (!confirmar) {
    return; // Si el usuario cancela, no hacer nada
  }

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
    // Resetear el formulario al mostrarlo
    if (this.showCreateUserForm) {
      this.newUser = {
        nombre: '',
        email: '',
        password: '',
        id_rol: 0,
        id_bodega: 0,
        estado: true
      };
      this.emailInvalid = false;
    }
  }

  onEmailChange(): void {
    if (this.newUser.email) {
      // Validar que el correo termine en @head.com
      this.emailInvalid = !this.newUser.email.toLowerCase().endsWith('@head.com');
      
      // Generar el nombre de usuario a partir del correo
      if (!this.emailInvalid) {
        this.newUser.nombre = this.newUser.email.split('@')[0];
      } else {
        this.newUser.nombre = '';
      }
    } else {
      this.newUser.nombre = '';
      this.emailInvalid = false;
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
    this.resetPasswordValidation();
  }

  // Reiniciar validación de contraseña
  private resetPasswordValidation(): void {
    this.passwordInvalid = false;
    this.passwordHasUppercase = false;
    this.passwordHasLowercase = false;
    this.passwordHasNumber = false;
    this.passwordHasValidLength = false;
  }

  // Validar contraseña en tiempo real
  onPasswordChange(): void {
    const password = this.newUser.password || '';
    
    // Validar mayúsculas
    this.passwordHasUppercase = /[A-Z]/.test(password);
    
    // Validar minúsculas
    this.passwordHasLowercase = /[a-z]/.test(password);
    
    // Validar números
    this.passwordHasNumber = /[0-9]/.test(password);
    
    // Validar longitud
    this.passwordHasValidLength = password.length >= 8 && password.length <= 10;
    
    // Validar si la contraseña cumple con todos los requisitos
    this.passwordInvalid = !(this.passwordHasUppercase && 
                           this.passwordHasLowercase && 
                           this.passwordHasNumber && 
                           this.passwordHasValidLength);
  }

  //Crear usuario
  createUser(): void {
    if (!this.validateNewUser()) {
      return;
    }

    // Asegurar que el correo esté en minúsculas
    const userToCreate = {
      ...this.newUser,
      email: this.newUser.email.toLowerCase()
    };

    this._userService.createUser(userToCreate).subscribe({
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

  // Verificar si el formulario es válido
  isFormValid(): boolean {
    // Validar campos requeridos
    if (!this.newUser.nombre || !this.newUser.email || !this.newUser.password) {
      return false;
    }
    
    // Validar roles y bodega
    if (!this.newUser.id_rol || !this.newUser.id_bodega) {
      return false;
    }
    
    // Validar formato de email
    if (this.emailInvalid) {
      return false;
    }
    
    // Validar que la contraseña cumpla con todos los requisitos
    if (this.passwordInvalid) {
      return false;
    }
    
    return true;
  }

  private validateNewUser(): boolean {
    return this.isFormValid();
  }

  // Obtener bodega por ID
  getBodegaById(id: number | undefined): Bodega | undefined {
    console.log(id);
    if (id === undefined) return undefined;
    const bodega : Bodega | undefined = this.bodegas.find(bodega => bodega.id === id);
    console.log(JSON.stringify(bodega));
    return bodega
  }

  // Método para cancelar la edición
  cancelEdit(user: User): void {
    // Simplemente cerramos el modo de edición sin guardar cambios
    user.isEditing = false;
    // Recargamos los datos del usuario para descartar cambios
    this._userService.getUsuarios().subscribe(users => {
      const originalUser = users.find(u => u.id === user.id);
      if (originalUser) {
        Object.assign(user, originalUser);
      }
    });
  }

  // Método para aplicar los filtros de búsqueda
  aplicarFiltros(): void {
    this.usuariosFiltrados = this.users_list.filter(user => {
      const matchesUser = user.nombre?.toLowerCase().includes(this.filtroUsuario.toLowerCase()) ?? false;
      const matchesEmail = user.email.toLowerCase().includes(this.filtroEmail.toLowerCase());
      return matchesUser && matchesEmail;
    });
    this.totalItems = this.usuariosFiltrados.length;
    this.currentPage = 1; // Resetear a la primera página al aplicar filtros
  }

  // Método para cambiar de página
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
