import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
//导入全局自定义样式表
import './assets/css/global.css'
//导入【菜单】的icon图标的css
import './assets/fonts/iconfont.css'

//导入TreeTable 树表格插件
import TreeTable from 'vue-table-with-tree-grid'
//将树表格 注册为全局可用组件
Vue.component('tree-table', TreeTable)

//导入 QuillEditor 富文本编辑器 插件
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//将富文本编辑器注册为全局可用组件
Vue.use(VueQuillEditor)

//注册全局过滤器：将时间戳转成日期显示
Vue.filter('dataFormat',function(originVal){
   //时间戳*1000 日期补上19天正常
   const date = new Date(originVal*1000);
   const year = date.getFullYear();
   const month = (date.getMonth()+1+'').padStart(2,'0');
   const day = (date.getDay()+19+'').padStart(2,'0');
   const hh = (date.getHours()+'').padStart(2,'0');
   const mm = (date.getMinutes()+'').padStart(2,'0');
   const ss = (date.getSeconds()+'').padStart(2,'0');
   return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
});

Vue.config.productionTip = false
//设置axios请求的带上默认路径
axios.defaults.baseURL ='http://127.0.0.1:8888/api/private/v1/';
//先设置一个axios拦截器，给所有的请求加上一个请求头参数Authorization
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
