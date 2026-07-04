import { ApiService } from '../../../utils/api.service.js';

// Convertimos la función en asíncrona para poder usar ApiService
export async function renderProductDetail(container: HTMLElement, productoId: number, onBack: () => void): Promise<void> {

    // 1. Renderizamos primero el esqueleto visual y un estado de carga
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); background: #fff;">
            <button id="back-detail-btn" style="padding: 10px 15px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 25px; font-weight: bold;">
                ← Volver al Menú
            </button>
            
            <div id="detail-content" style="text-align: center; padding: 40px;">
                <p style="color: #999; font-size: 1.1em;">Cargando información del plato...</p>
            </div>
        </div>
    `;

    document.getElementById('back-detail-btn')?.addEventListener('click', onBack);

    const contentContainer = document.getElementById('detail-content') as HTMLDivElement;

    try {
        // 2. Buscamos el producto específico en la capa de datos
        const productos = await ApiService.getProductos();
        const producto = productos.find(p => p.id === productoId);

        if (!producto) {
            contentContainer.innerHTML = `
                <div style="padding: 40px; color: #e91e63; font-weight: bold; font-size: 1.2em;">
                    ❌ No se encontró el producto solicitado.
                </div>
            `;
            return;
        }

        // 3. Renderizamos la información detallada del plato
        contentContainer.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 40px; text-align: left;">
                
                <!-- Columna Izquierda: Imagen -->
                <div style="flex: 1; min-width: 300px;">
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" onerror="this.src='https://placehold.co/400x400?text=Comida'">
                </div>
                
                <!-- Columna Derecha: Información y Compra -->
                <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <span style="display: inline-block; padding: 4px 10px; background: #eee; color: #555; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-bottom: 15px;">
                            ${(producto.categoria as any)?.nombre || 'Menú'}
                        </span>
                        <h2 style="margin: 0 0 15px 0; color: #333; font-size: 2.2em;">${producto.nombre}</h2>
                        <p style="color: #666; font-size: 1.1em; line-height: 1.6; margin-bottom: 25px;">
                            ${producto.descripcion}
                        </p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                        <div style="font-size: 2.5em; color: #e91e63; font-weight: bold; margin-bottom: 20px;">
                            $${producto.precio.toFixed(2)}
                        </div>
                        <button id="add-to-cart-detail-btn" style="width: 100%; padding: 15px; background: #ff9800; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1.2em; cursor: pointer; transition: background 0.2s;">
                            🛒 Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 4. Lógica para sumar el producto al carrito directamente desde esta vista
        document.getElementById('add-to-cart-detail-btn')?.addEventListener('click', () => {
            let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const itemExistente = carrito.find((item: any) => item.id === producto.id);

            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    cantidad: 1
                });
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            alert(`✅ ¡"${producto.nombre}" se agregó al carrito!`);
        });

    } catch (error) {
        console.error('Error al cargar el detalle del producto:', error);
        contentContainer.innerHTML = `
            <div style="padding: 40px; color: #e91e63; font-weight: bold;">
                Ocurrió un error de conexión al cargar la información.
            </div>
        `;
    }
}