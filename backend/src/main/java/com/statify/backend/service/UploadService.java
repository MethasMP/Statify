package com.statify.backend.service;

import com.statify.backend.entity.Transaction;
import com.statify.backend.entity.Upload;
import com.statify.backend.parser.FileParser;
import com.statify.backend.parser.ParsedTransaction;
import com.statify.backend.repository.TransactionRepository;
import com.statify.backend.repository.UploadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final TransactionRepository transactionRepository;
    private final List<FileParser> parsers;
    private final CategorizationService categorizationService;
    private final AnomalyService anomalyService;

    public Upload initiateUpload(MultipartFile file) throws IOException {
        String extension = getFileExtension(file.getOriginalFilename());
        Upload upload = new Upload();
        upload.setFilename(file.getOriginalFilename());
        upload.setFileType(extension);
        upload.setStatus("pending");
        return uploadRepository.save(upload);
    }

    @Async
    public void processUpload(UUID uploadId, MultipartFile file) {
        Upload upload = uploadRepository.findById(uploadId).orElseThrow();
        upload.setStatus("processing");
        uploadRepository.save(upload);

        try {
            String extension = getFileExtension(file.getOriginalFilename());
            FileParser parser = parsers.stream()
                    .filter(p -> p.supports(extension))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No parser found for " + extension));

            List<ParsedTransaction> parsedTxns = parser.parse(file.getInputStream());

            List<Transaction> transactions = parsedTxns.stream().map(pt -> {
                Transaction t = new Transaction();
                t.setUpload(upload);
                t.setTxnDate(pt.date());
                t.setDescription(pt.description());
                t.setAmount(pt.amount());
                t.setCurrency(pt.currency());
                return t;
            }).collect(Collectors.toList());

            categorizationService.categorizeTransactions(transactions);

            transactionRepository.saveAll(transactions);

            anomalyService.detectAnomalies(transactions);

            upload.setStatus("completed");
            upload.setRowCount(transactions.size());
        } catch (Exception e) {
            upload.setStatus("failed");
            upload.setErrorMsg(e.getMessage());
        } finally {
            uploadRepository.save(upload);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains("."))
            return "";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
