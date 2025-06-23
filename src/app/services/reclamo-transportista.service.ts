import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { Observable } from 'rxjs';
import { EstadoReclamo } from '../interfaces/estado-reclamo';

@Injectable({
  providedIn: 'root'
})
export class ReclamoTransportistaService {

  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEstadosReclamo(): Observable<EstadoReclamo[]> {
    return this.http.get<EstadoReclamo[]>(this.url + '/getEstadosReclamo');
  }
}
