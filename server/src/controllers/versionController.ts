import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getVersions = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const productExists = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const versions = await prisma.productVersion.findMany({
      where: { productId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { version, changelog, releaseNotes } = req.body;

    if (!version) {
      return res.status(400).json({ error: 'Version is required' });
    }

    const productExists = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingVersion = await prisma.productVersion.findUnique({
      where: {
        productId_version: {
          productId,
          version
        }
      }
    });

    if (existingVersion) {
      return res.status(400).json({ error: 'Version already exists for this product' });
    }

    await prisma.productVersion.updateMany({
      where: { productId },
      data: { isActive: false }
    });

    const newVersion = await prisma.productVersion.create({
      data: {
        version,
        changelog,
        releaseNotes,
        productId,
        createdById: req.userId!,
        isActive: true
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(newVersion);
  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { version, changelog, releaseNotes, isActive } = req.body;

    const existingVersion = await prisma.productVersion.findUnique({
      where: { id }
    });

    if (!existingVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (version && version !== existingVersion.version) {
      const versionExists = await prisma.productVersion.findUnique({
        where: {
          productId_version: {
            productId: existingVersion.productId,
            version
          }
        }
      });

      if (versionExists) {
        return res.status(400).json({ error: 'Version already exists for this product' });
      }
    }

    if (isActive === true && !existingVersion.isActive) {
      await prisma.productVersion.updateMany({
        where: { 
          productId: existingVersion.productId,
          id: { not: id }
        },
        data: { isActive: false }
      });
    }

    const updatedVersion = await prisma.productVersion.update({
      where: { id },
      data: {
        ...(version && { version }),
        ...(changelog !== undefined && { changelog }),
        ...(releaseNotes !== undefined && { releaseNotes }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedVersion);
  } catch (error) {
    console.error('Update version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingVersion = await prisma.productVersion.findUnique({
      where: { id }
    });

    if (!existingVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const versionCount = await prisma.productVersion.count({
      where: { productId: existingVersion.productId }
    });

    if (versionCount === 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the only version of a product' 
      });
    }

    await prisma.productVersion.delete({
      where: { id }
    });

    if (existingVersion.isActive) {
      const latestVersion = await prisma.productVersion.findFirst({
        where: { productId: existingVersion.productId },
        orderBy: { createdAt: 'desc' }
      });

      if (latestVersion) {
        await prisma.productVersion.update({
          where: { id: latestVersion.id },
          data: { isActive: true }
        });
      }
    }

    res.json({ message: 'Version deleted successfully' });
  } catch (error) {
    console.error('Delete version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setActiveVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingVersion = await prisma.productVersion.findUnique({
      where: { id }
    });

    if (!existingVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    await prisma.productVersion.updateMany({
      where: { 
        productId: existingVersion.productId,
        id: { not: id }
      },
      data: { isActive: false }
    });

    const activeVersion = await prisma.productVersion.update({
      where: { id },
      data: { isActive: true },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(activeVersion);
  } catch (error) {
    console.error('Set active version error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};