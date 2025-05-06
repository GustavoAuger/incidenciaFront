import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Incidencia } from '../interfaces/incidencia';
import { Observable } from 'rxjs';
import { EstadoIncidencia } from '../interfaces/estado-incidencia';
import { Transportista } from '../interfaces/transportista';
import { Tipo_incidencia } from '../interfaces/tipo_incidencia';

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
      id_transportista: incidencia.transportista
    };
    return this.http.post<boolean>(this.apiUrl+'/createIncidencia', body);
  }

  getIncidencias(id_usuario: number): Observable<Incidencia[]> {
    return this.http.post<Incidencia[]>(this.apiUrl + '/getIncidencias', { id_usuario });
  }

  getEstadoIncidencias(): Observable<EstadoIncidencia[]>{
    return this.http.get<EstadoIncidencia[]>(this.apiUrl+'/getEstadoIncidencias');
  }

  getTransportistas(): Observable<Transportista[]>{
    return this.http.get<Transportista[]>(this.apiUrl+'/getTransportistas');
  }

  getTipoIncidencia(): Observable<Tipo_incidencia[]>{ //revisar
    return this.http.get<Tipo_incidencia[]>(this.apiUrl+'/getTipoincidencias');
  }
}
