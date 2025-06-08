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
  emailExists: boolean = false;
  isEmailValid: boolean = false;
  
  // Propiedades para validación de contraseña
  passwordInvalid: boolean = false;
  passwordHasUppercase: boolean = false;
  passwordHasLowercase: boolean = false;
  passwordHasNumber: boolean = false;
  passwordHasValidLength: boolean = false;
  confirmPassword: string = '';
  passwordsMatch: boolean = true;
  
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

  // Propiedades para ordenamiento
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isTiendaRole : boolean = false;

  emailsList: string[] = [];
  bodegaUsers: {id: string, id_bodega: number}[] = [];

  // Propiedad para almacenar el ID del usuario actual
  currentUserId: number | null = null;

  constructor(private router: Router, private _userService: UserService) {}

  ngOnInit(): void {
    // Obtener el ID del usuario logueado desde localStorage
    const userId = localStorage.getItem('id_usuario');
    if (userId) {
      this.currentUserId = parseInt(userId, 10);
    }

    if (this.users_list.length === 0) {
      this.getUsuarios();
    }
    this.username = localStorage.getItem('username') || '';
    this.getRoles();
    this.getBodegas();
    this.getEmailsList();
    this.getBodegaUsers();
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

  // Get bodegas filtered by name starting with 'L' and exclude already used bodegas
  get filteredBodegas(): Bodega[] {
    // Get the list of used bodega IDs
    const usedBodegaIds = this.bodegaUsers.map(bu => bu.id);
    
    return this.bodegas.filter(bodega => 
      bodega.nombre && 
      bodega.nombre.trim().toUpperCase().startsWith('L') &&
      !usedBodegaIds.includes(bodega.id_bodega)
    );
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

  if (!this.canDeleteUser(user.id)) {
    console.error('No se puede eliminar al usuario actual');
    return;
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

  //Método para verificar si un usuario puede ser eliminado
  canDeleteUser(userId: number | undefined): boolean {
    // No permitir eliminar al usuario actual
    return userId !== this.currentUserId;
  }

  //Método para verificar si un usuario puede editar el rol
  canEditRole(userId: number | undefined): boolean {
    // No permitir editar el rol del usuario actual
    return userId !== this.currentUserId;
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
        estado: true,
        bodega: ''
      };
      this.isTiendaRole = false; // Reset the flag when showing the form
      this.emailInvalid = false;
      this.emailExists = false;
      this.isEmailValid = false;
      this.passwordInvalid = false;
      this.passwordHasUppercase = false;
      this.passwordHasLowercase = false;
      this.passwordHasNumber = false;
      this.passwordHasValidLength = false;
      this.confirmPassword = '';
      this.passwordsMatch = true;
    }
  }

  getEmailsList(): void {
    this._userService.getMails().subscribe({
      next: (emails: string[]) => {
        this.emailsList = emails;
      },
      error: (error) => {
        console.error('Error al obtener correos:', error);
      }
    });
  }

  // Obtener usuarios de bodega
  getBodegaUsers(): void {
    this._userService.getBodegaUsers().subscribe({
      next: (bodegaUsers) => {
        this.bodegaUsers = bodegaUsers;
      },
      error: (error) => {
        console.error('Error al cargar usuarios de bodega:', error);
      }
    });
  }

  onEmailChange(): void {
    const email = this.newUser.email.toLowerCase();
    
    // Validar formato de correo
    this.emailInvalid = !email.endsWith('@head.com');
    
    // Solo verificar existencia si el formato es correcto
    if (!this.emailInvalid) {
      // Extraer el nombre de usuario del correo (antes del @)
      const username = email.split('@')[0];
      this.newUser.nombre = username;
      
      // Verificar si el correo ya existe
      this.emailExists = this.emailsList.includes(email);
    } else {
      // Si el formato es inválido, no verificar existencia
      this.emailExists = false;
    }
  }

  checkEmailExists(email: string): void {
    if (!email || !email.endsWith('@head.com')) {
      this.isEmailValid = false;
      this.emailExists = false;
      return;
    }

    this.isEmailValid = true;
    const emailLower = email.toLowerCase();
    this.emailExists = this.users_list.some(user => 
      user.email.toLowerCase() === emailLower && user.estado === true
    );
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
    this.confirmPassword = '';
    this.passwordsMatch = true;
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
    
    // Validar si las contraseñas coinciden
    this.validatePasswordsMatch();
  }

  // Método para validar que las contraseñas coincidan
  onConfirmPasswordChange(): void {
    this.validatePasswordsMatch();
  }

  // Validar si las contraseñas coinciden
  validatePasswordsMatch(): void {
    this.passwordsMatch = this.newUser.password === this.confirmPassword;
  }

  // Prevent typing beyond max length
  onPasswordKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 10 && event.key !== 'Backspace' && event.key !== 'Delete' && !event.ctrlKey) {
      event.preventDefault();
    }
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
          this.getBodegaUsers();
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
    if (this.newUser.password === undefined) return false;
    
    const isPasswordValid = !this.passwordInvalid && this.newUser.password.length > 0 && this.passwordsMatch;
    const isRoleValid = this.newUser.id_rol > 0;
    const isBodegaValid = !this.isTiendaRole || (this.isTiendaRole && this.newUser.id_bodega! > 0);
    
    return isPasswordValid && isRoleValid && isBodegaValid && !this.emailInvalid && !this.emailExists && this.isEmailValid;
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

  // Método para ordenar la tabla
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Si ya está ordenado por esta columna, invertir la dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una nueva columna, ordenar ascendente por defecto
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.usuariosFiltrados.sort((a, b) => {
      // Mapeo de columnas a propiedades del objeto User
      const propertyMap: {[key: string]: keyof User} = {
        'usuario': 'nombre',
        'email': 'email',
        'rol': 'rol',
        'bodega': 'bodega'
      };

      const property = propertyMap[column];
      if (!property) return 0;

      // Obtener los valores, manejando valores nulos/undefined
      let aValue = a[property] ?? '';
      let bValue = b[property] ?? '';
      
      // Si los valores son strings, convertirlos a minúsculas para comparación insensible
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Comparar los valores
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Método para obtener el ícono de ordenamiento
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // Update the role change handler
  onRoleChange(): void {
    this.isTiendaRole = this.newUser.id_rol === 4; // Assuming 4 is the ID for 'Tienda' role
    
    // Reset bodega selection if role is not Tienda
    if (!this.isTiendaRole) {
      this.newUser.id_bodega = 0;
    }

    // Set specific bodega IDs based on role
    if (this.newUser.id_rol === 2) {
      this.newUser.id_bodega = 22;
    } else if (this.newUser.id_rol === 3) {
      this.newUser.id_bodega = 21;
    } else if (this.newUser.id_rol === 1) {
      this.newUser.id_bodega = 23;
    }
  }
}
