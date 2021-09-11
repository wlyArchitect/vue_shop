import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  model:'hash', //hash兼容性好,带/#/    history带/,兼容性略差
  routes:[
    { name: 'index', path: '/', redirect: '/login' },
    { name: 'login', path: '/login', component: Login },
    { name: 'home',
      path: '/home', 
      component: Home,
      //重定向到 /welcome
      redirect: '/welcome',
      children:[
         {
           name:'welcome',
           path:'/welcome',
           component:Welcome,
         },
         {
           name:'users',
           path:'/users',
           component:Users
         }
      ]
    }
  ]
});
//全局路由前置守卫
router.beforeEach((to, from, next) => {
  //如果访问登录页，直接放行
  if (to.path === '/login') return next();
  //判断是否有token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next("/login");
  //有token发行
  next();
});

export default router
