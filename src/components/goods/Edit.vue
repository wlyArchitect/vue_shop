<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--
      本界面：
          将 steps步骤条和tabs标签页 动态的绑定到了一块
          级联选择器的使用
          form表单的使用
    -->
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- alert警告 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!--
        TODO 1
         Steps步骤条 区域
           :active 激活的是第 几 项，从0开始计数,只能接收 数字
                   0对应第一个<el-step>，依次往后推理
           :space 每项之间的间距
      -->
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--
         label-position="top" 设置表单域标签label的位置，默认left
      -->
      <el-form
        :model="editGoodsForm"
        :rules="editGoodsRules"
        ref="editGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <!--
          TODO 2
          tab栏区域 （切换栏）
            v-model 激活的el-tab-pane的name属性
            before-leave 切换标签之前的钩子，默认true，若传入的函数，则默认带activeName, oldActiveName
          @tab-click="tabClicked"

      -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
        >
          <!-- name的值会传给 v-model的属性，:name用于数字  -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="editGoodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="editGoodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="editGoodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器，
                  :options 绑定的是数据源
                  :proprs 定义级联的规则
                  v-model绑定的是级联选择的值，是一个数组
                  clearable 可以清空
              -->
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="editGoodsForm.goods_cat"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 动态参数
                注意：动态参数的每项item的值attr_vals是一个数组
          -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项
                      获取每个动态参数里面的 attr_vals数组值
              -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableDateList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <!-- border表示带边框的复选款 -->
                <el-checkbox
                  border
                  :label="cb"
                  v-for="(cb, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 静态属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableDateList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--
               upload 上传
                   action 表示图片要上传的后台ip地址
                   on-preview 预览事件，用来预览图片
                   on-remove 移除事件，当删除图片时
                   list-type="picture" 指定当前图片的预览呈现形式
                                       picture 表示带缩略图
                   el-upload没有使用axios请求，而是使用内部的ajax请求，需要设置请求头
                      :headers 设置请求头内容
            -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <!-- 提示信息 -->
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <!--
             TODO 安装依赖 vue-quill-editor 富文本编辑器
          -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="editGoodsForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="editGoodsSubmit"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="这是一张图片" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
//导入lodash依赖
import _ from 'lodash';

export default {
  name: 'GoodsAdd',
  created() {
    //获取三级分类的数据
    this.getCateList();
  },
  mounted(){
    //拿到路由相关的配置信息，从query中取出路由传过来的数据
    const goods_id = this.$route.params.goods_id;
    //根据id查询出商品的数据
    this.getGoodsDate(goods_id);
  },
  data() {
    return {
      //----步骤条区域
      //1.激活项
      activeIndex: '0',

      //表单和表单验证
      editGoodsForm: {
        //基本信息
        goods_name: '',
        //使用数字0存在为空的情况
        goods_price: '0',
        goods_weight: '0',
        goods_number: '0',
        //商品分类的分类数组,用于级联选择器的值  (传到后台是,分割的字符串)
        goods_cat: [],
        //图片临时路径的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        //存储对象{attr_id:'',attr_vals:''}
        //存储的是商品参数和商品属性的值
        //对于商品参数有多个得数组转成字符串(中间空格分割)
        attrs:[],
      },
      editGoodsRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur',
          },
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur',
          },
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur',
          },
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur',
          },
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur',
          },
        ],
      },

      //商品分类列表，用于级联显示
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        child: 'child',
      },

      //动态参数列表
      manyTableDateList: [],
      //静态属性列表
      onlyTableDateList: [],

      //文件上传设置请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //预览图片的url
      previewPath: '',
      previewVisible: false,
    }
  },
  methods: {
    //获取所有的商品分类的列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 },
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类信息失败')
      //获取成功
      this.cateList = res.data
      console.log("商品分类的列表数据",res)
    },
    //监听商品分类的级联选择器的变化
    handleChange() {
      console.log(this.editGoodsForm.goods_cat)
      if (this.editGoodsForm.goods_cat.length !== 3)
        this.editGoodsForm.goods_cat = []
    },
    //监听 离开tab标签页之前 的事件
    beforeTabLeave(activeName, oldActiveName) {
      //console.log("即将离开的标签页"+oldActiveName);
      //console.log("即将进入的标签页"+activeName);
      //在 “基本信息” 栏，也就是第一栏，且未选择 商品三级分类
      /* if (oldActiveName == '0' && this.editGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      } */
    },
    //tab标签页 被选中时触发
    async tabClicked() {
      //访问的是'商品参数'面板
      if (this.activeIndex == 1) {
        //获取 三级分类对应的动态参数 的数据 (attributes属性的意思)
        const { data: res } = await this.$http.get(
          `categories/${this.calcCatId}/attributes`,
          {
            params: { sel: 'many' },
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败')
        //获取 动态参数列表 数据成功
        //TODO 为什么要转成数组？？？
        //是因为动态参数：它的 attr_vals是一个数组,得字符串转成数组用于前台列表的展示
        //将attr_vals 的值(字符串转数组)
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableDateList = res.data
      }
      //访问的是 '商品属性' 面板
      else if (this.activeIndex == 2) {
        //获取 三级分类的静态属性 的数据
        const { data: res } = await this.$http.get(
          `categories/${this.calcCatId}/attributes`,
          {
            params: { sel: 'only' },
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取静态属性失败')
        //TODO 为什么不要转成数组？？？
        //因为 attr_vals就是一个值
        //获取 静态属性列表 数据成功
        this.onlyTableDateList = res.data
        console.log(res.data)
      }
    },
    //预览图片的事件
    handlePreview(file) {
      //获取图片对应的服务器的url路径
      this.previewPath = file.response.data.url
      //显示对话框
      this.previewVisible = true
    },
    //当删除图片时调用的事件 file包括文件的所有信息
    handleRemove(file) {
      //1.获取要删除的图片的临时路径
      console.log('要删除的文件路径:', file)
      const filePath = file.response.data.tmp_path
      //2.从pics数组中，找到这个图片对应的索引值
      //fixme 需要学 findIndex
      const index = this.editGoodsForm.pics.findIndex((p) => p.pic == filePath)
      //3.调用数组的splice方法，把图片信息从数组中删除
      this.editGoodsForm.pics.splice(index, 1)
      console.log(this.editGoodsForm.pics)
    },
    //监听图片上传成功的事件
    handleSuccess(response) {
      //图片上传成功
      if (response.meta.status == 200) {
        console.log(response)
        //1.拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path }
        //2.将图片信息对象，push到pics[]数组中
        this.editGoodsForm.pics.push(picInfo)
        console.log(picInfo)
      }
    },
    //TODO 添加商品的操作
    editGoodsSubmit() {
      //进行数据的校验
      this.$refs.editGoodsFormRef.validate(async(valid, obj) => {
        if (!valid) {
          let errotStr = ''
          Object.keys(obj).forEach(function (key) {
            errotStr += obj[key][0].message + '，'
          })
          errotStr = errotStr.substring(0, errotStr.length - 1)
          return this.$message.error(errotStr)
        }
        //执行添加的逻辑
        //深拷贝(不影响原对象)
        //lodash   cloneDeep(obj)
        const copyGoodsForm = _.cloneDeep(this.editGoodsForm);
        //将三级分类数组 转 字符串
        copyGoodsForm.goods_cat = copyGoodsForm.goods_cat.join(',');
        //处理动态参数
        this.manyTableDateList.forEach(item=>{
          //动态参数是就是商品的参数，它的每个参数都是数组显示,数组转成字符串
          const neweInfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join(" ")};
          this.editGoodsForm.attrs.push(neweInfo);
        })
        //处理静态属性
         this.onlyTableDateList.forEach(item=>{
           const neweInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
           this.editGoodsForm.attrs.push(neweInfo)
        })
        //复制
        copyGoodsForm.attrs = this.editGoodsForm.attrs
        console.log("复制后的提交商品数据",copyGoodsForm);
        console.log("复制后的提交商品数据",typeof copyGoodsForm.goods_price);
        //todo 发送请求到后台，进行添加商品操作
        const {data : res} = await this.$http.post('goods',copyGoodsForm)
        console.log("响应结果",res);
        if(res.meta.status!==201) return this.$message.error(res.meta.msg);
        //添加成功
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },
    //通过商品id 获取商品的信息
    async getGoodsDate(goods_id){
       const { data: res } = await this.$http.get(`goods/${goods_id}`)
       console.log("商品信息",res.data);
       //将商品的attrs的值转成对应的动态参数列表和静态属性列表
       res.data.attrs.forEach((item) => {
          //先判断是动态参数还是静态属性
          if(item.attr_sel=='many'){
            //console.log('many',item.attr_vals,typeof item.attr_vals);
            //字符串转成数组
            item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ');
            this.manyTableDateList.push(item);
          }else if(item.attr_sel=='only'){
            //console.log('only',item.attr_vals,typeof item.attr_vals);
            //由于item静态属性的attr_vals是一个数组，得转成字符串
            this.onlyTableDateList.push(item.attr_vals);
          }
        })
       //fixme 对于三级分类的回显，存在问题

       //回显到对应的form表单中
       this.editGoodsForm = res.data;
       console.log("编辑表单",this.editGoodsForm);
    }
  },
  //计算属性
  computed: {
    //计算三级分类的id
    calcCatId() {
      //这里级联选择器获取的是一个数组
      if (this.editGoodsForm.goods_cat.length === 3) {
        //返回三级分类的id
        return this.editGoodsForm.goods_cat[2]
      }
    },
  },
}
</script>

<style lang="less" scoped>
//设置复选款组的复选款
.el-checkbox {
  //只保留一个右边距
  margin: 0 10px 0 0 !important;
}
//预览图片的样式
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>