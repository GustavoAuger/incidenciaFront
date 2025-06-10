import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { User } from '../interfaces/user';
import { Rol } from '../interfaces/rol';
import { Bodega } from '../interfaces/bodega';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private user!: User;
  constructor(private http: HttpClient) { }
  
  getUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + '/getUsers');
  }

  updateUser(user: User, password?: string): Observable<boolean> {
    if (!user.id) {
      throw new Error('User ID is required for updating');
    }
    const body = {
      id: user.id,
      nombre: user.nombre,
      email: user.email, 
      id_rol: user.id_rol,
      id_bodega: user.id_bodega,
      estado: user.estado,
      contrasena: password || null
    };
    
    return this.http.post<boolean>(this.apiUrl+'/modifyUser', body);
  }

  createUser(user: User): Observable<boolean> {
    const body = {
      nombre: user.nombre,
      email: user.email,
      contrasena: user.password,
      id_rol: user.id_rol,
      id_bodega: user.id_bodega,
      estado: true
    };
    return this.http.post<boolean>(this.apiUrl+'/createUser', body);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl + '/getRol');
  }

  getBodegas(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(this.apiUrl + '/getBodegas');
  }

  // Obtener lista de correos electrónicos existentes
  getMails(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + '/getMails');
  }

  // Obtener lista de IDs de bodega de usuarios
  getBodegaUsers(): Observable<{id: string, id_bodega: number}[]> {
    return this.http.get<{id: string, id_bodega: number}[]>(this.apiUrl + '/getIdBodegaUser').pipe(
      map(bodegas => {
        return bodegas.map(bodega => ({
          ...bodega,
          id: bodega.id.includes('-') 
            ? bodega.id.split('-')[0] + '-' + bodega.id_bodega.toString().padStart(3, '0')
            : 'LO-' + bodega.id_bodega.toString().padStart(3, '0')
        }));
      })
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getUserByUsername/${username}`);
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


}
