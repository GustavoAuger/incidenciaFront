export interface UserUpdate {
    id?: number;
    nombre?: string;
    email: string;
    id_bodega?: number;
    estado?: boolean; 
    id_rol: number;
}