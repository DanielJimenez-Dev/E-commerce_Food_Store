import type { Producto } from './producto.js';

export interface DetallePedido {
    cantidad: number;
    subtotal: number;
    producto: number;
}

export interface Pedido {
    id: number;
    usuario: number;
    fecha: string;
    estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';
    total: number;
    formaPago: 'EFECTIVO' | 'TARJETA';
    detalles: DetallePedido[];
}