import React, { useState, useRef, useEffect } from 'react';
import { Bubble, Sender } from '@ant-design/x';
import './ChatAreaX.css';

const API_KEY = 'sk-cfwozebapbwqyaxcdcscuezdqqdzopiscgtvpsxcunelvvvh';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-32B';

function ChatAreaX() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理清空对话
  const handleClearChat = () => {
    if (window.confirm('确定要清空所有对话吗？')) {
      setMessages([]);
    }
  };

  // 处理发送消息
  const handleSendMessage = async (nextInput) => {
    if (!nextInput.trim()) return;

    setInput('');

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: nextInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: '你是一个有帮助的AI助手，可以回答各种问题。',
            },
            ...messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: nextInput,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('API 请求失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      const messageId = Date.now().toString();

      // 添加 AI 消息占位符
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: 'assistant',
          content: '',
          loading: true,
        },
      ]);

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
                aiContent += content;

                // 更新消息内容
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.id === messageId) {
                    lastMsg.content = aiContent;
                    lastMsg.loading = false;
                  }
                  return updated;
                });
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
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，对话失败了。请检查网络连接后重试。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-area-x">
      <div className="chat-header-x">
        <h2>💬 AI 对话助手</h2>
        <button className="clear-btn" onClick={handleClearChat}>
          清空对话
        </button>
      </div>

      <div className="chat-content-x">
        <Bubble.List
          items={messages.map((msg) => ({
            key: msg.id,
            loading: msg.loading,
            role: msg.role,
            content: msg.content,
          }))}
          style={{ height: '100%' }}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area-x">
        <Sender
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          placeholder="输入你的问题或对话内容..."
          loading={isLoading}
        />
      </div>
    </div>
  );
}

export default ChatAreaX;
