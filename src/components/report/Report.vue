<template>
  <div>
      <!--
          下载 echarts图表

      -->
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报表管理</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
//导入图表区
import * as echarts from 'echarts'
import _ from 'lodash';

export default {
  name: 'Report',
  created() {},
  data() {
    return {
      //需要合并的数据
      options: {
        title: {
          text: '用户来源',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3',
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
      },
    }
  },
  //此时页面上面的元素已经初始化完毕了
  async mounted() {
    //3.基于准备好的dom,初始化Eacharts实例
    var myChart = echarts.init(document.getElementById('main'))
    //发送请求获取数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取图表数据失败')

    //4. 指定图表的数据和配置项
    const result = _.merge(res.data,this.options);
    //5.展示数据:使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
  methods: {},
}
</script>

<style lang="less" scoped>
</style>