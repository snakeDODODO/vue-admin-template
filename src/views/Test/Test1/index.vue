<template>
  <div>
    <el-button type="primary" v-if="$store.state.user.buttons.indexOf('btn.Add1') != -1">测试按钮一</el-button>
  </div>
</template>

<script>
export default {
  name: 'Test1',
}
</script>

<style></style>
