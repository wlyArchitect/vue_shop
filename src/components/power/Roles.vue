<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 第一行，添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row}}</pre> -->
            <el-row
              :class="['bdBottom', i1 === 0 ? 'bdTop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限-->
              <el-col :span="6">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限-->
              <el-col :span="18">
                <!-- 通过for循环，嵌套渲染二级权限-->
                <el-row
                  :class="[i2 == 0 ? '' : 'bdTop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item1.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染出所有的 el-tag  三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :closable="true"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 显示内容：显示为一个树形结构 
        node-key 表示选中节点，拿到的是rightsList的id属性的值
    -->
      <el-tree
        :data="rightsList"
        :props="treeRightProps"
        :show-checkbox="true"
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultRightKeys"
        ref="treeRightRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="40%"
      @close="addRoleDialogClosed"
    >
      <el-form
        :model="addRoleForm"
        :rules="addRoleRules"
        ref="addRoleRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleSubmitBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="40%"
      @close="editRoleDialogClosed('editRoleRef')"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleRules"
        ref="editRoleRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleSubmitBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      //角色列表
      rolesList: [],
      //分配权限的对话框的显示和隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList: [],

      //树形控件的属性绑定对象
      treeRightProps: {
        //显示的内容所对应的属性
        label: 'authName',
        //父子节点的嵌套节点
        children: 'children',
      },
      //默认选中的节点的id值
      defaultRightKeys: [],
      //当前即将分配权限的角色id
      roleId: '',

      //添加角色的对话框的设定显示与隐藏
      addRoleDialogVisible: false,
      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      //添加角色的表单验证规则
      addRoleRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
        ],
      },

      //编辑角色的表单，验证规则
      editRoleForm: {},
      editRoleDialogVisible: false,
      editRoleRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    //获取所有的角色列表数据
    this.getRolesList()
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      //返回的数据：角色带有的权限
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$messag.error('获取角色信息失败')
      this.rolesList = res.data
      console.log('角色列表：', res.data)
    },
    //删除权限(right)： 角色  权限id
    async removeRightById(role, rightId) {
      const resConfirm = await this.$confirm(
        '删除这个权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((cancel) => cancel)
      if (resConfirm !== 'confirm') return this.$message.info('取消了删除')
      //删除权限的请求发起
      // roleId角色id  right权限id  roles/:roleId/:rights/:rightId
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200)
        return this.$message.error('删除三级权限失败')
      //删除成功，重新设置权限的数据
      this.$message.success('删除成功')
      //直接赋值给当前行
      role.children = res.data
    },
    //展示分配权限的对话框 role代表当前角色
    async showSetRightDialog(role) {
      //保存roleId角色id
      this.roleId = role.id
      //获取所有权限列表的数据
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限数据失败')
      this.rightsList = res.data
      console.log('rightsList:', this.rightsList)
      //递归获取三级节点的id
      this.getThreeLeafKeys(role, this.defaultRightKeys)
      this.setRightDialogVisible = true
    },
    //递归获取三级节点的id,保存到defaultRightKeys数组中
    getThreeLeafKeys(node, arr) {
      //包含children说明不是三级节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach((item) => {
        this.getThreeLeafKeys(item, arr)
      })
    },
    //每次关闭分配权限的按钮，记得清空原来的权限id
    setRightDialogClosed() {
      this.defaultRightKeys = []
    },
    //点击分配权限的对话框的确定按钮
    async allotRights() {
      //拿到所有选中的节点的key值
      //拿到所有半选中的节点
      const keys = [
        ...this.$refs.treeRightRef.getCheckedKeys(),
        ...this.$refs.treeRightRef.getHalfCheckedKeys(),
      ]
      console.log(keys)
      //转成以字符串, 拼接的字符串
      //需要当前角色id，传入权限id的字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `/roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200)
        return this.$message.error('当前角色分配权限失败')
      //成功分配,刷新角色列表的数据
      this.$message.success('当前角色分配权限成功')
      this.setRightDialogVisible = false
      this.getRolesList()
    },

    //添加角色的点击事件
    addRole() {
      this.addRoleDialogVisible = true
    },
    //关闭添加角色的对话框重置表单内的数据
    addRoleDialogClosed() {
      //通过表单的ref属性，重置所有prop属性的表单项
      this.$refs.addRoleRef.resetFields()
    },
    //点击添加角色的确定按钮
    addRoleSubmitBtn() {
      //验证表单的数据
      this.$refs.addRoleRef.validate(async (valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        //验证成功，发送请求到后台
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        //添加角色成功
        this.$message.error('添加角色成功')
        this.getRolesList()
        this.addRoleDialogVisible = false
      })

      this.addRoleDialogVisible = false
    },
    //删除角色
    async deleteRoleById(id) {
      const confirmResult = await this.$confirm(
        '确定删除该角色, 是否继续?',
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
      //
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      //进行删除操作
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      //删除成功
      this.$message.success('删除角色成功')
      this.getRolesList()
    },

    //编辑角色
    //1.对话框的显示,并回显角色的数据
    async editRoleDialog(id) {
      this.editRoleDialogVisible = true
      //通过id拿到角色的数据进行回显
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200)
        return this.$message.error('获取角色信息失败')
      this.editRoleForm = res.data
    },
    editRoleDialogClosed(editRoleRef) {
      this.$refs[editRoleRef].resetFields()
    },
    editRoleSubmitBtn() {
      //验证表单数据
      this.$refs.editRoleRef.validate(async (valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        //验证成功，发送请求到后台
        const { data: res } = await this.$http.put(
          `roles/${this.editRoleForm.roleId}`,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        //编辑成功
        this.editRoleDialogVisible = false
        this.$message.success('编辑角色信息成功')
        this.getRolesList()
      })
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
//用于居中显示
.vcenter {
  display: flex;
  align-items: center;
}
</style>