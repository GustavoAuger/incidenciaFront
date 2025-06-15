import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { User } from './interfaces/user';
import { Rol } from './interfaces/rol';
import { InitCapFirstPipe } from './pipes/init-cap-first.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InitCapFirstPipe, FormsModule],
  providers: [AuthService, UserService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title='proyecto';
  isAuthenticated: boolean = false;
  isNotLogin: boolean = false;
  username: string = '';
  userBodega: string = '';
  userRol: string = '';
  roles: Rol[] = [];
  selectedRoleId: number | null = null;
  private routerSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isNotLogin = this.router.url !== '/login';
      this.updateAuthStatus();
      
    });

    this.getRoles();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get isAdminUser(): boolean {
    return localStorage.getItem('is_admin') === 'true';
  }
  

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      const email = localStorage.getItem('username') || '';
      // Extraer el nombre de usuario antes del @
      this.username = email.split('@')[0];
      if (email) {
        this.loadUserInfo();
      }
    }
  }

  private loadUserInfo(): void {
    this.userService.getUsuarios().subscribe({
      next: (users: User[]) => {
        const userEmail = localStorage.getItem('username');
        const currentUser = users.find(user => user.email === userEmail);
        
        if (currentUser) {
          this.userBodega = currentUser.bodega || 'Sin bodega asignada';
          
          // Guardar si el usuario es administrador (solo la primera vez)
          if (localStorage.getItem('is_admin') === null) {
            const isAdmin = currentUser.id_rol === 1; // Asumiendo que 1 es el ID de administrador
            localStorage.setItem('is_admin', isAdmin.toString());
          }
          
          // Usar el rol del localStorage si existe, si no, usar el del usuario
          const roleId = localStorage.getItem('id_rol') || currentUser.id_rol?.toString();
          if (roleId) {
            this.selectedRoleId = Number(roleId);
            const role = this.roles.find(r => r.id === this.selectedRoleId);
            this.userRol = role ? this.capitalizeFirstLetter(role.nombre) : 'Rol no definido';
          } else {
            this.userRol = currentUser.rol ? this.capitalizeFirstLetter(currentUser.rol) : 'Rol no definido';
          }
        } else {
          this.userBodega = 'Sin bodega asignada';
          this.userRol = 'Rol no definido';
        }
      },
      error: (error) => {
        console.error('Error al cargar la información del usuario:', error);
        this.userBodega = 'Bodega no disponible';
        this.userRol = 'Rol no disponible';
      }
    });
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  isAdmin(): boolean {
    // Verificar si el usuario es administrador (originalmente)
    return localStorage.getItem('is_admin') === 'true';
  }

  saveRoleChange() {
    if (this.selectedRoleId !== null) {
      // Guardar el nuevo rol en localStorage
      localStorage.setItem('id_rol', this.selectedRoleId.toString());
      
      // Actualizar la interfaz
      const selectedRole = this.roles.find(r => r.id === this.selectedRoleId);
      if (selectedRole) {
        this.userRol = this.capitalizeFirstLetter(selectedRole.nombre);
      }
      
      // Cerrar el modal
      const modal = document.getElementById('adminModal') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAdminModal() {
    const modal = document.getElementById('adminModal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  getRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        // Set the selected role from localStorage
        const storedRoleId = localStorage.getItem('id_rol');
        if (storedRoleId) {
          this.selectedRoleId = Number(storedRoleId);
        }
      },
      error: (error) => {
        console.error('Error al cargar los roles:', error);
      }
    });
  }

  getLocalStorageItem(key: string): string | null {
    return localStorage.getItem(key);
  }
}
