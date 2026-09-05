package com.hms.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "permissions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_permissions_code",
            columnNames = "code"
        )
    }
)
public class Permission {

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
        nullable = false,
        unique = true,
        length = 100
    )
    private String code;

    @Column(
        nullable = false,
        length = 255
    )
    private String description;

    public Permission() {
    }

    public Permission(
        String code,
        String description
    ) {

        this.code = code;

        this.description = description;

    }

    public Long getId() {
        return id;
    }

    public void setId(
        Long id
    ) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(
        String code
    ) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
        String description
    ) {
        this.description = description;
    }
}