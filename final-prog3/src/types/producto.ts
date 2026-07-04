import type { Categoria } from './categoria.js';

export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    stock: number;
    imagen: string;
    disponible: boolean;
    categoria: number;
}