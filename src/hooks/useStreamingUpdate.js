import { useCallback } from 'react';

/**
 * 自定义 Hook：处理流式更新
 * 用于确保每个流式块都能被正确渲染
 */
export function useStreamingUpdate(setContent) {
  const updateQueue = [];
  let isProcessing = false;

  const processQueue = useCallback(async () => {
    if (isProcessing || updateQueue.length === 0) {
      return;
    }

    isProcessing = true;

    while (updateQueue.length > 0) {
      const chunk = updateQueue.shift();

      // 立即更新状态
      setContent((prev) => (prev || '') + chunk);

      // 强制浏览器渲染，使用 setTimeout 0 创建新的宏任务
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    }

    isProcessing = false;
  }, [setContent]);

  const addChunk = useCallback((chunk) => {
    updateQueue.push(chunk);
    processQueue();
  }, [processQueue]);

  return addChunk;
}
