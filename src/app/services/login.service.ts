import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  //private apiUrl = environment.apiUrl;

  //Mockup API
  private apiUrl = 'https://0d2c7ecf-6f81-4dea-b840-3cb58dae409c.mock.pstmn.io';
  
  constructor(private http: HttpClient) { }

  validateUserPassword(username : string, password : string): Observable<{access_token: string, id_rol: number}> {
    return this.http.post<{access_token: string, id_rol: number}>(this.apiUrl+'/validateLogin', {username, password});
  }
}
