# Product Management REST API

A NestJS REST API for managing products with variants. Built with PostgreSQL, TypeORM, JWT authentication, and role-based access control (ADMIN/USER).

## Setup Instructions

### Prerequisites

- Node.js v14+
- npm v6+
- PostgreSQL v12+

### Installation

```bash
npm install
cp .env.example .env
```

### Database Setup

1. Create PostgreSQL database:

   ```bash
   createdb product_db
   ```

2. Update `.env` with your PostgreSQL credentials

3. Tables are automatically created on startup

### Running the Application

```bash
npm run start          # Production
npm run start:dev      # Development with auto-reload
npm run start:debug    # Debug mode
npm run start:prod     # Optimized production
```

The application runs on `http://localhost:3000`

## Environment Variables

Create a `.env` file based on `.env.example`:

### PostgreSQL Configuration

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=product_db
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false
```

### JWT Configuration

```env
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

## API Usage

### Authentication Endpoints

**Register User**

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "USER"  # Optional: USER or ADMIN
}
```

**Login**

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "token...",
  "refreshToken": "token..."
}
```

**Refresh Token**

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "token..."
}
```

**Logout**

```bash
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "token..."
}
```

### Product Endpoints

All product endpoints require JWT authentication:

```
Authorization: Bearer <accessToken>
```

**Create Product (ADMIN only)**

```bash
POST /products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "category": "Electronics",
  "variants": [
    {
      "sku": "LAPTOP-001",
      "price": 999.99,
      "stock": 50,
      "attributes": { "color": "Silver", "storage": "512GB" }
    }
  ]
}
```

**Get All Products**

```bash
GET /products?page=1&limit=10&category=Electronics&minPrice=500&maxPrice=2000
```

**Get Product by ID**

```bash
GET /products/:id
```

**Update Product (ADMIN only)**

```bash
PUT /products/:id
Content-Type: application/json

{
  "name": "Updated name",
  "variants": [...]
}
```

**Delete Product (ADMIN only)**

```bash
DELETE /products/:id
```

## Design Decisions & Assumptions

### Authentication & Authorization

- **JWT-based Authentication**: Stateless tokens for scalability
- **Dual Token System**: Short-lived access tokens (15m) + long-lived refresh tokens (7d)
- **Role-Based Access Control**: Two roles - ADMIN (create/update/delete) and USER (read-only)
- **Assumption**: Email is unique per user; no duplicate registrations allowed

### Product Management

- **Product Variants**: Each product supports multiple variants with different SKUs and prices
- **Soft Deletes**: Deleted products are marked as deleted, not permanently removed
- **Dynamic Attributes**: Product variants support flexible JSON attributes for extensibility
- **Assumption**: Variant SKUs must be unique within a product

### Database

- **PostgreSQL**: Chosen for relational data and ACID compliance
- **TypeORM**: Provides type-safe database operations and migration support
- **Auto-Synchronization**: Schema automatically syncs with entity definitions on startup
- **Assumption**: Database is PostgreSQL; other databases require configuration changes

### Security

- **Password Hashing**: Bcrypt with salt for secure password storage
- **JWT Validation**: All protected endpoints validate token on every request
- **Refresh Token Storage**: Hashed tokens stored in database for logout functionality
- **Assumptions**:
  - Users must authenticate before accessing protected resources
  - Tokens are immutable once issued
  - Refresh tokens are invalidated on logout

### API Design

- **RESTful Principles**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Pagination**: Products endpoint supports pagination (page, limit)
- **Filtering**: Products can be filtered by category, price range, and attributes
- **Assumptions**: API clients will properly handle pagination; large datasets will not be returned without limits

### Code Quality

- **Separation of Concerns**: Controllers handle HTTP, Services handle business logic
- **Validation**: Input validation using class-validator
- **Error Handling**: Try-catch blocks with proper error responses
- **Configuration Management**: Environment variables for all environment-specific values

## License

MIT
