package com.statify.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "uploads")
@Getter
@Setter
public class Upload {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "error_msg")
    private String errorMsg;

    @Column(name = "uploaded_at", nullable = false)
    private OffsetDateTime uploadedAt = OffsetDateTime.now();
}
