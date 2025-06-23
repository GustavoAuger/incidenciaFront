export interface ReclamoTransportista{
    id:number;
    id_incidencia:number;
    monto_pagado:number;
    fdr:string;
    fecha_reclamo: Date;
    observacion?:string;
    id_estado:number;
}
