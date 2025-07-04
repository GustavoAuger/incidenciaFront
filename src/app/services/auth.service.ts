import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  username: string = '';
  loggedIn = false;

  constructor(private _loginService: LoginService) { 
    // Al inicializar el servicio, verificar si hay un token en el localStorage
    this.loggedIn = this.hasValidToken();
    if (this.loggedIn) {
      this.username = localStorage.getItem('username') || '';
    }
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    // Verificar que el token existe y no está vacío
    return !!token && token.trim() !== '';
  }

  async login(user: User): Promise<boolean|undefined> {
    if (user.password) {
      const response = await this._loginService.validateUserPassword(user.email, user.password).toPromise();
      const valid = !!response && response.access_token !== undefined;
      const isAdmin = response?.id_rol === 1;
  
      if (valid) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('id_usuario', response.id.toString());
        localStorage.setItem('id_bodega', response.id_bodega.toString());
        localStorage.setItem('id_rol', response.id_rol.toString()); 
        this.loggedIn = valid;
        this.username = user.email;
        localStorage.setItem('username', user.email);
        console.log('Respuesta del login:', response);
        if (response.id_rol) {
          if (isAdmin) {
            localStorage.setItem('is_admin', 'True');
          }
          else {
            localStorage.setItem('is_admin', 'False');
          }
        }
        
        return true;
      }
      return false;
    }
    return false;
  }

  logout() {
    // Limpiar todos los datos de autenticación
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('id_bodega');
    localStorage.removeItem('id_rol'); 
    this.loggedIn = false;
    this.username = '';
  }

  isAuthenticated(): boolean {
    // Always check localStorage directly for the most current state
    const hasToken = this.hasValidToken();
    this.loggedIn = hasToken;
    
    if (!hasToken) {
      this.logout();
    }
    
    return this.loggedIn;
  }

  refreshAuthState(): void {
    this.loggedIn = this.hasValidToken();
    if (this.loggedIn) {
      this.username = localStorage.getItem('username') || '';
    } else {
      this.username = '';
    }
  }
}
