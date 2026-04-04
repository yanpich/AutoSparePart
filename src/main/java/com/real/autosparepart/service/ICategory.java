package com.real.autosparepart.service;

import com.real.autosparepart.dto.CategoryDTO;

public interface ICategory  {
    // RCUD Operation
    CategoryDTO createCategory(CategoryDTO dto);
}
