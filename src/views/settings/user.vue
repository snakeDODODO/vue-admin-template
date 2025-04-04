<script lang="ts">
export default {
  name: 'user'
};
</script>
<script setup lang="ts">
import { Timer } from '@element-plus/icons-vue';
import { reqeustUserList, requestAddUser, requestDelUser, requestEditUser, requestUpdateUserStatus, requestUploadAvatar } from '@/api/user';
import { reqeustRoleList } from '@/api/dictionary';
import { reqeustDepartmentList } from '@/api/department';
import { dayjs } from 'element-plus';
import { Plus, Delete, Search, Refresh, Upload } from '@element-plus/icons-vue';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { ConsultUserListParams } from '@/types/consult';
import { userRole } from '@/rules/userRule';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import { userStatusType } from '@/enum/index';
// 修改 VueCropper 的导入方式
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

let userList = ref();
let roleList = ref<Array<Role>>([]);
let userForm = ref<User>({} as User);
let departmentList = ref();
let userFormRef = ref<FormInstance>();
let selectFormRef = ref<FormInstance>();
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let formLabelWidth = '90px';
let userIds = reactive<Array<string>>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const disabled = ref(false);
let userTotal = ref();
const selectForm = ref<ConsultUserListParams>({} as ConsultUserListParams);
const loading = ref(true);
let deleteButton = ref(true);
const filterText = ref('');
// let searchGlobal = ref(true);
// let selectedDepartmentId = ref<string | null>(null);
let searchCriteria = ref<ConsultUserListParams>({} as ConsultUserListParams); // 搜索条件
// 头像上传相关变量
const uploadDialogVisible = ref(false);
const currentUser = ref<User>({} as User);
const imgFile = ref<string>('');
const cropperRef = ref();
const previewUrl = ref('');
const uploadLoading = ref(false);

const defaultProps = {
  children: 'children',
  label: 'company_name'
};

// 获取用户列表
const getUserList = async () => {
  searchCriteria.value.currentPage = currentPage.value;
  searchCriteria.value.pageSize = pageSize.value;
  let queryInfo: any = {
    // currentPage: currentPage.value,
    // pageSize: pageSize.value,
    ...searchCriteria.value
  };
  // if (!searchGlobal.value) {
  //   queryInfo.department_id = selectedDepartmentId.value;
  // }
  loading.value = true;
  let result = await reqeustUserList(queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('用户列表失败');
  userTotal.value = result.count;
  userList.value = result.rows;
};

// 获取部门列表
const getDepartmentList = async () => {
  let result = await reqeustDepartmentList(true);
  if (!result) return ElMessage.error('部门列表获取失败');
  departmentList.value = result;
};

// 监听当前页数
watch(currentPage, newCurrentPage => {
  currentPage.value = newCurrentPage;
  getUserList();
});

// 监听每页显示条数
watch(pageSize, newPageSize => {
  pageSize.value = newPageSize;
  getUserList();
});

// 提交用户表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    let res: string;
    if (dialogTitle.value === '添加用户') {
      userForm.value.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      res = await requestAddUser(userForm.value);
    } else if (dialogTitle.value === '编辑用户') {
      res = await requestEditUser(userForm.value);
    } else {
      return ElMessage.error('无法识别对用户的操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    getUserList();
  });
};

// 删除用户方法（按钮）
const delUser = (row: User) => {
  ElMessageBox.confirm('请确认是否要删除用户', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let usersToDelete = [];
      usersToDelete.push(row.id);
      let result = await requestDelUser(usersToDelete);
      if (result !== 'success') return ElMessage.error('删除用户失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getUserList();
    }
  });
};

// 删除用户方法（选择框）
const delUserBySelect = async () => {
  if (userIds.length === 0)
    return ElMessageBox.alert('请选择需要删除的用户', {
      type: 'warning',
      title: '提示',
      confirmButtonText: 'OK'
    });
  ElMessageBox.confirm('请确认是否要删除用户', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let result = await requestDelUser(userIds);
      if (result !== 'success') return ElMessage.error('删除用户失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getUserList();
    }
  });
};

// 修改用户状态
const statusChange = (row: User) => {
  return ElMessageBox.confirm('请确认是否要改变用户状态', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        row.status = row.status === 0 ? 1 : 0;
        return ElMessage.info('操作已经取消');
      }
      let result = await requestUpdateUserStatus(row.status, row.id);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success({
        message: '状态修改成功',
        type: 'success'
      });
    }
  });
};

// 条件查询用户
const selectUser = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    // searchGlobal.value = false;
    selectForm.value.pageSize = pageSize.value;
    selectForm.value.currentPage = currentPage.value;
    searchCriteria.value = { ...selectForm.value };
    let res = await reqeustUserList(selectForm.value);
    if (!res) return ElMessage.error('查询失败');
    userList.value = res.rows;
    userTotal.value = res.count;
    ElMessage.success({
      message: '查询成功',
      type: 'success'
    });
  });
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 选择框触发回调
const selectChange = (row: Array<User>) => {
  if (row.length === 0) {
    deleteButton.value = true;
    return (userIds = []);
  }
  deleteButton.value = false;
  row.forEach((item: User) => {
    userIds.push(item.id);
  });
};

// 打开对话框回调
const openDialog = async (title: string, row?: User) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  if (!row) return;
  roleList.value = await reqeustRoleList();
  row.roleIds = row.roles.map((role: { role_id: any }) => role.role_id);
  userForm.value = Object.assign({}, row);
  console.log(userForm.value);
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  userForm.value = Object.assign({});
};

// 序号显示
const indexMethod = (index: number) => {
  return index + (currentPage.value - 1) * pageSize.value + 1;
};

interface Tree {
  label: string;
  children?: Tree[];
  id: string;
}

const handleNodeClick = (data: Tree) => {
  // searchGlobal.value = false;
  // selectedDepartmentId.value = data.id;
  if (data.id) {
    searchCriteria.value.department_id = data.id;
    currentPage.value = 1;
  }
  getUserList();
};

// 处理用户头像上传
const handleUpload = (row: User) => {
  uploadDialogVisible.value = true;
  currentUser.value = row;
  imgFile.value = '';
  previewUrl.value = '';
};

// 选择图片文件
const handleFileChange = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  // 验证文件类型和大小
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
    return;
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
    return;
  }

  // 读取文件为base64
  const reader = new FileReader();
  reader.onload = event => {
    imgFile.value = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// 实时预览
const realTime = (data: any) => {
  if (data && data.url) {
    previewUrl.value = data.url;
  }
};

// 添加获取裁剪图片的方法
const getCropData = () => {
  if (!cropperRef.value) return;
  cropperRef.value.getCropData((data: string) => {
    previewUrl.value = data;
  });
};

// 监听图片变化，自动更新预览
watch(imgFile, newVal => {
  if (newVal) {
    // 图片加载后需要一点时间才能裁剪
    setTimeout(() => {
      getCropData();
    }, 300);
  }
});

// 上传裁剪后的头像
const uploadAvatar = async () => {
  if (!previewUrl.value) {
    ElMessage.warning('请先选择并裁剪图片');
    return;
  }

  uploadLoading.value = true;
  try {
    // 将base64转为blob
    const base64 = previewUrl.value;
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });

    // 创建FormData
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.png');

    // 调用上传API
    let result = await requestUploadAvatar(formData, currentUser.value.id);
    if (!result) {
      ElMessage.error('头像上传失败');
    } else {
      ElMessage.success('头像上传成功');
      uploadDialogVisible.value = false;
      // 刷新用户列表
      getUserList();
    }
  } catch (error) {
    console.error('上传头像出错:', error);
    ElMessage.error('头像上传失败');
  } finally {
    uploadLoading.value = false;
  }
};

// 关闭上传对话框
const closeUploadDialog = () => {
  uploadDialogVisible.value = false;
  imgFile.value = '';
  previewUrl.value = '';
};

onMounted(() => {
  getUserList();
  getDepartmentList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-left">
      <el-input v-model="filterText" style="margin-bottom: 15px" placeholder="部门名称" :prefix-icon="Search" />
      <el-tree style="max-width: 600px" :data="departmentList" :props="defaultProps" node-key="id" default-expand-all="true" @node-click="handleNodeClick" />
    </el-card>
    <div class="card-right">
      <el-card class="card-select">
        <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
          <el-form-item label="用户名" prop="username" label-width="80">
            <el-input v-model="selectForm.username" autocomplete="off" clearable class="select-input-width" />
          </el-form-item>
          <el-form-item label="姓名" prop="nickname" label-width="80">
            <el-input v-model="selectForm.nickname" autocomplete="off" clearable class="select-input-width" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone" label-width="80">
            <el-input v-model="selectForm.phone" autocomplete="off" clearable class="select-input-width" />
          </el-form-item>
          <el-form-item label="所属部门" prop="department_id" label-width="80">
            <el-tree-select v-model="selectForm.department_id" clearable class="select-input-width" :data="departmentList" :props="defaultProps" node-key="id" :render-after-expand="false" />
          </el-form-item>
          <el-form-item label="状态" prop="status" label-width="80">
            <el-select v-model="selectForm.status" clearable placeholder="请选择状态" class="select-input-width">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="group-button-right">
          <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
          <el-button type="primary" :icon="Search" @click="selectUser(selectFormRef)">查询</el-button>
        </div>
      </el-card>
      <el-card class="card-content">
        <template #header>
          <div class="card-header">
            <span>用户管理</span>
            <div class="button-group">
              <el-button type="primary" :icon="Plus" @click="openDialog('添加用户')">添加用户</el-button>
              <el-button type="danger" :icon="Delete" @click="delUserBySelect" :disabled="deleteButton">删除</el-button>
            </div>
          </div>
        </template>
        <div class="text item">
          <el-table :data="userList" v-loading="loading" max-height="480" style="width: 100%" @selection-change="selectChange" table-layout="auto" empty-text="没有数据">
            <el-table-column type="selection" />
            <el-table-column type="index" :index="indexMethod" label="序号" width="70" />
            <el-table-column prop="username" label="账号" width="100" show-overflow-tooltip />
            <el-table-column prop="nickname" label="姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="department.company_name" label="部门" width="100" />
            <el-table-column label="创建时间">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <el-icon><timer /></el-icon>
                  <span style="margin-left: 10px">{{ dayjs(`${scope.row.createtime}`).format('YYYY-MM-DD HH:mm:ss') }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="角色" width="150">
              <template #default="scope">
                <el-space v-for="item in scope.row.roles">
                  <el-tag>{{ item['role.name'] }}</el-tag>
                </el-space>
              </template>
            </el-table-column>
            <el-table-column label="是否启用">
              <template #default="scope">
                <el-switch v-model="scope.row.status" @change="statusChange(scope.row)" style="--el-switch-on-color: #13ce66" :active-value="1" :inactive-value="0" />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" type="primary" @click="openDialog('编辑用户', scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="delUser(scope.row)">删除</el-button>
                <el-button size="small" plain :icon="Upload" @click="handleUpload(scope.row)" style="color: #909399"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination style="justify-content: end" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 50, 100]" :disabled="disabled" background layout="prev, pager, next, jumper, sizes, total" :total="userTotal" />
      </el-card>
      <!-- 用户资料弹框 -->
      <el-dialog v-model="dialogFormVisible" :title="dialogTitle" @close="closeDialog(userFormRef)">
        <el-form :model="userForm" label-position="right" :inline="true" :rules="userRole" ref="userFormRef" hide-required-asterisk>
          <el-form-item label="账号" prop="username" :label-width="formLabelWidth">
            <el-input v-model="userForm.username" placeholder="请输入账号" :disabled="dialogTitle === '编辑用户' ? true : false" autocomplete="off" class="input-width" />
          </el-form-item>
          <el-form-item label="密码" prop="password" :label-width="formLabelWidth">
            <el-input v-model="userForm.password" placeholder="请输入密码" type="password" autocomplete="off" class="input-width" />
          </el-form-item>
          <el-form-item label="姓名" prop="nickname" :label-width="formLabelWidth">
            <el-input v-model="userForm.nickname" placeholder="请输入姓名" autocomplete="off" class="input-width" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone" :label-width="formLabelWidth">
            <el-input v-model="userForm.phone" placeholder="请输入手机号" autocomplete="off" class="input-width" />
          </el-form-item>
          <el-form-item label="角色" prop="roleIds" :label-width="formLabelWidth">
            <el-select v-model="userForm.roleIds" class="input-width" multiple placeholder="请选择角色">
              <el-option v-for="item in roleList" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属部门" prop="department_id" :label-width="formLabelWidth">
            <el-tree-select v-model="userForm.department_id" class="input-width" placeholder="请选择所属部门" :data="departmentList" :props="defaultProps" node-key="id" :render-after-expand="false" />
          </el-form-item>
          <el-form-item label="状态" prop="status" :label-width="formLabelWidth">
            <el-radio-group v-model="userForm.status">
              <el-radio :label="userStatusType.enable">启用</el-radio>
              <el-radio :label="userStatusType.disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm(userFormRef)">提交</el-button>
          </span>
        </template>
      </el-dialog>
      <!-- 添加头像上传对话框 -->
      <el-dialog v-model="uploadDialogVisible" title="上传头像" width="800px" @close="closeUploadDialog">
        <el-row :gutter="20">
          <el-col :span="14">
            <div class="cropper-container">
              <div class="cropper-title">裁剪区域</div>
              <div v-if="!imgFile" class="upload-placeholder">
                <input type="file" accept="image/jpeg,image/png" @change="handleFileChange" class="file-input" />
                <el-button type="primary" plain>选择图片</el-button>
                <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
              </div>
              <VueCropper
                v-else
                ref="cropperRef"
                :img="imgFile"
                :outputSize="1"
                :outputType="'png'"
                :info="true"
                :full="true"
                :canMove="false"
                :canMoveBox="true"
                :original="false"
                :autoCrop="true"
                :autoCropWidth="200"
                :autoCropHeight="200"
                :fixedBox="true"
                :centerBox="true"
                :infoTrue="true"
                mode="contain"
                @real-time="realTime"
                @imgMoving="getCropData"
                @cropMoving="getCropData"
              />
            </div>
          </el-col>
          <el-col :span="10">
            <div class="preview-container">
              <div class="preview-title">预览效果</div>
              <div class="preview-box">
                <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
                <div v-else class="preview-placeholder">
                  <el-icon><Upload /></el-icon>
                  <div>请先选择图片</div>
                </div>
              </div>
              <div class="preview-tip">头像将用于个人资料展示</div>
            </div>
          </el-col>
        </el-row>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeUploadDialog">取消</el-button>
            <el-button type="primary" @click="uploadAvatar" :loading="uploadLoading">上传头像</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
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
  flex-direction: row;
}
.card-left {
  width: 220px;
  margin-right: 5px;
}
.card-right {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.card-select {
  margin-bottom: 5px;
}
.card-content {
  flex: 1;
  height: 100%;
}
.input-width {
  width: 235px;
}
.select-input-width {
  width: 225px;
}

.demo-form-inline .el-form-item {
  margin-right: 0px;
}
// 添加头像上传相关样式
.cropper-container {
  height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;

  .cropper-title {
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: bold;
  }

  .upload-placeholder {
    height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;

    .file-input {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .upload-tip {
      margin-top: 10px;
      color: #909399;
      font-size: 12px;
    }
  }
}

.preview-container {
  height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .preview-title {
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: bold;
  }

  .preview-box {
    width: 200px;
    height: 200px;
    margin: 30px auto;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f5f7fa;
    display: flex;
    justify-content: center;
    align-items: center;

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #909399;

      .el-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }
    }
  }

  .preview-tip {
    text-align: center;
    color: #909399;
    font-size: 12px;
  }
}
</style>
