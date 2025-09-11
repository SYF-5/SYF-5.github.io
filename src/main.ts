import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
//引入初始化样式文件
import '@/styles/element/common.scss'

const pinia = createPinia();
const app = createApp(App);

// 在一个应用实例上安装所有插件
app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.mount('#app');