# AutoSparePart - Automotive Spare Parts Management System

## Project Overview

**Project Name:** AutoSparePart

**Project Objective:** Build a modern, secure, and scalable automotive spare parts management system for future expansion.

---

## Core Features

| # | Feature | Description                                                 | Status |
|---|---------|-------------------------------------------------------------|--------|
| 1 | Product Management | CRUD operations for spare parts                             | ✅ Completed |
| 2 | Category Management | Organize products by categories (Engine, Brake, Tire, etc.) | ✅ Completed |
| 3 | Brand Management | Manage brands (Toyota, Honda, BMW, Mercedes, etc.)          | ✅ Completed |
| 4 | Vehicle Management | Link spare parts to specific vehicle models                 | ✅ Completed |
| 5 | File Upload/Download | Upload and manage product images                            | ✅ Completed |
| 6 | User Authentication | Login/Register/Forgot Password with JWT                     | ✅ Completed |
| 7 | Role-based Authorization | ADMIN and USER roles                                        | ✅ Completed |

---

**Core Tables:**
- `users` - Authentication and role management
- `categories` - Product categories
- `brands` - Manufacturer brands
- `vehicles` - Vehicle models
- `products` - Spare parts with foreign keys to categories, brands, and vehicles
- `product_details` - Additional product information 
- `product_images` - Store file paths for product images'

**Key Relationships:**
- Products belong to one category, one brand, and one vehicle
- Indexes on foreign keys for query performance

---

## Authentication & Security

### Authentication Flow
1. Client sends credentials to `POST /auth/login`
2. Server validates credentials against database
3. Server generates signed JWT token
4. Token returned to client

### Authorized Request Flow
1. Client includes token in header: `Authorization: Bearer <jwt-token>`
2. Server validates token signature and expiration
3. Valid → process request; Invalid → return 401/403

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full CRUD access to all resources (products, categories, brands, vehicles, files, users) |
| **USER** | Read-only access to public endpoints only |

### Security Implementation
- Spring Security manages authentication and authorization
- Stateless JWT tokens include user roles as claims
- Protected endpoints use `@PreAuthorize("hasRole('ADMIN')")`
- BCrypt password encoding

---

## Getting Started

### Prerequisites
- Java 21+
- Maven 4.0.0
- MySQL 8.0

### Quick Setup
```bash
git clone https://github.com/yanpich/autosparepart.git
cd autosparepart
mvn clean install
mvn spring-boot:run