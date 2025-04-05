<script lang="ts">
export default {
  name: 'message'
};
</script>
<script setup lang="ts">
import { reqeustMessageList, requestDeleteMessage, requestUpdateMessageStatus } from '@/api/message';
import { Delete, Search, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import type { ConsultMessageParams } from '@/types/consult';
import { Message } from '@/types/message';
import { dayjs } from 'element-plus';
import { useUserStore } from '@/stores/modules/user';

let MessageInfo = ref<Message>({} as Message);
let messageFormRef = ref<FormInstance>();
let selectFormRef = ref<FormInstance>();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let formLabelWidth = '90px';
const MessageList = ref();
const loading = ref(true);
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(false);
let Total = ref<number>(0);
let deleteButton = ref(true);
let updateButton = ref(true);
let MessageIds = reactive<Array<number>>([]);
const selectForm = ref<ConsultMessageParams>({} as ConsultMessageParams);
let searchCriteria = ref<ConsultMessageParams>({} as ConsultMessageParams); // 搜索条件
const userStore = useUserStore();

// 监听当前页数
watch(currentPage, newCurrentPage => {
  currentPage.value = newCurrentPage;
  getMessagetionList();
});

// 监听每页显示条数
watch(pageSize, newPageSize => {
  pageSize.value = newPageSize;
  getMessagetionList();
});

// 获取通知列表
const getMessagetionList = async () => {
  searchCriteria.value.currentPage = currentPage.value;
  searchCriteria.value.pageSize = pageSize.value;
  let queryInfo = {
    ...searchCriteria.value
  };
  loading.value = true;
  let result = await reqeustMessageList(userStore.user.id, queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('获取消息列表失败');
  Total.value = result.count;
  MessageList.value = result.rows;
};

// 提交通知表单
// const submitForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(async (valid, fields) => {
//     if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);

//     // 如果是指定用户，需要处理选中的用户数据
//     if (noticeForm.value.is_appoint === 0) {
//       // 将选中的用户ID转换为字符串，以便后端处理
//       noticeForm.value.selected_users = selectedUsers.value.join(',');
//     }

//     let res: string;
//     if (dialogTitle.value === '添加公告') {
//       noticeForm.value.issuer = UserStore.user.username;
//       noticeForm.value.issuer_id = Number(UserStore.user.id);
//       noticeForm.value.created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');
//       console.log(noticeForm.value.selected_users);
//       res = await requestAddNotice(noticeForm.value);
//     } else if (dialogTitle.value === '编辑公告') {
//       res = await requestUpdateNotice(noticeForm.value.id, noticeForm.value);
//     } else {
//       return ElMessage.error('无法识别该操作');
//     }
//     if (res! !== 'success') return ElMessage.error('操作失败');
//     ElMessage.success({
//       message: '操作成功',
//       type: 'success'
//     });
//     dialogFormVisible.value = false;
//     getNotificationList();
//   });
// };

// 选择框触发回调
const selectChange = (row: Array<Message>) => {
  if (row.length === 0) {
    deleteButton.value = true;
    updateButton.value = true;
    return (MessageIds = []);
  }
  deleteButton.value = false;
  updateButton.value = false;
  row.forEach((item: Message) => {
    MessageIds.push(item.id);
  });
};

// 删除消息方法（按钮）
const delMessage = (row: Message) => {
  ElMessageBox.confirm('请确认是否要删除该条消息', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      console.log(row);
      let MessageToDelete = [];
      MessageToDelete.push(row.id);
      let result = await requestDeleteMessage(MessageToDelete);
      if (result !== 'success') return ElMessage.error('删除失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getMessagetionList();
    }
  });
};

// 操作通知方法（选择框）
const settingsMessageBySelect = async (title: string) => {
  if (MessageIds.length === 0)
    return ElMessageBox.alert(`请选择需要${title}的通知`, {
      type: 'warning',
      title: '提示',
      confirmButtonText: 'OK'
    });
  ElMessageBox.confirm(`请确认是否要${title}选中的通知`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      if (title === '已读') {
        let result = await requestUpdateMessageStatus(MessageIds);
        if (result !== 'success') return ElMessage.error('状态修改失败');
      } else {
        let result = await requestDeleteMessage(MessageIds);
        if (result !== 'success') return ElMessage.error('删除通知失败');
      }
      ElMessage.success({
        message: `${title}成功`,
        type: 'success'
      });
      getMessagetionList();
    }
  });
};

// 条件查询消息
const selectMessage = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    selectForm.value.pageSize = pageSize.value;
    selectForm.value.currentPage = currentPage.value;
    searchCriteria.value = { ...selectForm.value };
    let res = await reqeustMessageList(userStore.user.id, selectForm.value);
    if (!res) return ElMessage.error('查询失败');
    MessageList.value = res.rows;
    Total.value = res.count;
    ElMessage.success({
      message: '查询成功',
      type: 'success'
    });
  });
};

// 修改消息状态
const statusChange = (row: Message) => {
  return ElMessageBox.confirm('请确认状态是否要变更为已读', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        row.is_read = row.is_read === 0 ? 1 : 0;
        return ElMessage.info('操作已经取消');
      }
      let MessageToRead = [];
      MessageToRead.push(row.id);
      let result = await requestUpdateMessageStatus(MessageToRead);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success({
        message: '状态修改成功',
        type: 'success'
      });
      getMessagetionList();
    }
  });
};

// 打开对话框回调
const openDialog = (title: string, row?: Message) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  if (!row) return;
  MessageInfo.value = Object.assign({}, row);
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  MessageInfo.value = Object.assign({});
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
  getMessagetionList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="标题" prop="title" label-width="80">
          <el-input v-model="selectForm.title" clearable autocomplete="off" placeholder="请输入标题" class="select-input-width" />
        </el-form-item>
        <el-form-item label="状态" :inline="true" prop="is_read" :label-width="formLabelWidth">
          <el-select v-model="selectForm.is_read" placeholder="请选择状态" style="width: 100%">
            <el-option :value="0" label="未读"></el-option>
            <el-option :value="1" label="已读"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="group-button-right">
        <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
        <el-button type="primary" :icon="Search" @click="selectMessage(selectFormRef)">查询</el-button>
      </div>
    </el-card>
    <el-card class="card-content">
      <template #header>
        <div class="card-header">
          <span>消息中心</span>
          <div class="button-group">
            <el-button type="primary" @click="settingsMessageBySelect('已读')" :disabled="updateButton">标记为已读</el-button>
            <el-button type="danger" :icon="Delete" @click="settingsMessageBySelect('删除')" :disabled="deleteButton">删除</el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="MessageList" v-loading="loading" max-height="335" style="width: 100%" table-layout="auto" @selection-change="selectChange" empty-text="没有数据">
          <el-table-column type="selection" width="40" />
          <el-table-column type="index" :index="indexMethod" label="序号" width="60" />
          <el-table-column label="标题" width="200">
            <template #default="scope">
              <a href="#" @click="openDialog('消息详情', scope.row)">{{ scope.row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'success' : 'warning'">
                {{ scope.row.type === 0 ? '系统' : scope.row.type === 1 ? '公告' : '假期' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_user_id" label="发布者" width="120" />
          <el-table-column label="状态">
            <template #default="scope">
              <el-tag v-if="scope.row.is_read === 1">已读</el-tag>
              <el-tag v-else type="info">未读</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间">
            <template #default="scope">
              {{ dayjs(`${scope.row.create_time}`).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" v-if="!scope.row.is_read" @click="statusChange(scope.row)">已读</el-button>
              <el-button size="small" type="danger" @click="delMessage(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination style="justify-content: end" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 50, 100]" :disabled="disabled" background layout="prev, pager, next, jumper, sizes, total" :total="Total" />
    </el-card>
    <!-- 消息详情弹框 -->
    <el-dialog v-model="dialogFormVisible" width="600" :title="dialogTitle" @close="closeDialog(messageFormRef)">
      <div class="message-detail-container">
        <!-- 标题 -->
        <div class="message-title">{{ MessageInfo.title }}</div>
        <!-- 发布人和时间 -->
        <div class="message-info">
          <span>发布人：{{ MessageInfo.create_user_id }}</span>
          <span class="message-time">发布时间：{{ dayjs(`${MessageInfo.create_time}`).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <!-- 内容 -->
        <div class="message-content">
          {{ MessageInfo.content }}
        </div>
      </div>
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

/* 消息详情弹框样式 */
.message-detail-container {
  padding: 10px;
}

.message-title {
  font-size: 23px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  text-align: center;
}

.message-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-time {
  position: relative;
  padding-left: 20px;
}

.message-time::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 14px;
  width: 1px;
  background-color: #dcdfe6;
  margin: 0 10px;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  min-height: 100px;
  white-space: pre-wrap;
}
</style>
