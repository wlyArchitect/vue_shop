<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
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
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchOrder"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 显示数据的表格 -->
      <el-table :data="ordersList" border stripe height="500">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status == '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <!-- 使用全局过滤器，设置时间 -->
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="openAddressEditWin"
              >修改地址</el-button
            >
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="openProgessWin"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页底部数据显示栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!--
       添加地址的对话框
   -->
    <el-dialog
      title="修改地址"
      :visible.sync="addAddressVisable"
      width="50%"
      @close="addAddressClosed"
    >
      <!-- 内容区域-->
      <el-form
        :model="addAddressForm"
        :rules="addAddressRules"
        ref="addAddressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityDate" v-model="addAddressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button type="primary" @click="addAddressVisable = false"
          >确定</el-button
        >
        <el-button @click="addAddressVisable = false">取消</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progessVisable" width="50%">
      <!-- 内容区域-->
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
//
import cityDate from './citydata.js'
export default {
  name: 'Order',
  created() {
    this.getOrdersList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      ordersList: [],

      addAddressVisable: false,
      addAddressForm: {
        //级联选择器
        address1: [],
        address2: '',
      },
      addAddressRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      cityDate: cityDate,

      //物流对话框
      progessVisable: false,
      progressInfo: [],
    }
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取订单列表失败')
      console.log(res.data)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    //监听每页的大小
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    //监听页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    //
    searchOrder() {
      console.log(this.queryInfo.query)
      this.getOrdersList()
    },
    //打开添加地址的对话框
    openAddressEditWin() {
      this.addAddressVisable = true
    },
    //关闭对话框
    addAddressClosed() {
      //清空表单的数据
      this.$refs.addAddressRef.resetFields()
    },

    //打开物流对话框
    async openProgessWin() {
      //测试物流单号 70365716896101
      const { data: res } = await this.$http.get('/kuaidi/')
      if (res.meta.status !== 200)
        return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progessVisable = true
    },
  },
}
</script>

<style lang="less" scoped>
//设置时间线(物流信息)的样式
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
//设置级联选择器的宽度
.el-cascader {
  width: 100%;
}
</style>