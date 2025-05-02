import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Incidencia } from '../interfaces/incidencia';
import { DetalleIncidencia } from '../interfaces/detalleIncidencia';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  // Crear una nueva incidencia
  createIncidencia(incidencia: Incidencia): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.apiUrl + '/createIncidencia', incidencia);
  }

  // Crear un nuevo detalle de incidencia
  createDetalleIncidencia(detalle: DetalleIncidencia): Observable<DetalleIncidencia> {
    return this.http.post<DetalleIncidencia>(this.apiUrl + '/createDetalleIncidencia', detalle);
  }

  // Obtener todas las incidencias
  getIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.apiUrl + '/getIncidencias');
  }

  // Obtener una incidencia por ID
  getIncidencia(id: number): Observable<Incidencia> {
    return this.http.get<Incidencia>(this.apiUrl + '/getIncidencia/' + id);
  }

  // Obtener detalles de una incidencia
  getDetallesIncidencia(id_incidencia: number): Observable<DetalleIncidencia[]> {
    return this.http.get<DetalleIncidencia[]>(this.apiUrl + '/getDetallesIncidencia/' + id_incidencia);
  }

  

}
