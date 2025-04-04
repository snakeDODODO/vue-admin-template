import { type FormRules } from 'element-plus/lib/components/index.js';

export const profileRules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
});

// 创建验证函数工厂
const createPasswordValidator = (formData: any) => {
  return (rule: any, value: string, callback: (error?: Error) => void) => {
    if (value !== formData.newPassword) {
      callback(new Error('两次输入密码不一致'));
    } else {
      callback();
    }
  };
};

export const getPasswordRules = (formData: any) => reactive<FormRules>({
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
    { validator: createPasswordValidator(formData), trigger: 'blur' }
  ]
});
