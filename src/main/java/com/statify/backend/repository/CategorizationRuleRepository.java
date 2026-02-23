package com.statify.backend.repository;

import com.statify.backend.entity.CategorizationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CategorizationRuleRepository extends JpaRepository<CategorizationRule, Integer> {
    @Query("SELECT r FROM CategorizationRule r JOIN FETCH r.category ORDER BY r.priority DESC")
    List<CategorizationRule> findAllWithCategories();
}
