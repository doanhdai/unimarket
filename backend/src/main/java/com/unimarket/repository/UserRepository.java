package com.unimarket.repository;

import com.unimarket.entity.User;
import com.unimarket.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByIsSellerTrueAndSellerApprovedFalse();

    List<User> findByRole(Role role);

    long countByIsSellerTrueAndSellerApprovedTrue();
}
