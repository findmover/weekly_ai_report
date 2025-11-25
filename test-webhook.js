/**
 * 企业微信 Webhook URL 测试脚本
 * 使用方法: node test-webhook.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testWebhook() {
  console.log('\n' + '='.repeat(70));
  console.log('企业微信 Webhook URL 测试工具');
  console.log('='.repeat(70));

  // 获取 Webhook URL
  const webhookUrl = await askQuestion('\n请输入你的 Webhook URL: ');

  if (!webhookUrl.trim()) {
    console.log('\n❌ Webhook URL 不能为空');
    rl.close();
    return;
  }

  // 验证 URL 格式
  console.log('\n📋 验证 URL 格式...');
  const urlValidation = validateWebhookUrl(webhookUrl);

  if (!urlValidation.valid) {
    console.log('\n❌ URL 格式错误:');
    urlValidation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    rl.close();
    return;
  }

  console.log('✅ URL 格式正确');

  // 添加 debug 参数
  let finalUrl = webhookUrl;
  if (!webhookUrl.includes('debug=1')) {
    const separator = webhookUrl.includes('?') ? '&' : '?';
    finalUrl = webhookUrl + separator + 'debug=1';
  }

  console.log('\n📤 发送测试请求...');
  console.log('URL:', finalUrl.substring(0, 60) + '...');

  const payload = {
    msgtype: 'text',
    text: {
      content: '这是一条测试消息'
    }
  };

  try {
    const response = await axios.post(finalUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ 请求成功！');
    console.log('\n📊 响应信息:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.errcode === 0) {
      console.log('\n🎉 Webhook URL 有效！可以正常使用。');
    } else {
      console.log('\n⚠️  Webhook 返回错误:');
      console.log(`   错误码: ${response.data.errcode}`);
      console.log(`   错误信息: ${response.data.errmsg}`);

      if (response.data.hint) {
        console.log(`   Hint: ${response.data.hint}`);
        console.log('\n💡 提示: 可以在以下网址查询错误详情:');
        console.log('   https://open.work.weixin.qq.com/devtool/query');
        console.log(`   将 hint 值 "${response.data.hint}" 粘贴到查询框中');
      }
    }
  } catch (error) {
    console.log('\n❌ 请求失败！');
    console.log('\n📋 错误信息:');

    if (error.response) {
      console.log(`   HTTP 状态码: ${error.response.status}`);
      console.log(`   响应数据: ${JSON.stringify(error.response.data, null, 2)}`);

      if (error.response.data && error.response.data.hint) {
        console.log('\n💡 提示: 可以在以下网址查询错误详情:');
        console.log('   https://open.work.weixin.qq.com/devtool/query');
        console.log(`   将 hint 值 "${error.response.data.hint}" 粘贴到查询框中');
      }
    } else if (error.request) {
      console.log('   没有收到响应，请检查:');
      console.log('   1. 网络连接是否正常');
      console.log('   2. Webhook URL 是否正确');
      console.log('   3. 防火墙是否阻止了请求');
    } else {
      console.log(`   ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  rl.close();
}

function validateWebhookUrl(url) {
  const errors = [];

  // 检查协议
  if (!url.startsWith('https://')) {
    errors.push('URL 必须使用 https:// 协议');
  }

  // 检查域名
  if (!url.includes('qyapi.weixin.qq.com')) {
    errors.push('URL 域名必须是 qyapi.weixin.qq.com');
  }

  // 检查路径
  if (!url.includes('/cgi-bin/webhook/send')) {
    errors.push('URL 路径必须包含 /cgi-bin/webhook/send');
  }

  // 检查 key 参数
  if (!url.includes('key=')) {
    errors.push('URL 必须包含 key 参数');
  }

  // 检查 key 值是否为空
  const keyMatch = url.match(/key=([^&]*)/);
  if (keyMatch && !keyMatch[1]) {
    errors.push('key 参数值不能为空');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// 运行测试
testWebhook();
