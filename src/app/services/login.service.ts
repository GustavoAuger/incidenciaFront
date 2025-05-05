import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  validateUserPassword(username : string, password : string): Observable<{access_token: string, id_rol: number, id: number, id_bodega: number}> {
    const body = { username, password };
    return this.http.post<{access_token: string, id_rol: number, id: number , id_bodega: number}>(this.apiUrl+'/validateLogin', body);
  }
}
