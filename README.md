# ProductForge 🏭

Product lifecycle management tool with hierarchical organization for tracking products from concept to retirement.

---

## Overview

ProductForge helps businesses organize and manage their product catalog using a powerful hierarchical structure. Track product revisions, manage lifecycles, and collaborate with role-based access controls—all in one centralized platform.

## Features

### 📦 Hierarchical Product Organization
- **Categories** → **Product Lines** → **Product Models** → **Versions**
- Navigate your entire product catalog with intuitive hierarchy

### 📝 Comprehensive Tracking
- **Version Control**: Track every product revision with detailed history
- **Status Management**: Monitor product lifecycle stages
  - Draft
  - Active
  - Discontinued
  - Archived
- **Metadata**: Store descriptions, specifications, and notes for each product level

### 👥 Role-Based Access Control
- **Admin**: Full system access and user management
- **Editor**: Create and modify products
- **Viewer**: Read-only access to product information

### 🔍 Advanced Features
- Search and filter across all product levels
- Data import/export capabilities
- Audit trails for product changes
- Responsive design for desktop and mobile

## Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **React Context + useReducer** for state management
- **Vite** for blazing-fast development

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Prisma ORM** for type-safe database access
- **JWT** authentication with bcrypt
- **RESTful API** architecture

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Sh0tybumbati/ProductForge.git
cd ProductForge
```

2. **Install dependencies**

Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd ../server
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/productforge"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

4. **Set up the database**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

5. **Start the development servers**

Backend (from `server` directory):
```bash
npm run dev
```

Frontend (from `client` directory):
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## Database Schema

### Hierarchy Structure
```
Category
  └─ Product Line
      └─ Product Model
          └─ Version
```

### Key Tables
- **users**: Authentication and role management
- **categories**: Top-level product groupings
- **product_lines**: Product families within categories
- **product_models**: Specific product types
- **versions**: Individual product versions with status tracking
- **audit_log**: Change history and tracking

## User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Create/edit/delete products, manage users, access all features |
| **Editor** | Create/edit products, cannot manage users |
| **Viewer** | Read-only access to products |

## Product Status Lifecycle

```
Draft → Active → Discontinued → Archived
```

- **Draft**: Product in development, not yet released
- **Active**: Currently available/in production
- **Discontinued**: No longer in production but may have support
- **Archived**: End of lifecycle, historical record only

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

### Products
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

See full API documentation in `/server/docs/api.md`

## Deployment

### Planned Deployment Stack
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL

### Build for Production

Frontend:
```bash
cd client
npm run build
```

Backend:
```bash
cd server
npm run build
```

## Development

### Project Structure
```
ProductForge/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # State management
│   │   ├── pages/       # Page components
│   │   └── types/       # TypeScript types
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── prisma/      # Database schema
│   └── package.json
└── README.md
```

### Database Migrations
```bash
cd server
npx prisma migrate dev --name migration_name
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows TypeScript best practices
- All tests pass
- New features include appropriate tests
- Commit messages are descriptive

## Roadmap

- [ ] File attachments for products
- [ ] Advanced reporting and analytics
- [ ] Export to PDF/Excel
- [ ] Product comparison tool
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Dark mode theme

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Built with modern web technologies to streamline product lifecycle management for teams of all sizes.

---

**Questions or Issues?** Open an issue on GitHub or reach out to [@Sh0tybumbati](https://github.com/Sh0tybumbati)
