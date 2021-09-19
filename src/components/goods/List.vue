<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜搜区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!--
                clearable 可以清空输入框
                @clear 清空时监听
            -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
        ></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <!-- 使用全局过滤器，设置时间 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="编辑">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="goEditpage(scope.row.goods_id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row)"
              >删除</el-button
            >
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
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data() {
    return {
      //查询参数
      queryInfo: {
        //搜索内容
        query: '',
        //当前页数
        pagenum: 1,
        //页码大小
        pagesize: 5,
      },
      //存放商品列表数据
      goodsList: [],
      //总条数
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品信息失败')
      //获取成功
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
    },
    //监听页码大小的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //监听页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //
    async removeById(row) {
      const goods_id = row.goods_id;
      const confirmResult = await this.$confirm(
        `确定删除${row.goods_name}, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
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
      const { data: res } = await this.$http.delete(`goods/${goods_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')

      // 根据总的数据条数total和一页显示的数据条数，得到总页数
      let lastPage = Math.ceil(this.total / this.queryInfo.pagesize);
      // 判断当前页是否是最后一页 是的话自减1页，然后发送请求获取数据
      if (this.queryInfo.pagenum === lastPage) this.queryInfo.pagenum--;
      this.getGoodsList()
      this.$message.success('删除成功')
    },

    //跳转到商品添加界面
    goAddpage(){
       this.$router.push('/goods/add');
    },
    goEditpage(id){
      //想要传递params参数，必须通过路由的name
      //但是query会暴露参数到请求栏地址上
       this.$router.push({
         //path:'/goods/edit',
         name:'goodsEdit',
         params:{
           goods_id:`${id}`
         }
       });
    },
  },
}
</script>

<style lang="less" scoped>
</style>