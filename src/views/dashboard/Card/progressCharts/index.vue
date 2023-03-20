<template>
  <!-- 容器 -->
  <div class="charts" ref="charts"></div>
</template>

<script>
// 引入charts
// import * as echarts from 'echarts'
import echarts from 'echarts'
export default {
  name: 'progressCharts',
  mounted() {
    // 初始化echarts实例
    let progressCharts = echarts.init(this.$refs.charts)
    // 配置数据
    progressCharts.setOption({
      xAxis: {
        show: false,
        // 最大与最小值的设置
        min: 0,
        max: 100,
      },
      yAxis: {
        show: false,
        type: 'category',
      },
      // 系列
      series: [
        {
          type: 'bar',
          data: [78],
          color: 'cyan',
          barWidth: 10,
          color: 'yellowgreen',
          showBackground: true,
          backgroundStyle: {
            color: '#eee',
          },
          // 文本标签
          label: {
            show: true,
            // 改变文本内容
            formatter: '|',
            // 文本标签位置调试
            position: 'right',
          },
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
