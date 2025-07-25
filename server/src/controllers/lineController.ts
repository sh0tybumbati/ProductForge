import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getLines = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId } = req.query;

    const lines = await prisma.productLine.findMany({
      where: categoryId ? { categoryId: categoryId as string } : undefined,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            status: true,
            sku: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(lines);
  } catch (error) {
    console.error('Get lines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const line = await prisma.productLine.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        products: {
          include: {
            versions: {
              select: {
                id: true,
                version: true,
                isActive: true
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
        }
      }
    });

    if (!line) {
      return res.status(404).json({ error: 'Product line not found' });
    }

    res.json(line);
  } catch (error) {
    console.error('Get line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and category ID are required' });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const line = await prisma.productLine.create({
      data: {
        name,
        description,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.status(201).json(line);
  } catch (error) {
    console.error('Create line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId } = req.body;

    const existingLine = await prisma.productLine.findUnique({
      where: { id }
    });

    if (!existingLine) {
      return res.status(404).json({ error: 'Product line not found' });
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    const line = await prisma.productLine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    res.json(line);
  } catch (error) {
    console.error('Update line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingLine = await prisma.productLine.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!existingLine) {
      return res.status(404).json({ error: 'Product line not found' });
    }

    if (existingLine.products.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product line that contains products. Please move or delete products first.' 
      });
    }

    await prisma.productLine.delete({
      where: { id }
    });

    res.json({ message: 'Product line deleted successfully' });
  } catch (error) {
    console.error('Delete line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};