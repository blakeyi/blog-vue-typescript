import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";

export interface ResponseData {
  code: number;
  data?: any;
  message: string;
}


// console.log('import.meta.env: ', import.meta.env);

// 创建 axios 实例
let service: AxiosInstance | any;
if (import.meta.env.MODE === "development") {
  console.log("development")
  service = axios.create({
    baseURL: "", // api 的 base_url
    timeout: 50000 // 请求超时时间
  });
} else {
  // 生产环境下
  console.log("product")
  service = axios.create({
    baseURL: "",
    timeout: 50000
  });
}

// request 拦截器 axios 的一些配置
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: any) => {
    // Do something with request error
    console.error("error:", error); // for debug
    Promise.reject(error);
  }
);

// respone 拦截器 axios 的一些配置
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // Some example codes here:
    // code == 0: success
    if (res.status === 200) {
      console.log(res)
      return res.data
      // const data: ResponseData = res.data
      // if (data.ret_code === 0) {
      //   return data.data;
      // } else {
      //   console.log(data);
      //   ElMessage({
      //     message: data.message,
      //     type: "error"
      //   });
      // }
    } else {
      ElMessage({
        message: "网络错误!",
        type: "error"
      });
      return Promise.reject(new Error(res.data.message || "Error"));
    }
  },
  (error: any) => Promise.reject(error)
);

export default service;
