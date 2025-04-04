<script lang="ts">
export default {
  name: 'department'
};
</script>
<script setup lang="ts">
import { reqeustDepartmentList, requestAddDepartment, requestUpdateDepartment, requestDeleteDepartment } from '@/api/department';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import { Department } from '@/types/department';
import { dayjs } from 'element-plus';
import { departmentRule } from '@/rules/departmentRule';

const DepartmentList = ref();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let departmentForm = ref<Department>({} as Department);
let resourceFormRef = ref<FormInstance>();
let departmentFormRef = ref<FormInstance>();
let formLabelWidth = '90px';
const selectForm = ref<Department>({} as Department);
let selectFormRef = ref<FormInstance>();
const loading = ref(true);

// 获取部门列表
const getDepartmentList = async () => {
  let queryInfo = {};
  let result = await reqeustDepartmentList(true, queryInfo);
  if (!result) {
    loading.value = false;
    return ElMessage.error('部门列表获取失败');
  }
  DepartmentList.value = result;
  loading.value = false;
};

// 提交部门表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    let res: string;
    if (dialogTitle.value === '添加部门' || dialogTitle.value === '新增部门') {
      departmentForm.value.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      res = await requestAddDepartment(departmentForm.value);
    } else if (dialogTitle.value === '编辑部门') {
      res = await requestUpdateDepartment(departmentForm.value.id, departmentForm.value);
    } else {
      return ElMessage.error('无法识别对部门的操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    getDepartmentList();
  });
};

// 删除部门方法
const delDepartment = (id: string) => {
  ElMessageBox.confirm('请确认是否要删除部门，删除时所属子部门会一并删除', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let departmentsToDelete = [];
      departmentsToDelete.push(id);
      let result = await requestDeleteDepartment(departmentsToDelete);
      if (result !== 'success') return ElMessage.error('删除部门失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getDepartmentList();
    }
  });
};

// 查询资源列表方法
const selectDepartment = async (formEl: FormInstance | undefined) => {
  let res = await reqeustDepartmentList(true, selectForm.value);
  console.log(res);
  if (!res) return ElMessage.error('查询失败');
  DepartmentList.value = res;
  ElMessage.success({
    message: '查询成功',
    type: 'success'
  });
  resetForm(formEl);
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 打开对话框回调
const openDialog = (title: string, row?: Department) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  if (!row) return;
  if (dialogTitle.value === '新增部门') {
    departmentForm.value = Object.assign({});
    departmentForm.value.parent_id = row.id;
    return;
  }
  departmentForm.value = Object.assign({}, row);
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  departmentForm.value = Object.assign({});
};

onMounted(() => {
  getDepartmentList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="部门名称" prop="company_name" label-width="80">
          <el-input v-model="selectForm.company_name" autocomplete="off" clearable class="select-input-width" />
        </el-form-item>
        <el-form-item label="状态" prop="status" label-width="50">
          <el-select v-model="selectForm.status" placeholder="请选择状态" class="select-input-width" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="group-button-right">
        <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
        <el-button type="primary" :icon="Search" @click="selectDepartment(selectFormRef)">查询</el-button>
      </div>
    </el-card>
    <el-card class="card-content">
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <div class="button-group">
            <el-button type="primary" :icon="Plus" @click="openDialog('添加部门')">添加部门</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="DepartmentList" v-loading="loading" table-layout="auto" style="width: 100%; margin-bottom: 20px" row-key="id">
          <el-table-column label="部门名称">
            <template #default="scope">
              {{ scope.row.company_name }}
            </template>
          </el-table-column>
          <el-table-column label="排序">
            <template #default="scope">
              {{ scope.row.sort }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template #default="scope">
              {{ dayjs(`${scope.row.createtime}`).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 1">启用</el-tag>
              <el-tag v-else type="error">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="操作" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openDialog('编辑部门', scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="openDialog('新增部门', scope.row)">新增</el-button>
              <el-button size="small" type="danger" @click="delDepartment(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 部门详情弹框 -->
    <el-dialog v-model="dialogFormVisible" draggable width="650" :title="dialogTitle" @close="closeDialog(resourceFormRef)" class="dialog-resource">
      <el-form :model="departmentForm" label-position="right" :rules="departmentRule" :inline="true" ref="departmentFormRef" hide-required-asterisk>
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级部门" prop="parent_id" :label-width="formLabelWidth" style="width: 100%">
              <el-tree-select :data="DepartmentList" :props="{ value: 'id', label: 'company_name', children: 'children' }" v-model="departmentForm.parent_id" value-ley="id" placeholder="请选择上级部门" check-strictly class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label-width="formLabelWidth" prop="company_name">
              <el-input v-model="departmentForm.company_name" placeholder="请输入部门名称" autocomplete="off" class="input-width" />
              <template #label>
                <span class="tips"> 部门名称 </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" :label-width="formLabelWidth" prop="sort">
              <el-input-number v-model="departmentForm.sort" placeholder="请输入排序编号" class="input-width" :min="1" :max="10" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态" prop="status" :label-width="formLabelWidth">
              <el-radio-group v-model="departmentForm.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm(departmentFormRef)">提交</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
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
  width: 100%;
}
.select-input-width {
  width: 225px;
}

.demo-form-inline .el-form-item {
  margin-right: 0px;
}
.dialog-resource {
  .el-form-item {
    margin-right: 0px;
    width: 100%;
  }
}
.tips {
  display: flex;
  align-items: center;
  i {
    padding-right: 5px;
  }
}
</style>
