package com.real.autosparepart.dto;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class BrandDTO {
    private Integer brandId;

    @NotBlank(message = "Please provide brand's name!")
    private String brandName;

    @NotBlank(message = "Please provide brand's image!")
    private String image;// URL or path to the brand's image
    @JsonIgnore
    private MultipartFile file; //file for user upload (not store on database)
}
