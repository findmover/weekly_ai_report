import React from 'react';
import { Upload, Button } from 'antd';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import './FileUploadArea.css';

function FileUploadArea({ index, file, onUpload, onDelete }) {
  return (
    <div className="upload-item">
      <label className="upload-label">📄 周报 {index + 1}</label>

      {!file ? (
        <Upload.Dragger
          accept=".txt,.docx,.pdf,.md"
          beforeUpload={onUpload}
          maxCount={1}
          className="upload-box"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此上传</p>
          <p className="ant-upload-hint">支持 .txt, .docx, .pdf, .md 格式，单个文件不超过10MB</p>
        </Upload.Dragger>
      ) : (
        <div className="file-info">
          <span className="file-name">📁 {file.name}</span>
          <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            删除
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUploadArea;
