import { Request, Response } from 'express';
import { ElementModel } from '../models/elementModel';
import { BoardModel } from '../models/boardModel';
import { ExcalidrawElement } from '../types';
import logger from '../utils/logger';

export const elementController = {
  async getByBoardId(req: Request<{ boardId: string }>, res: Response) {
    try {
      const { boardId: boardIdParam } = req.params;
      const boardId = parseInt(boardIdParam, 10);
      if (isNaN(boardId)) {
        return res.status(400).json({ success: false, message: 'Invalid board ID format' });
      }

      const board = await BoardModel.findById(boardId);

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found',
        });
      }

      const elements = await ElementModel.findAllByBoardId(boardId);

      const excalidrawElements = ElementModel.convertToExcalidrawElements(elements);

      return res.status(200).json({
        success: true,
        data: excalidrawElements,
      });
    } catch (error) {
      logger.error(`Error getting elements for board ${req.params.boardId}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get elements',
      });
    }
  },

  async replaceAll(req: Request<{ boardId: string }, unknown, ExcalidrawElement[]>, res: Response) {
    try {
      const { boardId: boardIdParam } = req.params;
      const elements = req.body;
      const boardId = parseInt(boardIdParam, 10);
      if (isNaN(boardId)) {
        return res.status(400).json({ success: false, message: 'Invalid board ID format' });
      }

      // Validate input
      if (!Array.isArray(elements)) {
        return res.status(400).json({
          success: false,
          message: 'Request body must be an array of elements',
        });
      }

      const board = await BoardModel.findById(boardId);
      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found',
        });
      }

      await ElementModel.replaceAll(boardId, elements);

      await BoardModel.update(boardId, {});

      return res.status(200).json({
        success: true,
        message: `Elements replaced for board ${boardId}`,
      });
    } catch (error) {
      logger.error(`Error replacing elements for board ${req.params.boardId}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to replace elements',
      });
    }
  },
};
