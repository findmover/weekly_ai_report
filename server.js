const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * 代理推送到企业微信的请求
 */
app.post('/api/push-wechat', async (req, res) => {
  try {
    console.log('收到推送请求，请求体大小:', JSON.stringify(req.body).length, '字节');

    const { content, webhookUrl } = req.body;

    // 详细的验证日志
    if (!content) {
      console.error('验证失败: 缺少内容');
      return res.status(400).json({ error: '缺少内容' });
    }

    if (typeof content !== 'string') {
      console.error('验证失败: 内容不是字符串，类型为:', typeof content);
      return res.status(400).json({ error: '内容必须是字符串' });
    }

    if (!webhookUrl) {
      console.error('验证失败: 缺少 Webhook 地址');
      return res.status(400).json({ error: '缺少 Webhook 地址' });
    }

    if (typeof webhookUrl !== 'string') {
      console.error('验证失败: Webhook 地址不是字符串，类型为:', typeof webhookUrl);
      return res.status(400).json({ error: 'Webhook 地址必须是字符串' });
    }

    // 验证 Webhook URL 格式
    if (!webhookUrl.startsWith('https://qyapi.weixin.qq.com')) {
      console.warn('警告: Webhook URL 不是标准的企业微信地址:', webhookUrl.substring(0, 50));
    }

    console.log('验证通过，准备构建消息...');

    // 构建企业微信消息格式
    const payload = {
      msgtype: 'text',
      text: {
        content: content,
      },
    };

    console.log('消息构建完成，准备发送到企业微信...');
    console.log('Webhook URL:', webhookUrl.substring(0, 50) + '...');

    // 调用企业微信 API
    // 如果 URL 中没有 debug 参数，自动添加 debug=1 以获取详细错误信息
    let finalUrl = webhookUrl;
    if (!webhookUrl.includes('debug=1')) {
      const separator = webhookUrl.includes('?') ? '&' : '?';
      finalUrl = webhookUrl + separator + 'debug=1';
    }

    console.log('最终请求 URL:', finalUrl.substring(0, 80) + '...');

    const response = await axios.post(finalUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('企业微信响应:', response.data);

    // 检查企业微信的响应
    if (response.data.errcode === 0) {
      console.log('推送成功');
      res.json({ success: true, message: '推送成功' });
    } else {
      console.error('企业微信返回错误:', response.data.errmsg, '错误码:', response.data.errcode);
      res.status(400).json({
        success: false,
        error: `企业微信返回错误: ${response.data.errmsg}`,
        errcode: response.data.errcode,
      });
    }
  } catch (error) {
    console.error('推送失败 - 错误类型:', error.name);
    console.error('推送失败 - 错误信息:', error.message);
    if (error.response) {
      console.error('推送失败 - HTTP 状态码:', error.response.status);
      console.error('推送失败 - 响应数据:', error.response.data);
    }
    console.error('推送失败 - 完整错误:', error);

    res.status(500).json({
      success: false,
      error: `推送失败: ${error.message}`,
      details: error.response?.data || null,
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
