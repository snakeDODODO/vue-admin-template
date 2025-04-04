<script lang="ts">
export default {
  name: 'dictionarydata'
};
</script>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { reqeustDictionarydataList, requestAddDictionarydata, requestDelDictionarydata, requestUpdateDictionarydata } from '@/api/dictionarydata';
import { requestUpdateRoleStatus } from '@/api/role';
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import { Role } from '@/types/role';
import { dictionarydataRule } from '@/rules/dictionarydataRule';
import type { ConsuletDictionarydataParams } from '@/types/consult';
import { Dictionary } from '@/types/dictionary';
import { Dictionarydata } from '@/types/dictionarydata';

let dictionaryDataForm = ref<Dictionarydata>({} as Dictionarydata);
let dictionaryDataFormRef = ref<FormInstance>();
let selectFormRef = ref<FormInstance>();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let formLabelWidth = '90px';
const DictionaryDataList = ref();
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(false);
let Total = ref();
let deleteButton = ref(true);
let DictionaryDataIds = reactive<Array<string>>([]);
const selectForm = ref<ConsuletDictionarydataParams>({} as ConsuletDictionarydataParams);
const router = useRoute();
let ditID = router.params.dictId;
let searchCriteria = ref<ConsuletDictionarydataParams>({} as ConsuletDictionarydataParams); // 搜索条件

// 监听当前页数
watch(currentPage, newCurrentPage => {
  currentPage.value = newCurrentPage;
  getDictionaryDataList();
});

// 监听每页显示条数
watch(pageSize, newPageSize => {
  pageSize.value = newPageSize;
  getDictionaryDataList();
});

// 获取字典详情列表
const getDictionaryDataList = async () => {
  searchCriteria.value.currentPage = currentPage.value;
  searchCriteria.value.pageSize = pageSize.value;
  searchCriteria.value.dictionary_id = ditID as string;
  let queryInfo: any = {
    ...searchCriteria.value
  };
  loading.value = true;
  let result = await reqeustDictionarydataList(queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('获取字典详情失败');
  Total.value = result.count;
  DictionaryDataList.value = result.rows;
};

// 提交字典详情表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    let res: string;
    if (dialogTitle.value === '添加') {
      dictionaryDataForm.value.dictionary_id = ditID as string;
      res = await requestAddDictionarydata(dictionaryDataForm.value);
    } else if (dialogTitle.value === '编辑') {
      res = await requestUpdateDictionarydata(dictionaryDataForm.value.id, dictionaryDataForm.value);
    } else {
      return ElMessage.error('无法识别该操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    getDictionaryDataList();
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
const selectChange = (row: Array<Dictionarydata>) => {
  if (row.length === 0) {
    deleteButton.value = true;
    return (DictionaryDataIds = []);
  }
  deleteButton.value = false;
  row.forEach((item: Dictionarydata) => {
    DictionaryDataIds.push(item.id);
  });
};

// 删除字典详情方法（按钮）
const delDictionaryData = (row: Dictionary) => {
  ElMessageBox.confirm('请确认是否要删除字典详情，', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let DictionarysDataToDelete = [];
      DictionarysDataToDelete.push(row.id);
      let result = await requestDelDictionarydata(DictionarysDataToDelete);
      if (result !== 'success') return ElMessage.error('删除字典详情失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getDictionaryDataList();
    }
  });
};

// 删除字典详情方法（选择框）
const delDictionaryBySelect = async () => {
  if (DictionaryDataIds.length === 0)
    return ElMessageBox.alert('请选择需要删除的字典详情', {
      type: 'warning',
      title: '提示',
      confirmButtonText: 'OK'
    });
  ElMessageBox.confirm('请确认是否要删除字典详情', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let result = await requestDelDictionarydata(DictionaryDataIds);
      if (result !== 'success') return ElMessage.error('删除字典失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getDictionaryDataList();
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
    selectForm.value.dictionary_id = ditID as string;
    searchCriteria.value = { ...selectForm.value };
    let res = await reqeustDictionarydataList(selectForm.value);
    if (!res) return ElMessage.error('查询失败');
    DictionaryDataList.value = res.rows;
    Total.value = res.count;
    ElMessage.success({
      message: '查询成功',
      type: 'success'
    });
  });
};

// 打开对话框回调
const openDialog = (title: string, row?: Dictionarydata) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  if (!row) return;
  dictionaryDataForm.value = Object.assign({}, row);
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  dictionaryDataForm.value = Object.assign({});
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 序号显示
const indexMethod = (index: number) => {
  return index * currentPage.value + 1;
};

onMounted(() => {
  getDictionaryDataList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="字典标签" prop="name" label-width="80">
          <el-input v-model="selectForm.dictionaryname" clearable autocomplete="off" class="select-input-width" />
        </el-form-item>
        <el-form-item label="字典描述" prop="sys_name" label-width="80">
          <el-input v-model="selectForm.dictionaryvalue" clearable autocomplete="off" class="select-input-width" />
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
          <span>字典详情</span>
          <div class="button-group">
            <el-button type="primary" :icon="Plus" @click="openDialog('添加')">添加</el-button>
            <el-button type="danger" :icon="Delete" @click="delDictionaryBySelect" :disabled="deleteButton">删除</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="DictionaryDataList" v-loading="loading" max-height="335" style="width: 100%" table-layout="auto" @selection-change="selectChange" empty-text="没有数据">
          <el-table-column type="selection" width="50" />
          <el-table-column type="index" :index="indexMethod" label="序号" width="70" />
          <el-table-column prop="dictionaryname" label="字典标签" width="150" />
          <el-table-column prop="dictionaryvalue" label="字典详情" width="150" />
          <el-table-column label="是否启用" width="150">
            <template #default="scope">
              <el-switch v-model="scope.row.status" @change="statusChange(scope.row)" style="--el-switch-on-color: #13ce66" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openDialog('编辑', scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="delDictionaryData(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination style="justify-content: end" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 50, 100]" :disabled="disabled" background layout="prev, pager, next, jumper, sizes, total" :total="Total" />
    </el-card>
    <!-- 字典资料弹框 -->
    <el-dialog v-model="dialogFormVisible" width="500" :title="dialogTitle" @close="closeDialog(dictionaryDataFormRef)">
      <el-form :model="dictionaryDataForm" label-position="right" :rules="dictionarydataRule" ref="dictionaryDataFormRef" hide-required-asterisk>
        <el-form-item label="字典标签" prop="dictionaryname" :label-width="formLabelWidth">
          <el-input v-model="dictionaryDataForm.dictionaryname" placeholder="请输入字典标签" autocomplete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="字典详情" prop="dictionaryvalue" :label-width="formLabelWidth">
          <el-input v-model="dictionaryDataForm.dictionaryvalue" placeholder="请输入字典详情描述(中文描述)" autocomplete="off" class="input-width" />
        </el-form-item>
        <el-form-item label="状态" prop="status" :label-width="formLabelWidth">
          <el-radio-group v-model="dictionaryDataForm.status" class="input-width">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(dictionaryDataFormRef)">提交</el-button>
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
