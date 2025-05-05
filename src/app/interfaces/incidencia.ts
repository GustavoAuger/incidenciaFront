export interface Incidencia {
    id?: number;
    id_bodega?: number;
    ots?: string;
    fecha?: string;
    observaciones?: string;
    origen_id_local: string;
    destino_id_local: string;
    id_estado?: number;
    id_usuario?: number;
    transportista?: string;
    id_transportista?: number;
    fecha_recepcion?: string;
    destino?: string;
    id_tipo_incidencia?: number;
    tipo_estado: string;
    
}

