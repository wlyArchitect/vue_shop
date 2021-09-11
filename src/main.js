import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
//导入icon
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false
//设置axios请求的带上默认路径
axios.defaults.baseURL ='http://127.0.0.1:8888/api/private/v1/';
//先设置一个axios拦截器
axios.interceptors.request.use(config=>{
   //console.log(config);
   //设置请求头 Authorization  
   config.headers.Authorization = window.sessionStorage.getItem('token');
   //必须返回config
   return config;
});
//挂载到Vue中
Vue.prototype.$http=axios;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
