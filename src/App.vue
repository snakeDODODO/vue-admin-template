<script setup lang="ts">
// 引入element-plus国际化插件
import { zhCn } from 'element-plus/lib/locale/index.js'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <routerView />
  </el-config-provider>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  font-size: 14px;
}
</style>
