import React, { useState, useEffect, useRef } from 'react';
import './StreamingReportDisplay.css';

/**
 * 流式报告显示组件
 * 实现逐字显示周报内容的效果
 */
function StreamingReportDisplay({ content, isStreaming = false }) {
  const [displayedContent, setDisplayedContent] = useState('');
  const displayedIndexRef = useRef(0);
  const contentRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  // 处理流式内容显示
  useEffect(() => {
    if (!content) {
      displayedIndexRef.current = 0;
      setDisplayedContent('');
      return;
    }

    // 如果新内容的长度大于已显示的长度
    if (content.length > displayedIndexRef.current) {
      // 计算需要显示的字符数
      const remainingChars = content.length - displayedIndexRef.current;

      // 如果剩余字符很多（>50），分批显示，否则一次性显示
      if (remainingChars > 50 && isStreaming) {
        // 分批显示，每次显示一个字符
        const displayNextChar = () => {
          if (displayedIndexRef.current < content.length) {
            setDisplayedContent(content.slice(0, displayedIndexRef.current + 1));
            displayedIndexRef.current += 1;

            // 使用 requestAnimationFrame 来同步浏览器刷新
            requestAnimationFrame(() => {
              setTimeout(displayNextChar, 10); // 10ms 延迟，可以调整速度
            });
          }
        };

        displayNextChar();
      } else {
        // 一次性显示所有新内容
        setDisplayedContent(content);
        displayedIndexRef.current = content.length;
      }
    }
  }, [content, isStreaming]);

  // 自动滚动到底部 - 更频繁的检查
  useEffect(() => {
    if (contentRef.current && shouldAutoScrollRef.current) {
      // 使用 setTimeout 确保 DOM 更新后再滚动
      const scrollTimer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 0);

      return () => clearTimeout(scrollTimer);
    }
  }, [displayedContent]);

  // 监听滚动事件，判断用户是否在手动滚动
  const handleScroll = (e) => {
    const element = e.target;
    // 如果用户滚动到接近底部（距离底部 100px 以内），保持自动滚动
    // 否则禁用自动滚动，让用户可以查看上面的内容
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    shouldAutoScrollRef.current = isNearBottom;
  };

  if (!content && !isStreaming) {
    return (
      <div className="streaming-report-display">
        <div className="empty-state">
          <p>粘贴两份周报后，点击"生成周报"按钮</p>
        </div>
      </div>
    );
  }

  return (
    <div className="streaming-report-display">
      <div
        ref={contentRef}
        className="report-content-scroll"
        onScroll={handleScroll}
      >
        <div className="report-text">
          {displayedContent}
          {isStreaming && displayedContent.length < content.length && (
            <span className="blinking-cursor">│</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreamingReportDisplay;

