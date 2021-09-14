<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部搜索，添加区-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 
           https://github.com/MisterTaki/vue-table-with-tree-grid
      
      -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text=""
        border
        class="treeTable"
      >
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" type="primary"
            @click="editCate(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button size="mini" icon="el-icon-delete" type="danger"
          @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
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

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- v-model 必须绑定一个数组 -->
          <!-- clearable 可以清空输入的内容 -->
          <!-- change-on-select 可以选择父节点 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addCateSubmitBtn">确 定</el-button>
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 编辑操作 -->
    <el-dialog
      title="提示"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateRules"
        ref="editCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editCateSubmitBtn">确 定</el-button>
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
export default {
  name: 'Category',
  data() {
    return {
      //
      catName: '',
      //商品分类列表的数据，默认空
      cateList: [],
      //查询条件
      queryInfo: {
        pagenum: 1,
        pagesize: 5,
      },
      //总数据条数
      total: 0,
      //为tree-table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示，当前列定义为模板列
          type: 'template',
          //模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          //表示，当前列定义为模板列
          type: 'template',
          //模板名称
          template: 'order',
        },
        {
          label: '操作',
          //表示，当前列定义为模板列
          type: 'template',
          //模板名称
          template: 'opt',
        },
      ],

      //控制添加分类的对话框的显示和隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据
      addCateForm: {
        cat_name: '', //添加的分类名称
        cat_pid: 0, //分类父id, 给一个默认值0
        cat_level: 0, //分类等级 给一个默认1级分类，从0开始计数
      },
      //添加分类的表单验证规则
      addCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur',
          },
        ],
      },

      //父级分类的数据列表
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //选中的父级分类的id数组
      selectedKeys: [],

      //编辑操作
      editCateForm:{},
      editCateDialogVisible:false,
      editCateRules:{
        cat_name:[
          {
            required:true,
            messaeg:'请输入分类名称',
            trigger:'blur'
          }
        ]
      },

    }
  },
  created() {
    //获取商品分类的数据
    this.getCateList()
  },
  methods: {
    async getCateList() {
      //get请求 params携带参数
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类信息失败！')
      //获取成功
      console.log('商品分类', res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      //
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    //点击按钮，显示分类的对话框
    addCate() {
      //获取父级分类的数据列表数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //关闭对话框时，清空表单数据
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      //父级分类id
      this.addCateForm.cat_pid = 0
      //为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取父级分类数据失败')
      //获取成功
      this.parentCateList = res.data
      console.log('父级分类的数据', this.parentCateList)
    },
    //监听选择项的变化
    parentCateChanged() {
      console.log('选中的数据', this.selectedKeys)
      //如果 selectKeys数据中的length大于0，证明选中了父类分类
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        //父级分类id
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    //点击添加分类的 确定按钮
    async addCateSubmitBtn() {
      //验证表单的数据
      this.$refs.addCateRef.validate(async (valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        this.addCateDialogVisible = false
        //发起网络请求，进行保存分类的操作
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        //添加分类成功
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //编辑操作
    async editCate(cat_id){
       const {data:res} = await this.$http.get(`categories/${cat_id}`);
       if(res.meta.status!==200) return this.$message.error('获取分类信息失败');
       this.editCateForm = res.data;
       console.log(this.editCateForm,'编辑操作');
       this.editCateDialogVisible=true;
    },
    editCateDialogClosed(){
        this.$refs.editCateRef.resetFields();
    },
    editCateSubmitBtn(){
       //验证表单数据
      this.$refs.editCateRef.validate(async (valid, obj) => {
         if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
         }
         //
         const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name,
          }
        )
        if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
        //编辑成功
        this.editCateDialogVisible = false
        this.$message.success('编辑分类信息成功')
        this.getCateList();
      })
    },
    //删除分类
    async deleteCate(cat_id){
      const confirmResult = await this.$confirm(
        '确定删除该分类, 是否继续?',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning',
          //取消按钮的自定义类名
          cancelButtonClass: "btn-custom-cancel"
        }
      ).catch((value) => {
        //cancel 取消
        return value
      });
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      //进行删除操作
      const { data: res } = await this.$http.delete(`categories/${cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      //删除成功
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  },
}
</script>

<style lang="less">
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}

</style>