<script setup lang="ts">
import { ref } from 'vue'
import type { DropdownInstance } from 'element-plus/lib/components/index.js'
import type { Dropdown } from '@/types/dropdown'

const dropdown1 = ref<DropdownInstance>()
// 按钮触发下拉框打开
const showDropdown = () => {
  if (!dropdown1.value) return
  dropdown1.value.handleOpen()
}

const dropdownList = defineProps<{
  dropdown: Dropdown
}>()

const emit = defineEmits<{
  (e: 'tabOptions', clickId: number): void
}>()

defineExpose({
  showDropdown,
})
</script>

<template>
  <el-dropdown ref="dropdown1" trigger="contextmenu" :style="`margin-right: 30px; position: fixed;top: ${dropdownList.dropdown.y}px;left: ${dropdownList.dropdown.x}px`">
    <span class="el-dropdown-link"></span>
    <template #dropdown>
      <el-dropdown-menu v-for="item in dropdownList.dropdown.opstionItem">
        <el-dropdown-item :key="item.contextMenuClickId" @click="emit('tabOptions', item.contextMenuClickId)">{{ item.title }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
