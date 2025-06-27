export interface GetIncidencia {
    destino: string;
    fecha_emision: string;
    fecha_recepcion: string;
    id: number;
    id_estado: number;
    id_tipo_incidencia: number;
    id_transportista: number;
    id_usuario: number;
    observaciones: string;
    origen: string;
    ots: string;
    ruta: string | null;
    total_item: number;
    valorizado: number;
}
