import axios from 'axios';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

const API_KEY = 'sk-cfwozebapbwqyaxcdcscuezdqqdzopiscgtvpsxcunelvvvh';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-32B';

const SYSTEM_PROMPT = `你是一名专业的行政秘书，负责将多份个人周报内容进行合并、提炼、去重，并生成一份统一格式、正式严谨的本周综合周报。

【你的任务】
1. 从我提供的多份周报内容中抽取关键信息。
2. 自动合并语义相同或相似的内容，不允许简单拼接。
3. 自动识别关键成果、进度、问题、风险、亮点和业务价值。
4. 统一专业口径，确保内容正式、行政化、有条理。
5. 按要求输出最终综合周报（纯文本，不使用 Markdown），换行以数字分点。
6. 最终输出需同时生成一个 docx 文件。
7. 严格按照用户输入周报生成，不得杜撰擅自添加内容,如果周报很少，生成内容也应该很少

【最终输出格式（纯文本，必须严格遵守以下格式）】
本周工作周报
一、本周主要工作进展
（按模块和工作内容分类汇总，不按人员分类）
二、存在问题及风险点
（如无，请写"本周暂无明显风险"）
三、下周工作计划
（按优先级列出，内容需明确、可执行）`;

/**
 * 解析上传的文件内容
 */
export async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // 根据文件类型处理
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          resolve(content);
        } else if (file.name.endsWith('.md')) {
          resolve(content);
        } else if (file.type === 'application/pdf') {
          // PDF处理需要额外库，这里简化处理
          resolve(content);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // DOCX处理需要额外库，这里简化处理
          resolve(content);
        } else {
          resolve(content);
        }
      } catch (error) {
        reject(new Error('文件解析失败'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
}

/**
 * 调用硅基流动API生成周报
 */
export async function generateReport(content1, content2, previousReport = null, userMessage = null) {
  try {
    let userPrompt;

    if (previousReport && userMessage) {
      // 连续对话模式
      userPrompt = `之前生成的周报：
${previousReport}

用户的修改建议：
${userMessage}

请根据用户的建议修改周报内容，保持原有的格式。`;
    } else {
      // 初始生成模式
      userPrompt = `请根据以下两份周报内容，生成一份综合的AI周报：

【周报1】
${content1}

【周报2】
${content2}`;
    }

    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('API返回数据格式错误');
    }
  } catch (error) {
    console.error('API调用失败:', error);
    throw new Error(`生成周报失败: ${error.message}`);
  }
}

/**
 * 流式生成周报（实时显示）
 */
export async function generateReportStream(content1, content2, onChunk, previousReport = null, userMessage = null) {
  try {
    let userPrompt;

    if (previousReport && userMessage) {
      // 连续对话模式
      userPrompt = `之前生成的周报：
${previousReport}

用户的修改建议：
${userMessage}

请根据用户的建议修改周报内容，保持原有的格式。`;
    } else {
      // 初始生成模式
      userPrompt = `请根据以下两份周报内容，生成一份综合的AI周报：

【周报1】
${content1}

【周报2】
${content2}`;
    }

    console.log('开始流式请求...');
    console.log('API URL:', API_URL);
    console.log('Model:', MODEL);

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
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 响应错误:', response.status, errorText);
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    console.log('收到响应，开始处理流...');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log(`流处理完成，共收到 ${chunkCount} 个数据块`);
        break;
      }

      // 解码数据
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // 按行处理
      const lines = buffer.split('\n');

      // 保留最后一行（可能不完整）
      buffer = lines[lines.length - 1];

      // 处理完整的行
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();

        if (line === '') {
          continue;
        }

        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);

            // 处理 [DONE] 标记
            if (jsonStr === '[DONE]') {
              console.log('收到 [DONE] 标记，流结束');
              continue;
            }

            const data = JSON.parse(jsonStr);

            // 检查是否有内容
            if (data.choices && data.choices[0]) {
              const delta = data.choices[0].delta;
              if (delta && delta.content) {
                const content = delta.content;
                fullContent += content;

                // 使用 Promise 微任务确保每个 chunk 都能被正确处理
                // 这样可以避免 React 的批处理导致的显示延迟
                Promise.resolve().then(() => {
                  onChunk(content);
                });

                chunkCount++;

                // 每 10 个块打印一次日志
                if (chunkCount % 10 === 0) {
                  console.log(`已接收 ${chunkCount} 个数据块，内容长度: ${fullContent.length}`);
                }
              }
            }
          } catch (e) {
            console.warn('JSON 解析错误:', e.message, '行内容:', line.slice(0, 100));
          }
        }
      }
    }

    // 处理缓冲区中剩余的数据
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice(6);
          if (jsonStr !== '[DONE]') {
            const data = JSON.parse(jsonStr);
            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
              const content = data.choices[0].delta.content;
              fullContent += content;
              onChunk(content);
              chunkCount++;
            }
          }
        } catch (e) {
          console.warn('最后一行 JSON 解析错误:', e.message);
        }
      }
    }

    console.log('流式生成完成，总内容长度:', fullContent.length);
    return fullContent;
  } catch (error) {
    console.error('流式生成失败:', error);
    throw error;
  }
}

/**
 * 导出为DOCX文件
 */
export async function exportToDocx(reportContent, fileName = 'AI周报.docx') {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'AI周报',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `生成时间: ${dateStr}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...parseReportToDocxParagraphs(reportContent),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadFile(blob, fileName);
  } catch (error) {
    console.error('导出DOCX失败:', error);
    throw new Error('导出失败');
  }
}

/**
 * 将周报内容转换为DOCX段落
 */
function parseReportToDocxParagraphs(content) {
  const paragraphs = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.includes('一、') || trimmedLine.includes('二、') || trimmedLine.includes('三、')) {
      paragraphs.push(
        new Paragraph({
          text: trimmedLine,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmedLine.match(/^[0-9]+\./)) {
      // 数字列表项
      paragraphs.push(
        new Paragraph({
          text: trimmedLine,
          spacing: { before: 50, after: 50 },
          indent: { left: 720 },
        })
      );
    } else if (trimmedLine) {
      paragraphs.push(
        new Paragraph({
          text: trimmedLine,
          spacing: { before: 50, after: 50 },
        })
      );
    } else {
      paragraphs.push(new Paragraph({ text: '' }));
    }
  });

  return paragraphs;
}

/**
 * 下载文件
 */
function downloadFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 推送到企业微信
 */
export async function pushToWeChat(reportContent, webhookUrl) {
  try {
    console.log('开始推送到企业微信...');
    console.log('内容长度:', reportContent.length, '字符');
    console.log('Webhook URL:', webhookUrl.substring(0, 50) + '...');

    // 调用本地后端代理服务
    const response = await axios.post('http://localhost:5000/api/push-wechat', {
      content: reportContent,
      webhookUrl: webhookUrl,
    }, {
      timeout: 30000, // 增加超时时间到30秒
    });

    console.log('后端响应:', response.data);

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.error || '推送失败');
    }
  } catch (error) {
    console.error('推送到企业微信失败:', error);

    // 提供更详细的错误信息
    let errorMessage = error.message;
    if (error.response) {
      console.error('后端返回错误:', error.response.data);
      errorMessage = error.response.data?.error || error.response.data?.message || error.message;
    }

    throw new Error(`推送失败: ${errorMessage}`);
  }
}
