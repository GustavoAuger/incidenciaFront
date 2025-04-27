import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  //Valida que el usuario esté autenticado 
  //El método se usará en las rutas de app.routes.ts que se quieran proteger
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
