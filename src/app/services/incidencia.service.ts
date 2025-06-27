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
import { catchError, throwError } from 'rxjs';
import { GetIncidencia } from '../interfaces/get-incidencia';

// Interfaz para la respuesta del backend
interface BackendResponse {
  mensaje: string;
}

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
  }, file?: File): Observable<BackendResponse> {
    const formData = new FormData();
    formData.append('body', JSON.stringify(data));
    
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<BackendResponse>(this.apiUrl + '/createIncidencia', formData);
  }
  getIncidencias(id_usuario: number): Observable<Incidencia[]> {
    return this.http.post<Incidencia[]>(this.apiUrl + '/getIncidencias', { id_usuario });
  }

  getAllIncidencias(): Observable<GetIncidencia[]> {
    return this.http.get<GetIncidencia[]>(this.apiUrl + '/getAllIncidencias');
  }

  getEstadoIncidencias(): Observable<EstadoIncidencia[]>{
    return this.http.get<EstadoIncidencia[]>(this.apiUrl+'/getEstadoincidencias');
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

  // Método para enviar correo
  enviarCorreo(incidencia: Incidencia): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl + '/enviar_correo_bodega2', { incidencia });
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

  actualizarDetallesIncidencia(data: { 
    incidencia: Incidencia, 
    total_item: number,
    valorizado: number,
    detalles: DetalleIncidencia[] 
  }): Observable<boolean> {
    console.log(data);
    return this.http.post<boolean>(this.apiUrl + '/actualizarDetalle', data);
  }

  generarMovimiento(id_incidencia: number): Observable<boolean> {
    return this.http.post<boolean>(this.apiUrl + '/post-movimientos', { id_incidencia });
  }

  getMovimiento(id_incidencia: number): Observable<any> {
    // Ensure the id_incidencia is sent as a number
    const body = {
      id_incidencia: Number(id_incidencia)
    };
    return this.http.post<any>(this.apiUrl + '/getMovimientos', body);
  }

  // Método para calcular el total de items
  calcularTotalItems(detalles: DetalleIncidencia[]): number {
    return detalles.reduce((total, detalle) => {
      return total + detalle.cantidad;
    }, 0);
  }

  // Método para calcular el valorizado total
  calcularValorizado(detalles: DetalleIncidencia[], guias: any[]): number {
    return detalles.reduce((total, detalle) => {
      // Buscar la guía correspondiente al detalle
      const guia = guias.find(g => g.numguia === detalle.numGuia);
      if (!guia) return total;

      // Buscar el SKU en la guía para obtener el precio
      const skuInfo = guia.sku_total.find((item: any) => item.sku === detalle.sku);
      if (!skuInfo) return total;

      // Multiplicar el precio por la cantidad del detalle
      return total + (skuInfo.precio * detalle.cantidad);
    }, 0);
  }

  subirImagenes(formData: FormData) {
    return this.http.post<{ urls: string[] }>(this.apiUrl + '/upload-image', formData);
  }

  updateEstadoIncidencia(data: {id_incidencia: number, id_estado: number, observaciones?: string}): Observable<boolean> {
    const body = {
      id_incidencia: data.id_incidencia,
      id_estado: data.id_estado,
      observaciones: data.observaciones || '' // Incluir las observaciones en el cuerpo de la petición
    };
    return this.http.post<boolean>(this.apiUrl + '/update-estado-incidencia', body);
  }
}
