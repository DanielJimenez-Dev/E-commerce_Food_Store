package com.tp.jpa;

import com.tp.jpa.model.enums.EstadoPedido;
import com.tp.jpa.model.*;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Scanner;

/**
 * Clase principal: menú de consola del sistema Food Store.
 * Orden de uso natural: Categorías -> Productos -> Usuarios -> Pedidos.
 */
public class Main {

    private static final Scanner sc = new Scanner(System.in);

    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        boolean salir = false;
        while (!salir) {
            System.out.println();
            System.out.println("===== FOOD STORE - MENÚ PRINCIPAL =====");
            System.out.println("1. Gestionar Categorías");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();
            switch (op) {
                case "1": menuCategorias(); break;
                case "2": menuProductos(); break;
                case "3": menuUsuarios(); break;
                case "4": menuPedidos(); break;
                case "5": menuReportes(); break;
                case "0": salir = true; break;
                default: System.out.println("Opción inválida.");
            }
        }
        JPAUtil.close();
        System.out.println("Aplicación finalizada.");
    }

    // ── Submenús ─────────────────────────────────────────────────

    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE CATEGORÍAS ---");
            System.out.println("1. Alta de Categoría");
            System.out.println("2. Modificar Categoría");
            System.out.println("3. Baja Lógica");
            System.out.println("4. Listado de Activas");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();

            switch (op) {
                case "1":
                    System.out.print("Nombre de la categoría: ");
                    String nombreAlta = sc.nextLine().trim();
                    System.out.print("Descripción: ");
                    String descAlta = sc.nextLine().trim();

                    Categoria nuevaCat = Categoria.builder()
                            .nombre(nombreAlta)
                            .descripcion(descAlta)
                            .build();
                    categoriaRepo.guardar(nuevaCat);
                    System.out.println("¡Categoría guardada con éxito!");
                    break;

                case "2":
                    System.out.print("Ingrese el ID de la categoría a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Categoria> catOpt = categoriaRepo.buscarPorId(idMod);
                        if (catOpt.isPresent()) {
                            Categoria cat = catOpt.get();
                            System.out.print("Nuevo nombre (actual: " + cat.getNombre() + "): ");
                            String nuevoNombre = sc.nextLine().trim();
                            System.out.print("Nueva descripción (actual: " + cat.getDescripcion() + "): ");
                            String nuevaDesc = sc.nextLine().trim();

                            if (!nuevoNombre.isEmpty()) cat.setNombre(nuevoNombre);
                            if (!nuevaDesc.isEmpty()) cat.setDescripcion(nuevaDesc);

                            categoriaRepo.guardar(cat);
                            System.out.println("¡Categoría modificada con éxito!");
                        } else {
                            System.out.println("No se encontró ninguna categoría con ese ID.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "3":
                    System.out.print("Ingrese el ID de la categoría a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        boolean exito = categoriaRepo.eliminarLogico(idBaja);
                        if (exito) {
                            System.out.println("Categoría dada de baja lógicamente.");
                        } else {
                            System.out.println("No se encontró la categoría o ya estaba dada de baja.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "4":
                    List<Categoria> activas = categoriaRepo.listarActivos();
                    if (activas.isEmpty()) {
                        System.out.println("No hay categorías activas registradas.");
                    } else {
                        System.out.println("\n=== LISTADO DE CATEGORÍAS ACTIVAS ===");
                        for (Categoria c : activas) {
                            System.out.println("ID: " + c.getId() + " | Nombre: " + c.getNombre() + " | Descripción: " + c.getDescripcion());
                        }
                    }
                    break;

                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE PRODUCTOS ---");
            System.out.println("1. Alta de Producto");
            System.out.println("2. Modificar Producto");
            System.out.println("3. Baja Lógica");
            System.out.println("4. Listado de Activos");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();

            switch (op) {
                case "1":
                    // Listamos las categorías primero para que el usuario elija una válida
                    List<Categoria> categoriasDispo = categoriaRepo.listarActivos();
                    if (categoriasDispo.isEmpty()) {
                        System.out.println("No se pueden crear productos porque no hay categorías activas. Cree una primero.");
                        break;
                    }

                    System.out.println("\n--- Categorías Disponibles ---");
                    for (Categoria c : categoriasDispo) {
                        System.out.println("ID: " + c.getId() + " - " + c.getNombre());
                    }
                    System.out.print("Seleccione el ID de la categoría para el producto: ");
                    try {
                        Long catId = Long.parseLong(sc.nextLine().trim());
                        Optional<Categoria> catOpt = categoriaRepo.buscarPorId(catId);

                        if (catOpt.isEmpty()) {
                            System.out.println("Categoría no encontrada.");
                            break;
                        }
                        Categoria categoriaSeleccionada = catOpt.get();

                        System.out.print("Nombre del producto: ");
                        String nombre = sc.nextLine().trim();
                        System.out.print("Precio: ");
                        Double precio = Double.parseDouble(sc.nextLine().trim());
                        System.out.print("Descripción: ");
                        String desc = sc.nextLine().trim();
                        System.out.print("Stock Inicial: ");
                        Integer stock = Integer.parseInt(sc.nextLine().trim());
                        System.out.print("URL de la Imagen (opcional): ");
                        String imagen = sc.nextLine().trim();

                        Producto nuevoProducto = Producto.builder()
                                .nombre(nombre)
                                .precio(precio)
                                .descripcion(desc)
                                .stock(stock)
                                .imagen(imagen.isEmpty() ? null : imagen)
                                .categoria(categoriaSeleccionada) // Vínculo relacional
                                .build();

                        // Guardamos mediante el repositorio
                        productoRepo.guardar(nuevoProducto);
                        System.out.println("¡Producto guardado con éxito!");

                    } catch (NumberFormatException e) {
                        System.out.println("Error: El precio, stock o ID deben ser valores numéricos válidos.");
                    }
                    break;

                case "2":
                    System.out.print("Ingrese el ID del producto a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Producto> prodOpt = productoRepo.buscarPorId(idMod);

                        if (prodOpt.isPresent()) {
                            Producto prod = prodOpt.get();
                            System.out.print("Nuevo nombre (actual: " + prod.getNombre() + "): ");
                            String nuevoNombre = sc.nextLine().trim();
                            System.out.print("Nuevo precio (actual: " + prod.getPrecio() + "): ");
                            String nuevoPrecioStr = sc.nextLine().trim();
                            System.out.print("Nueva descripción (actual: " + prod.getDescripcion() + "): ");
                            String nuevaDesc = sc.nextLine().trim();
                            System.out.print("Nuevo stock (actual: " + prod.getStock() + "): ");
                            String nuevoStockStr = sc.nextLine().trim();

                            if (!nuevoNombre.isEmpty()) prod.setNombre(nuevoNombre);
                            if (!nuevoPrecioStr.isEmpty()) prod.setPrecio(Double.parseDouble(nuevoPrecioStr));
                            if (!nuevaDesc.isEmpty()) prod.setDescripcion(nuevaDesc);
                            if (!nuevoStockStr.isEmpty()) prod.setStock(Integer.parseInt(nuevoStockStr));

                            productoRepo.guardar(prod);
                            System.out.println("¡Producto modificado con éxito!");
                        } else {
                            System.out.println("No se encontró ningún producto con ese ID.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("Error en el formato de los números ingresados.");
                    }
                    break;

                case "3":
                    System.out.print("Ingrese el ID del producto a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        boolean exito = productoRepo.eliminarLogico(idBaja);
                        if (exito) {
                            System.out.println("Producto dado de baja lógicamente.");
                        } else {
                            System.out.println("No se encontró el producto o ya estaba de baja.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "4":
                    try {
                        List<Producto> activos = productoRepo.listarActivos();
                        if (activos.isEmpty()) {
                            System.out.println("No hay productos activos registrados.");
                        } else {
                            System.out.println("\n=== LISTADO DE PRODUCTOS ACTIVOS ===");
                            for (Producto p : activos) {
                                // Imprimimos cosas básicas primero para ver si el fallo es la relación
                                System.out.print("ID: " + p.getId() + " | Nombre: " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock());

                                // Probamos la categoría con cuidado
                                if (p.getCategoria() != null) {
                                    System.out.println(" | Categoría: " + p.getCategoria().getNombre());
                                } else {
                                    System.out.println(" | Categoría: Sin Categoría");
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("\n[ERROR CRÍTICO AL LISTAR]:");
                        e.printStackTrace(); // Esto nos va a mostrar el árbol del error en la consola
                    }
                    break;

                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE USUARIOS ---");
            System.out.println("1. Alta de Usuario");
            System.out.println("2. Modificar Usuario");
            System.out.println("3. Baja Lógica");
            System.out.println("4. Listado de Activos");
            System.out.println("5. Buscar por Email");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();

            switch (op) {
                case "1":
                    System.out.print("Nombre: ");
                    String nombre = sc.nextLine().trim();
                    System.out.print("Apellido: ");
                    String apellido = sc.nextLine().trim();
                    System.out.print("Email (Único): ");
                    String mail = sc.nextLine().trim();
                    System.out.print("Celular: ");
                    String celular = sc.nextLine().trim();
                    System.out.print("Contraseña: ");
                    String pass = sc.nextLine().trim();

                    System.out.println("Seleccione el Rol (1. CLIENTE / 2. ADMINISTRADOR): ");
                    String opRol = sc.nextLine().trim();
                    Rol rolAsignado = "2".equals(opRol) ? Rol.ADMIN : Rol.USUARIO;

                    Usuario nuevoUsuario = Usuario.builder()
                            .nombre(nombre)
                            .apellido(apellido)
                            .mail(mail)
                            .celular(celular)
                            .contraseña(pass)
                            .rol(rolAsignado)
                            .build();

                    try {
                        usuarioRepo.guardar(nuevoUsuario);
                        System.out.println("¡Usuario registrado con éxito!");
                    } catch (RuntimeException e) {
                        System.out.println("Error al guardar: Asegúrese de que el email no esté duplicado.");
                    }
                    break;

                case "2":
                    System.out.print("Ingrese el ID del usuario a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Usuario> userOpt = usuarioRepo.buscarPorId(idMod);

                        if (userOpt.isPresent()) {
                            Usuario user = userOpt.get();
                            System.out.print("Nuevo nombre (actual: " + user.getNombre() + "): ");
                            String nuevoNom = sc.nextLine().trim();
                            System.out.print("Nuevo apellido (actual: " + user.getApellido() + "): ");
                            String nuevoApe = sc.nextLine().trim();
                            System.out.print("Nuevo celular (actual: " + user.getCelular() + "): ");
                            String nuevoCel = sc.nextLine().trim();

                            if (!nuevoNom.isEmpty()) user.setNombre(nuevoNom);
                            if (!nuevoApe.isEmpty()) user.setApellido(nuevoApe);
                            if (!nuevoCel.isEmpty()) user.setCelular(nuevoCel);

                            usuarioRepo.guardar(user);
                            System.out.println("¡Usuario modificado con éxito!");
                        } else {
                            System.out.println("No se encontró ningún usuario con ese ID.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "3":
                    System.out.print("Ingrese el ID del usuario a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        boolean exito = usuarioRepo.eliminarLogico(idBaja);
                        if (exito) {
                            System.out.println("Usuario dado de baja lógicamente.");
                        } else {
                            System.out.println("No se encontró el usuario o ya estaba de baja.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "4":
                    List<Usuario> activos = usuarioRepo.listarActivos();
                    if (activos.isEmpty()) {
                        System.out.println("No hay usuarios activos registrados.");
                    } else {
                        System.out.println("\n=== LISTADO DE USUARIOS ACTIVOS ===");
                        for (Usuario u : activos) {
                            System.out.println("ID: " + u.getId() +
                                    " | Nombre: " + u.getApellido() + ", " + u.getNombre() +
                                    " | Email: " + u.getMail() +
                                    " | Rol: " + u.getRol());
                        }
                    }
                    break;

                case "5":
                    System.out.print("Ingrese el email a buscar: ");
                    String mailBuscar = sc.nextLine().trim();
                    Optional<Usuario> encontrado = usuarioRepo.buscarPorMail(mailBuscar);

                    if (encontrado.isPresent()) {
                        Usuario u = encontrado.get();
                        System.out.println("\n--- Usuario Encontrado ---");
                        System.out.println("ID: " + u.getId());
                        System.out.println("Nombre Completo: " + u.getNombre() + " " + u.getApellido());
                        System.out.println("Celular: " + u.getCelular());
                        System.out.println("Rol: " + u.getRol());
                    } else {
                        System.out.println("No se encontró ningún usuario activo registrado con el email: " + mailBuscar);
                    }
                    break;

                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIÓN DE PEDIDOS ---");
            System.out.println("1. Registrar Nuevo Pedido (Alta)");
            System.out.println("2. Cambiar Estado de Pedido");
            System.out.println("3. Baja Lógica de Pedido");
            System.out.println("4. Listar Todos los Pedidos Activos");
            System.out.println("5. Buscar Pedidos por Usuario");
            System.out.println("6. Buscar Pedidos por Estado");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();

            switch (op) {
                case "1":
                    System.out.print("Ingrese el Email del cliente que realiza el pedido: ");
                    String emailCliente = sc.nextLine().trim();
                    Optional<Usuario> userOpt = usuarioRepo.buscarPorMail(emailCliente);

                    if (userOpt.isEmpty()) {
                        System.out.println("Usuario no encontrado. Debe registrarse primero.");
                        break;
                    }
                    Usuario cliente = userOpt.get();

                    System.out.println("Seleccione Forma de Pago (1. EFECTIVO / 2. TARJETA / 3. TRANSFERENCIA): ");
                    String opPago = sc.nextLine().trim();
                    FormaPago formaPago = FormaPago.EFECTIVO;
                    if ("2".equals(opPago)) formaPago = FormaPago.TARJETA;
                    if ("3".equals(opPago)) formaPago = FormaPago.TRANSFERENCIA;

                    // Instanciamos el pedido con el constructor builder
                    Pedido nuevoPedido = Pedido.builder()
                            .formaPago(formaPago)
                            .usuario(cliente) // Relación bidireccional establecida
                            .build();

                    boolean agregandoProductos = true;
                    while (agregandoProductos) {
                        System.out.print("Ingrese el ID del Producto a añadir al carrito: ");
                        try {
                            Long prodId = Long.parseLong(sc.nextLine().trim());
                            Optional<Producto> prodOpt = productoRepo.buscarPorId(prodId);

                            if (prodOpt.isEmpty()) {
                                System.out.println("Producto no encontrado.");
                            } else {
                                Producto producto = prodOpt.get();
                                System.out.print("Cantidad para " + producto.getNombre() + " (Stock actual: " + producto.getStock() + "): ");
                                int cantidad = Integer.parseInt(sc.nextLine().trim());

                                // El método encapsulado valida stock y acumula el total automáticamente
                                nuevoPedido.addDetallePedido(cantidad, producto);

                                // Descontamos el stock físicamente del objeto Producto para reflejar el cambio
                                producto.setStock(producto.getStock() - cantidad);
                                productoRepo.guardar(producto);

                                System.out.println("¡Producto añadido! Subtotal actual del pedido: $" + nuevoPedido.getTotal());
                            }
                        } catch (IllegalArgumentException e) {
                            System.out.println("Error de negocio: " + e.getMessage());
                        } catch (Exception e) {
                            System.out.println("Error en el ingreso de datos.");
                        }

                        System.out.print("¿Desea agregar otro producto? (S/N): ");
                        String continuar = sc.nextLine().trim().toUpperCase();
                        if (!"S".equals(continuar)) {
                            agregandoProductos = false;
                        }
                    }

                    if (!nuevoPedido.getDetalles().isEmpty()) {
                        pedidoRepo.guardar(nuevoPedido);
                        System.out.println("¡Pedido registrado exitosamente! Total a pagar: $" + nuevoPedido.getTotal());
                    } else {
                        System.out.println("Pedido cancelado por falta de productos.");
                    }
                    break;

                case "2":
                    System.out.print("Ingrese el ID del pedido a modificar: ");
                    try {
                        Long idMod = Long.parseLong(sc.nextLine().trim());
                        Optional<Pedido> pedOpt = pedidoRepo.buscarPorId(idMod);

                        if (pedOpt.isPresent()) {
                            Pedido pedido = pedOpt.get();
                            System.out.println("Estado actual: " + pedido.getEstado());
                            System.out.println("Seleccione nuevo estado (1. PENDIENTE / 2. CONFIRMADO / 3. TERMINADO / 4. CANCELADO): ");
                            String opEst = sc.nextLine().trim();

                            switch (opEst) {
                                case "1": pedido.setEstado(EstadoPedido.PENDIENTE); break;
                                case "2": pedido.setEstado(EstadoPedido.CONFIRMADO); break;
                                case "3": pedido.setEstado(EstadoPedido.TERMINADO); break;
                                case "4": pedido.setEstado(EstadoPedido.CANCELADO); break;
                                default: System.out.println("Opción inválida. No se alteró el estado.");
                            }

                            pedidoRepo.guardar(pedido);
                            System.out.println("¡Estado actualizado con éxito!");
                        } else {
                            System.out.println("No se encontró ningún pedido con ese ID.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "3":
                    System.out.print("Ingrese el ID del pedido a dar de baja: ");
                    try {
                        Long idBaja = Long.parseLong(sc.nextLine().trim());
                        boolean exito = pedidoRepo.eliminarLogico(idBaja);
                        if (exito) {
                            System.out.println("Pedido dado de baja lógicamente.");
                        } else {
                            System.out.println("No se encontró el pedido o ya estaba de baja.");
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "4":
                    List<Pedido> activos = pedidoRepo.listarActivos();
                    mostrarListaPedidos(activos);
                    break;

                case "5":
                    System.out.print("Ingrese el ID del Usuario para ver su historial: ");
                    try {
                        Long userId = Long.parseLong(sc.nextLine().trim());
                        List<Pedido> pedidosUser = usuarioRepo.buscarPedidosPorUsuario(userId);
                        mostrarListaPedidos(pedidosUser);
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "6":
                    System.out.println("Seleccione el Estado a filtrar (1. PENDIENTE / 2. CONFIRMADO / 3. TERMINADO / 4. CANCELADO): ");
                    String opFiltro = sc.nextLine().trim();
                    EstadoPedido estFiltro = EstadoPedido.PENDIENTE;
                    if ("2".equals(opFiltro)) estFiltro = EstadoPedido.CONFIRMADO;
                    if ("3".equals(opFiltro)) estFiltro = EstadoPedido.TERMINADO;
                    if ("4".equals(opFiltro)) estFiltro = EstadoPedido.CANCELADO;

                    List<Pedido> pedidosEstado = pedidoRepo.buscarPorEstado(estFiltro);
                    mostrarListaPedidos(pedidosEstado);
                    break;

                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

    // Método auxiliar interno para no duplicar lógica de impresión por pantalla
    private static void mostrarListaPedidos(List<Pedido> lista) {
        if (lista == null || lista.isEmpty()) {
            System.out.println("No se encontraron pedidos para mostrar.");
        } else {
            System.out.println("\n=== LISTADO DE PEDIDOS ===");
            for (Pedido p : lista) {
                String clienteNom = (p.getUsuario() != null) ? p.getUsuario().getApellido() + ", " + p.getUsuario().getNombre() : "Anónimo";
                System.out.println("ID: " + p.getId() +
                        " | Cliente: " + clienteNom +
                        " | Fecha: " + p.getFecha() +
                        " | Total: $" + p.getTotal() +
                        " | Estado: " + p.getEstado() +
                        " | Pago: " + p.getFormaPago());
            }
        }
    }

    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- PANEL DE REPORTES ---");
            System.out.println("1. Productos por Categoría");
            System.out.println("2. Pedidos por Usuario");
            System.out.println("3. Pedidos por Estado");
            System.out.println("4. Total Facturado (Caja General)");
            System.out.println("0. Volver");
            System.out.print("Opción: ");
            String op = sc.nextLine().trim();

            switch (op) {
                case "1":
                    // Listamos las categorías disponibles para que el usuario elija
                    List<Categoria> categorias = categoriaRepo.listarActivos();
                    if (categorias.isEmpty()) {
                        System.out.println("No hay categorías cargadas.");
                        break;
                    }
                    System.out.println("\n--- Seleccione una Categoría ---");
                    for (Categoria c : categorias) {
                        System.out.println("ID: " + c.getId() + " - " + c.getNombre());
                    }
                    System.out.print("ID Categoría: ");
                    try {
                        Long catId = Long.parseLong(sc.nextLine().trim());
                        List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(catId);

                        if (productos.isEmpty()) {
                            System.out.println("No hay productos activos en esta categoría.");
                        } else {
                            System.out.println("\n=== PRODUCTOS EN LA CATEGORÍA ===");
                            for (Producto p : productos) {
                                System.out.println("-> " + p.getNombre() + " | Precio: $" + p.getPrecio() + " | Stock: " + p.getStock());
                            }
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "2":
                    System.out.print("Ingrese el ID del Usuario para ver sus compras: ");
                    try {
                        Long userId = Long.parseLong(sc.nextLine().trim());
                        List<Pedido> pedidosUser = usuarioRepo.buscarPedidosPorUsuario(userId);

                        if (pedidosUser.isEmpty()) {
                            System.out.println("El usuario no registra pedidos activos.");
                        } else {
                            System.out.println("\n=== HISTORIAL DE COMPRAS DEL USUARIO ===");
                            for (Pedido p : pedidosUser) {
                                System.out.println("Pedido ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Total: $" + p.getTotal() + " | Estado: " + p.getEstado());
                            }
                        }
                    } catch (NumberFormatException e) {
                        System.out.println("ID inválido.");
                    }
                    break;

                case "3":
                    System.out.println("Seleccione el Estado a consultar (1. PENDIENTE / 2. CONFIRMADO / 3. TERMINADO / 4. CANCELADO): ");
                    String opEst = sc.nextLine().trim();
                    EstadoPedido estado = EstadoPedido.PENDIENTE;
                    if ("2".equals(opEst)) estado = EstadoPedido.CONFIRMADO;
                    if ("3".equals(opEst)) estado = EstadoPedido.TERMINADO;
                    if ("4".equals(opEst)) estado = EstadoPedido.CANCELADO;

                    List<Pedido> pedidosEstado = pedidoRepo.buscarPorEstado(estado);
                    if (pedidosEstado.isEmpty()) {
                        System.out.println("No hay pedidos registrados con el estado: " + estado);
                    } else {
                        System.out.println("\n=== PEDIDOS CON ESTADO: " + estado + " ===");
                        for (Pedido p : pedidosEstado) {
                            String cliente = (p.getUsuario() != null) ? p.getUsuario().getNombre() + " " + p.getUsuario().getApellido() : "Anónimo";
                            System.out.println("ID: " + p.getId() + " | Cliente: " + cliente + " | Total: $" + p.getTotal());
                        }
                    }
                    break;

                case "4":
                    // Calculamos el total acumulado en base a todos los pedidos activos en la BD
                    List<Pedido> todosLosPedidos = pedidoRepo.listarActivos();
                    double cajaTotal = 0.0;
                    int pedidosValidos = 0;

                    for (Pedido p : todosLosPedidos) {
                        // Opcional: No sumamos los pedidos CANCELADOS a la facturación real
                        if (p.getEstado() != EstadoPedido.CANCELADO && p.getTotal() != null) {
                            cajaTotal += p.getTotal();
                            pedidosValidos++;
                        }
                    }
                    System.out.println("\n=========================================");
                    System.out.println("      REPORTE DE CAJA Y FACTURACIÓN      ");
                    System.out.println("=========================================");
                    System.out.println("Cantidad de pedidos procesados: " + pedidosValidos);
                    System.out.println("Total neto facturado en el sistema: $" + cajaTotal);
                    System.out.println("=========================================");
                    break;

                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opción inválida.");
            }
        }
    }

}
