import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 流式文本处理 Hook
 * 用于管理流式数据的接收、缓冲和显示
 */
export function useStreamingText() {
  const [fullContent, setFullContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chunkQueueRef = useRef([]);
  const processingRef = useRef(false);

  // 添加数据块到队列
  const addChunk = useCallback((chunk) => {
    chunkQueueRef.current.push(chunk);
    setFullContent((prev) => prev + chunk);
  }, []);

  // 开始流式传输
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setFullContent('');
    chunkQueueRef.current = [];
  }, []);

  // 结束流式传输
  const endStreaming = useCallback(() => {
    setIsStreaming(false);
  }, []);

  // 清除内容
  const clear = useCallback(() => {
    setFullContent('');
    chunkQueueRef.current = [];
    setIsStreaming(false);
  }, []);

  // 获取已接收的块数
  const getChunkCount = useCallback(() => {
    return chunkQueueRef.current.length;
  }, []);

  return {
    fullContent,
    isStreaming,
    addChunk,
    startStreaming,
    endStreaming,
    clear,
    getChunkCount,
  };
}
