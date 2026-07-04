import { ApiService } from '../../../utils/api.service.js';
import type { Producto, Categoria } from '../../../types/index.js';

export async function renderStoreHome(
    container: HTMLElement,
    onLogout: () => void,
    onViewCart: () => void,
    onViewDetail: (id: number) => void
): Promise<void> {
    try {
        // 1. Cargamos los datos iniciales desde el servicio estático
        const [productos, categorias]: [Producto[], Categoria[]] = await Promise.all([
            ApiService.getProductos(),
            ApiService.getCategorias()
        ]);

        // 2. Estructuramos el HTML base de la tienda
        container.innerHTML = `
            <div class="store-container" style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
                <!-- Barra de Navegación Superior -->
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff9800; padding-bottom: 15px; margin-bottom: 25px;">
                    <div>
                        <h1 style="color: #ff9800; margin: 0;">🍕 Food Store</h1>
                        <p style="color: #666; margin: 5px 0 0 0;">¡Los mejores platos a un clic!</p>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <button id="cart-btn" style="padding: 10px 15px; background: #4caf50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                            🛒 Carrito (<span id="cart-count">0</span>)
                        </button>
                        <button id="logout-btn" style="padding: 10px 15px; background: #e91e63; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                <!-- Sección de Filtros por Categoría -->
                <section style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 10px;">Filtrar por Categoría:</h3>
                    <div id="categories-filter-container" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="filter-btn" data-category="all" style="padding: 8px 16px; background: #ff9800; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">Todos</button>
                        ${categorias.map(cat => `
                            <button class="filter-btn" data-category="${cat.id}" style="padding: 8px 16px; background: #eee; color: #333; border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">${cat.nombre}</button>
                        `).join('')}
                    </div>
                </section>

                <!-- Grilla de Productos -->
                <main>
                    <h2 style="color: #333; margin-bottom: 20px;">Nuestro Menú</h2>
                    <div id="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                        <!-- Los productos filtrados se inyectarán dinámicamente aquí -->
                    </div>
                </main>
            </div>
        `;

        // Vinculamos eventos de los botones globales de navegación
        document.getElementById('logout-btn')?.addEventListener('click', onLogout);
        document.getElementById('cart-btn')?.addEventListener('click', onViewCart);

        const productsGrid = document.getElementById('products-grid') as HTMLDivElement;
        const filterButtons = document.querySelectorAll('.filter-btn');
        const cartCountSpan = document.getElementById('cart-count') as HTMLSpanElement;

        // Función auxiliar para actualizar visualmente la burbuja numérica del carrito
        const actualizarContadorCarrito = () => {
            const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const totalItems = carrito.reduce((sum: number, item: any) => sum + item.cantidad, 0);
            if (cartCountSpan) cartCountSpan.textContent = totalItems.toString();
        };

        // Lógica para guardar en el LocalStorage
        const agregarAlCarritoSimulado = (productoId: number) => {
            const productoSeleccionado = productos.find(p => p.id === productoId);
            if (!productoSeleccionado) return;

            let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const itemExistente = carrito.find((item: any) => item.id === productoId);

            if (itemExistente) {
                itemExistente.cantidad += 1;
            } else {
                carrito.push({
                    id: productoSeleccionado.id,
                    nombre: productoSeleccionado.nombre,
                    precio: productoSeleccionado.precio,
                    imagen: productoSeleccionado.imagen,
                    cantidad: 1
                });
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
        };

        // Función encargada de inyectar las tarjetas de productos
        const displayProducts = (filteredList: Producto[]) => {
            if (filteredList.length === 0) {
                productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #999; font-size: 1.2em; margin-top: 40px;">No hay productos disponibles en esta categoría.</p>`;
                return;
            }

            productsGrid.innerHTML = filteredList.map(prod => `
                <div class="product-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); background: #fff; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="clickable-area" data-id="${prod.id}" style="cursor: pointer;">
                        <img src="${prod.imagen}" alt="${prod.nombre}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 12px;" onerror="this.src='https://placehold.co/250x150?text=Comida'">
                        <h3 style="margin: 0 0 8px 0; font-size: 1.15em; color: #222;">${prod.nombre}</h3>
                        <p style="margin: 0 0 12px 0; font-size: 0.9em; color: #666; height: 40px; overflow: hidden; text-overflow: ellipsis;">${prod.descripcion}</p>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: bold;">
                            <span style="color: #e91e63; font-size: 1.25em;">$${prod.precio}</span>
                        </div>
                        <button class="add-to-cart-btn" data-id="${prod.id}" style="width: 100%; padding: 10px; background: #ff9800; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            `).join('');

            // Escuchar clics para ir a la vista de detalle
            productsGrid.querySelectorAll('.clickable-area').forEach(el => {
                el.addEventListener('click', () => {
                    const id = parseInt(el.getAttribute('data-id') || '0');
                    onViewDetail(id);
                });
            });

            // Escuchar clics para agregar al carrito
            productsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitamos que abra el detalle por error
                    const target = e.currentTarget as HTMLButtonElement;
                    const productoId = parseInt(target.getAttribute('data-id') || '0');
                    agregarAlCarritoSimulado(productoId);
                });
            });
        };

        // Inicializamos los productos y el contador global
        displayProducts(productos);
        actualizarContadorCarrito();

        // MANEJO DE FILTROS: Los vinculamos en el contenedor principal que nunca se destruye
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement;

                // Cambiar estilos de selección visual en los botones
                filterButtons.forEach(b => {
                    (b as HTMLButtonElement).style.background = '#eee';
                    (b as HTMLButtonElement).style.color = '#333';
                });
                target.style.background = '#ff9800';
                target.style.color = 'white';

                const categoryStr = target.getAttribute('data-category');
                if (categoryStr === 'all') {
                    displayProducts(productos);
                } else {
                    const catId = parseInt(categoryStr || '0');
                    // Filtramos chequeando correctamente el id interno del objeto categoria
                    const filtrados = productos.filter(p => p.categoria && (p.categoria as any).id === catId);
                    displayProducts(filtrados);
                }
            });
        });

    } catch (error) {
        console.error('Error al renderizar la tienda:', error);
        container.innerHTML = `<p style="text-align: center; color: red; margin-top: 50px;">Ocurrió un error al cargar la tienda. Inténtelo de nuevo más tarde.</p>`;
    }
}