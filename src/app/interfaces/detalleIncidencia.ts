import { Incidencia } from "./incidencia";

export interface DetalleIncidencia {
    id?: number;
    numGuia: string;
    tipoDiferencia: string;
    numBulto: number;
    pesoOrigen: number;
    pesoRecepcion: number;
    cantidad: number;
    sku: string;
    descripcion: string;
    incidencia?: Incidencia[];
    idIncidencia: number;
    skusDisponibles?: Array<{sku: string, total: number}>;
}