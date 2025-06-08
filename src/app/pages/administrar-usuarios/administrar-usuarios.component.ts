import { ChangeDetectorRef, Component } from '@angular/core';
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

  emailPrefix: string = '';

  showSuccessMessage: boolean = false;
  successMessage: string = '';

  showEditModal: boolean = false;
  userToEdit: User | null = null;
  editPassword: string = '';
  editConfirmPassword: string = '';
  editEmailPrefix: string = '';
  editIsTiendaRole: boolean = false;
  editEmailInvalid: boolean = false;
  editEmailExists: boolean = false;
  editIsEmailValid: boolean = false;
  editPasswordInvalid: boolean = false;
  editPasswordsMatch: boolean = true;
  editPasswordHasUppercase: boolean = false;
  editPasswordHasLowercase: boolean = false;
  editPasswordHasNumber: boolean = false;
  editPasswordHasValidLength: boolean = false;

  // Propiedad para rastrear si se han realizado cambios
  hasChanges: boolean = false;
  originalUserData: User | null = null;

  constructor(private router: Router, private _userService: UserService, private cdr: ChangeDetectorRef) {}

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

  onEmailPrefixChange(): void {
    // Limpiar el prefijo de caracteres no permitidos (solo letras, números, puntos y guiones bajos)
    this.emailPrefix = this.emailPrefix.replace(/[^\w.-]/g, '').toLowerCase();
    
    // Construir el email completo
    const fullEmail = this.emailPrefix + '@head.com';
    this.newUser.email = fullEmail;
    this.newUser.nombre = this.emailPrefix;
    
    // Verificar si el correo ya existe
    this.emailExists = this.emailsList.includes(fullEmail);
    this.isEmailValid = this.emailPrefix.length > 0;
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
      estado: true,
      bodega: ''
    };
    this.emailPrefix = '';
    this.confirmPassword = '';
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

  // Prevenir la entrada de @ y espacios
  onEmailKeyDown(event: KeyboardEvent): void {
    // Evitar la tecla @ (Shift + 2) y espacio
    if (event.key === '@' || event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
      event.preventDefault();
      return;
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
          // Mostrar mensaje de éxito
          this.showSuccessMessage = true;
          this.successMessage = 'Usuario creado con éxito';
          
          // Ocultar el mensaje después de 3 segundos
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
          
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

  // Obtener el nombre de la bodega por su ID
  getBodegaNombre(idBodega: number): string {
    if (!idBodega) return '';
    
    // Bodegas especiales
    switch(idBodega) {
      case 0: return 'Bodega Virtual';
      case 1: return 'Bodega Central';
      case 23: return 'Bodega Devoluciones';
      default:
        // Buscar en las bodegas filtradas
        const bodega = this.filteredBodegas.find(b => b.id === idBodega);
        return bodega ? bodega.nombre : 'Bodega no encontrada';
    }
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

  // Manejar cambio de rol en edición
  onEditRoleChange(): void {
    if (!this.userToEdit) return;
    
    // Obtener el objeto rol completo para el ID seleccionado
    const selectedRole = this.roles.find(r => r.id === this.userToEdit!.id_rol);
    this.editIsTiendaRole = selectedRole?.nombre.toLowerCase() === 'tienda';
    
    // Asignar bodega según el rol
    if (selectedRole) {
      switch(selectedRole.nombre.toLowerCase()) {
        case 'emisor':
          // Bodega Devoluciones
          this.userToEdit.id_bodega = 22;
          break;
        case 'gestor':
          // Bodega Virtual (ID 0) en lugar de Bodega Central
          this.userToEdit.id_bodega = 21;
          break;
        case 'admin':
          // Bodega Virtual
          this.userToEdit.id_bodega = 23;
          break;
        case 'tienda':
          // No asignar bodega, se seleccionará del dropdown
          this.userToEdit.id_bodega = 0;
          break;
        default:
          this.userToEdit.id_bodega = 0;
      }
    }
  }

  // Método para abrir el modal de edición
  openEditModal(user: User): void {
    this.userToEdit = { ...user };
    this.originalUserData = { ...user }; // Guardar una copia del usuario original
    this.editPassword = '';
    this.editConfirmPassword = '';
    this.editIsTiendaRole = user.rol?.toLowerCase() === 'tienda';
    this.hasChanges = false; // Inicialmente no hay cambios
    this.resetEditPasswordValidation();
    this.showEditModal = true;
  }

  // Cerrar modal de edición
  closeEditModal(): void {
    this.showEditModal = false;
    this.userToEdit = null;
    this.originalUserData = null;
    this.editPassword = '';
    this.editConfirmPassword = '';
    this.hasChanges = false;
  }

  // Método para verificar cambios en los campos del formulario
  checkForChanges(): void {
    if (!this.userToEdit || !this.originalUserData) {
      this.hasChanges = false;
      return;
    }

    // Verificar cambios en los campos básicos
    const basicFieldsChanged = 
      this.userToEdit.nombre !== this.originalUserData.nombre ||
      this.userToEdit.email !== this.originalUserData.email ||
      this.userToEdit.id_rol !== this.originalUserData.id_rol ||
      this.userToEdit.id_bodega !== this.originalUserData.id_bodega ||
      this.userToEdit.estado !== this.originalUserData.estado;

    // Verificar si hay cambios en la contraseña
    const passwordChanged = !!this.editPassword;

    this.hasChanges = basicFieldsChanged || passwordChanged;
  }

  // Resetear validación de contraseña en edición
  resetEditPasswordValidation(): void {
    this.editPasswordInvalid = false;
    this.editPasswordsMatch = true;
    this.editPasswordHasUppercase = false;
    this.editPasswordHasLowercase = false;
    this.editPasswordHasNumber = false;
    this.editPasswordHasValidLength = false;
  }

  // Validar contraseña en edición
  validateEditPassword(): void {
    if (!this.editPassword) {
      this.resetEditPasswordValidation();
      return;
    }

    // Validar longitud máxima de 10 caracteres
    if (this.editPassword.length > 10) {
      this.editPassword = this.editPassword.slice(0, 10); // Truncar a 10 caracteres
    }

    this.editPasswordHasUppercase = /[A-Z]/.test(this.editPassword);
    this.editPasswordHasLowercase = /[a-z]/.test(this.editPassword);
    this.editPasswordHasNumber = /[0-9]/.test(this.editPassword);
    this.editPasswordHasValidLength = this.editPassword.length >= 8 && this.editPassword.length <= 10;
    
    this.editPasswordInvalid = !(
      this.editPasswordHasUppercase &&
      this.editPasswordHasLowercase &&
      this.editPasswordHasNumber &&
      this.editPasswordHasValidLength
    );

    // Validar que las contraseñas coincidan si hay confirmación
    if (this.editConfirmPassword) {
      this.validateEditPasswordsMatch();
    }
  }

  // Validar que coincidan las contraseñas en edición
  validateEditPasswordsMatch(): void {
    if (this.editPassword && this.editConfirmPassword) {
      this.editPasswordsMatch = this.editPassword === this.editConfirmPassword;
    } else {
      this.editPasswordsMatch = true;
    }
  }

  // Validar email en edición
  validateEditEmail(): void {
    if (!this.userToEdit?.email) return;
    
    const email = this.userToEdit.email.toLowerCase();
    this.editIsEmailValid = email.endsWith('@head.com');
    
    if (this.editIsEmailValid) {
      this.checkEditEmailExists(email);
    } else {
      this.editEmailExists = false;
    }
  }

  // Verificar si el email ya existe en edición
  checkEditEmailExists(email: string): void {
    if (!email.endsWith('@head.com')) {
      this.editIsEmailValid = false;
      this.editEmailExists = false;
      return;
    }

    this.editIsEmailValid = true;
    const emailLower = email.toLowerCase();
    this.editEmailExists = this.users_list.some(user => 
      user.email.toLowerCase() === emailLower && 
      user.estado === true &&
      user.id !== this.userToEdit?.id
    );
  }

  // Validar formulario de edición
  isEditFormValid(): boolean {
    if (!this.userToEdit) return false;
    
    // Validar que se haya seleccionado un rol
    if (!this.userToEdit.id_rol) {
      return false;
    }
    
    // Si es rol Tienda, validar que se haya seleccionado una bodega
    const selectedRole = this.roles.find(r => r.id === this.userToEdit!.id_rol);
    const isTiendaRole = selectedRole?.nombre.toLowerCase() === 'tienda';
    
    if (isTiendaRole && !this.userToEdit.id_bodega) {
      return false;
    }
    
    // Si se está cambiando la contraseña, validar que sea válida
    if (this.editPassword || this.editConfirmPassword) {
      // Si hay contraseña, validar que cumpla con los requisitos y que coincida
      if (this.editPasswordInvalid || !this.editPasswordsMatch) {
        return false;
      }
      
      // Si hay contraseña, debe tener al menos 8 caracteres
      if (this.editPassword.length < 8) {
        return false;
      }
    }
    
    return true;
  }

  // Guardar cambios del usuario
  saveUserChanges(): void {
    console.log('Iniciando guardado de cambios...');
    
    if (!this.userToEdit) {
      console.error('No hay usuario para actualizar');
      return;
    }

    if (!this.isEditFormValid()) {
      console.error('El formulario no es válido');
      console.log('Estado de validación:', {
        id_rol: this.userToEdit.id_rol,
        id_bodega: this.userToEdit.id_bodega,
        editPassword: this.editPassword,
        editPasswordInvalid: this.editPasswordInvalid,
        editPasswordsMatch: this.editPasswordsMatch
      });
      return;
    }

    console.log('Datos a enviar:', {
      ...this.userToEdit,
      contrasena: this.editPassword || '[NO CAMBIA]'
    });

    // Si se proporcionó una nueva contraseña, incluirla
    const passwordToUpdate = this.editPassword || undefined;

    console.log('Llamando a updateUser...');
    this._userService.updateUser(this.userToEdit, passwordToUpdate).subscribe({
      next: (response: boolean) => {
        console.log('Respuesta del servidor:', response);
        if (response) {
          console.log('Usuario actualizado exitosamente');
          this.getUsuarios();
          this.closeEditModal();
          
          // Mostrar mensaje de éxito
          this.showSuccessMessage = true;
          this.successMessage = 'Usuario actualizado con éxito';
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        } else {
          console.error('El servidor no pudo actualizar el usuario');
        }
      },
      error: (error) => {
        console.error('Error al actualizar usuario', error);
      }
    });
  }
}
