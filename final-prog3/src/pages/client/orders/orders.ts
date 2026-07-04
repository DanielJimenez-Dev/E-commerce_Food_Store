export function renderClientOrders(container: HTMLElement): void {
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">📋 Mis Pedidos</h2>
            <p style="color: #666; margin-top: 15px;">Aquí podrás hacer el seguimiento de tus platos y ver el historial de tus compras.</p>
            <div id="client-orders-list" style="margin-top: 20px;">
                <!-- Los pedidos del usuario se listarán dinámicamente aquí -->
                <p style="color: #999; italic;">No tienes pedidos registrados en este momento.</p>
            </div>
        </div>
    `;
}