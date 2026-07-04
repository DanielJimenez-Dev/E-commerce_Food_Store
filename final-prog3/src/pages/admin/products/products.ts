import { ApiService } from '../../../utils/api.service.js';
import type { Producto, Categoria } from '../../../types/index.js';

export async function renderAdminProducts(container: HTMLElement): Promise<void> {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
            <div>
                <h3 style="margin: 0; color: #2c3e50; font-size: 1.8em;">🍔 ABM de Productos</h3>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">Gestión del menú, precios, stock y vinculación con categorías en memoria.</p>
            </div>
            <button id="btn-new-product" style="padding: 10px 20px; background-color: #2ecc71; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                + Nuevo Producto
            </button>
        </div>

        <div id="products-table-container"></div>

        <div id="product-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; font-family: Arial, sans-serif;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 500px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
                <h4 id="product-modal-title" style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.4em;">Nuevo Producto</h4>
                <form id="product-form">
                    <input type="hidden" id="product-id">
                    
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">Nombre *</label>
                        <input type="text" id="product-name" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">Categoría *</label>
                        <select id="product-category" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">Descripción *</label>
                        <textarea id="product-description" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; height: 60px; resize: none;"></textarea>
                    </div>

                    <div style="display: flex; gap: 15px; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">Precio ($) *</label>
                            <input type="number" id="product-price" step="0.01" min="0" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">Stock Inicial *</label>
                            <input type="number" id="product-stock" min="0" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #34495e;">URL Imagen *</label>
                        <input type="text" id="product-image" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                    </div>

                    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="product-available" checked style="width: 18px; height: 18px; cursor: pointer;">
                        <label for="product-available" style="font-weight: bold; color: #34495e; cursor: pointer;">Disponible para la venta</label>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" id="btn-close-product-modal" style="padding: 8px 15px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 8px 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('products-table-container') as HTMLDivElement;
    const modal = document.getElementById('product-modal') as HTMLDivElement;
    const form = document.getElementById('product-form') as HTMLFormElement;
    const selectCategory = document.getElementById('product-category') as HTMLSelectElement;
    const btnNew = document.getElementById('btn-new-product');
    const btnClose = document.getElementById('btn-close-product-modal');

    const populateCategoryDropdown = (categorias: Categoria[]) => {
        const activas = categorias.filter((c: any) => c.eliminado !== true);
        selectCategory.innerHTML = activas.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    };

    const refreshTable = async () => {
        try {
            const memoryProducts = localStorage.getItem('db_productos');
            const productos: Producto[] = memoryProducts ? JSON.parse(memoryProducts) : await ApiService.getProductos();
            const categories = await ApiService.getCategorias();

            if (!memoryProducts) {
                localStorage.setItem('db_productos', JSON.stringify(productos));
            }

            // CORRECCIÓN: Volvemos a declarar la variable 'activos' que faltaba
            const activos = productos.filter((p: any) => p.eliminado !== true);

            if (activos.length === 0) {
                tableContainer.innerHTML = `<p style="color: #7f8c8d; padding: 20px;">No hay productos registrados en el menú.</p>`;
                return;
            }

            let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left; color: #495057;">
                            <th style="padding: 12px;">ID</th>
                            <th style="padding: 12px;">Imagen</th>
                            <th style="padding: 12px;">Nombre / Detalles</th>
                            <th style="padding: 12px;">Categoría</th>
                            <th style="padding: 12px;">Precio</th>
                            <th style="padding: 12px;">Stock</th>
                            <th style="padding: 12px; text-align: center;">Estado</th>
                            <th style="padding: 12px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            activos.forEach((prod: any) => {
                const nombreCategoria = prod.categoria?.nombre || `ID: ${prod.categoria?.id || 'Sin Cat'}`;
                const badgeStyle = prod.disponible
                    ? 'background: #e8f8f5; color: #2ecc71; border: 1px solid #2ecc71;'
                    : 'background: #fdf2e9; color: #e67e22; border: 1px solid #e67e22;';

                html += `
                    <tr style="border-bottom: 1px solid #dee2e6; color: #212529;">
                        <td style="padding: 12px; font-weight: bold;">${prod.id}</td>
                        <td style="padding: 12px;"><img src="${prod.imagen}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                        <td style="padding: 12px;">
                            <div style="font-weight: bold;">${prod.nombre}</div>
                            <div style="font-size: 0.85em; color: #7f8c8d; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.descripcion}</div>
                        </td>
                        <td style="padding: 12px;"><span style="background: #f1f2f6; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">${nombreCategoria}</span></td>
                        <td style="padding: 12px; font-weight: bold; color: #2c3e50;">$${prod.precio.toFixed(2)}</td>
                        <td style="padding: 12px; font-weight: bold;">${prod.stock} u.</td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="padding: 3px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; ${badgeStyle}">
                                ${prod.disponible ? 'Disponible' : 'Pausado'}
                            </span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <button class="btn-edit-prod" data-id="${prod.id}" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">Editar</button>
                            <button class="btn-delete-prod" data-id="${prod.id}" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Eliminar</button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            tableContainer.innerHTML = html;

            document.querySelectorAll('.btn-edit-prod').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                    // Pasamos la lista completa de productos para la edición segura
                    openModalForEdit(id, productos, categories);
                });
            });

            document.querySelectorAll('.btn-delete-prod').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                    handleDelete(id, productos);
                });
            });

        } catch (err) {
            tableContainer.innerHTML = `<p style="color: #e74c3c;">Error al renderizar los productos de la tienda.</p>`;
        }
    };

    btnNew?.addEventListener('click', async () => {
        const categorias = await ApiService.getCategorias();
        populateCategoryDropdown(categorias);

        form.reset();
        (document.getElementById('product-id') as HTMLInputElement).value = '';
        (document.getElementById('product-available') as HTMLInputElement).checked = true;
        (document.getElementById('product-modal-title') as HTMLHeadingElement).innerText = '🍔 Nuevo Producto';
        modal.style.display = 'flex';
    });

    const openModalForEdit = (id: number, listaProds: Producto[], listaCats: Categoria[]) => {
        const prod = listaProds.find(p => p.id === id) as any;
        if (!prod) return;

        populateCategoryDropdown(listaCats);

        (document.getElementById('product-id') as HTMLInputElement).value = prod.id.toString();
        (document.getElementById('product-name') as HTMLInputElement).value = prod.nombre;
        (document.getElementById('product-category') as HTMLSelectElement).value = (prod.categoria?.id || '').toString();
        (document.getElementById('product-description') as HTMLTextAreaElement).value = prod.descripcion;
        (document.getElementById('product-price') as HTMLInputElement).value = prod.precio.toString();
        (document.getElementById('product-stock') as HTMLInputElement).value = prod.stock.toString();
        (document.getElementById('product-image') as HTMLInputElement).value = prod.imagen;
        (document.getElementById('product-available') as HTMLInputElement).checked = prod.disponible;

        (document.getElementById('product-modal-title') as HTMLHeadingElement).innerText = '✏️ Editar Producto';
        modal.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idStr = (document.getElementById('product-id') as HTMLInputElement).value;
        const nombre = (document.getElementById('product-name') as HTMLInputElement).value.trim();
        const selectedCatId = parseInt((document.getElementById('product-category') as HTMLSelectElement).value);
        const descripcion = (document.getElementById('product-description') as HTMLTextAreaElement).value.trim();
        const precio = parseFloat((document.getElementById('product-price') as HTMLInputElement).value);
        const stock = parseInt((document.getElementById('product-stock') as HTMLInputElement).value);
        const imagen = (document.getElementById('product-image') as HTMLInputElement).value.trim();
        const disponible = (document.getElementById('product-available') as HTMLInputElement).checked;

        const memoryProducts = localStorage.getItem('db_productos');
        let listaCompleta: Producto[] = memoryProducts ? JSON.parse(memoryProducts) : await ApiService.getProductos();
        const categorias = await ApiService.getCategorias();

        const catObj = categorias.find(c => c.id === selectedCatId) || { id: selectedCatId, nombre: 'Categoría', descripcion: '' };

        if (idStr) {
            const targetId = parseInt(idStr);
            const index = listaCompleta.findIndex(p => p.id === targetId);
            if (index !== -1) {
                listaCompleta[index] = {
                    ...listaCompleta[index],
                    nombre, descripcion, precio, stock, imagen, disponible,
                    categoria: catObj
                } as any;
            }
        } else {
            const nextId = listaCompleta.length > 0 ? Math.max(...listaCompleta.map(p => p.id)) + 1 : 1;
            const nuevoProd: any = {
                id: nextId, nombre, descripcion, precio, imagen, stock, disponible, eliminado: false,
                categoria: catObj
            };
            listaCompleta.push(nuevoProd);
        }

        localStorage.setItem('db_productos', JSON.stringify(listaCompleta));

        modal.style.display = 'none';
        refreshTable();
    });

    const handleDelete = async (id: number, lista: Producto[]) => {
        if (confirm('¿Está seguro de que desea eliminar este producto del catálogo?')) {
            const memoryProducts = localStorage.getItem('db_productos');
            let listaCompleta: Producto[] = memoryProducts ? JSON.parse(memoryProducts) : lista;

            const index = listaCompleta.findIndex(p => p.id === id);
            if (index !== -1) {
                (listaCompleta[index] as any).eliminado = true;
                localStorage.setItem('db_productos', JSON.stringify(listaCompleta));
                refreshTable();
            }
        }
    };

    btnClose?.addEventListener('click', () => modal.style.display = 'none');
    refreshTable();
}