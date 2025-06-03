import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Incidencia } from '../interfaces/incidencia';
import { Observable } from 'rxjs';
import { EstadoIncidencia } from '../interfaces/estado-incidencia';
import { Transportista } from '../interfaces/transportista';
import { Tipo_incidencia } from '../interfaces/tipo_incidencia';
import { DetalleIncidencia } from '../interfaces/detalleIncidencia';
import { Guia } from '../interfaces/guia';
@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private incidenciaParcial: Incidencia | null = null; //nuevo para hacer 2 pasos
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  createIncidenciaCompleta(data: { 
    incidencia: Incidencia, 
    detalles: DetalleIncidencia[] 
  }): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl + '/createIncidencia', data);
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

  //NUEVO
  setIncidenciaParcial(incidencia: Incidencia): void { //CREAMOS UNA INCIDENCIA PARCIALMENTE
    this.incidenciaParcial = incidencia;
    console.log('Incidencia parcial guardada:', this.incidenciaParcial);
  }

  // Método para obtener la incidencia parcial si la necesitas después
  getIncidenciaParcial(): Incidencia | null { // AQUI LA LLAMAMOS
    return this.incidenciaParcial; 
  }

  createDetalleIncidencia(detalle: DetalleIncidencia): Observable<DetalleIncidencia> {
    return this.http.post<DetalleIncidencia>(this.apiUrl + '/createDetalleIncidencia', detalle);
  }
  getDetallesIncidencia(idIncidencia: number): Observable<DetalleIncidencia[]> {
    return this.http.post<DetalleIncidencia[]>(this.apiUrl + '/getDetallesIncidencia', { id_incidencia: idIncidencia });
  }
  //TERMINA LO NUEVO 
  private incidenciaForm: any = null;

  setIncidenciaForm(formData: any): void {
    this.incidenciaForm = formData;
    console.log('Datos del formulario guardados:', this.incidenciaForm);
  }

  getIncidenciaForm(): any {
    return this.incidenciaForm;
  }

  getGuias(): Observable<Guia[]>{
    return this.http.get<Guia[]>(this.apiUrl+'/getGuias');
  }

  getProductos(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getProductos');
  }
}
