import { Incidencia } from "./incidencia";

export interface DetalleIncidencia {
    id?: number;
    numGuia: number;
    tipoDiferencia: string;
    numBulto: string;
    pesoOrigen: number;
    pesoRecepcion: number;
    cantidad: number;
    sku: number;
    ean13: number;
    descripcion: string;
    incidencia?: Incidencia[];
    idIncidencia: number;
}