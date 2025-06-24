export interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  fechaReclamoDesde?: string;
  fechaReclamoHasta?: string;
  numeroIncidencia: string;
  numeroReclamo?: string;
  tipoIncidencia: string;
  origen: string;
  destino: string;
  ots: string;
  transporte: string;  
  estado: string;    
}