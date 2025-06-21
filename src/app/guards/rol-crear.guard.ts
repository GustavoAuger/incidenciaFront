import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RolCrearGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const roleId = localStorage.getItem('id_rol');
    
    // Verificar si el rol es 1 (admin), 2 (emisor), 3 (gestor) o 4 (tienda)
    if (['1', '2', '3', '4'].includes(roleId || '')) {
      return true;
    } else {
      // Redireccionar a home si no tiene permiso
      this.router.navigate(['/home']);
      return false;
    }
  }
}
