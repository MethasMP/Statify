package com.statify.backend.controller;

import com.statify.backend.entity.CategorizationRule;
import com.statify.backend.entity.Category;
import com.statify.backend.repository.CategorizationRuleRepository;
import com.statify.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RulesController {

    private final CategorizationRuleRepository ruleRepository;
    private final CategoryRepository categoryRepository;

    /** GET /api/v1/categories */
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /** GET /api/v1/rules */
    @GetMapping("/rules")
    public ResponseEntity<List<CategorizationRule>> listRules() {
        return ResponseEntity.ok(ruleRepository.findAllWithCategories());
    }

    /** POST /api/v1/rules */
    @PostMapping("/rules")
    public ResponseEntity<CategorizationRule> addRule(@RequestBody RuleRequest req) {
        Category cat = categoryRepository.findById(req.categoryId()).orElse(null);
        if (cat == null)
            return ResponseEntity.badRequest().build();

        CategorizationRule rule = new CategorizationRule();
        rule.setKeyword(req.keyword());
        rule.setCategory(cat);
        rule.setPriority(req.priority() != null ? req.priority() : 0);
        rule.setMatchCount(0);
        rule.setSystem(false);
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    /** PUT /api/v1/rules/:id */
    @PutMapping("/rules/{id}")
    public ResponseEntity<CategorizationRule> updateRule(
            @PathVariable Integer id,
            @RequestBody RuleRequest req) {

        return ruleRepository.findById(id)
                .map(rule -> {
                    rule.setKeyword(req.keyword());
                    if (req.categoryId() != null) {
                        categoryRepository.findById(req.categoryId()).ifPresent(rule::setCategory);
                    }
                    if (req.priority() != null)
                        rule.setPriority(req.priority());
                    return ResponseEntity.ok(ruleRepository.save(rule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/v1/rules/:id — 403 if system rule */
    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Object> deleteRule(@PathVariable Integer id) {
        return ruleRepository.findById(id)
                .map(rule -> {
                    if (rule.isSystem()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body((Object) "System rules cannot be deleted.");
                    }
                    ruleRepository.delete(rule);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    record RuleRequest(String keyword, Integer categoryId, Integer priority) {
    }
}
