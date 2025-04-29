export interface Incidencia {
    id?: number;
    origen:string;
    tipoTransporte: string;
    ots: string;
    fechaRecepcion: string;
    observaciones?: string;
    imagen1?: File | null;
    imagen2?: File | null;
}