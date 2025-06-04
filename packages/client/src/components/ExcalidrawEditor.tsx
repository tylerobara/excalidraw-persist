import { useState, useEffect, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI, AppState } from '@excalidraw/excalidraw/types';
import '../styles/ExcalidrawEditor.scss';
import { ElementService } from '../services/elementService';
import { useExcalidrawEditor } from '../hooks/useExcalidrawEditor';
import Loader from './Loader';
import { useTheme } from '../contexts/ThemeProvider';
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import logger from '../utils/logger';
import Utils from '../utils';

interface ExcalidrawEditorProps {
  boardId: string;
}

const debouncedHandleChange = Utils.debounce((f: () => void) => {
  f();
}, 500);

const ExcalidrawEditor = ({ boardId }: ExcalidrawEditorProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { theme: currentAppTheme, setTheme: setAppTheme } = useTheme();

  const {
    excalidrawAPI,
    elements,
    setElements,
    setExcalidrawAPI,
    handleChange: originalHandleChange,
  } = useExcalidrawEditor(boardId);

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api),
    [setExcalidrawAPI]
  );

  const handleChange = useCallback(
    (updatedElements: readonly ExcalidrawElement[], appState: AppState) => {
      if (updatedElements.length === 0) {
        return;
      }

      debouncedHandleChange(() => {
        originalHandleChange(updatedElements);
      });

      if (appState?.theme && appState.theme !== currentAppTheme) {
        setAppTheme(appState.theme);
      }
    },
    [originalHandleChange, currentAppTheme, setAppTheme]
  );

  useEffect(() => {
    if (excalidrawAPI) {
      const currentExcalidrawTheme = excalidrawAPI.getAppState().theme;
      if (currentExcalidrawTheme !== currentAppTheme) {
        excalidrawAPI.updateScene({ appState: { theme: currentAppTheme } });
      }
      const updatedExcalidrawTheme = excalidrawAPI.getAppState().theme;
      if (updatedExcalidrawTheme !== currentAppTheme) {
        setAppTheme(updatedExcalidrawTheme);
      }
    }
  }, [excalidrawAPI, currentAppTheme, setAppTheme]);

  const fetchBoardElements = useCallback(async () => {
    if (!boardId) {
      setElements([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const fetchedElements = await ElementService.getBoardElements(boardId);
      setElements(fetchedElements || []);
    } catch (error) {
      logger.error('Error fetching board elements:', error, true);
      setElements([]);
    } finally {
      setIsLoading(false);
    }
  }, [boardId, setElements]);

  useEffect(() => {
    fetchBoardElements();
  }, [fetchBoardElements]);

  if (isLoading) {
    return (
      <div className="excalidraw-editor">
        <div className="excalidraw-container">
          <Loader message="Loading board elements..." />
        </div>
      </div>
    );
  }

  if (!boardId) {
    return (
      <div className="excalidraw-editor">
        <div className="excalidraw-container">
          <p>Please select or create a board.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="excalidraw-editor">
      <div className="excalidraw-container relative">
        <Excalidraw
          key={boardId}
          initialData={{
            elements: elements,
            appState: {
              theme: currentAppTheme,
            },
          }}
          onChange={handleChange}
          name={`Board: ${boardId}`}
          excalidrawAPI={handleExcalidrawAPI}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: true,
              saveAsImage: true,
              export: false,
              loadScene: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default ExcalidrawEditor;
