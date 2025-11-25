/**
 * 测试企业微信推送功能
 * 使用方法: node test-push.js
 */

const axios = require('axios');

// 测试配置
const TEST_CONFIG = {
  backendUrl: 'http://localhost:5000/api/push-wechat',
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=ac750978-31f1-45f4-af0a-0e5cae1f65d8',
  testContent: `本周工作周报

一、本周主要工作进展
1. 完成了AI周报生成系统的开发
2. 实现了企业微信推送功能
3. 优化了系统性能

二、存在问题及风险点
本周暂无明显风险

三、下周工作计划
1. 继续优化系统功能
2. 增加更多的导出格式支持
3. 完善用户文档`,
};

async function testPush() {
  console.log('='.repeat(60));
  console.log('企业微信推送功能测试');
  console.log('='.repeat(60));

  try {
    console.log('\n📤 发送测试请求...');
    console.log('后端地址:', TEST_CONFIG.backendUrl);
    console.log('Webhook URL:', TEST_CONFIG.webhookUrl.substring(0, 50) + '...');
    console.log('内容长度:', TEST_CONFIG.testContent.length, '字符');

    const response = await axios.post(
      TEST_CONFIG.backendUrl,
      {
        content: TEST_CONFIG.testContent,
        webhookUrl: TEST_CONFIG.webhookUrl,
      },
      {
        timeout: 30000,
      }
    );

    console.log('\n✅ 请求成功！');
    console.log('响应状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 推送成功！');
    } else {
      console.log('\n⚠️  推送失败:', response.data.error);
    }
  } catch (error) {
    console.log('\n❌ 请求失败！');
    console.log('错误类型:', error.name);
    console.log('错误信息:', error.message);

    if (error.response) {
      console.log('\n📋 后端响应信息:');
      console.log('状态码:', error.response.status);
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('\n📋 请求信息:');
      console.log('没有收到响应，请检查后端是否运行');
    } else {
      console.log('\n📋 错误详情:');
      console.log(error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}

// 运行测试
testPush();
