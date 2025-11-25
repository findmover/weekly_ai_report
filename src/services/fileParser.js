/**
 * 文件解析工具
 * 支持 .txt, .md, .pdf, .docx 格式
 */

/**
 * 解析文本文件
 */
export function parseTextFile(content) {
  return content;
}

/**
 * 解析Markdown文件
 */
export function parseMarkdownFile(content) {
  // 移除Markdown语法，保留纯文本
  return content
    .replace(/^#+\s+/gm, '') // 移除标题
    .replace(/\*\*(.+?)\*\*/g, '$1') // 移除加粗
    .replace(/\*(.+?)\*/g, '$1') // 移除斜体
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除链接
    .replace(/`(.+?)`/g, '$1') // 移除代码
    .trim();
}

/**
 * 解析PDF文件（简化版，实际需要pdfjs库）
 */
export function parsePdfFile(content) {
  // 这里需要使用pdfjs-dist库来解析PDF
  // 简化处理：直接返回内容
  return content;
}

/**
 * 解析DOCX文件（简化版，实际需要docx库）
 */
export function parseDocxFile(content) {
  // 这里需要使用docx库来解析DOCX
  // 简化处理：直接返回内容
  return content;
}

/**
 * 根据文件类型选择合适的解析器
 */
export function parseFileByType(content, fileName) {
  const ext = fileName.split('.').pop().toLowerCase();

  switch (ext) {
    case 'txt':
      return parseTextFile(content);
    case 'md':
      return parseMarkdownFile(content);
    case 'pdf':
      return parsePdfFile(content);
    case 'docx':
      return parseDocxFile(content);
    default:
      return parseTextFile(content);
  }
}
