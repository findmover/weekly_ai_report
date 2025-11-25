# 周报生成系统

一个智能化的AI周报生成前端应用，通过上传两份AI领域的周报，利用大语言模型自动合成、整理和生成一份高质量的本周AI周报。

## 功能特性

- ✅ **文件上传**：支持上传两份周报（.txt, .docx, .pdf, .md）
- ✅ **AI生成**：调用硅基流动API（Qwen3-32B模型）自动生成周报
- ✅ **连续对话**：支持与AI进行多轮对话优化周报内容
- ✅ **一键复制**：快速复制生成的周报内容
- ✅ **DOCX导出**：导出为专业的Word文档
- ✅ **响应式设计**：支持不同屏幕尺寸

## 项目结构

```
ai_weenkly/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── FileUploadArea.jsx
│   │   ├── FileUploadArea.css
│   │   ├── ReportDisplay.jsx
│   │   ├── ReportDisplay.css
│   │   ├── DialogArea.jsx
│   │   └── DialogArea.css
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.jsx
│   └── index.css
├── package.json
├── PRD.md
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:3000` 打开。

### 构建生产版本

```bash
npm run build
```

## 技术栈

- **前端框架**：React 18+
- **UI组件库**：Ant Design 5
- **HTTP客户端**：Axios
- **文档导出**：docx
- **样式**：CSS3 + Ant Design

## API配置

系统使用硅基流动API进行周报生成：

- **API提供商**：硅基流动
- **模型**：Qwen/Qwen3-32B
- **API Key**：在 `src/services/api.js` 中配置

## 使用说明

1. **上传周报**：点击上传区域或拖拽文件上传两份周报
2. **生成周报**：点击"生成周报"按钮，系统将自动合成周报
3. **优化内容**：在对话框中输入修改建议，AI将更新周报
4. **导出文档**：点击"导出DOCX"按钮下载Word文档
5. **复制内容**：点击"复制内容"按钮复制到剪贴板

## 周报格式

生成的周报包含以下四个部分：

1. **本周主要工作进展**：按模块和工作内容分类汇总
2. **存在问题及风险点**：汇总存在的问题和风险
3. **下周工作计划**：按优先级列出下周计划

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT
