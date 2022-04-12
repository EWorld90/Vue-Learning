import axios from "axios"
import { ElMessage } from "element-plus"

import router from '../router/index.js'

const axiosRequest = axios.create({
    baseURL: 'http://127.0.0.1:8080',
    timeout: 5000,
})

// 请求拦截器配置
axiosRequest.interceptors.request.use(function (config) {
    // 除了登录以外的所有请求前添加 Token
    if (config.url != '/login') {
        config.headers.Token = localStorage.getItem('token')
    }

    return config
})

// 响应拦截器配置
axiosRequest.interceptors.response.use(function (response){
    // 响应为 401 时为 Token 不存在或过期，跳转回登录界面
    if (response.data.status === 401) {
        ElMessage({
            type: 'error',
            message: '用户登录信息过期',
            duration: 3000,
        })

        localStorage.removeItem('userName')
        localStorage.removeItem('token')
        router.push('/login')

        return null
    }

    return response
})

export default axiosRequest