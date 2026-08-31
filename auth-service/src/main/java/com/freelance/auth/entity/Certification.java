package com.freelance.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String organization;

    private String issueDate; // String type ensures manual typing and calendar dates save cleanly

    private String credentialId;

    @Column(columnDefinition = "TEXT")
    private String credentialUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String certificatePdfUrl; // Longtext accommodates PDF file paths and Data URLs without truncation

    public Certification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }

    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }

    public String getCertificatePdfUrl() { return certificatePdfUrl; }
    public void setCertificatePdfUrl(String certificatePdfUrl) { this.certificatePdfUrl = certificatePdfUrl; }
}