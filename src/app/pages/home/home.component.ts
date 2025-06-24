import { Component, OnInit, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  isLoading: boolean = true;
  user: User = {
    email: '',
    password: '',
    id_rol: 1,
    id_bodega: 1,
    id: 0,
  }

  constructor(
    private router: Router,
    @Optional() @Inject(AppComponent) private appComponent: AppComponent
  ) {}

  ngOnInit(): void {
    // Mostrar loader
    this.isLoading = true;
    const startTime = Date.now();
    
    // Obtener el rol desde localStorage
    const idRolStr = localStorage.getItem('id_rol');
    
    // Imprimir valores para depuración
    console.log('idRolStr:', idRolStr);
    
    // Asignar rol basado en localStorage
    if (idRolStr && !isNaN(parseInt(idRolStr, 10))) {
      this.user.id_rol = parseInt(idRolStr, 10);
      console.log('Rol asignado desde id_rol:', this.user.id_rol);
    } else {
      // Fallback a is_admin si no hay id_rol
      const isAdmin = localStorage.getItem('is_admin');
      console.log('isAdmin:', isAdmin);
      
      if (isAdmin === 'True') {
        this.user.id_rol = 1; // Admin
        console.log('Rol asignado desde is_admin:', this.user.id_rol);
      } else {
        // Si no hay información de rol, asignar un valor por defecto
        // Esto debería manejarse mejor en producción
        this.user.id_rol = 1; // Default a admin para pruebas
        console.log('Rol asignado por defecto:', this.user.id_rol);
      }
    }
    
    console.log('Rol final asignado:', this.user.id_rol);
    
    // Calcular tiempo restante para completar 2 segundos
    const minLoadingTime = 2000; // 2 segundos
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    // Ocultar loader después del tiempo mínimo
    setTimeout(() => {
      this.isLoading = false;
    }, remainingTime);
  }

  navigateTo(route: string): void {    
    this.router.navigate([route]);
  }

  // Método para manejar el clic en Crear Incidencia
  onCreateIncidenciaClick(): void {
    const idRol = parseInt(localStorage.getItem('id_rol') || '0', 10);
    
    if (idRol === 1) {
      // Si es administrador, mostrar el modal de cambio de rol
      if (this.appComponent) {
        this.appComponent.openAdminModal(3);
      } else {
        console.error('No se pudo acceder al componente principal');
        this.navigateTo('/crear-incidencia');
      }
    } else {
      // Si no es administrador, navegar normalmente
      this.navigateTo('/crear-incidencia');
    }
  }

  // Método para manejar el clic en Resolver Incidencias
  onResolverIncidenciasClick(): void {
    const idRol = parseInt(localStorage.getItem('id_rol') || '0', 10);
    
    if (idRol === 1) {
      // Si es administrador, mostrar el modal de cambio de rol
      if (this.appComponent) {
        this.appComponent.openAdminModal(2);
      } else {
        console.error('No se pudo acceder al componente principal');
        this.navigateTo('/resolver-incidencias');
      }
    } else {
      // Si no es administrador, navegar normalmente
      this.navigateTo('/resolver-incidencias');
    }
  }

  onReclamoTransportistaClick(): void {
    const idRol = parseInt(localStorage.getItem('id_rol') || '0', 10);
    
    if (idRol === 1) {
      // Si es administrador, mostrar el modal de cambio de rol
      if (this.appComponent) {
        this.appComponent.openAdminModal(2, 4);
      } else {
        console.error('No se pudo acceder al componente principal');
        this.navigateTo('/reclamo-transportista');
      }
    } else {
      // Si no es administrador, navegar normalmente
      this.navigateTo('/reclamo-transportista');
    }
  }

  // Métodos auxiliares para verificar roles
  isAdmin(): boolean {
    return this.user.id_rol === 1;
  }

  isEmisor(): boolean {
    return this.user.id_rol === 2;
  }

  isGestor(): boolean {
    return this.user.id_rol === 3;
  }

  isTienda(): boolean {
    return this.user.id_rol === 4;
  }

  // Métodos actualizados para verificar permisos de acceso
  canAccessIncidenciasSinResolver(): boolean {
    return this.isAdmin() || this.isGestor() || this.isTienda();
  }
  
  canAccessCrearIncidencia(): boolean {
    return this.isAdmin() || this.isEmisor() || this.isTienda();
  }

  canAccessReportesIncidencias(): boolean {
    return this.isAdmin() || this.isGestor();
  }

  canAccessIncidenciasReclamo(): boolean {
    return this.isAdmin() || this.isGestor() || this.isTienda();
  }

  canAccessAdministrarUsuarios(): boolean {
    return this.isAdmin();
  }
}
