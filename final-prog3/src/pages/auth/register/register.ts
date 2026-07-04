import { ApiService } from '../../../utils/api.service.js';
import type { Usuario } from '../../../types/index.js';

export function renderRegister(container: HTMLElement, onRegisterSuccess: () => void, onGoToLogin: () => void): void {
    container.innerHTML = `
        <div class="register-container" style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: #fff;">
            <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Crear Cuenta</h2>
            <form id="register-form">
                <div style="margin-bottom: 12px;">
                    <label for="reg-nombre" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Nombre:</label>
                    <input type="text" id="reg-nombre" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label for="reg-apellido" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Apellido:</label>
                    <input type="text" id="reg-apellido" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label for="reg-mail" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Correo Electrónico:</label>
                    <input type="email" id="reg-mail" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 12px;">
                    <label for="reg-celular" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Celular:</label>
                    <input type="tel" id="reg-celular" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="reg-password" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Contraseña:</label>
                    <input type="password" id="reg-password" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background-color: #4caf50; color: white; border: none; border-radius: 4px; font-size: 1em; font-weight: bold; cursor: pointer;">Registrarse</button>
                <p id="reg-error-message" style="display: none; color: red; margin-top: 15px; text-align: center; font-size: 0.9em;"></p>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                <p style="text-align: center; font-size: 0.9em; color: #666;">
                    ¿Ya tenés cuenta? <a id="link-to-login" href="#" style="color: #ff9800; text-decoration: none; font-weight: bold;">Iniciá sesión acá</a>
                </p>
            </form>
        </div>
    `;

    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    const errorMsg = document.getElementById('reg-error-message') as HTMLParagraphElement;
    const linkToLogin = document.getElementById('link-to-login') as HTMLAnchorElement;

    // Enlace para volver al login de forma manual
    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        onGoToLogin();
    });

    registerForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const nombre = (document.getElementById('reg-nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('reg-apellido') as HTMLInputElement).value.trim();
        const mail = (document.getElementById('reg-mail') as HTMLInputElement).value.trim();
        const celular = (document.getElementById('reg-celular') as HTMLInputElement).value.trim();
        const password = (document.getElementById('reg-password') as HTMLInputElement).value;

        try {
            // 1. Traemos los usuarios base del JSON
            const usuariosBase: Usuario[] = await ApiService.getUsuarios();

            // 2. Traemos los usuarios que ya se hayan guardado previamente en LocalStorage
            const usuariosLocalesRaw = localStorage.getItem('local_users');
            const usuariosLocales: Usuario[] = usuariosLocalesRaw ? JSON.parse(usuariosLocalesRaw) : [];

            // 3. Cruzamos ambas listas para verificar que el email no esté tomado
            const existeEnBase = usuariosBase.some(u => u.mail === mail);
            const existeEnLocal = usuariosLocales.some(u => u.mail === mail);

            if (existeEnBase || existeEnLocal) {
                errorMsg.textContent = 'El correo electrónico ya se encuentra registrado.';
                errorMsg.style.display = 'block';
                return;
            }

            // 4. Generamos un ID autoincremental sumando ambas listas para evitar colisiones
            const nuevoId = usuariosBase.length + usuariosLocales.length + 1;

            // 5. Creamos el nuevo usuario respetando estrictamente tu interfaz
            const nuevoUsuario: Usuario = {
                id: nuevoId,
                nombre,
                apellido,
                mail,
                celular,
                rol: 'USUARIO', // Forzado estricto por normativa de registro de clientes
                password
            };

            // 6. Guardamos en el array simulado del LocalStorage
            usuariosLocales.push(nuevoUsuario);
            localStorage.setItem('local_users', JSON.stringify(usuariosLocales));

            errorMsg.style.display = 'none';
            alert('¡Registro completado con éxito! Ahora podés iniciar sesión.');

            // Ejecutamos el callback para decirle al main que nos mande al login
            onRegisterSuccess();

        } catch (error) {
            errorMsg.textContent = 'Error al procesar el registro.';
            errorMsg.style.display = 'block';
            console.error(error);
        }
    });
}