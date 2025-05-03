import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CrearDetalleIncidenciaGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean {
    // Check if incidencia data exists in localStorage
    const incidenciaData = localStorage.getItem('incidenciaData');
    
    if (incidenciaData) {
      return true;
    }

    // If no incidencia data, redirect to crear-incidencia
    this.router.navigate(['/crear-incidencia']);
    return false;
  }
}
