// Vue 引入
import { createApp } from 'vue'

// Element Plus 引入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Router 引入
import router from './router/index.js'

// App 组件引入
import App from './App.vue'

// 初始化
const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
