import { useState, useCallback } from 'react';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { ElementService } from '../services/elementService';
import Utils from '../utils';
import logger from '../utils/logger';

const debouncedSave = Utils.debounce((boardId: string, elements: ExcalidrawElement[]) => {
  if (boardId && elements) {
    ElementService.replaceAllElements(boardId, elements).catch(error =>
      logger.error('Error saving elements:', error, true)
    );
  }
}, 500);

export const useExcalidrawEditor = (boardId: string | undefined) => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  const handleChange = useCallback(
    (excalidrawElements: readonly ExcalidrawElement[]) => {
      const elementsArray = [...excalidrawElements];

      setElements(elementsArray);

      if (boardId) {
        debouncedSave(boardId, elementsArray);
      }
    },
    [boardId]
  );

  return {
    elements,
    setElements,
    excalidrawAPI,
    setExcalidrawAPI,
    handleChange,
  };
};
