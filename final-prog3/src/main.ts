import { renderLogin } from './pages/auth/login/login.js';
import { renderRegister } from './pages/auth/register/register.js';
import { renderStoreHome } from './pages/store/home/home.js';
import { renderAdminDashboard } from './pages/admin/adminHome/adminHome.js';
import { renderCart } from './pages/store/cart/cart.js';
import { renderProductDetail } from './pages/store/productDetail/productDetail.js'; // Asegurate que esta ruta sea correcta

const appContainer = document.getElementById('app') as HTMLElement;

let currentView: 'LOGIN' | 'REGISTER' = 'LOGIN';
// Expandimos el estado para incluir la vista de detalle
let storeSubView: 'HOME' | 'CART' | 'DETAIL' = 'HOME';
let activeProductId: number | null = null;

function router(): void {
    appContainer.innerHTML = '';
    const sessionRaw = localStorage.getItem('session_user');

    if (!sessionRaw) {
        if (currentView === 'REGISTER') {
            (renderRegister as any)(appContainer, () => {
                currentView = 'LOGIN';
                router();
            });
        } else {
            (renderLogin as any)(appContainer, () => { router(); }, () => {
                currentView = 'REGISTER';
                router();
            });
        }
        return;
    }

    const usuarioLogueado = JSON.parse(sessionRaw);

    const handleLogout = () => {
        localStorage.removeItem('session_user');
        currentView = 'LOGIN';
        storeSubView = 'HOME';
        router();
    };

    if (usuarioLogueado.rol === 'ADMIN') {
        renderAdminDashboard(appContainer, handleLogout);
    } else {
        // Lógica de navegación del cliente
        if (storeSubView === 'CART') {
            renderCart(appContainer, () => {
                storeSubView = 'HOME';
                router();
            });
        } else if (storeSubView === 'DETAIL' && activeProductId !== null) {
            renderProductDetail(appContainer, activeProductId, () => {
                storeSubView = 'HOME';
                router();
            });
        } else {
            renderStoreHome(
                appContainer,
                handleLogout,
                () => { // onViewCart
                    storeSubView = 'CART';
                    router();
                },
                (id: number) => { // onViewDetail
                    activeProductId = id;
                    storeSubView = 'DETAIL';
                    router();
                }
            );
        }
    }
}

window.addEventListener('DOMContentLoaded', router);