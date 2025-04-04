<script setup lang="ts">
import type { loginType } from '@/types/login'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus/lib/components/index.js'
import 'iconify-icon'
import { User, Unlock } from '@element-plus/icons-vue'
import { loginByPassword } from '@/api/user'
import { useUserStore } from '@/stores/modules/user'
import { useRoute, useRouter } from 'vue-router'

const loginForm = ref<loginType>({ username: '', password: '' })
const store = useUserStore()
const loginFormRef = ref<FormInstance>()
// 跳转路由
const router = useRouter()
// 获取路由参数
const route = useRoute()

// 登录表单校验规则
const loginRule = ref<FormRules>({
  username: [
    { required: true, message: '请输入正确的用户名格式', trigger: 'blur' },
    { min: 2, max: 10, message: '用户名的长度应在2~10个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度应在6~18个字符之间', trigger: 'blur' },
  ],
})

// 登录函数
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields)
    const res = await loginByPassword(loginForm.value.username, loginForm.value.password)
    if (!res) return
    store.setUser(res)
    router.replace((route.query.returnUrl as string) || '/')
    ElMessage.success({
      message: '登录成功',
      type: 'success',
    })
  })
}
</script>

<template>
  <div class="login-full" @keydown.enter="submitForm(loginFormRef)">
    <div class="login-current login-left flex-1">
      <div class="top"></div>
      <div class="context">
        <div>
          <img src="@/assets/login-box-bg-fec91044.svg" alt="图片" style="width: 350px" />
          <div class="left-title">欢迎使用本系统</div>
        </div>
      </div>
    </div>
    <div class="login-current login-right flex-1">
      <div class="right-context m-auto">
        <el-form label-position="top" ref="loginFormRef" hide-required-asterisk="true" :rules="loginRule" class="m-auto p-20" label-width="100px" :model="loginForm" style="max-width: 500px; flex: 0 0 100%" size="large">
          <el-row>
            <el-col :span="24">
              <el-form-item style="padding-left: 10px; padding-right: 10px">
                <h2 class="text-2xl font-bold text-center" style="width: 100%">登录</h2>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="用户名" style="padding-left: 10px; padding-right: 10px" prop="username">
                <el-input v-model="loginForm.username" type="text" :prefix-icon="User" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="密码" style="padding-left: 10px; padding-right: 10px" prop="password">
                <el-input v-model="loginForm.password" type="password" :prefix-icon="Unlock" clearable show-password="true" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item style="padding-left: 10px; padding-right: 10px">
                <div class="select-option">
                  <el-checkbox label="记住我" name="type" size="small" />
                  <el-link type="primary" :underline="false">忘记密码</el-link>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item style="padding-left: 10px; padding-right: 10px">
                <div style="width: 100%">
                  <el-button type="primary" style="width: 100%" @click="submitForm(loginFormRef)">登录</el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item style="padding-left: 10px; padding-right: 10px">
                <div style="width: 100%">
                  <el-button style="width: 100%">注册</el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <div style="width: 100%">
                  <el-divider> 其他登录方式 </el-divider>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item style="padding-left: 10px; padding-right: 10px">
                <div style="width: 100%" class="other-login">
                  <el-icon :size="30" class="cursor-pointer anticon" color="rgb(153, 153, 153)">
                    <iconify-icon icon="ant-design:github-outlined"></iconify-icon>
                  </el-icon>
                  <el-icon :size="30" class="cursor-pointer anticon" color="rgb(153, 153, 153)">
                    <iconify-icon icon="ant-design:wechat-outlined"></iconify-icon>
                  </el-icon>
                  <el-icon :size="30" class="cursor-pointer anticon" color="rgb(153, 153, 153)">
                    <iconify-icon icon="ant-design:alipay-circle-outlined"></iconify-icon>
                  </el-icon>
                  <el-icon :size="30" class="cursor-pointer anticon" color="rgb(153, 153, 153)">
                    <iconify-icon icon="ant-design:weibo-circle-outlined"></iconify-icon>
                  </el-icon>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-full {
  width: 100%;
  height: 100%;
  display: flex;
  .login-current {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .login-left {
    position: relative;
    padding: 30px;
    background-color: rgba(107, 114, 128, 0.2);
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      background-image: url(../../assets/login-bg-e36b8ca7.svg);
      width: 100%;
      height: 100%;
      z-index: -1;
      content: '';
      background-position: center;
      background-repeat: no-repeat;
    }
    .top {
      color: #fff;
      font-size: 20px;
      line-height: 1;
      font-weight: 700;
    }
  }
  .login-right {
    padding: 30px;
    .right-context {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
  .left-title {
    font-size: 1.875rem;
    line-height: 2.25rem;
    color: rgba(255, 255, 255, 1);
  }
}
.flex-1 {
  flex: 1 1 0%;
}
.m-auto {
  margin: auto;
}
.other-login {
  display: flex;
  justify-content: space-between;
}
.cursor-pointer {
  cursor: pointer;
}
.anticon {
  &:hover {
    color: #409eff !important;
  }
}
.select-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
