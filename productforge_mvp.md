# ProductForge MVP - Development Specification

## Project Overview
**ProductForge** is a product lifecycle management tool that helps businesses organize products in a hierarchical structure (Categories > Lines > Models > Versions) with basic revision tracking and collaboration features.

## MVP Scope
Focus on core product organization with simple version tracking, basic search/filtering, and data import/export capabilities.

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **File Uploads**: Multer for images/documents
- **Deployment**: Vercel (frontend) + Railway (backend + DB)

## Project Structure
```
productforge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components
│   │   │   ├── layout/     # Header, sidebar, dashboard
│   │   │   ├── products/   # Product-specific components
│   │   │   └── auth/       # Authentication components
│   │   ├── contexts/       # React contexts for state
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── public/
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── models/         # Prisma schema
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
└── README.md
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(EDITOR)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  createdCategories Category[]
  createdProducts   Product[]
  createdVersions   ProductVersion[]
  comments          Comment[]

  @@map("users")
}

model Category {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?  @default("#6366f1")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  createdBy   User   @relation(fields: [createdById], references: [id])
  createdById String
  lines       ProductLine[]

  @@map("categories")
}

model ProductLine {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  products   Product[]

  @@map("product_lines")
}

model Product {
  id          String        @id @default(cuid())
  name        String
  description String?
  sku         String?       @unique
  status      ProductStatus @default(DRAFT)
  tags        String[]      @default([])
  imageUrl    String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  createdBy     User           @relation(fields: [createdById], references: [id])
  createdById   String
  line          ProductLine    @relation(fields: [lineId], references: [id], onDelete: Cascade)
  lineId        String
  versions      ProductVersion[]
  comments      Comment[]
  customFields  Json?          // Flexible JSON field for custom attributes

  @@map("products")
}

model ProductVersion {
  id            String   @id @default(cuid())
  version       String   // e.g., "1.0", "1.1", "2.0"
  changelog     String?
  releaseNotes  String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  createdBy   User    @relation(fields: [createdById], references: [id])
  createdById String

  @@unique([productId, version])
  @@map("product_versions")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author    User    @relation(fields: [authorId], references: [id])
  authorId  String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String

  @@map("comments")
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum ProductStatus {
  DRAFT
  ACTIVE
  DISCONTINUED
  ARCHIVED
}
```

## API Endpoints

### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Categories
```typescript
GET    /api/categories              # List all categories
POST   /api/categories              # Create category
GET    /api/categories/:id          # Get category with lines
PUT    /api/categories/:id          # Update category
DELETE /api/categories/:id          # Delete category
```

### Product Lines
```typescript
GET    /api/lines                   # List all lines
POST   /api/lines                   # Create line
GET    /api/lines/:id               # Get line with products
PUT    /api/lines/:id               # Update line
DELETE /api/lines/:id               # Delete line
```

### Products
```typescript
GET    /api/products                # List products (with search/filter)
POST   /api/products                # Create product
GET    /api/products/:id            # Get product with versions
PUT    /api/products/:id            # Update product
DELETE /api/products/:id            # Delete product
GET    /api/products/search         # Search products
POST   /api/products/import         # Import from CSV
GET    /api/products/export         # Export to CSV
```

### Product Versions
```typescript
GET    /api/products/:id/versions   # List product versions
POST   /api/products/:id/versions   # Create new version
PUT    /api/versions/:id            # Update version
DELETE /api/versions/:id            # Delete version
```

## Core React Components

### 1. App Layout
```typescript
// src/components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### 2. Product Tree Navigator
```typescript
// src/components/products/ProductTree.tsx
interface ProductTreeProps {
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string;
}

const ProductTree: React.FC<ProductTreeProps> = ({ onSelectProduct, selectedProductId }) => {
  const { categories, loading } = useCategories();
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Products</h3>
      {categories.map(category => (
        <CategoryNode 
          key={category.id} 
          category={category}
          onSelectProduct={onSelectProduct}
          selectedProductId={selectedProductId}
        />
      ))}
    </div>
  );
};
```

### 3. Product Card
```typescript
// src/components/products/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const latestVersion = product.versions[0];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <ProductStatus status={product.status} />
      </div>
      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>SKU: {product.sku || 'N/A'}</span>
        <span>v{latestVersion?.version || '1.0'}</span>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
          Edit
        </Button>
        <Button variant="outline" size="sm" color="red" onClick={() => onDelete(product.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
};
```

### 4. Product Form
```typescript
// src/components/products/ProductForm.tsx
interface ProductFormProps {
  product?: Product;
  onSave: (productData: ProductFormData) => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  status: ProductStatus;
  categoryId: string;
  lineId: string;
  tags: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    status: product?.status || 'DRAFT',
    categoryId: product?.line.categoryId || '',
    lineId: product?.lineId || '',
    tags: product?.tags || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
};
```

## Key React Hooks

### 1. useProducts Hook
```typescript
// src/hooks/useProducts.ts
export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData: ProductFormData) => {
    const newProduct = await productService.createProduct(productData);
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (id: string, productData: Partial<ProductFormData>) => {
    const updated = await productService.updateProduct(id, productData);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
};
```

### 2. useCategories Hook
```typescript
// src/hooks/useCategories.ts
export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithLines[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, setCategories };
};
```

## Service Layer Examples

### Product Service
```typescript
// src/services/productService.ts
class ProductService {
  private baseURL = '/api/products';

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.status) params.append('status', filters.status);
    
    const response = await fetch(`${this.baseURL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  }

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
  }

  async exportProducts(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export`);
    if (!response.ok) throw new Error('Failed to export products');
    return response.blob();
  }

  async importProducts(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseURL}/import`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to import products');
    return response.json();
  }
}

export const productService = new ProductService();
```

## Development Commands

```bash
# Setup
npm create vite@latest productforge-client -- --template react-ts
cd productforge-client && npm install
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p

cd ../
mkdir productforge-server && cd productforge-server
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D @types/express @types/bcryptjs @types/jsonwebtoken @types/cors typescript ts-node nodemon

# Database setup
npx prisma init
npx prisma generate
npx prisma migrate dev --name init

# Development
npm run dev (both client and server)
```

## Environment Variables

```bash
# .env (server)
DATABASE_URL="postgresql://user:password@localhost:5432/productforge"
JWT_SECRET="your-secret-key-here"
PORT=3001

# .env.local (client)
VITE_API_URL="http://localhost:3001"
```

## Next Steps for ClaudeCode

1. **Project Setup**: Initialize the project structure with the tech stack
2. **Database Schema**: Implement the Prisma schema and run migrations  
3. **Authentication**: Build JWT-based auth system
4. **Core CRUD Operations**: Implement category, line, product, and version APIs
5. **Frontend Components**: Build the main UI components and hooks
6. **Search & Filtering**: Add product search and filtering capabilities
7. **Import/Export**: CSV import/export functionality
8. **Polish & Testing**: UI improvements and basic testing

## Success Metrics
- Users can create their first product within 5 minutes
- Product organization reduces lookup time by 50%
- CSV import works for 90%+ of common product data formats
- App loads and responds in under 2 seconds

This specification provides a complete foundation for building the ProductForge MVP with ClaudeCode.