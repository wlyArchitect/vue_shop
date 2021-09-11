<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout()">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏
           动态设置侧边栏的大小
       -->
      <el-aside :width="isCollapce?'64px':'200px'">
        <!-- 菜单的切换与展开 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域
            unique-opened 表示每次是否只展开一个
            collapse 是否折叠 true
            collapse-transition 折叠动画是否需要
            router 激活路由模式 点击菜单跳转到 :index所对应的路径
            default-active 高亮对应的菜单地址，传入动态的地址
         -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapce"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item 
            :index="'/'+subItem.path" 
            v-for="subItem in item.children" 
            :key="subItem.id"
            @click="saveNative('/'+subItem.path)"
            >
              <i class="el-icon-menu"></i>
              {{subItem.authName}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- -->
      <el-container>
        <el-main>
              <router-view></router-view>          
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  //创建dom等调用获取菜单的方法
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    //由于返回值promise  解构赋值且最近方法async修饰
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if(res.meta.status !==200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      console.log(res.data);
    },
    //点击按钮，切换菜单的折叠与展开
    toggleCollapse(){
         this.isCollapce = !this.isCollapce;
    },
    saveNative(path){
       window.sessionStorage.setItem('activePath',path);
       this.activePath = path;
    }
  },
  data() {
    return {
      //左侧菜单数据
      menuList:[],
      //拿到一级菜单的id
      iconObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapce:false,
      activePath:'',
    }
  },
}
</script>
<style scoped lang="less">
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  //两端显示
  justify-content: space-between;
  //内间距0
  padding-left: 0px;
  align-items: center;
  //文字颜色
  color: #fff;
  //文字大小
  font-size: 20px;
  > div {
    //设置布局flex 居中显示
    display: flex;
    align-items: center;
    span {
      margin-left: 15px; //文字外距离图片间距
    }
  }
}
//侧边栏
.el-aside {
  background-color: #333744;
  .toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 20px;
    color:#fff;
    text-align: center;
    letter-spacing: 0.2em;//设置|之间的间距
    cursor: pointer;
  }
  //默认自带 border-right: solid 1px #e6e6e6;
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
//设置图标与文本的间距
.iconfont{
   margin-right: 10px;
}
</style>