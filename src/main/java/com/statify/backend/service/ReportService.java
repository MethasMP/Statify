package com.statify.backend.service;

import com.statify.backend.entity.Category;
import com.statify.backend.entity.Transaction;
import com.statify.backend.repository.CategoryRepository;
import com.statify.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public byte[] generatePdfReport(UUID uploadId) throws Exception {
        List<Transaction> txns = transactionRepository.findByUploadIdOrderByTxnDate(uploadId);
        List<Category> allCategories = categoryRepository.findAll();
        Map<Integer, String> categoryMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        // Prepare parameters
        BigDecimal totalIncome = txns.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = txns.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .map(t -> t.getAmount().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("uploadId", uploadId.toString());
        parameters.put("totalIncome", totalIncome);
        parameters.put("totalExpense", totalExpense);
        parameters.put("netBalance", netBalance);

        // Prepare data records
        List<Map<String, Object>> records = new ArrayList<>();
        for (Transaction t : txns) {
            Map<String, Object> record = new HashMap<>();
            record.put("txnDate", t.getTxnDate());
            record.put("description", t.getDescription());
            record.put("amount", t.getAmount());
            record.put("categoryName",
                    t.getCategoryId() != null ? categoryMap.getOrDefault(t.getCategoryId(), "Uncategorized")
                            : "Uncategorized");
            records.add(record);
        }

        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(records);

        // Compile and map report
        InputStream reportStream = new ClassPathResource("reports/report.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
}
