package com.tp.jpa.repository;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.List;

/**
 * Repositorio de Categoria. Además del CRUD heredado implementa la consulta
 * de productos activos pertenecientes a una categoría.[cite: 8]
 *
 * Nota de diseño: como la relación es unidireccional y Categoria es la dueña
 * de la colección Set<Producto>, la navegación se hace desde Categoria hacia
 * sus productos (p. ej. JPQL con JOIN sobre c.productos).[cite: 8]
 */
public class CategoriaRepository extends BaseRepository<Categoria> {

    public CategoriaRepository() {
        super(Categoria.class);
    }

    /**
     * Retorna los productos activos que pertenecen a la categoría indicada.[cite: 8]
     *
     * Consulta JPQL: Realiza un JOIN sobre la colección 'productos' de la entidad Categoria[cite: 8].
     * Filtra los resultados asociando el ID de la categoría y asegurando que el producto
     * no haya sido borrado lógicamente (p.eliminado = false), cerrando correctamente el
     * EntityManager en el bloque finally[cite: 9].
     */
    public List<Producto> buscarProductosPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager(); // Usamos el emf heredado de BaseRepository[cite: 9]
        try {
            String jpql = "SELECT p FROM Categoria c JOIN c.productos p "
                    + "WHERE c.id = :categoriaId AND p.eliminado = false";

            TypedQuery<Producto> query = em.createQuery(jpql, Producto.class);
            query.setParameter("categoriaId", categoriaId);

            return query.getResultList();
        } finally { // <-- AGREGADO: Ahora el bloque está correctamente identificado.
            em.close(); // Garantizamos el cierre del recurso tal como hace BaseRepository[cite: 9]
        }
    }
}
