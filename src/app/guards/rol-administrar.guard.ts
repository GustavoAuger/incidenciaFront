import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RolAdministrarGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const roleId = localStorage.getItem('id_rol');
    
    // Verificar si el rol es 1 (admin)
    if (roleId === '1') {
      return true;
    } else {
      // Redireccionar a home si no tiene permiso
      this.router.navigate(['/home']);
      return false;
    }
  }
}
