import React, { useState } from 'react';
import { Input, Button, Empty } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './DialogArea.css';

function DialogArea({ history, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      await onSendMessage(inputValue);
      setInputValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="dialog-area">
      <div className="dialog-title">💬 连续对话</div>

      <div className="dialog-history">
        {history.length === 0 ? (
          <div style={{ color: '#999', fontSize: '12px' }}>
            AI周报已生成，您可以继续优化内容...
          </div>
        ) : (
          history.map((msg, index) => (
            <div
              key={index}
              className={`dialog-message ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      <div className="dialog-input-group">
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的修改建议..."
          rows={2}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          block
          style={{ marginTop: '10px' }}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

export default DialogArea;
