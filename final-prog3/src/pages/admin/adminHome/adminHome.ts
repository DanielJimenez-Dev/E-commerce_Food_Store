import { renderAdminCategories } from '../categories/categories.js';
import { renderAdminProducts } from '../products/products.js';
import { renderAdminOrders } from '../orders/orders.js';

// Importación del servicio real existente y el tipo Producto
import { ApiService } from '../../../utils/api.service.js';
import type { Producto } from '../../../types/index.js';

/**
 * Renderiza la pantalla principal del Dashboard con las 4 tarjetas estadísticas (FHU-07)
 */
async function renderDashboardMetrics(container: HTMLElement): Promise<void> {
    try {
        // Indicador de carga temporal mientras se resuelven los archivos JSON
        container.innerHTML = `<p style="padding: 20px; color: #7f8c8d; font-family: Arial, sans-serif;">Cargando estadísticas...</p>`;

        // Consultamos los arreglos en memoria de forma segura utilizando tu ApiService
        const [categorias, productos, pedidos] = await Promise.all([
            ApiService.getCategorias(),
            ApiService.getProductos(),
            ApiService.getPedidos()
        ]);

        const totalCategorias = categorias.length;
        const totalProductos = productos.length;
        const totalPedidos = pedidos.length;

        // Filtro tipado explícitamente como 'Producto' para solucionar el error TS7006
        const productosDisponibles = productos.filter((p: any) => p.disponible && !p.eliminado).length;

        // Inyección del HTML estructurado del Dashboard
        container.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.8em;">📊 Resumen del Sistema</h3>
                <p style="margin: 0; color: #7f8c8d;">Métricas generales de la plataforma en tiempo real.</p>
            </div>

            <!-- Grilla de Tarjetas Estadísticas -->
            <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 20px;">
                
                <!-- Tarjeta 1: Categorías -->
                <div style="background: #3498db; color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Total Categorías</div>
                    <div style="font-size: 2.5em; font-weight: bold; margin-top: 10px;">${totalCategorias}</div>
                </div>

                <!-- Tarjeta 2: Productos -->
                <div style="background: #e67e22; color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Total Productos</div>
                    <div style="font-size: 2.5em; font-weight: bold; margin-top: 10px;">${totalProductos}</div>
                </div>

                <!-- Tarjeta 3: Productos Disponibles -->
                <div style="background: #2ecc71; color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Disponibles Tienda</div>
                    <div style="font-size: 2.5em; font-weight: bold; margin-top: 10px;">${productosDisponibles}</div>
                </div>

                <!-- Tarjeta 4: Pedidos -->
                <div style="background: #9b59b6; color: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Pedidos Recibidos</div>
                    <div style="font-size: 2.5em; font-weight: bold; margin-top: 10px;">${totalPedidos}</div>
                </div>

            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p style="padding: 20px; color: #e74c3c; font-family: Arial, sans-serif;">❌ Error al cargar las métricas del sistema.</p>`;
        console.error(error);
    }
}

export function renderAdminDashboard(container: HTMLElement, onLogout: () => void): void {
    // 1. Inyectamos la estructura del Layout con barra lateral (Sidebar) y área de trabajo principal
    container.innerHTML = `
        <div class="admin-layout" style="display: flex; font-family: Arial, sans-serif; min-height: 100vh; background-color: #f4f6f9;">
            
            <!-- Sidebar / Barra Lateral de Navegación -->
            <aside style="width: 260px; background-color: #2c3e50; color: white; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; box-sizing: border-box; box-shadow: 2px 0 5px rgba(0,0,0,0.1);">
                <div>
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #34495e; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #ff9800; font-size: 1.5em;">👑 Panel Admin</h2>
                        <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #bdc3c7;">Bienvenido, Admin Sistema</p>
                    </div>
                    
                    <nav style="display: flex; flex-direction: column; gap: 10px;">
                        <button id="tab-dashboard" class="nav-tab-btn active" style="width: 100%; padding: 12px 15px; text-align: left; background: #ff9800; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                            🏠 Inicio / Dashboard
                        </button>
                        <button id="tab-products" class="nav-tab-btn" style="width: 100%; padding: 12px 15px; text-align: left; background: transparent; color: #ecf0f1; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                            🍔 Productos (ABM)
                        </button>
                        <button id="tab-categories" class="nav-tab-btn" style="width: 100%; padding: 12px 15px; text-align: left; background: transparent; color: #ecf0f1; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                            📦 Categorías (ABM)
                        </button>
                        <button id="tab-orders" class="nav-tab-btn" style="width: 100%; padding: 12px 15px; text-align: left; background: transparent; color: #ecf0f1; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: 0.2s;">
                            📋 Pedidos Recibidos
                        </button>
                    </nav>
                </div>
                
                <!-- Botón de salida en la parte inferior -->
                <button id="admin-logout-btn" style="width: 100%; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                    Cerrar Sesión
                </button>
            </aside>

            <!-- Espacio de Trabajo Principal (Donde se inyectan las pantallas) -->
            <main style="flex: 1; padding: 40px; box-sizing: border-box; overflow-y: auto;">
                <div id="admin-workspace-content" style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-height: 80vh;">
                    <!-- El contenido del CRUD seleccionado se inyectará acá -->
                </div>
            </main>
        </div>
    `;

    // 2. Selección de los elementos de control del DOM
    const workspace = document.getElementById('admin-workspace-content') as HTMLDivElement;
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');

    // 3. Vinculación del evento de salida del ecosistema
    logoutBtn?.addEventListener('click', onLogout);

    // 4. Función interna para normalizar el estilo de los botones inactivos
    const resetTabStyles = () => {
        tabButtons.forEach(btn => {
            (btn as HTMLButtonElement).style.background = 'transparent';
            (btn as HTMLButtonElement).style.color = '#ecf0f1';
        });
    };

    // 5. Orquestador de vistas dinámicas dentro del workspace
    const switchTab = (tabId: string) => {
        resetTabStyles();
        const activeBtn = document.getElementById(tabId) as HTMLButtonElement;

        if (activeBtn) {
            activeBtn.style.background = '#ff9800';
            activeBtn.style.color = 'white';
        }

        workspace.innerHTML = '';

        switch (tabId) {
            case 'tab-dashboard':
                renderDashboardMetrics(workspace);
                break;
            case 'tab-products':
                renderAdminProducts(workspace);
                break;
            case 'tab-categories':
                renderAdminCategories(workspace);
                break;
            case 'tab-orders':
                renderAdminOrders(workspace); // Esto es lo que invoca al módulo actualizado
                break;
            default:
                workspace.innerHTML = `<p>Seleccione una opción válida del menú lateral.</p>`;
        }
    };

    // 6. Asignación de manejadores de eventos a la barra lateral
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = (e.currentTarget as HTMLButtonElement).id;
            switchTab(id);
        });
    });

    // 7. Renderizado por defecto al ingresar (Dashboard como primera pantalla visible)
    switchTab('tab-dashboard');
}