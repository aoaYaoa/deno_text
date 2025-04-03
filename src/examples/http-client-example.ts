// HTTP客户端使用示例
import httpClient, { HttpClient, HttpError } from '../utils/http-client.ts';

/**
 * 演示HTTP客户端的使用
 */
export async function runHttpClientDemo() {
  console.log('开始HTTP客户端示例演示...\n');

  // 1. 创建一个自定义的HTTP客户端实例
  const apiClient = new HttpClient({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    headers: {
      'X-Custom-Header': 'Deno App',
    },
  });

  // 2. 添加请求拦截器
  apiClient.addRequestInterceptor({
    onFulfilled: (config) => {
      console.log('请求拦截器执行，添加Authorization头');
      return {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': 'Bearer demo-token-123',
        },
      };
    },
  });

  // 3. 添加响应拦截器
  apiClient.addResponseInterceptor({
    onFulfilled: (response) => {
      console.log(`响应拦截器执行，状态码: ${response.status}`);
      return response;
    },
  });

  // 4. 基本GET请求示例
  try {
    console.log('发送GET请求获取帖子列表...');
    const posts = await apiClient.get('/posts', { params: { _limit: 3 } });
    console.log('成功获取帖子:');
    console.log(posts);
    console.log('\n');
  } catch (error) {
    handleError(error);
  }

  // 5. POST请求示例
  try {
    console.log('发送POST请求创建新帖子...');
    const newPost = await apiClient.post('/posts', {
      title: 'Deno HTTP客户端测试',
      body: '这是使用我们的HTTP客户端发送的请求',
      userId: 1,
    });
    console.log('成功创建帖子:');
    console.log(newPost);
    console.log('\n');
  } catch (error) {
    handleError(error);
  }

  // 6. PUT请求示例
  try {
    console.log('发送PUT请求更新帖子...');
    const updatedPost = await apiClient.put('/posts/1', {
      id: 1,
      title: '更新后的标题',
      body: '更新后的内容',
      userId: 1,
    });
    console.log('成功更新帖子:');
    console.log(updatedPost);
    console.log('\n');
  } catch (error) {
    handleError(error);
  }

  // 7. DELETE请求示例
  try {
    console.log('发送DELETE请求删除帖子...');
    const result = await apiClient.delete('/posts/1');
    console.log('成功删除帖子:', result);
    console.log('\n');
  } catch (error) {
    handleError(error);
  }

  // 8. 错误处理示例（404）
  try {
    console.log('发送请求到不存在的端点...');
    await apiClient.get('/non-existent-endpoint');
  } catch (error) {
    handleError(error);
  }

  // 9. 使用默认客户端
  try {
    console.log('\n使用默认HTTP客户端实例发送请求...');
    const defaultClientResult = await httpClient.get('https://jsonplaceholder.typicode.com/users/1');
    console.log('默认客户端请求成功:');
    console.log(defaultClientResult);
  } catch (error) {
    handleError(error);
  }

  console.log('\nHTTP客户端示例演示结束');
}

/**
 * 处理HTTP错误
 */
function handleError(error: unknown) {
  if (error instanceof HttpError) {
    console.error(`HTTP错误: ${error.message}`);
    console.error(`状态码: ${error.status}`);
    if (error.data) {
      console.error('错误数据:', error.data);
    }
  } else {
    console.error('未知错误:', error);
  }
  console.log('\n');
}

// 如果直接运行此文件，执行演示
if (import.meta.main) {
  await runHttpClientDemo();
} 