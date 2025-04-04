<template>
  <div class="error-page">
    <div class="error-code">404</div>
    <div class="error-desc">抱歉，你访问的页面不存在</div>
    <el-button type="primary" @click="router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: #f56c6c;
    margin-bottom: 20px;
  }

  .error-desc {
    font-size: 24px;
    color: #606266;
    margin-bottom: 30px;
  }
}
</style>
