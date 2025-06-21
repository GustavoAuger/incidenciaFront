import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolResolverGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const roleId = localStorage.getItem('id_rol');
    
    // Verificar si el rol es 3 (gestor) o 4 (tienda)
    if (roleId === '3' || roleId === '4') {
      return true;
    } else {
      // Redireccionar a home si no tiene permiso
      this.router.navigate(['/home']);
      return false;
    }
  }
}
