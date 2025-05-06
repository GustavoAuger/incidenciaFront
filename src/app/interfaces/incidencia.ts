export interface Incidencia {
    id?: number;
    fecha_recepcion: string;
    id_estado: number;
    tipo_estado: string;
    transportista: string;
    origen_id_local: number;
    destino?: string;
    destino_id_local: number;
    ots: string;
    fecha_emision?: string;
    observaciones: string;
    id_usuario: number;
    id_tipo_incidencia?: number;
    estado?: string;
    id_bodega?: number;
    id_transportista?: number;
}
