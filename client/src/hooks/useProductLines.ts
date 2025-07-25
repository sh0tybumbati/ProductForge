import { useState, useEffect, useCallback } from 'react';
import type { ProductLine, LineFormData } from '../types';

export const useProductLines = (categoryId?: string) => {
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = categoryId 
        ? `${import.meta.env.VITE_API_URL}/api/lines?categoryId=${categoryId}`
        : `${import.meta.env.VITE_API_URL}/api/lines`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product lines');
      }

      const data = await response.json();
      setLines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  const createLine = async (lineData: LineFormData): Promise<ProductLine> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lineData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create product line');
    }

    const newLine = await response.json();
    setLines(prev => [...prev, newLine]);
    return newLine;
  };

  const updateLine = async (id: string, lineData: Partial<LineFormData>): Promise<ProductLine> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lines/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lineData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update product line');
    }

    const updatedLine = await response.json();
    setLines(prev => prev.map(l => l.id === id ? updatedLine : l));
    return updatedLine;
  };

  const deleteLine = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lines/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete product line');
    }

    setLines(prev => prev.filter(l => l.id !== id));
  };

  const getLine = async (id: string): Promise<ProductLine> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lines/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch product line');
    }

    return response.json();
  };

  return {
    lines,
    loading,
    error,
    createLine,
    updateLine,
    deleteLine,
    getLine,
    refresh: fetchLines
  };
};