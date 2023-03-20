<template>
  <!-- 容器 -->
  <div class="charts" ref="charts"></div>
</template>

<script>
// 引入charts
// import * as echarts from 'echarts'
import echarts from 'echarts'
export default {
  name: '',
  mounted() {
    // 初始化echarts实例
    let barCharts = echarts.init(this.$refs.charts)
    // 配置数据
    barCharts.setOption({
      xAxis: {
        show: false,
        type: 'category',
      },
      yAxis: {
        show: false,
      },
      // 系列
      series: [
        {
          type: 'bar',
          data: [10, 7, 33, 12, 48, 9, 29, 10, 44],
        },
      ],
      grid: {
        left: 10,
        top: 0,
        right: 0,
        bottom: 0,
      },
    })
  },
}
</script>

<style scoped>
.charts {
  width: 100%;
  height: 100%;
}
</style>
