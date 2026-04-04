package com.real.autosparepart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer categoryID;

    @NotBlank(message = "Please provide category's name!")
    private String name;

    @NotBlank(message = "Please provide category's slug!")
    @Column(unique = true, nullable = false)
    private String slug;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Product> products;

    public Object getId() {
        return categoryID;
    }
}
