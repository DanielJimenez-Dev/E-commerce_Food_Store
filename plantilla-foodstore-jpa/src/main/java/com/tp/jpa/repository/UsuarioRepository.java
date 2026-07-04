package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Usuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de Usuario. Además del CRUD heredado implementa la búsqueda de
 * un usuario activo por su mail y la consulta de los pedidos de un usuario.
 *
 * Nota de diseño: como la relación es unidireccional y Usuario es el dueño de
 * la colección Set<Pedido>, la navegación se hace desde Usuario hacia sus
 * pedidos (p. ej. JPQL con JOIN sobre u.pedidos).
 */
public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    /**
     * Retorna el usuario activo con el mail indicado.
     */
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
            Usuario usuario = em.createQuery(jpql, Usuario.class)
                    .setParameter("mail", mail)
                    .getSingleResult();
            return Optional.ofNullable(usuario);
        } catch (jakarta.persistence.NoResultException e) {
            return Optional.empty(); // Si no lo encuentra, retorna un Optional vacío de forma segura
        } finally {
            em.close();
        }
    }

    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();
        try {
            // Gracias a la bidireccionalidad, la consulta es directa sobre el atributo 'usuario' de Pedido
            String jpql = "SELECT p FROM Pedido p WHERE p.usuario.id = :idUsuario AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("idUsuario", idUsuario)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}
