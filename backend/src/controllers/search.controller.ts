import { Request, Response } from 'express';
import { searchService } from '../services/search.service';

export const searchController = {
  advancedSearch: async (req: Request, res: Response) => {
    try {
      const { 
        q, 
        type = 'all',
        category,
        faculty,
        minPrice,
        maxPrice,
        condition,
        sortBy = 'relevance',
        page = 1, 
        limit = 20 
      } = req.query;
      
      if (!q || (q as string).trim().length < 2) {
        return res.status(400).json({ error: 'Query too short' });
      }
      
      const results = await searchService.advancedSearch(
        q as string,
        type as string,
        {
          category: category as string,
          faculty: faculty as string,
          minPrice: minPrice ? Number.parseFloat(minPrice as string) : undefined,
          maxPrice: maxPrice ? Number.parseFloat(maxPrice as string) : undefined,
          condition: condition as string,
        },
        sortBy as string,
        Number.parseInt(page as string),
        Number.parseInt(limit as string)
      );
      
      res.json({
        success: true,
        ...results
      });
    } catch (error) {
      console.error('Advanced Search Error:', error);
      res.status(500).json({ error: 'Failed to perform advanced search' });
    }
  }
};
