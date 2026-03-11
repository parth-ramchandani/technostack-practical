# Product Management REST API

A production-ready NestJS REST API for managing products with variants. Built with PostgreSQL, TypeORM, JWT authentication, and role-based access control (ADMIN/USER).

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Relational database
- **TypeORM** - ORM for database management
- **JWT** - Stateless authentication
- **Role-Based Access Control** - ADMIN and USER roles

## Setup

Requirements: Node.js v14+, npm v6+, PostgreSQL v12+

```bash
npm install
cp .env.example .env
# Update .env with your PostgreSQL credentials
npm run start:dev
```

## Environment Variables

See `.env.example` for configuration options.

PostgreSQL Configuration:

- `DATABASE_HOST` - PostgreSQL server host (default: localhost)
- `DATABASE_PORT` - PostgreSQL server port (default: 5432)
- `DATABASE_USERNAME` - Database user (default: postgres)
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name (default: product_db)
- `DATABASE_SYNCHRONIZE` (default: true) - Auto-sync schema

JWT Configuration:

- `JWT_SECRET` - Secret key for signing tokens
- `JWT_ACCESS_TOKEN_EXPIRY` (default: 15m) - Access token expiration
- `JWT_REFRESH_TOKEN_EXPIRY` (default: 7d) - Refresh token expiration

## Running

```bash
npm run start          # Development
npm run start:dev      # Watch mode with auto-reload
npm run start:debug    # Debug mode
npm run start:prod     # Production
```

API runs on `http://localhost:3000`

## Database Setup

1. Install PostgreSQL (v12 or higher)
2. Create a database:
   ```bash
   createdb product_db
   ```
3. Update `.env` with your PostgreSQL credentials
4. Tables are automatically created on startup (via `DATABASE_SYNCHRONIZE=true`)

## API

### Auth

- `POST /auth/register` - Register user with email and password
- `POST /auth/login` - Login, returns access_token and refresh_token
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### Products

All product endpoints require JWT authentication header.

- `GET /products` - Get all products (paginated)
  - Query: `page`, `limit`, `category`, `minPrice`, `maxPrice`, `attributes`
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)

#### Create Product Example

```json
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

## Project Structure

```
src/
├── auth/              # Authentication module with JWT & Local strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── local-auth.guard.ts
│   ├── local.strategy.ts
│   ├── roles.decorator.ts
│   ├── roles.guard.ts
│   └── auth.module.ts
├── products/          # Products module
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── entities/          # Database entities
│   ├── user.entity.ts
│   ├── product.entity.ts
│   ├── product-variant.entity.ts
│   └── refresh-token.entity.ts
├── database/          # Database configuration
│   └── database.module.ts
├── common/            # Shared utilities
│   └── user-role.enum.ts
├── app.module.ts      # Main application module
└── main.ts            # Application entry point
```

## Key Features

- **User Authentication**: Register, login, refresh token, logout
- **JWT Tokens**: Access tokens (15m) and refresh tokens (7d)
- **Role-Based Access Control**: ADMIN and USER roles
- **Product Management**: Create, read, update, soft-delete products
- **Product Variants**: Support multiple variants per product with custom attributes
- **Database Transactions**: Atomic operations for data consistency
- **Validation**: Input validation with class-validator
- **Security**: Password hashing with bcrypt, parameterized queries

## Testing

```bash
npm run test           # Unit tests
npm run test:watch    # Watch mode
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
```

## Code Quality

```bash
npm run format         # Format code with Prettier
npm run lint           # Check and fix linting issues
```

## API Documentation

Detailed API endpoints are documented above. All endpoints return JSON responses.

### Authentication Flow

1. **Register**: Create new user account

   ```bash
   POST /auth/register
   ```

2. **Login**: Get JWT tokens

   ```bash
   POST /auth/login
   ```

3. **Use Access Token**: Include in Authorization header

   ```
   Authorization: Bearer <access_token>
   ```

4. **Refresh**: Get new access token when expired

   ```bash
   POST /auth/refresh
   ```

5. **Logout**: Invalidate refresh token
   ```bash
   POST /auth/logout
   ```

## Best Practices Implemented

- ✅ TypeORM for database abstraction
- ✅ JWT-based stateless authentication
- ✅ Role-based authorization with guards
- ✅ Database transaction management
- ✅ Input validation and sanitization
- ✅ Error handling and exception filters
- ✅ Separation of concerns (Controllers/Services)
- ✅ Environment-based configuration
- ✅ Passport.js for authentication strategies
- ✅ Password hashing with bcrypt

## Troubleshooting

**Connection refused on PostgreSQL**

- Ensure PostgreSQL is running
- Check DATABASE_HOST and DATABASE_PORT in .env
- Verify database exists: `psql -l`

**Invalid token errors**

- Ensure JWT_SECRET is set in .env
- Token may be expired, use refresh endpoint
- Check Authorization header format

**Permission denied errors**

- Verify user role is ADMIN for protected operations
- Check token payload contains correct role

## License

MIT
