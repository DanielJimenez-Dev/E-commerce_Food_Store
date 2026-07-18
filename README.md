# 🍔 E-commerce Food Store

Trabajo Práctico Integrador — Materia Programación III, Tecnicatura en Programación (UTN).

Este repositorio contiene **dos entregables independientes** de la misma consigna académica: un cliente web (frontend) y un sistema de gestión de datos (backend). Actualmente **no están conectados entre sí** (el frontend no consume el backend por API) — cada uno se ejecuta y se evalúa por separado.

## 🖥️ Parte 1 — Frontend (Cliente Web)

Demo de interfaz de e-commerce: catálogo de productos, carrito de compras y flujo de login/registro simulado.

- **Stack:** TypeScript, Vite.
- **Persistencia de sesión:** `localStorage` (simulada, sin backend real detrás).
- **Carpeta:** `/final-prog3`
- **Demo en vivo:** https://e-commerce-food-store-zeta.vercel.app/

## 🗄️ Parte 2 — Backend (Gestión de Datos)

Aplicación de consola en Java para la gestión completa de un sistema de food store: categorías, productos, usuarios y pedidos, con reportes de facturación.

- **Stack:** Java, JPA (Jakarta Persistence), base de datos relacional.
- **Interfaz:** menú interactivo por consola (no expone endpoints REST).
- **Carpeta:** `/plantilla-foodstore-jpa`
- **Funcionalidades:** ABM de categorías y productos, gestión de usuarios y pedidos, reportes (productos por categoría, pedidos por usuario/estado, total facturado).

## 🚧 Próximos pasos

- Exponer el backend como una API REST (Spring Boot) para poder integrarlo con el frontend y tener un flujo end-to-end real.

---
*Desarrollado por Daniel Alberto Jimenez Valderrama*

