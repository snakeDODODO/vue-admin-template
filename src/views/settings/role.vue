<script lang="ts">
export default {
  name: 'role'
};
</script>
<script setup lang="ts">
import { Timer } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { reqeustRoleList, requestAddRole, requestDeleteRole, requestUpdateRole, requestUpdateRoleStatus, requestAuthList } from '@/api/role';
import { reqeustResourceList } from '@/api/resource';
import { dayjs } from 'element-plus';
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, FormInstance, type Action, ElTree } from 'element-plus/lib/components/index.js';
import { Role } from '@/types/role';
import { roleRule } from '@/rules/roleRule';
import { roleStatusType } from '@/enum';
import type { ConsultRoleListParams } from '@/types/consult';
import { useUserStore } from '@/stores/modules/user';
import { usePermissionStore } from '@/stores/modules/permission';
import { MenuItem } from '@/types/resource';

let roleForm = ref<Role>({} as Role);
let roleFormRef = ref<FormInstance>();
let selectFormRef = ref<FormInstance>();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let formLabelWidth = '90px';
const RoleList = ref();
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(false);
let roleTotal = ref();
let deleteButton = ref(true);
let roleIds = reactive<Array<string>>([]);
const resourceTree = ref<Array<MenuItem>>([]);
const treeRef = ref<InstanceType<typeof ElTree>>();
const selectForm = ref<ConsultRoleListParams>({} as ConsultRoleListParams);
const userStore = useUserStore();
const permissionStore = usePermissionStore();
const router = useRouter();
let searchCriteria = ref<ConsultRoleListParams>({} as ConsultRoleListParams); // 搜索条件

// 监听当前页数
watch(currentPage, newCurrentPage => {
  currentPage.value = newCurrentPage;
  getRoleList();
});

// 监听每页显示条数
watch(pageSize, newPageSize => {
  pageSize.value = newPageSize;
  getRoleList();
});

// 获取角色列表
const getRoleList = async () => {
  searchCriteria.value.currentPage = currentPage.value;
  searchCriteria.value.pageSize = pageSize.value;
  let queryInfo = {
    ...searchCriteria.value
  };
  loading.value = true;
  let result = await reqeustRoleList(queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('角色列表失败');
  roleTotal.value = result.count;
  RoleList.value = result.rows;
};

// 提交角色表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    let res: string;
    if (dialogTitle.value === '添加角色') {
      roleForm.value.resources = getCheckedKeys();
      roleForm.value.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      res = await requestAddRole(roleForm.value);
    } else if (dialogTitle.value === '编辑角色') {
      roleForm.value.resources = getCheckedKeys();
      res = await requestUpdateRole(roleForm.value);
    } else {
      return ElMessage.error('无法识别该操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    let resourceIds = await requestAuthList(userStore.user.id);
    router.removeRoute('settings');
    router.removeRoute('bill');
    await permissionStore.generateRoutes(resourceIds);
    getRoleList();
  });
};

// 修改角色状态
const statusChange = (row: Role) => {
  return ElMessageBox.confirm('请确认是否要改变用户状态', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        row.status = row.status === 0 ? 1 : 0;
        return ElMessage.info('操作已经取消');
      }
      let result = await requestUpdateRoleStatus(row.status, row.id);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success({
        message: '状态修改成功',
        type: 'success'
      });
    }
  });
};

// 选择框触发回调
const selectChange = (row: Array<Role>) => {
  if (row.length === 0) {
    deleteButton.value = true;
    return (roleIds = []);
  }
  deleteButton.value = false;
  row.forEach((item: Role) => {
    roleIds.push(item.id);
  });
};

// 删除角色方法（按钮）
const delRole = (row: Role) => {
  ElMessageBox.confirm('请确认是否要删除角色', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let rolesToDelete = [];
      rolesToDelete.push(row.id);
      let result = await requestDeleteRole(rolesToDelete);
      if (result !== 'success') return ElMessage.error('删除角色失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getRoleList();
    }
  });
};

// 删除角色方法（选择框）
const delRoleBySelect = async () => {
  if (roleIds.length === 0)
    return ElMessageBox.alert('请选择需要删除的角色', {
      type: 'warning',
      title: '提示',
      confirmButtonText: 'OK'
    });
  ElMessageBox.confirm('请确认是否要删除角色', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let result = await requestDeleteRole(roleIds);
      if (result !== 'success') return ElMessage.error('删除角色失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getRoleList();
    }
  });
};

// 条件查询角色
const selectRole = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    selectForm.value.pageSize = pageSize.value;
    selectForm.value.currentPage = currentPage.value;
    searchCriteria.value = { ...selectForm.value };
    let res = await reqeustRoleList(selectForm.value);
    if (!res) return ElMessage.error('查询失败');
    RoleList.value = res.rows;
    roleTotal.value = res.count;
    ElMessage.success({
      message: '查询成功',
      type: 'success'
    });
  });
};

// 打开对话框回调
const openDialog = async (title: string, row?: Role) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  if (!row) return;
  let queryInfo = {};
  let result = await reqeustResourceList(true, queryInfo);
  resourceTree.value = result;
  roleForm.value = Object.assign({}, row);
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  resetChecked();
  handleCheckedTreeExpand(false);
  roleForm.value = Object.assign({});
};

// 清空tree节点
const resetChecked = () => {
  treeRef.value!.setCheckedKeys([], false);
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 序号显示
const indexMethod = (index: number) => {
  return index * currentPage.value + 1;
};

// 获取树形节点数据
const getCheckedKeys = () => {
  let checkedKeys = treeRef.value.getCheckedKeys();
  let halfCheckedKeys = treeRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
};

// 树权限 （展开/折叠）
const handleCheckedTreeExpand = (value: any) => {
  let treeList = resourceTree.value;
  for (let i = 0; i < treeList.length; i++) {
    treeRef.value.store.nodesMap[treeList[i].id].expanded = value;
  }
};

onMounted(() => {
  getRoleList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="用户名" prop="name" label-width="80">
          <el-input v-model="selectForm.name" clearable autocomplete="off" class="select-input-width" />
        </el-form-item>
        <el-form-item label="角色标识" prop="sys_name" label-width="80">
          <el-input v-model="selectForm.sys_name" clearable autocomplete="off" class="select-input-width" />
        </el-form-item>
        <el-form-item label="创建时间" prop="time" label-width="80">
          <el-date-picker v-model="selectForm.time" clearable value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange" start-placeholder="起始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="状态" prop="status" label-width="50">
          <el-select v-model="selectForm.status" clearable placeholder="请选择状态" class="select-input-width">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="group-button-right">
        <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
        <el-button type="primary" :icon="Search" @click="selectRole(selectFormRef)">查询</el-button>
      </div>
    </el-card>
    <el-card class="card-content">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <div class="button-group">
            <el-button type="primary" v-has-perm="['role:btn:add']" :icon="Plus" @click="openDialog('添加角色')">添加角色</el-button>
            <el-button type="danger" :icon="Delete" @click="delRoleBySelect" :disabled="deleteButton">删除</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="RoleList" v-loading="loading" max-height="335" style="width: 100%" table-layout="auto" @selection-change="selectChange" empty-text="没有数据">
          <el-table-column type="selection" width="50" />
          <el-table-column type="index" :index="indexMethod" label="序号" width="70" />
          <el-table-column prop="name" label="角色名称" width="150" />
          <el-table-column label="角色标识" width="120">
            <template #default="scope">
              <el-tag>{{ scope.row.sys_name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="250">
            <template #default="scope">
              <div style="display: flex; align-items: center">
                <el-icon><timer /></el-icon>
                <span style="margin-left: 10px">{{ dayjs(`${scope.row.createtime}`).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="是否启用" width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.status" @change="statusChange(scope.row)" style="--el-switch-on-color: #13ce66" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openDialog('编辑角色', scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="delRole(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination style="justify-content: end" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 50, 100]" :disabled="disabled" background layout="prev, pager, next, jumper, sizes, total" :total="roleTotal" />
    </el-card>
    <!-- 角色资料弹框 -->
    <el-dialog v-model="dialogFormVisible" width="500" :title="dialogTitle" @close="closeDialog(roleFormRef)">
      <el-form :model="roleForm" label-position="right" :rules="roleRule" ref="roleFormRef" hide-required-asterisk>
        <el-form-item label="角色名称" prop="name" :label-width="formLabelWidth">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" autocomplete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="角色标识" prop="sys_name" :label-width="formLabelWidth">
          <el-input v-model="roleForm.sys_name" placeholder="请输入角色标识" autocomplete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="roleIds" :label-width="formLabelWidth">
          <el-tree ref="treeRef" class="tree-border" :default-checked-keys="roleForm.resources" check-strictly="true" :data="resourceTree" show-checkbox node-key="id" highlight-current>
            <template #default="{ data }">
              {{ data.meta.title }}
            </template>
          </el-tree>
        </el-form-item>
        <el-form-item label="状态" prop="status" :label-width="formLabelWidth">
          <el-radio-group v-model="roleForm.status" class="input-width">
            <el-radio :label="roleStatusType.enable">启用</el-radio>
            <el-radio :label="roleStatusType.disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(roleFormRef)">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-select {
  margin-bottom: 5px;
}
.card-content {
  flex: 1;
}
.input-width {
  width: 340px;
}
.select-input-width {
  width: 180px;
}
.demo-form-inline .el-form-item {
  margin-right: 0px;
}
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #fff none;
  border-radius: 4px;
  width: 340px;
}
</style>
