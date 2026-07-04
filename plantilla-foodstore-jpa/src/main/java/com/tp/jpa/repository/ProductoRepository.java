package com.tp.jpa.repository;

import com.tp.jpa.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.List;

/**
 * Repositorio de Producto. Hereda todo el CRUD de BaseRepository; no
 * requiere queries adicionales.
 *
 * Nota de diseño: la búsqueda de productos por categoría NO vive aquí porque
 * la relación Categoria–Producto es unidireccional y la dueña es Categoria
 * (es Categoria quien posee el Set<Producto>). Producto no conoce su
 * categoría, por lo que esa consulta se ubica en CategoriaRepository.
 */
public class ProductoRepository extends BaseRepository<Producto> {

    public ProductoRepository() {
        super(Producto.class);
    }

    // Sobreescribimos el método para solucionar la LazyInitializationException
    @Override
    public List<Producto> listarActivos() {
        EntityManager em = emf.createEntityManager();
        try {
            // Usamos JOIN FETCH para traer la categoría de forma inmediata en la misma query
            String jpql = "SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE p.eliminado = false";
            TypedQuery<Producto> query = em.createQuery(jpql, Producto.class);
            return query.getResultList();
        } finally {
            em.close();
        }
    }
}
