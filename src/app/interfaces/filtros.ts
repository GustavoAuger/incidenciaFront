export interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  numeroIncidencia: string;
  tipoIncidencia: string;
  origen: string;
  destino: string;
  ots: string;
  transporte: string;  // Almacenará el ID del transporte como string
  estado: string;      // Almacenará el ID del estado como string
}