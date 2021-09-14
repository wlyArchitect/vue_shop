<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部的警告区-->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 选择商品分类区域 
           clearable 清空输入的内容
      -->
      <el-row class="cat_opt" :gutter="10">
        <el-col :span="2.5">
          <span>选择商品分类：</span>
        </el-col>
        <el-col :span="10">
          <el-cascader
            :options="cateList"
            :props="cateProps"
            v-model="selectKyes"
            @change="handlerChange"
            clearable
            label-width="70px"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页
           v-model 会自动绑定<el-tab-pane>的name属性的值
           v-model 初始化第一次被激活的name值

       -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数的表格 -->
          <el-table :data="manyTableData" :stripe="true" :border="true">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 
                  输入的文本框 
                -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性的表格 -->
          <el-table :data="onlyTableData" :stripe="true" :border="true">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 
                  输入的文本框 
                -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加(参数/属性)对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 表单 -->
      <el-form>
        <el-form
          :model="addForm"
          :rules="addRules"
          ref="addRef"
          label-width="80px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改 的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 表单 -->
      <el-form>
        <el-form
          :model="editForm"
          :rules="editRules"
          ref="editRef"
          label-width="80px"
        >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  created() {
    this.getCateList()
  },
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择框的数据对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        //鼠标悬停触发子菜单
        expandTrigger: 'hover',
      },
      //选中的级联选择框双向绑定的数组id
      selectKyes: [],

      //被激活的页签名称
      activeName: 'many',

      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],

      //控制添加参数对话框的显示和隐藏
      addDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addRules: {
        attr_name: [
          {
            required: true,
            message: '请输入内容',
            trigger: 'blur',
          },
        ],
      },

      //控制修改参数对话框的显示和隐藏
      editDialogVisible: false,
      editForm: {},
      editRules: {
        attr_name: [
          {
            required: true,
            message: '请输入内容',
            trigger: 'blur',
          },
        ],
      },



    }
  },
  methods: {
    //获取所有的商品分类的列表信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 },
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类信息失败！')
      //获取数据成功
      this.cateList = res.data
    },
    //监听级联选择框的选择
    async handlerChange() {
      this.getParamsData()
    },
    //tab页签点击事件的处理函数
    handleClick() {
      //显示动态参数，静态属性
      this.getParamsData()
    },
    //获取参数的列表数据
    async getParamsData() {
      //只能选择三级分类,才请求后台获取数据
      //说明选择的不是三级分类
      if (this.selectKyes.length !== 3) {
        this.selectKyes = [];
        //清空内容
        this.manyTableData=[];
        this.onlyTableData=[];
        return
      }
      //通过计算属性获取三级分类的id
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          //many 获取的是动态参数  only获取的是静态属性
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('获取参数列表失败')
      //获取参数成功
      //进行一些处理
      res.data.forEach((item) => {
        //将attr_vals属性的字符串转成数组 
        item.attr_vals =
            item.attr_vals.trim() == '' ? [] : item.attr_vals.split(' ')
        //控制文本框的输入和隐藏
        item.inputVisible = false; 
        //控制文本框输入的值
        item.inputValue = '';
      });

      console.log(res.data)
      //获取的是动态参数的数据
      if (this.activeName == 'many') this.manyTableData = res.data
      else this.onlyTableData = res.data
    },
    //关闭对话框重置表单内容
    addDialogClosed() {
      this.$refs.addRef.resetFields()
    },
    //
    async addParams() {
      this.$refs.addRef.validate(async (valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        //验证通过，发送请求

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        //添加成功
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //点击按钮，显示修改参数的对话框
    async showEditDialog(attr_id) {
      //三级分类id下的属性id
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          //动态参数 还是 静态属性
          params: { attr_sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      //获取数据成功
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editRef.resetFields()
    },
    //编辑
    editParams() {
      this.$refs.editRef.validate(async (valid, obj) => {
        if (!valid) return
        //验证成功
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        //修改成功
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    //删除操作
    async deleteParam(attr_id) {
      //消息确认弹框也是 promise类型的返回值
      const confirmResult = await this.$confirm(
        '确定删除该参数, 是否继续?',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning',
          //取消按钮的自定义类名
          cancelButtonClass: 'btn-custom-cancel',
        }
      ).catch((value) => {
        //cancel 取消
        return value
      })
      if (confirmResult !== 'confirm') return this.$message.info('取消成功')
      //进行删除操作
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      //删除成功
      this.$message.success('删除成功')
      this.getParamsData()
    },
    
    //文本框失去焦点，或者按下回车enter
     handleInputConfirm(row){
      //输入内容无效，清空内容
      if(row.inputValue.trim().length===0){
        row.inputValue = '';
        //隐藏文本输入框
      row.inputVisible = false;
        return
      }
      //输入内容有效，进行后续操作
      row.attr_vals.push(row.inputValue.trim());
      //保存到数据库种
      this.saveAttrVals(row);
      row.inputValue='';//添加完内容以后必须清空，因为如果不清空，则发送异步请求，由于之前隐藏了输入框，那么失去焦点会再次调用这整个方法，进行添加操作
      //隐藏文本输入框
      row.inputVisible = false;
    },
    //显示文本输入框
    showInput(row){
      row.inputVisible = true;
      //-----让文本框自动获取焦点
      //$nextTick方法的作用，就是当页码上的元素被重新渲染以后，才会回调指定的函数
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
          console.log(this.$refs.saveTagInput);//表示一个组件
          console.log(this.$refs.saveTagInput.$refs.input);//拿到原生DOM input输入框
      });
    },
    //删除对应的参数和属性
    handleClosed(i,row){
        //删除，渲染界面
        row.attr_vals.splice(i,1);
        //保存到数据库中
        this.saveAttrVals(row);
    },
    //将对attr_vals的操作保存到数据库种
    async saveAttrVals(row){
      //需要发送请求，保存这次操作
      const{data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' '),
      })
      if(res.meta.status!==200) return this.$message.error('修改失败');
      this.$message.success('修改参数项成功');
    }
  },
  //计算属性
  computed: {
    //如果按钮需要被禁用,返回true
    isBtnDisabled() {
      if (this.selectKyes.length !== 3) {
        return true
      }
      return false
    },
    //当前选中的三级分类的id
    cateId() {
      if (this.selectKyes.length === 3) {
        //返回这个id
        return this.selectKyes[2]
      }
      return null
    },
    //动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  //上下15px 左右0px
  margin: 15px 0px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag{
  width: 90px;
}
</style>