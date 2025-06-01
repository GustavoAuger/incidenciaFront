import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  user: User = {
    email: '',
    password: '',
    id_rol: 1,
    id_bodega: 1,
    id: 0,
  }

  ngOnInit(): void {
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
    
    // Verificar los métodos de acceso
    console.log('isAdmin():', this.isAdmin());
    console.log('isEmisor():', this.isEmisor());
    console.log('isGestor():', this.isGestor());
    console.log('isTienda():', this.isTienda());
    console.log('canAccessCrearIncidencia():', this.canAccessCrearIncidencia());
    console.log('canAccessReportesIncidencias():', this.canAccessReportesIncidencias());
    console.log('canAccessIncidenciasReclamo():', this.canAccessIncidenciasReclamo());
    console.log('canAccessAdministrarUsuarios():', this.canAccessAdministrarUsuarios());
  }

  navigateTo(route: string): void {    
    this.router.navigate([route]);
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
  // Agregar este nuevo método de control de acceso
  canAccessIncidenciasSinResolver(): boolean {
    return this.isAdmin() || this.isGestor() || this.isTienda();
  }
  
  // El resto de los métodos permanecen igual
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
