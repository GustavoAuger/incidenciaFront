export interface User {
    id?: number;
    nombre?: string;
    email: string;
    id_bodega?: number;
    bodega?: string;
    estado?: boolean;   
    rol?: string;
    id_rol: number;
    password?: string;
    isEditing?: boolean;
}
