import { ApiService } from '../../../utils/api.service.js';

export function renderCart(container: HTMLElement, onBackToStore: () => void): void {
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
            <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4caf50; padding-bottom: 15px; margin-bottom: 25px;">
                <h2 style="color: #4caf50; margin: 0;">🛒 Tu Carrito de Compras</h2>
                <button id="back-to-store-btn" style="padding: 10px 15px; background: #ff9800; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                    Volver al Menú
                </button>
            </header>
            
            <div id="cart-items-container">
                <!-- Se inyectará la tabla o el mensaje de vacío aquí -->
            </div>
        </div>
    `;

    document.getElementById('back-to-store-btn')?.addEventListener('click', onBackToStore);

    const itemsContainer = document.getElementById('cart-items-container') as HTMLDivElement;

    // Función interna para refrescar los datos y la vista del carrito
    const refreshCartView = () => {
        // Obtenemos el carrito usando la clave exacta 'carrito' que usa tu home.ts
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

        if (carrito.length === 0) {
            itemsContainer.innerHTML = `<p style="text-align: center; color: #999; margin-top: 40px; font-size: 1.1em;">Tu carrito está vacío.</p>`;
            return;
        }

        let html = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 2; min-width: 550px;">
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left; color: #495057;">
                                <th style="padding: 12px;">Plato</th>
                                <th style="padding: 12px; text-align: center;">Precio</th>
                                <th style="padding: 12px; text-align: center;">Cantidad</th>
                                <th style="padding: 12px; text-align: right;">Subtotal</th>
                                <th style="padding: 12px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        let totalCompra = 0;

        carrito.forEach((item: any) => {
            const subtotal = item.precio * item.cantidad;
            totalCompra += subtotal;

            html += `
                <tr style="border-bottom: 1px solid #dee2e6; color: #212529; vertical-align: middle;">
                    <td style="padding: 12px; display: flex; align-items: center; gap: 10px;">
                        <img src="${item.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://placehold.co/40x40?text=Food'">
                        <span style="font-weight: bold; color: #333;">${item.nombre}</span>
                    </td>
                    <td style="padding: 12px; text-align: center;">$${item.precio.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: center;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 6px;">
                            <button class="btn-minus" data-id="${item.id}" style="padding: 2px 8px; background: #eee; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">-</button>
                            <span style="font-weight: bold; width: 25px; display: inline-block;">${item.cantidad}</span>
                            <button class="btn-plus" data-id="${item.id}" style="padding: 2px 8px; background: #eee; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">+</button>
                        </div>
                    </td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #333;">$${subtotal.toFixed(2)}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button class="btn-delete" data-id="${item.id}" style="padding: 5px 10px; background: #e91e63; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; font-weight: bold;">Quitar</button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>

                <!-- Tarjeta Lateral de Cierre de Compra -->
                <div style="flex: 1; min-width: 280px; background: #fdfefe; border: 1px solid #e1e8ed; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); height: fit-content;">
                    <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Resumen de Compra</h3>
                    <div style="display: flex; justify-content: space-between; margin: 15px 0; font-size: 1.15em;">
                        <span>Total:</span>
                        <strong style="color: #4caf50; font-size: 1.3em;">$${totalCompra.toFixed(2)}</strong>
                    </div>
                    <button id="checkout-btn" style="width: 100%; padding: 12px; background: #4caf50; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 1.1em; cursor: pointer; transition: background 0.2s;">
                        🚀 Confirmar Pedido
                    </button>
                </div>
            </div>
        `;

        itemsContainer.innerHTML = html;

        // --- Eventos de la Tabla ---

        // Botón Restar Cantidad
        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                let cart = JSON.parse(localStorage.getItem('carrito') || '[]');
                const idx = cart.findIndex((i: any) => i.id === id);
                if (idx !== -1) {
                    cart[idx].cantidad -= 1;
                    if (cart[idx].cantidad <= 0) {
                        cart.splice(idx, 1);
                    }
                    localStorage.setItem('carrito', JSON.stringify(cart));
                    refreshCartView();
                }
            });
        });

        // Botón Sumar Cantidad
        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                let cart = JSON.parse(localStorage.getItem('carrito') || '[]');
                const idx = cart.findIndex((i: any) => i.id === id);
                if (idx !== -1) {
                    cart[idx].cantidad += 1;
                    localStorage.setItem('carrito', JSON.stringify(cart));
                    refreshCartView();
                }
            });
        });

        // Botón Eliminar Fila
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                let cart = JSON.parse(localStorage.getItem('carrito') || '[]');
                cart = cart.filter((i: any) => i.id !== id);
                localStorage.setItem('carrito', JSON.stringify(cart));
                refreshCartView();
            });
        });

        // Botón Confirmar Compra e inserción en el JSON de pedidos
        document.getElementById('checkout-btn')?.addEventListener('click', async () => {
            try {
                const currentCart = JSON.parse(localStorage.getItem('carrito') || '[]');
                if (currentCart.length === 0) return;

                // Intentamos capturar la sesión del usuario si existiera, sino creamos un fallback simulado
                const sesion = JSON.parse(localStorage.getItem('usuario_sesion') || '{"id": 1, "nombre": "Daniel", "apellido": "Jimenez", "celular": "351000000"}');

                // Traemos los pedidos de la persistencia para auto-incrementar el ID de forma correcta
                const pedidosExistentes = await ApiService.getPedidos();
                const nuevoId = pedidosExistentes.length > 0 ? Math.max(...pedidosExistentes.map((p: any) => p.id)) + 1 : 1;

                // Fecha formateada local
                const fechaStr = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

                // Estructuramos el objeto idéntico a lo que consume tu panel de administración (orders.ts)
                const nuevoPedido = {
                    id: nuevoId,
                    fecha: fechaStr,
                    idUsuario: sesion.id,
                    usuarioDto: {
                        nombre: sesion.nombre,
                        apellido: sesion.apellido,
                        celular: sesion.celular
                    },
                    detalles: currentCart.map((item: any) => ({
                        cantidad: item.cantidad,
                        producto: {
                            id: item.id,
                            nombre: item.nombre,
                            precio: item.precio
                        }
                    })),
                    total: totalCompra,
                    estado: "PENDIENTE"
                } as any;

                // Guardamos usando el método estático de la capa de datos
                pedidosExistentes.push(nuevoPedido);
                ApiService.setPedidos(pedidosExistentes);

                // Limpiamos el carrito local
                localStorage.removeItem('carrito');

                alert(`🎉 ¡Pedido #${nuevoId} enviado a la cocina con éxito!`);

                // Redireccionamos al menú principal del store
                onBackToStore();

            } catch (err) {
                alert('Ocurrió un error al procesar el pedido.');
                console.error(err);
            }
        });
    };

    // Inicializamos la lectura de datos
    refreshCartView();
}