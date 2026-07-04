import type { Categoria, Producto, Usuario, Pedido } from '../types/index.js';

// Variables en memoria para persistir el estado durante la sesión
let _categorias: Categoria[] | null = null;
let _productos: Producto[] | null = null;
let _usuarios: Usuario[] | null = null;
let _pedidos: Pedido[] | null = null;

export const ApiService = {
    async getCategorias(): Promise<Categoria[]> {
        if (_categorias) return _categorias; // Si ya existen en memoria, los devuelve directo

        const res = await fetch('/data/categorias.json');
        if (!res.ok) throw new Error('Error al cargar categorías');
        _categorias = await res.json();
        return _categorias!;
    },

    async getProductos(): Promise<Producto[]> {
        if (_productos) return _productos;

        const res = await fetch('/data/productos.json');
        if (!res.ok) throw new Error('Error al cargar productos');
        _productos = await res.json();
        return _productos!;
    },

    async getUsuarios(): Promise<Usuario[]> {
        if (_usuarios) return _usuarios;

        const res = await fetch('/data/usuarios.json');
        if (!res.ok) throw new Error('Error al cargar usuarios');
        _usuarios = await res.json();
        return _usuarios!;
    },

    async getPedidos(): Promise<Pedido[]> {
        if (_pedidos) return _pedidos;

        const res = await fetch('/data/pedidos.json');
        if (!res.ok) throw new Error('Error al cargar pedidos');
        _pedidos = await res.json();
        return _pedidos!;
    },

    // Métodos auxiliares para cuando hagamos ABM (guardar los cambios en la memoria de la sesión)
    setCategorias(nuevas: Categoria[]): void { _categorias = nuevas; },
    setProductos(nuevos: Producto[]): void { _productos = nuevos; },
    setPedidos(nuevos: Pedido[]): void { _pedidos = nuevos; }
};