import { ApiService } from '../../../utils/api.service.js';
import type { Categoria } from '../../../types/index.js';

export async function renderAdminCategories(container: HTMLElement): Promise<void> {
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
            <div>
                <h3 style="margin: 0; color: #2c3e50; font-size: 1.8em;">📦 ABM de Categorías</h3>
                <p style="margin: 5px 0 0 0; color: #7f8c8d;">Panel de control para altas, bajas y modificaciones en memoria.</p>
            </div>
            <button id="btn-new-category" style="padding: 10px 20px; background-color: #2ecc71; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                + Nueva Categoría
            </button>
        </div>

        <div id="categories-table-container"></div>

        <div id="category-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; font-family: Arial, sans-serif;">
            <div style="background: white; padding: 30px; border-radius: 8px; width: 450px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <h4 id="modal-title" style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.4em;">Nueva Categoría</h4>
                <form id="category-form">
                    <input type="hidden" id="category-id">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Nombre *</label>
                        <input type="text" id="category-name" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #34495e;">Descripción *</label>
                        <textarea id="category-description" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; height: 80px; resize: none;"></textarea>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" id="btn-close-modal" style="padding: 8px 15px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 8px 15px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('categories-table-container') as HTMLDivElement;
    const modal = document.getElementById('category-modal') as HTMLDivElement;
    const form = document.getElementById('category-form') as HTMLFormElement;
    const btnNew = document.getElementById('btn-new-category');
    const btnClose = document.getElementById('btn-close-modal');

    const refreshTable = async () => {
        try {
            // Se utiliza localStorage para mantener la persistencia entre módulos
            const memoryCats = localStorage.getItem('db_categorias');
            const lista: Categoria[] = memoryCats ? JSON.parse(memoryCats) : await ApiService.getCategorias();

            if (!memoryCats) {
                localStorage.setItem('db_categorias', JSON.stringify(lista));
            }

            const activas = lista.filter((c: any) => c.eliminado !== true);

            if (activas.length === 0) {
                tableContainer.innerHTML = `<p style="color: #7f8c8d; padding: 20px;">No hay categorías registradas.</p>`;
                return;
            }

            let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left; color: #495057;">
                            <th style="padding: 12px;">ID</th>
                            <th style="padding: 12px;">Nombre</th>
                            <th style="padding: 12px;">Descripción</th>
                            <th style="padding: 12px; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            activas.forEach(cat => {
                html += `
                    <tr style="border-bottom: 1px solid #dee2e6; color: #212529;">
                        <td style="padding: 12px; font-weight: bold;">${cat.id}</td>
                        <td style="padding: 12px; font-weight: bold;">${cat.nombre}</td>
                        <td style="padding: 12px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cat.descripcion}</td>
                        <td style="padding: 12px; text-align: center;">
                            <button class="btn-edit" data-id="${cat.id}" style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; font-weight: bold;">Editar</button>
                            <button class="btn-delete" data-id="${cat.id}" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Eliminar</button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            tableContainer.innerHTML = html;

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                    openModalForEdit(id, lista);
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt((e.currentTarget as HTMLButtonElement).getAttribute('data-id')!);
                    handleDelete(id, lista);
                });
            });

        } catch (err) {
            tableContainer.innerHTML = `<p style="color: #e74c3c;">Error al renderizar categorías.</p>`;
        }
    };

    btnNew?.addEventListener('click', () => {
        form.reset();
        (document.getElementById('category-id') as HTMLInputElement).value = '';
        (document.getElementById('modal-title') as HTMLHeadingElement).innerText = '📦 Nueva Categoría';
        modal.style.display = 'flex';
    });

    const openModalForEdit = (id: number, lista: Categoria[]) => {
        const cat = lista.find(c => c.id === id);
        if (!cat) return;

        (document.getElementById('category-id') as HTMLInputElement).value = cat.id.toString();
        (document.getElementById('category-name') as HTMLInputElement).value = cat.nombre;
        (document.getElementById('category-description') as HTMLTextAreaElement).value = cat.descripcion;

        (document.getElementById('modal-title') as HTMLHeadingElement).innerText = '✏️ Editar Categoría';
        modal.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idStr = (document.getElementById('category-id') as HTMLInputElement).value;
        const nombre = (document.getElementById('category-name') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('category-description') as HTMLTextAreaElement).value.trim();

        if (!nombre || !descripcion) return;

        const memoryCats = localStorage.getItem('db_categorias');
        let listaCompleta: Categoria[] = memoryCats ? JSON.parse(memoryCats) : await ApiService.getCategorias();

        if (idStr) {
            const targetId = parseInt(idStr);
            const index = listaCompleta.findIndex(c => c.id === targetId);
            if (index !== -1) {
                listaCompleta[index] = { ...listaCompleta[index], nombre, descripcion } as any;
            }
        } else {
            const nextId = listaCompleta.length > 0 ? Math.max(...listaCompleta.map(c => c.id)) + 1 : 1;
            const nuevaCat: any = { id: nextId, nombre, descripcion, eliminado: false };
            listaCompleta.push(nuevaCat);
        }

        // Se actualiza localStorage
        localStorage.setItem('db_categorias', JSON.stringify(listaCompleta));
        modal.style.display = 'none';
        refreshTable();
    });

    const handleDelete = (id: number, lista: Categoria[]) => {
        if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
            const index = lista.findIndex(c => c.id === id);
            if (index !== -1) {
                (lista[index] as any).eliminado = true;
                // Se guarda el estado de borrado lógico en localStorage
                localStorage.setItem('db_categorias', JSON.stringify(lista));
                refreshTable();
            }
        }
    };

    btnClose?.addEventListener('click', () => modal.style.display = 'none');
    refreshTable();
}