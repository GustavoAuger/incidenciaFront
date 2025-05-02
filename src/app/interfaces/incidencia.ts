export interface Incidencia {
    id?: number;
    bodOrigen:string;
    transportista: string;
    ots: string;
    fechaRecepcion: string;
    observaciones?: string;
    imagen1?: File | null;
    imagen2?: File | null;
}