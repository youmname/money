// src/main.js —— 项目入口文件（浏览器加载后首先执行的 JS）（创建 App + 挂载路由）
// 导入 Vue 的 createApp，用来创建一个 Vue 应用实例
import { createApp } from "vue"; // 创建 Vue 应用的函数

// 导入根组件 App（所有页面的外壳）
import App from "./App.vue"; // 根组件

// 导入路由实例（控制页面切换）
import router from "./router/index.js"; // Vue Router 路由配置

// 导入全局样式（你 assets/main.css 里可以放全局通用样式）
import "./assets/main.css"; // 全局 CSS

// 创建 Vue 应用实例
const app = createApp(App); // 把 App 作为根组件

// 使用路由（让 <router-view/> 能生效）
app.use(router); // 挂载路由

// 挂载到 index.html 里的 <div id="app"></div>
app.mount("#app"); // 启动应用
