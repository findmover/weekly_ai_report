import React, { useState, useRef, useCallback } from 'react';
import { Button, message, Spin, Empty, Divider, Input, Tabs, Modal } from 'antd';
import { CopyOutlined, DownloadOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import './App.css';
import StreamingReportDisplay from './components/StreamingReportDisplay';
import DialogArea from './components/DialogArea';
import ChatAreaX from './components/ChatAreaX';
import { generateReport, generateReportStream, exportToDocx, pushToWeChat } from './services/api';
import { useStreamingText } from './hooks/useStreamingText';

function App() {
  const [reportContents, setReportContents] = useState(['', '']);
  const [reportContent, setReportContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogHistory, setDialogHistory] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ac750978-31f1-45f4-af0a-0e5cae1f65d8');
  const [showWebhookInput, setShowWebhookInput] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushContent, setPushContent] = useState('');
  const [pushing, setPushing] = useState(false);

  // 处理文本框内容变化
  const handleTextChange = (index, value) => {
    const newContents = [...reportContents];
    newContents[index] = value;
    setReportContents(newContents);
  };

  // 清空文本框
  const handleClearText = (index) => {
    const newContents = [...reportContents];
    newContents[index] = '';
    setReportContents(newContents);
    message.success(`已清空周报${index + 1}`);
  };

  // 生成周报
  const handleGenerateReport = async () => {
    if (!reportContents[0].trim() || !reportContents[1].trim()) {
      message.warning('请在两个文本框中输入周报内容');
      return;
    }

    setLoading(true);
    setIsStreaming(true);
    setReportContent(''); // 清空之前的内容，准备接收流式输出

    try {
      // 使用流式输出
      const report = await generateReportStream(
        reportContents[0],
        reportContents[1],
        (chunk) => {
          // 实时更新内容
          setReportContent((prev) => prev + chunk);
        }
      );

      setIsStreaming(false);
      setDialogHistory([]);
      message.success('周报生成成功');
    } catch (error) {
      message.error(`生成失败: ${error.message}`);
      setReportContent('');
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  // 发送对话消息
  const handleSendMessage = async (message_text) => {
    const newHistory = [...dialogHistory, { role: 'user', content: message_text }];
    setDialogHistory(newHistory);

    try {
      // 使用流式输出进行对话
      setIsStreaming(true);
      setReportContent('');
      await generateReportStream(
        reportContents[0],
        reportContents[1],
        (chunk) => {
          setReportContent((prev) => prev + chunk);
        },
        reportContent,
        message_text
      );
      setIsStreaming(false);
      newHistory.push({ role: 'assistant', content: '周报已更新' });
      setDialogHistory(newHistory);
    } catch (error) {
      message.error('对话失败');
      setIsStreaming(false);
    }
  };

  // 复制内容
  const handleCopyContent = () => {
    if (!reportContent) {
      message.warning('请先生成周报');
      return;
    }
    navigator.clipboard.writeText(reportContent);
    message.success('内容已复制到剪贴板');
  };

  // 导出DOCX
  const handleExportDocx = async () => {
    if (!reportContent) {
      message.warning('请先生成周报');
      return;
    }
    try {
      const now = new Date();
      const year = now.getFullYear();
      const week = Math.ceil((now.getDate() - now.getDay() + 6) / 7);
      const fileName = `AI周报_${year}年第${week}周.docx`;
      await exportToDocx(reportContent, fileName);
      message.success('文档已下载');
    } catch (error) {
      message.error(`导出失败: ${error.message}`);
    }
  };

  // 打开推送编辑框
  const handleOpenPushModal = () => {
    if (!reportContent) {
      message.warning('请先生成周报');
      return;
    }
    if (!webhookUrl.trim()) {
      message.warning('请输入企业微信 Webhook 地址');
      return;
    }
    setPushContent(reportContent);
    setShowPushModal(true);
  };

  // 确认推送
  const handleConfirmPush = async () => {
    if (!pushContent.trim()) {
      message.warning('推送内容不能为空');
      return;
    }
    setPushing(true);
    try {
      await pushToWeChat(pushContent, webhookUrl);
      message.success('已推送到企业微信');
      setShowPushModal(false);
      setPushContent('');
    } catch (error) {
      message.error(`推送失败: ${error.message}`);
    } finally {
      setPushing(false);
    }
  };

  // 取消推送
  const handleCancelPush = () => {
    setShowPushModal(false);
    setPushContent('');
  };

  // 清空所有内容
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有内容吗？')) {
      setReportContents(['', '']);
      setReportContent(null);
      setDialogHistory([]);
      message.success('已清空所有内容');
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🤖 周报生成系统</h1>
        <p>智能合成AI领域周报，一键生成专业文档</p>
      </div>

      <div className="app-content">
        {/* 左侧面板 */}
        <div className="left-panel">
          <div className="panel-title">输入周报</div>

          {/* 周报1文本框 */}
          <div className="text-input-item">
            <label className="input-label">📄 周报 1</label>
            <Input.TextArea
              value={reportContents[0]}
              onChange={(e) => handleTextChange(0, e.target.value)}
              placeholder="请粘贴第一份周报内容..."
              rows={8}
              className="report-textarea"
            />
            <div className="input-actions">
              <span className="char-count">{reportContents[0].length} 字</span>
              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleClearText(0)}
              >
                清空
              </Button>
            </div>
          </div>

          {/* 周报2文本框 */}
          <div className="text-input-item">
            <label className="input-label">📄 周报 2</label>
            <Input.TextArea
              value={reportContents[1]}
              onChange={(e) => handleTextChange(1, e.target.value)}
              placeholder="请粘贴第二份周报内容..."
              rows={8}
              className="report-textarea"
            />
            <div className="input-actions">
              <span className="char-count">{reportContents[1].length} 字</span>
              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleClearText(1)}
              >
                清空
              </Button>
            </div>
          </div>

          {/* 企业微信 Webhook 地址 */}
          <div className="text-input-item">
            <label className="input-label">🔗 企业微信 Webhook</label>
            {!showWebhookInput ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                  {webhookUrl ? webhookUrl.substring(0, 50) + '...' : '未设置'}
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setShowWebhookInput(true)}
                >
                  编辑
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="输入企业微信 Webhook 地址"
                  size="small"
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => setShowWebhookInput(false)}
                >
                  保存
                </Button>
              </div>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleGenerateReport}
            disabled={!reportContents[0].trim() || !reportContents[1].trim()}
            loading={loading}
            style={{ marginTop: '20px' }}
          >
            ✨ 生成周报
          </Button>
        </div>

        {/* 右侧面板 */}
        <div className="right-panel">
          <Tabs
            defaultActiveKey="report"
            items={[
              {
                key: 'report',
                label: '📊 周报生成',
                children: (
                  <div className="tab-content">
                    <div className="result-area">
                      <div className="result-title">生成结果</div>
                      {!reportContent && !isStreaming ? (
                        <Empty
                          description="粘贴两份周报后，点击'生成周报'按钮"
                          style={{ marginTop: '60px' }}
                        />
                      ) : (
                        <StreamingReportDisplay
                          content={reportContent}
                          isStreaming={isStreaming}
                        />
                      )}
                    </div>

                    {reportContent && (
                      <div style={{ flex: '0 1 200px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Divider style={{ margin: '10px 0 0 0' }} />
                        <DialogArea
                          history={dialogHistory}
                          onSendMessage={handleSendMessage}
                        />
                      </div>
                    )}

                    {reportContent && (
                      <div className="action-buttons">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={handleCopyContent}
                        >
                          复制内容
                        </Button>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={handleExportDocx}
                        >
                          导出DOCX
                        </Button>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleOpenPushModal}
                        >
                          推送企微
                        </Button>
                        <Button
                          danger
                          onClick={handleClearAll}
                        >
                          清空
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'chat',
                label: '💬 AI对话',
                children: (
                  <div className="tab-content chat-tab">
                    <ChatAreaX />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 推送编辑框 */}
      <Modal
        title="编辑并推送到企业微信"
        open={showPushModal}
        onOk={handleConfirmPush}
        onCancel={handleCancelPush}
        width="80%"
        style={{ maxWidth: '1000px' }}
        okText="确认推送"
        cancelText="取消"
        confirmLoading={pushing}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ marginBottom: '10px', color: '#666', fontSize: '12px' }}>
          字数: {pushContent.length} / 2000 (企业微信限制单条消息为 2000 字符)
        </div>
        <Input.TextArea
          value={pushContent}
          onChange={(e) => setPushContent(e.target.value)}
          placeholder="编辑推送内容..."
          rows={15}
          style={{ fontFamily: 'monospace', fontSize: '14px' }}
        />
      </Modal>
    </div>
  );
}

export default App;
