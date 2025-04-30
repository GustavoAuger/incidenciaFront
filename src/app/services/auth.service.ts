import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  username: string = '';
  loggedIn = false;

  constructor(private _loginService: LoginService) { }

  async login(user: User): Promise<boolean|undefined> {
    if (user.password) {
      const response = await this._loginService.validateUserPassword(user.email, user.password).toPromise();
      const valid = !!response && response.access_token !== undefined;
      const isAdmin = response?.id_rol === 1;

      if (valid) {
        localStorage.setItem('access_token', response.access_token);
        this.loggedIn = valid;
        this.username = user.email;
        localStorage.setItem('username', user.email);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    this.loggedIn = false;
  }

  isAuthenticated(): boolean {
    return this.loggedIn;
  }
}
