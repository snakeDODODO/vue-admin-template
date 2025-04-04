<script lang="ts">
export default {
  name: 'UserProfile'
};
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus/lib/components/index.js';
import { User as UserIcon } from '@element-plus/icons-vue';
import { requestChangeProfile } from '@/api/user';
import { useUserStore } from '@/stores/modules/user';
import { storeToRefs } from 'pinia';
import { dayjs } from 'element-plus';
import { User } from '@/types/user';
import { profileRules } from '@/rules/userRule';
import { getAvatarUrl } from '@/utils/url';

// 用户信息
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

// 表单引用
const userFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 是否显示修改密码表单
const showPasswordForm = ref(false);

// 用户表单数据
const userForm = reactive<User>({} as User);

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码表单验证规则
const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 头像上传地址
const uploadUrl = import.meta.env.VITE_API_URL + '/upload/avatar';

// 头像上传前的钩子
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

// 头像上传成功的钩子
const handleAvatarSuccess = async (response: any) => {
  if (response.code === 200) {
    try {
      const avatarUrl = response.data.url;

      // 更新本地表单数据
      userForm.avatar = avatarUrl;

      // 更新Pinia中的用户信息
      userStore.setUser({
        ...user.value,
        avatar: avatarUrl
      });

      ElMessage.success('头像上传成功');
    } catch (error) {
      console.error('更新头像失败:', error);
      ElMessage.error('头像更新失败');
    }
  } else {
    ElMessage.error(response.message || '头像上传失败');
  }
};

// 初始化用户信息
const initUserInfo = () => {
  if (user.value) {
    userForm.username = user.value.username || '';
    userForm.nickname = user.value.nickname || '';
    userForm.phone = user.value.phone || '';
    userForm.avatar = user.value.avatar || '';
    userForm.company_name = user.value.company_name || '';
  }
};

// 提交用户信息表单
const submitUserForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      try {
        await requestChangeProfile(userForm, userStore.user.id);

        // 更新Pinia中的用户信息
        userStore.setUser({
          ...user.value,
          nickname: userForm.nickname,
          phone: userForm.phone
          // 不更新avatar
        });

        ElMessage.success('个人信息更新成功');
      } catch (error) {
        console.error('更新用户信息失败:', error);
        ElMessage.error('个人信息更新失败');
      }
    }
  });
};

// 提交密码表单
const submitPasswordForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      try {
        // 这里调用修改密码的API
        // const res = await changePassword({
        //   oldPassword: passwordForm.oldPassword,
        //   newPassword: passwordForm.newPassword
        // });
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        ElMessage.success('密码修改成功，请重新登录');
        // 清空表单
        formEl.resetFields();
        // 隐藏密码表单
        showPasswordForm.value = false;

        // 可选：登出用户，重新登录
        // userStore.logout();
        // router.push('/login');
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('密码修改失败');
      }
    }
  });
};

// 切换密码表单显示状态
const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value;
  if (!showPasswordForm.value) {
    passwordFormRef.value?.resetFields();
  }
};

onMounted(() => {
  initUserInfo();
});
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="avatar-container">
            <div class="avatar-display">
              <img v-if="userForm.avatar" :src="getAvatarUrl(userForm.avatar)" class="avatar" />
              <el-icon v-else class="avatar-placeholder"><UserIcon /></el-icon>
            </div>
            <el-upload class="avatar-uploader" :action="uploadUrl + '/' + `${userStore.user.id}`" name="avatar" auto-upload="false" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="{ Authorization: userStore.userToken }">
              <el-button type="primary" size="small">上传头像</el-button>
            </el-upload>
          </div>
          <div class="user-info">
            <h3>{{ userForm.nickname }}</h3>
            <p>部门：{{ userForm.company_name }}</p>
            <p>注册时间：{{ dayjs(userForm.createtime).format('YYYY-MM-DD HH:mm:ss') }}</p>
          </div>
        </el-col>

        <el-col :span="16">
          <el-form ref="userFormRef" :model="userForm" :rules="profileRules" label-width="100px" class="user-form">
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" disabled />
            </el-form-item>

            <el-form-item label="姓名" prop="nickname">
              <el-input v-model="userForm.nickname" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitUserForm(userFormRef)">保存修改</el-button>
              <el-button @click="togglePasswordForm">{{ showPasswordForm ? '取消修改密码' : '修改密码' }}</el-button>
            </el-form-item>
          </el-form>

          <el-collapse-transition>
            <div v-show="showPasswordForm">
              <el-divider content-position="left">修改密码</el-divider>

              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" class="password-form">
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="submitPasswordForm(passwordFormRef)">确认修改</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-transition>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.profile-container {
  padding: 20px;

  .profile-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;

    .avatar-display {
      border: 1px dashed #d9d9d9;
      border-radius: 50%;
      overflow: hidden;
      width: 178px;
      height: 178px;
      margin-bottom: 15px;

      .avatar {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .avatar-placeholder {
        font-size: 64px;
        color: #8c939d;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .avatar-uploader {
      margin-top: 10px;
    }

    .upload-tip {
      color: #606266;
      font-size: 14px;
      margin-top: 10px;
    }
  }
  .user-info {
    text-align: center;
    margin-bottom: 20px;
    h3 {
      margin-bottom: 10px;
    }
    p {
      color: #606266;
      margin: 5px 0;
    }
  }
  .user-form,
  .password-form {
    max-width: 500px;
  }
  .el-divider {
    margin: 24px 0;
  }
}
</style>
