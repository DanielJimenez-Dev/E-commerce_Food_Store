import { ApiService } from '../../../utils/api.service.js';
import type { Usuario } from '../../../types/index.js';

// Agregamos el callback onNavigateToRegister a la firma de la función
export function renderLogin(
    container: HTMLElement,
    onLoginSuccess: (rol: any) => void,
    onNavigateToRegister: () => void
): void {
    // Inyectamos la estructura agregando el link de registro al final
    container.innerHTML = `
        <div class="login-container" style="font-family: Arial, sans-serif; max-width: 400px; margin: 80px auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: #fff;">
            <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Iniciar Sesión</h2>
            <form id="login-form">
                <div style="margin-bottom: 15px;">
                    <label for="mail" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Correo Electrónico:</label>
                    <input type="email" id="mail" required autocomplete="username" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label for="password" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Contraseña:</label>
                    <input type="password" id="password" required autocomplete="current-password" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background-color: #ff9800; color: white; border: none; border-radius: 4px; font-size: 1em; font-weight: bold; cursor: pointer;">Ingresar</button>
                <p id="error-message" style="display: none; color: red; margin-top: 15px; text-align: center; font-size: 0.9em;"></p>
                
                <!-- LINK DE REGISTRO AGREGADO -->
                <div style="margin-top: 20px; text-align: center; font-size: 0.9em;">
                    <span style="color: #666;">¿No tienes cuenta?</span> 
                    <a href="#" id="go-to-register" style="color: #ff9800; text-decoration: none; font-weight: bold; margin-left: 5px;">Regístrate aquí</a>
                </div>
            </form>
        </div>
    `;

    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const mailInput = document.getElementById('mail') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;

    // Capturamos el link de registro y le asignamos el evento de navegación
    const registerLink = document.getElementById('go-to-register');
    registerLink?.addEventListener('click', (e) => {
        e.preventDefault();
        onNavigateToRegister(); // Ejecuta el cambio de pantalla
    });

    loginForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        const mail = mailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        try {
            const usuariosBase: Usuario[] = await ApiService.getUsuarios();
            const usuariosLocalesRaw = localStorage.getItem('local_users');
            const usuariosLocales: Usuario[] = usuariosLocalesRaw ? JSON.parse(usuariosLocalesRaw) : [];
            const todosLosUsuarios = [...usuariosBase, ...usuariosLocales];

            const usuarioValido = todosLosUsuarios.find(u =>
                u.mail.trim().toLowerCase() === mail && u.password === password
            );

            if (usuarioValido) {
                errorMessage.style.display = 'none';
                const rolNormalizado = usuarioValido.rol.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USUARIO';

                const sessionData = {
                    id: usuarioValido.id,
                    nombre: usuarioValido.nombre,
                    apellido: usuarioValido.apellido,
                    mail: usuarioValido.mail,
                    rol: rolNormalizado
                };
                localStorage.setItem('session_user', JSON.stringify(sessionData));
                onLoginSuccess(rolNormalizado);
            } else {
                errorMessage.textContent = 'Correo o contraseña incorrectos.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = 'Error al conectar con el servidor.';
            errorMessage.style.display = 'block';
            console.error(error);
        }
    });
}