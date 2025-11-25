import React, { useState, useEffect, useRef } from 'react';
import './StreamingDisplay.css';

/**
 * 流式输出显示组件
 * 实现逐字显示效果，模拟真实的打字过程
 */
export default function StreamingDisplay({
  content = '',
  isStreaming = false,
  cursorVisible = true
}) {
  const [displayedContent, setDisplayedContent] = useState('');
  const contentRef = useRef(null);
  const [showCursor, setShowCursor] = useState(cursorVisible);

  // 处理流式内容更新
  useEffect(() => {
    if (!isStreaming) {
      // 不在流式模式下，直接显示完整内容
      setDisplayedContent(content);
      return;
    }

    // 如果新内容比当前显示内容长，说明有新数据
    if (content.length > displayedContent.length) {
      // 获取新增的部分
      const newPart = content.slice(displayedContent.length);

      // 逐字添加新内容
      let charIndex = 0;

      const addChar = () => {
        if (charIndex < newPart.length) {
          setDisplayedContent((prev) => prev + newPart[charIndex]);
          charIndex++;
          // 下一个字符添加延迟（毫秒）
          // 减少延迟可以让显示更快
          setTimeout(addChar, 10);
        }
      };

      addChar();
    }
  }, [content, displayedContent, isStreaming]);

  // 闪烁光标效果
  useEffect(() => {
    if (!isStreaming || !cursorVisible) {
      setShowCursor(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming, cursorVisible]);

  // 自动滚动到最新内容
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedContent]);

  return (
    <div className="streaming-display">
      <div
        ref={contentRef}
        className="streaming-content"
      >
        <pre className="content-text">{displayedContent}</pre>
        {isStreaming && showCursor && (
          <span className="cursor">│</span>
        )}
      </div>
    </div>
  );
}
