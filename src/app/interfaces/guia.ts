export interface SkuTotal {
  sku: string;
  total: number;
}

export interface Guia {
  id: string;
  numguia: string;
  id_bod_origen: string;
  id_bod_destino: string;
  sku_total: SkuTotal[];
}