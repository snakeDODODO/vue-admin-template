import axios, { type AxiosResponse } from 'axios';
import { useUserStore } from '@/stores/modules/user';
import router from '@/router';
import { ElMessage } from 'element-plus/lib/components/index.js';

// 新axios实例，基础配置
const baseURL = 'http://localhost:3000/api';
const request = axios.create({
  baseURL,
  timeout: 10000
});

// 请求拦截器，携带token
request.interceptors.request.use(
  config => {
    const store = useUserStore();
    if (store.userToken) {
      config.headers['authorization'] = `${store.userToken}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

// 响应拦截器，拦截错误数据
request.interceptors.response.use(
  (res: AxiosResponse<any>) => {
    // 后台预定，非200响应状态码数据即为错误
    if (res.data?.code !== 200) {
      ElMessage.error(res.data.msg || '请求失败');
      return Promise.reject(res.data);
    }
    // 把token拿出来存储到Pinia中
    const store = useUserStore();
    store.setUserToken(res.headers.authorization);
    return res.data.data;
  },
  err => {
    console.log(err);
    // 获取错误信息
    const errMsg = err.response?.data?.msg || err.message || '服务器错误';

    if (err.response?.status === 400) {
      ElMessage.error(errMsg);
    } else if (err.response?.status === 401) {
      const store = useUserStore();
      store.delUser();
      ElMessage.error('登录信息过期，请重新登录');
      router.push(`/login?returnUrl=${router.currentRoute.value.fullPath}`);
    } else {
      // 处理其他错误状态
      ElMessage.error(errMsg);
    }
    return Promise.reject(err);
  }
);

export { baseURL, request };
