import { ApiService } from '../../../utils/api.service.js';

export async function renderAdminOrders(container: HTMLElement): Promise<void> {
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #2c3e50; font-size: 1.8em;">📋 Gestión de Pedidos</h3>
            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Control de estados de preparación, despacho y facturación de la tienda.</p>
        </div>
        <div id="orders-table-container"></div>
    `;

    const tableContainer = document.getElementById('orders-table-container') as HTMLDivElement;

    const refreshTable = async () => {
        try {
            // Priorizamos localStorage para persistencia de estados
            const memoryOrders = localStorage.getItem('db_pedidos');
            const pedidos: any[] = memoryOrders ? JSON.parse(memoryOrders) : await ApiService.getPedidos();

            // Guardamos en memoria si es la primera vez que cargamos
            if (!memoryOrders) {
                localStorage.setItem('db_pedidos', JSON.stringify(pedidos));
            }

            if (pedidos.length === 0) {
                tableContainer.innerHTML = `<p style="color: #7f8c8d; padding: 20px;">No se han registrado pedidos en la plataforma.</p>`;
                return;
            }

            let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left; color: #495057;">
                            <th style="padding: 12px;">ID Pedido</th>
                            <th style="padding: 12px;">Fecha</th>
                            <th style="padding: 12px;">Cliente / Contacto</th>
                            <th style="padding: 12px;">Detalle de Productos</th>
                            <th style="padding: 12px;">Total</th>
                            <th style="padding: 12px; text-align: center;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            pedidos.forEach((pedido: any) => {
                let detallesHtml = '<ul style="margin: 0; padding-left: 20px; font-size: 0.9em; color: #34495e;">';
                const lineas = pedido.detalles || [];
                lineas.forEach((item: any) => {
                    const nombreProd = item.producto?.nombre || 'Producto Desconocido';
                    const precioUnitario = item.producto?.precio || 0;
                    detallesHtml += `<li style="margin-bottom: 4px;"><strong>${item.cantidad}x</strong> ${nombreProd} <span style="color: #7f8c8d;">($${precioUnitario.toFixed(2)} c/u)</span></li>`;
                });
                detallesHtml += '</ul>';

                const usuario = pedido.usuarioDto ? `${pedido.usuarioDto.nombre} ${pedido.usuarioDto.apellido}` : `ID: ${pedido.idUsuario || 'N/A'}`;
                const celular = pedido.usuarioDto?.celular ? `📞 ${pedido.usuarioDto.celular}` : '📍 Envío a domicilio';

                let selectStyle = 'padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; border: 1px solid ';
                if (pedido.estado === 'PENDIENTE') selectStyle += '#e74c3c; color: #e74c3c; background: #fdedec;';
                else if (pedido.estado === 'EN_PREPARACION') selectStyle += '#f39c12; color: #f39c12; background: #fef5e7;';
                else if (pedido.estado === 'ENTREGADO') selectStyle += '#2ecc71; color: #2ecc71; background: #e8f8f5;';
                else selectStyle += '#7f8c8d; color: #34495e; background: #f2f3f4;';

                html += `
                    <tr style="border-bottom: 1px solid #dee2e6; color: #212529; vertical-align: top;">
                        <td style="padding: 12px; font-weight: bold; color: #2c3e50;">#${pedido.id}</td>
                        <td style="padding: 12px; font-size: 0.9em; white-space: nowrap;">${pedido.fecha}</td>
                        <td style="padding: 12px;">
                            <div style="font-weight: bold;">${usuario}</div>
                            <div style="font-size: 0.85em; color: #7f8c8d; margin-top: 4px;">${celular}</div>
                        </td>
                        <td style="padding: 12px;">${detallesHtml}</td>
                        <td style="padding: 12px; font-weight: bold; color: #2c3e50; font-size: 1.1em;">$${(pedido.total || 0).toFixed(2)}</td>
                        <td style="padding: 12px; text-align: center;">
                            <select class="select-order-status" data-id="${pedido.id}" style="${selectStyle}">
                                <option value="PENDIENTE" ${pedido.estado === 'PENDIENTE' ? 'selected' : ''}>⏳ Pendiente</option>
                                <option value="EN_PREPARACION" ${pedido.estado === 'EN_PREPARACION' ? 'selected' : ''}>👨‍🍳 En Preparación</option>
                                <option value="ENTREGADO" ${pedido.estado === 'ENTREGADO' ? 'selected' : ''}>✅ Entregado</option>
                                <option value="CANCELADO" ${pedido.estado === 'CANCELADO' ? 'selected' : ''}>❌ Cancelado</option>
                            </select>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            tableContainer.innerHTML = html;

            document.querySelectorAll('.select-order-status').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const targetSelect = e.currentTarget as HTMLSelectElement;
                    const idPedido = parseInt(targetSelect.getAttribute('data-id')!);
                    const nuevoEstado = targetSelect.value;

                    const listaPedidos = JSON.parse(localStorage.getItem('db_pedidos') || '[]');
                    const index = listaPedidos.findIndex((p: any) => p.id === idPedido);

                    if (index !== -1) {
                        listaPedidos[index].estado = nuevoEstado;
                        localStorage.setItem('db_pedidos', JSON.stringify(listaPedidos));
                        refreshTable();
                    }
                });
            });

        } catch (err) {
            tableContainer.innerHTML = `<p style="color: #e74c3c;">Error al procesar la lista de pedidos.</p>`;
            console.error(err);
        }
    };

    refreshTable();
}