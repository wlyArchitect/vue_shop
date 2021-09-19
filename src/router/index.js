import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Category from '../components/goods/Category.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import GoodsAdd from '../components/goods/Add.vue'
import GoodsEdit from '../components/goods/Edit.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode:'hash', //hash兼容性好,带/#/    history带/,兼容性略差
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
         },
         //权限管理模块： 权限 角色
         {
           name:'rights',
           path:'/rights',
           component:Rights
         },
         {
           name:'roles',
           path:'/roles',
           component:Roles
         },
         //商品管理模块：商品分类
         {
           name:'Category',
           path:'/categories',
           component:Category
         },
         {
           name:'params',
           path:'/params',
           component: Params,
         },
         {
           name:'goods',
           path:'/goods',
           component: GoodsList
         },
        {
          name: 'goodsAdd',
          path: '/goods/add',
          component: GoodsAdd,
        },
        {
          name: 'goodsEdit',
          path: '/goods/edit',
          component: GoodsEdit,
        },
        {
          name: 'order',
          path: '/orders',
          component: Order,
        },
        {
          name:'report',
          path:'/reports',
          component:Report,
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
