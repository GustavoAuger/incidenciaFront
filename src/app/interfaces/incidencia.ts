export interface Incidencia {
    id?: number;
    id_bodega?: number;
    ots?: string;
    fecha?: string;
    observaciones?: string;
    origen_id_local: string;
    destino_id_bodega: string;
    id_estado?: number;
    id_usuario?: number;
    transportista?: string;
    id_transportista?: number;
    fecha_recepcion?: string;
    fecha_emision?: string;
    destino?: string;
    id_tipo_incidencia?: number;
    tipo_estado: string;
    valorizado: number;
    total_item: number;
    d_id_bodega: number;
    ruta: string;
    
}

