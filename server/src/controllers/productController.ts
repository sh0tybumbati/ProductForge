import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search, 
      categoryId, 
      lineId, 
      status, 
      tags, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { sku: { contains: search as string } }
      ];
    }

    if (categoryId) {
      where.line = { categoryId: categoryId as string };
    }

    if (lineId) {
      where.lineId = lineId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (tags) {
      where.tags = { contains: tags as string };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          line: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          },
          versions: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              version: true,
              changelog: true,
              isActive: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              versions: true,
              comments: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        line: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, 
      description, 
      sku, 
      status, 
      tags, 
      lineId, 
      customFields,
      imageUrl 
    } = req.body;

    if (!name || !lineId) {
      return res.status(400).json({ error: 'Name and line ID are required' });
    }

    const lineExists = await prisma.productLine.findUnique({
      where: { id: lineId }
    });

    if (!lineExists) {
      return res.status(400).json({ error: 'Product line not found' });
    }

    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        status: status || 'DRAFT',
        tags: tags || [],
        lineId,
        customFields,
        imageUrl,
        createdById: req.userId!
      },
      include: {
        line: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    await prisma.productVersion.create({
      data: {
        version: '1.0',
        changelog: 'Initial version',
        productId: product.id,
        createdById: req.userId!
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      sku, 
      status, 
      tags, 
      lineId, 
      customFields,
      imageUrl 
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (lineId) {
      const lineExists = await prisma.productLine.findUnique({
        where: { id: lineId }
      });

      if (!lineExists) {
        return res.status(400).json({ error: 'Product line not found' });
      }
    }

    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sku !== undefined && { sku }),
        ...(status && { status }),
        ...(tags !== undefined && { tags }),
        ...(lineId && { lineId }),
        ...(customFields !== undefined && { customFields }),
        ...(imageUrl !== undefined && { imageUrl })
      },
      include: {
        line: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { sku: { contains: q as string } },
          { tags: { contains: q as string } }
        ]
      },
      include: {
        line: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        versions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            version: true
          }
        }
      },
      take: 20,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};