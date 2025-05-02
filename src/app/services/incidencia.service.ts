import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Incidencia } from '../interfaces/incidencia';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createIncidencia(incidencia : Incidencia): Observable<boolean>{
    const body = {
      id_bodega: incidencia.id_bodega,
      ots: incidencia.ots,
      fecha: incidencia.fecha,
      observaciones: incidencia.observaciones,
      id_estado: incidencia.id_estado,
      id_usuario: incidencia.id_usuario,
      id_transportista: incidencia.id_transportista
    };
    return this.http.post<boolean>(this.apiUrl+'/createIncidencia', body);
  }
}
