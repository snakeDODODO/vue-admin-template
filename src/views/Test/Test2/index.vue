<template>
  <div>
    <el-button type="primary" v-if="$store.state.user.buttons.indexOf('btn.Add2') != -1">测试按钮二</el-button>
    <el-button type="primary" v-if="$store.state.user.buttons.indexOf('btn.Add3') != -1">测试按钮三</el-button>
  </div>
</template>

<script>
export default {
  name: 'Test2',
}
</script>

<style></style>
