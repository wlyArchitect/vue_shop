<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索和添加区域 
           :gutter="20" 设置间距 
           （分栏间隔）
      -->
      <el-row :gutter="20">
        <!-- 设置 :span最多24  el-col平分这24-->
        <el-col :span="8">
          <!-- clearable属性带有清空输入框     clear事件，清空输入内容时回调一个函数-->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserdialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 
           border 带边框
           stripe 带斑马纹
           给表格中传入一个数组数据
      -->
      <el-table :data="userList" :stripe="true" :border="true">
        <!--
              每列的数据  prop就是列名，数组中每行数据的属性名
          -->
        <el-table-column type="index"></el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="150"
        ></el-table-column>
        <el-table-column prop="mobile" label="电话" width="150">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="150">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态" width="100">
          <!-- 使用作用域插槽 会覆盖 prop  双向绑定mg_state -->
          <!-- 
             slot-scope="scope" 取到当前单元格
             scope.row 是当前这一行的数据 
             scope.$index 拿到当前行的index
          -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
              >删除</el-button
            >
            <!-- 设置文字提示  enterable:鼠标是否可进入到 tooltip提示 中 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页底部数据显示栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框  
         :visible.sync  控制对话框的显示和隐藏
         :before-close
    -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserdialogVisible"
      width="50%"
      @close="closeAddUserWin"
    >
      <!-- 内容主体区域 
           model 表单数据对象
           rules 表单验证规则对象
      -->
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button type="primary" @click="addUserBtn">确定</el-button>
        <el-button @click="addUserdialogVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <!--
     修改用户的对话框
   -->
    <el-dialog
      title="提示"
      :visible.sync="editUserdialogVisible"
      width="50%"
      @close="closeEditUserWin"
    >
      <el-form
        :model="editUserForm"
        ref="editUserRef"
        :rules="editUserRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editUserBtn">确 定</el-button>
        <el-button @click="editUserdialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  created() {
    this.getUserList()
  },
  data() {
    //验证邮箱的规则（自定义）
    let checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      //合法的邮箱
      if (regEmail.test(value)) return cb()
      //cb回调方法中提供一个错误对象
      cb(new Error('请输入合法的邮箱'))
    }
    //验证手机号的规则（自定义）
    let checkPhone = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      //合法的手机号
      if (regMobile.test(value)) return cb()
      cb(new Error('请输入合法的手机号'))
    }

    //---数据---
    return {
      queryInfo: {
        //搜索的内容
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示的数据条数
        pagesize: 5,
      },
      //存放用户列表数据
      userList: [],
      //用户列表总数
      total: 0,

      //控制添加用户对话框的显示和隐藏
      addUserdialogVisible: false,
      //控制修改用户对话框的显示和隐藏
      editUserdialogVisible: false,

      //添加用户的表单数据,存的是输入框中v-model的addUserForm的属性
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加用户的表单验证规则对象
      //验证的是表单中prop中的属性
      addUserRules: {
        //trigger: 'blur' 表示光标离开
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3到10个字符之间',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: '用户名长度在6到15个字符之间',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          {
            //自定义规则
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
          {
            validator: checkPhone,
            trigger: 'blur',
          },
        ],
      },

      //编辑用户的表单数据
      editUserForm: {},
      //编辑用户的表单数据的验证规则
      editUserRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          {
            //自定义规则
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
          {
            validator: checkPhone,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    async getUserList() {
      //结构结果的data 命名为res
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取用户信息失败！')
      console.log(res)
      debugger
      this.userList = res.data.users
      this.total = res.data.total
    },

    //监听pagesize (每页条数)改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getUserList()
    },
    //检测switch开关状态的变化
    async userStateChanged(userinfo) {
      console.log(userinfo)
      //获取这一行的id
      let uid = userinfo.id
      let type = userinfo.mg_state
      //传入后台进行修改客户状态的方法
      //解构结果的data命名为res   后台路径user/:uid/state/:type
      const { data: res } = await this.$http.put(`users/${uid}/state/${type}`)
      if (res.meta.status !== 200) {
        //把客户状态重置回去
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新客户状态失败')
      }
      this.$message.success('更新客户状态成功')
    },
    //监听 添加用户的对话框的关闭事件
    closeAddUserWin() {
      //拿到整个表单的ref属性的值，重置表单的内容
      // this.$refs['addUserRef'].resetFields();
      this.$refs.addUserRef.resetFields()
    },
    //添加用户确定按钮
    addUserBtn() {
      this.$refs.addUserRef.validate(async (valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        //发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        //添加成功的话
        //1.隐藏对话框
        this.addUserdialogVisible = false
        //2.刷新用户列表
        this.getUserList()
      })
    },
    //点击编辑按钮,展示编辑的对话框
    async showEditDialog(id) {
      //设置对话框的显示
      this.editUserdialogVisible = true
      //通过id获取用户信息  或者'users'+id
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败')
      //赋值给编辑输入框
      this.editUserForm = res.data
      console.log(this.editUserForm)
    },
    //监听 关闭修改用户信息对话框的事件
    closeEditUserWin() {
      //todo 验证的结果重置，不然打开还是上次的表单验证的提示
      this.$refs.editUserRef.resetFields()
    },
    //编辑用户的对话框的确认按钮
    editUserBtn() {
      //隐藏窗口
      this.editUserdialogVisible = false
      //验证表单数据
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) return this.$message.error('用户信息有误')
        //发起修改用户信息的请求
        const { data: res } = await this.$http.put(
          `users/${this.editUserForm.id}`,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile,
          }
        )
        if (res.meta.status !== 200) this.$message.error('更新用户信息失败')
        //更新成功弹出提示并刷新列表
        this.$message.success('更新用户信息成功')
        this.getUserList()
      })
    },
    //删除用户
    async deleteUserById(id) {
      const confirmResult = await this.$confirm(
        '确定删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((value) => {
        //cancel 取消
        return value
      })
      //todo 还有一个链型函数 then是针对点击确认confirm    catch是针对点击取消cancel
      //接收的是then的返回值
      console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      //进行删除的操作
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      //记录总页数,
      //此时已经实现删除操作，所以total的值需要减1，Math.ceil是向上取整，保证始终大于等于1

      // 6条数据   5条1页  删除最后1条
      debugger
      // 根据总的数据条数total和一页显示的数据条数，得到总页数
      let lastPage = Math.ceil(this.total / this.queryInfo.pagesize)
      // 判断当前页是否是最后一页 是的话自减1页，然后发送请求获取数据
      if (this.queryInfo.pagenum === lastPage) this.queryInfo.pagenum--
      //重新获取数据
      this.getUserList()
    },
  },
}
</script>

<style lang="less" scoped>
</style>