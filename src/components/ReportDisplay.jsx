import React from 'react';
import './ReportDisplay.css';

function ReportDisplay({ content }) {
  // 如果内容为空，显示加载状态
  if (!content) {
    return (
      <div className="report-content">
        <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          正在生成周报...
        </div>
      </div>
    );
  }

  return (
    <div className="report-content">
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', lineHeight: '1.8', color: '#333' }}>
        {content}
      </div>
    </div>
  );
}

export default ReportDisplay;
