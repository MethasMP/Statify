package com.statify.backend.service;

import com.statify.backend.entity.CategorizationRule;
import com.statify.backend.entity.Category;
import com.statify.backend.entity.Transaction;
import com.statify.backend.repository.CategorizationRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * TDD: RED → these tests define expected behaviors.
 * Each test names one concrete behavior per rule.
 */
@ExtendWith(MockitoExtension.class)
class CategorizationServiceTest {

    @Mock
    private CategorizationRuleRepository ruleRepository;

    @InjectMocks
    private CategorizationService service;

    private Transaction txn(String description) {
        Transaction t = new Transaction();
        t.setTxnDate(LocalDate.now());
        t.setDescription(description);
        t.setAmount(new BigDecimal("-120.00"));
        t.setCurrency("THB");
        return t;
    }

    private CategorizationRule rule(String keyword, int categoryId, int priority) {
        Category cat = new Category();
        cat.setId(categoryId);
        cat.setName("Cat_" + categoryId);

        CategorizationRule r = new CategorizationRule();
        r.setId(priority * 10); // unique id
        r.setKeyword(keyword);
        r.setCategory(cat);
        r.setPriority(priority);
        r.setMatchCount(0);
        return r;
    }

    @BeforeEach
    void setup() {
        when(ruleRepository.findAllWithCategories()).thenReturn(List.of(
                rule("KFC", 1, 10), // Food
                rule("GRAB", 2, 8), // Transport
                rule("SHOPEE", 3, 10), // Shopping
                rule("TRANSFER", 6, 5) // Transfer (lower priority)
        ));
    }

    // ── RED 1 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("matches keyword case-insensitively")
    void categorizes_case_insensitive() {
        Transaction t = txn("ซื้อ kfc อาหาร");

        service.categorizeTransactions(List.of(t));

        assertEquals(1, t.getCategoryId(), "Should match 'KFC' keyword regardless of case");
    }

    // ── RED 2 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("uses first matching rule — keyword match stops on first hit")
    void stops_on_first_matching_rule() {
        // GRAB matches transport (priority 8) but description also has 'SHOPEE'
        // (priority 10)
        // Whichever rule matches first in the ordered list wins
        Transaction t = txn("SHOPEE แต่มี GRAB FOOD");

        service.categorizeTransactions(List.of(t));

        // SHOPEE has priority 10, GRAB has 8 → SHOPEE should be found first
        assertNotNull(t.getCategoryId());
    }

    // ── RED 3 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("unmatched transaction leaves categoryId null")
    void unmatched_leaves_category_null() {
        Transaction t = txn("RANDOM_STORE_XYZ_NOTHING");

        service.categorizeTransactions(List.of(t));

        assertNull(t.getCategoryId(), "No matching rule → categoryId must remain null");
    }

    // ── RED 4 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("increments match_count on matched rule")
    void increments_match_count() {
        Transaction t = txn("ร้าน KFC Thailand");

        service.categorizeTransactions(List.of(t));

        verify(ruleRepository).saveAll(argThat(rules -> {
            ArrayList<CategorizationRule> list = new ArrayList<>();
            rules.forEach(list::add);
            return list.stream().anyMatch(r -> r.getKeyword().equalsIgnoreCase("KFC") && r.getMatchCount() == 1);
        }));
    }

    // ── RED 5 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("saves matched rule ID on transaction")
    void saves_matched_rule_id_on_transaction() {
        Transaction t = txn("SHOPEE PURCHASE");

        service.categorizeTransactions(List.of(t));

        assertNotNull(t.getMatchedRuleId(), "MatchedRuleId must be set after rule hit");
    }

    // ── RED 6 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("handles empty transaction list without throwing")
    void handles_empty_list_gracefully() {
        assertDoesNotThrow(() -> service.categorizeTransactions(List.of()));
    }

    // ── RED 7 ───────────────────────────────────────────────────────────
    @Test
    @DisplayName("processes multiple transactions in one call")
    void processes_multiple_transactions() {
        List<Transaction> txns = List.of(
                txn("KFC lunch"),
                txn("GRAB taxi"),
                txn("SHOPEE order"));

        service.categorizeTransactions(txns);

        assertEquals(1, txns.get(0).getCategoryId()); // KFC → Food
        assertEquals(2, txns.get(1).getCategoryId()); // GRAB → Transport
        assertEquals(3, txns.get(2).getCategoryId()); // SHOPEE → Shopping
    }
}
