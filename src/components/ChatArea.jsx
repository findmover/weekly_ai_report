import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Empty, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './ChatArea.css';

function ChatArea() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 添加用户消息
    const userMessage = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 调用 AI 对话 API
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-cfwozebapbwqyaxcdcscuezdqqdzopiscgtvpsxcunelvvvh`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-32B',
          messages: [
            {
              role: 'system',
              content: '你是一个有帮助的AI助手，可以回答各种问题。',
            },
            ...messages,
            userMessage,
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('API 请求失败');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { role: 'assistant', content: '' };
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                aiMessage.content += content;

                // 第一次收到内容时添加消息
                if (isFirstChunk) {
                  setMessages((prev) => [...prev, aiMessage]);
                  isFirstChunk = false;
                } else {
                  // 更新最后一条消息
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...aiMessage };
                    return updated;
                  });
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('对话失败:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，对话失败了。请检查网络连接后重试。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 清空对话
  const handleClearChat = () => {
    if (window.confirm('确定要清空所有对话吗？')) {
      setMessages([]);
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2>💬 AI 对话助手</h2>
        <Button type="text" danger size="small" onClick={handleClearChat}>
          清空对话
        </Button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <Empty
            description="开始对话"
            style={{ marginTop: '60px' }}
          />
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <Spin size="small" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题或对话内容... (Shift+Enter 换行，Enter 发送)"
          rows={3}
          disabled={loading}
          className="chat-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={loading}
          disabled={!inputValue.trim() || loading}
          block
          style={{ marginTop: '10px' }}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

export default ChatArea;
