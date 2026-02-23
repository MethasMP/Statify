package com.statify.backend.service;

import com.statify.backend.entity.CategorizationRule;
import com.statify.backend.entity.Transaction;
import com.statify.backend.repository.CategorizationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorizationService {

    private final CategorizationRuleRepository ruleRepository;

    @Transactional
    public void categorizeTransactions(List<Transaction> transactions) {
        List<CategorizationRule> rules = ruleRepository.findAllWithCategories();

        for (Transaction txn : transactions) {
            for (CategorizationRule rule : rules) {
                if (txn.getDescription().toUpperCase().contains(rule.getKeyword().toUpperCase())) {
                    txn.setCategoryId(rule.getCategory().getId());
                    txn.setMatchedRuleId(rule.getId());
                    rule.setMatchCount(rule.getMatchCount() + 1);
                    break;
                }
            }
        }
        ruleRepository.saveAll(rules);
    }
}
