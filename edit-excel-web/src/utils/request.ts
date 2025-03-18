import axios from 'axios'
import { ElMessage } from 'element-plus'
import { httpBaseUrl } from '@/config_custom'

// 创建一个 axios 实例
const service = axios.create({
  baseURL: import.meta.env.MODE === 'production' ? httpBaseUrl : '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，例如添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
   
    // 对响应数据做点什么
    const { data = {} } = response
    if (data.code === 200) {
      return data
    }
    console.log('response', response)
    ElMessage.error(data.errorMsg || '请求出错，稍后重试')
    return Promise.reject()
  },
  error => {
    console.log('http error', error)
    ElMessage.error('请求出错，稍后重试')
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default service