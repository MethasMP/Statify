package com.statify.backend.repository;

import com.statify.backend.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, UUID> {

    @Query("SELECT a FROM Anomaly a WHERE a.transaction.upload.id = :uploadId ORDER BY a.createdAt DESC")
    List<Anomaly> findByUploadId(UUID uploadId);
}
