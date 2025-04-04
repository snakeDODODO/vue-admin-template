<script lang="ts">
export default {
  name: 'notification'
};
</script>
<script setup lang="ts">
import { reqeustNoticeeList, requestAddNotice, requestDeleteNotice, requestUpdateNotice, requestUpdateNoticePublish } from '@/api/notice';
import { reqeustUserList } from '@/api/user';
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import { noticeRule } from '@/rules/noticeRule';
import type { ConsultNoticeParams } from '@/types/consult';
import { Notification } from '@/types/notification';
import { dayjs } from 'element-plus';
import { useUserStore } from '@/stores/modules/user';

let noticeForm = ref<Notification>({} as Notification);
const userList = ref();
const selectedUsers = ref<string[]>([]);
let noticeFormRef = ref<FormInstance>();
let selectFormRef = ref<FormInstance>();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let formLabelWidth = '90px';
const NoticeList = ref();
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(false);
const UserStore = useUserStore();
let Total = ref();
let deleteButton = ref(true);
let NoticeIds = reactive<Array<number>>([]);
const selectForm = ref<ConsultNoticeParams>({} as ConsultNoticeParams);
let searchCriteria = ref<ConsultNoticeParams>({} as ConsultNoticeParams); // 搜索条件

// 监听当前页数
watch(currentPage, newCurrentPage => {
  currentPage.value = newCurrentPage;
  getNotificationList();
});

// 监听每页显示条数
watch(pageSize, newPageSize => {
  pageSize.value = newPageSize;
  getNotificationList();
});

// 获取通知列表
const getNotificationList = async () => {
  searchCriteria.value.currentPage = currentPage.value;
  searchCriteria.value.pageSize = pageSize.value;
  let queryInfo = {
    ...searchCriteria.value
  };
  loading.value = true;
  let result = await reqeustNoticeeList(queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('获取通知列表失败');
  Total.value = result.count;
  NoticeList.value = result.rows;
};

// 提交通知表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);

    // 如果是指定用户，需要处理选中的用户数据
    if (noticeForm.value.is_appoint === 0) {
      // 将选中的用户ID转换为字符串，以便后端处理
      noticeForm.value.selected_users = selectedUsers.value.join(',');
    }

    let res: string;
    if (dialogTitle.value === '添加公告') {
      noticeForm.value.issuer = UserStore.user.username;
      noticeForm.value.issuer_id = Number(UserStore.user.id);
      noticeForm.value.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
      console.log(noticeForm.value.selected_users);
      res = await requestAddNotice(noticeForm.value);
    } else if (dialogTitle.value === '编辑公告') {
      res = await requestUpdateNotice(noticeForm.value.id, noticeForm.value);
    } else {
      return ElMessage.error('无法识别该操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    getNotificationList();
  });
};

// 选择框触发回调
const selectChange = (row: Array<Notification>) => {
  if (row.length === 0) {
    deleteButton.value = true;
    return (NoticeIds = []);
  }
  deleteButton.value = false;
  row.forEach((item: Notification) => {
    NoticeIds.push(item.id);
  });
};

// 删除通知方法（按钮）
const delNotice = (row: Notification) => {
  ElMessageBox.confirm('请确认是否要删除该通知', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let NoticesToDelete = [];
      NoticesToDelete.push(row.id);
      let result = await requestDeleteNotice(NoticesToDelete);
      if (result !== 'success') return ElMessage.error('删除通知失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getNotificationList();
    }
  });
};

// 删除通知方法（选择框）
const delNoticeBySelect = async () => {
  if (NoticeIds.length === 0)
    return ElMessageBox.alert('请选择需要删除的通知', {
      type: 'warning',
      title: '提示',
      confirmButtonText: 'OK'
    });
  ElMessageBox.confirm('请确认是否要删除选中的通知', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let result = await requestDeleteNotice(NoticeIds);
      if (result !== 'success') return ElMessage.error('删除通知失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getNotificationList();
    }
  });
};

// 条件查询通知
const selectNotice = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    selectForm.value.pageSize = pageSize.value;
    selectForm.value.currentPage = currentPage.value;
    searchCriteria.value = { ...selectForm.value };
    let res = await reqeustNoticeeList(selectForm.value);
    if (!res) return ElMessage.error('查询失败');
    NoticeList.value = res.rows;
    Total.value = res.count;
    ElMessage.success({
      message: '查询成功',
      type: 'success'
    });
  });
};

// 修改字典状态
const statusChange = (row: Notification) => {
  return ElMessageBox.confirm('请确认是否要改变发布状态', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        row.publish_status = row.publish_status === 0 ? 1 : 0;
        return ElMessage.info('操作已经取消');
      }
      let result = await requestUpdateNoticePublish(row.id, row.publish_status);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success({
        message: '状态修改成功',
        type: 'success'
      });
    }
  });
};

// 打开对话框回调
const openDialog = (title: string, row?: Notification) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  // 重置选中的用户
  selectedUsers.value = [];

  if (!row) return;
  noticeForm.value = Object.assign({}, row);

  // 如果是编辑模式且是指定用户，需要处理已选择的用户数据
  if (row.is_appoint === 0 && row.selected_users) {
    // 将字符串形式的用户ID转换为数组
    selectedUsers.value = row.selected_users.split(',');
  }
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  noticeForm.value = Object.assign({});
  // 重置选中的用户
  selectedUsers.value = [];
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 序号显示
const indexMethod = (index: number) => {
  return index * currentPage.value + 1;
};

// 获取用户列表
const getUserList = async () => {
  let result = await reqeustUserList({});
  if (!result) return ElMessage.error('获取用户列表失败');
  userList.value = result.rows;
};

onMounted(() => {
  getNotificationList();
  getUserList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="标题" prop="title" label-width="80">
          <el-input v-model="selectForm.title" clearable autocomplete="off" class="select-input-width" />
        </el-form-item>
      </el-form>
      <div class="group-button-right">
        <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
        <el-button type="primary" :icon="Search" @click="selectNotice(selectFormRef)">查询</el-button>
      </div>
    </el-card>
    <el-card class="card-content">
      <template #header>
        <div class="card-header">
          <span>通知管理</span>
          <div class="button-group">
            <el-button type="primary" :icon="Plus" @click="openDialog('添加公告')">添加公告</el-button>
            <el-button type="danger" :icon="Delete" @click="delNoticeBySelect" :disabled="deleteButton">删除</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="NoticeList" v-loading="loading" max-height="335" style="width: 100%" table-layout="auto" @selection-change="selectChange" empty-text="没有数据">
          <el-table-column type="selection" width="40" />
          <el-table-column type="index" :index="indexMethod" label="序号" width="60" />
          <el-table-column prop="title" label="通知标题" width="200"></el-table-column>
          <el-table-column label="通知类型" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'success' : 'warning'">
                {{ scope.row.type === 0 ? '系统' : scope.row.type === 1 ? '公告' : '假期' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="issuer" label="发布者" width="120" />
          <el-table-column label="发布状态">
            <template #default="scope">
              <el-switch v-model="scope.row.publish_status" @change="statusChange(scope.row)" style="--el-switch-on-color: #13ce66" :active-value="1" :inactive-value="0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openDialog('编辑公告', scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="delNotice(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination style="justify-content: end" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 50, 100]" :disabled="disabled" background layout="prev, pager, next, jumper, sizes, total" :total="Total" />
    </el-card>
    <!-- 通知弹框 -->
    <el-dialog v-model="dialogFormVisible" width="600" :title="dialogTitle" @close="closeDialog(noticeFormRef)">
      <el-form :model="noticeForm" label-position="right" :rules="noticeRule" ref="noticeFormRef" hide-required-asterisk>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通知标题" prop="title" :label-width="formLabelWidth">
              <el-input v-model="noticeForm.title" placeholder="请输入标题" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知类型" prop="type" :label-width="formLabelWidth">
              <el-select v-model="noticeForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option :value="0" label="系统"></el-option>
                <el-option :value="1" label="公告"></el-option>
                <el-option :value="2" label="假期"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="通知范围" prop="user_id" :label-width="formLabelWidth">
          <el-radio-group v-model="noticeForm.is_appoint" class="input-width">
            <el-radio :label="1">全部</el-radio>
            <el-radio :label="0">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="noticeForm.is_appoint === 0" label="选择用户" prop="noticeForm.selected_users" :label-width="formLabelWidth">
          <el-select v-model="selectedUsers" multiple filterable placeholder="请选择用户" class="input-width">
            <el-option v-for="item in userList" :key="item.id" :label="item.nickname || item.username" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间" prop="effective_time" :label-width="formLabelWidth">
          <el-date-picker v-model="noticeForm.effective_time" type="datetime" placeholder="选择日期时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="终止时间" prop="terminate_time" :label-width="formLabelWidth">
          <el-date-picker v-model="noticeForm.terminate_time" type="datetime" placeholder="选择日期时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="内容" prop="content" :label-width="formLabelWidth">
          <el-input v-model="noticeForm.content" type="textarea" :rows="4" placeholder="请输入内容" autocomplete="off" class="input-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm(noticeFormRef)">提交</el-button>
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
.routea {
  color: #337ab7;
  &:hover {
    color: #20a0ff;
  }
}
</style>
