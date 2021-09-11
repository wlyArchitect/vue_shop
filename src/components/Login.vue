<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="这是一张logo图片" />
      </div>
      <!-- 登录表单区  ref -->
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
        label-width="60px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <!-- 传入ref的名字 -->
          <el-button type="primary" @click="submitForm('loginForm')"
            >登录</el-button>
          <el-button type="info" @click="resetForm('loginForm')"
            >重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //登录表单的绑定数据对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //定义表单的数据验证规则
      rules: {
        //属性名就是表单输入框的prop属性
        username: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async (valid,object) => {  //对整个表单进行校验的方法,valid表示是否验证成功
        //回调的箭头函数
        console.log(valid,"true表示验证成功");
        console.log(object,"未验证成功的字段");
        if (!valid) return;
        //返回结果如果是promise  await简化操作，只能用于async修饰的方法中
        // const result = await this.$http.post('login',this.loginForm);
        //使用解构操作，对于result.data命名为res
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200)
          return this.$message({
            type: "error",
            message: "登录失败",
            showClose: true, //带有关闭的×
          });
        this.$message.success("登录成功");
        //1.将登录成功后的token保存到客户端的sessionStorage中
        //1.1 项目中除了登录以外的Api接口，都必须要有登录后的权限
        //1.2 token只应在当前网页打开时生效，
        //通过编程式导航栏跳转到后台主页 /home
        window.sessionStorage.setItem('token',res.data.token);
        this.$router.push('/home');
      });
    },
    resetForm(formName) {
      //通过ref找到表单，调用重置方法
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  //移动
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%; //距离父div的距离
  transform: translate(-50%, -50%); //根据自身div盒子的高度来确定百分比
  background-color: #fff; //设置背景色
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  //弹性布局，尾部对齐
  display: flex;
  justify-content: flex-end;
}
</style>