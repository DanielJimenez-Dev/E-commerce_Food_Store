export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    mail: string;         // Coincide con tu "mail" del JSON
    celular: string;
    rol: 'ADMIN' | 'USUARIO'; // Restringido estricto
    password: string;     // Coincide con tu "password" del JSON
}