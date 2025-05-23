import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { User } from '../interfaces/user';
import { Rol } from '../interfaces/rol';
import { Bodega } from '../interfaces/bodega';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  
  getUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + '/getUsers');
  }

  updateUser(user: User): Observable<boolean> {
    if (!user.id) {
      throw new Error('User ID is required for updating');
    }
    const body = {
      id: user.id,
      nombre: user.nombre,
      email: user.email, 
      id_rol: user.id_rol,
      id_bodega: user.id_bodega,
      estado: user.estado
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

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getUserByUsername/${username}`);
  }
}
