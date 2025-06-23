import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { Observable } from 'rxjs';
import { EstadoReclamo } from '../interfaces/estado-reclamo';
import { ReclamoTransportista } from '../interfaces/reclamo-transportista';

@Injectable({
  providedIn: 'root'
})
export class ReclamoTransportistaService {

  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEstadosReclamo(): Observable<EstadoReclamo[]> {
    return this.http.get<EstadoReclamo[]>(this.url + '/getEstadosReclamo');
  }

  getReclamosTransportista(): Observable<ReclamoTransportista[]> {
    return this.http.get<ReclamoTransportista[]>(this.url + '/getReclamosTransportista');
  }

  createReclamoTransportista(reclamoTransportista: ReclamoTransportista): Observable<boolean> {
    return this.http.post<boolean>(this.url + '/createReclamoTransportista', reclamoTransportista);
  }

  updateReclamoTransportista(reclamoTransportista: ReclamoTransportista): Observable<boolean> {
    return this.http.put<boolean>(this.url + '/updateReclamoTransportista', reclamoTransportista);
  }
}
