// src/config/whitelist.ts
// 定义API白名单路径

export const WHITE_LIST = [
  // 根路径和信息页
  '/',
  '/info',
  
  // 认证相关
  '/api/auth/login',
  '/api/auth/register',
  
  // 首页相关
  '/api/home/search',
  
  // 购物车相关
  '/api/cart/add',
  '/api/cart/list',
  
  // 微信相关
  '/api/wechat/login',
  
  // MBTI相关
  '/api/mbti/questions',
  '/api/mbti/types',
  '/api/mbti/types/:type',
  '/api/mbti/roles',
  '/api/mbti/test',
  '/api/mbti/result',
  
  // 静态资源
  '/assets',
  '/favicon.ico',
  '/robots.txt'
]; 