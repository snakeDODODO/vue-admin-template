import { type FormRules } from 'element-plus/lib/components/index.js';

// 自定义规则
const checkPhone = (rule: any, value: any, callback: any) => {
  let phone = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
  if (!value || value.length === 0) {
    callback(new Error('手机号码不能为空'));
  } else if (value.length > 11 || value.length < 11) {
    callback(new Error('号码不小于11位数或者大于11位数'));
  } else if (value.length === 11) {
    if (!phone.test(value)) {
      callback(new Error('请输入正确的手机号码'));
    }
    callback();
  } else {
    callback();
  }
};

const checkUsername = (rule: any, value: any, callback: any) => {
  let username = /^[a-zA-Z][a-zA-Z0-9_]{4,17}$/;
  if (!value || value.length === 0) {
    callback(new Error('用户名不能为空'));
  } else if (!username.test(value)) {
    callback(new Error('字母开头,5~18个字符,允许字母数字下划线'));
  } else {
    callback();
  }
};

const checkPassword = (rule: any, value: any, callback: any) => {
  let password = /^[a-zA-Z]\w{5,17}$/;
  if (!value || value.length === 0) {
    callback(new Error('密码不能为空'));
  } else if (!password.test(value)) {
    callback(new Error('密码的格式应以字母开头，长度在6~18之间，只能包含字母、数字和下划线'));
  } else {
    callback();
  }
};

const checkNickname = (rule: any, value: any, callback: any) => {
  let nickname = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
  if (!value || value.length === 0) {
    callback(new Error('姓名不能为空'));
  } else if (value.length > 11 || value.length < 1) {
    callback(new Error('姓名长度应该在2到10之间'));
  } else if (!nickname.test(value)) {
    callback(new Error('姓名的格式只能输入中文、英文、数字包括下划线'));
  } else {
    callback();
  }
};

export const userRole = ref<FormRules>({
  username: [{ validator: checkUsername, trigger: 'blur' }],
  password: [{ validator: checkPassword, trigger: 'blur' }],
  nickname: [{ validator: checkNickname, trigger: 'blur' }],
  phone: [{ validator: checkPhone, trigger: 'blur' }],
  roleIds: [
    {
      required: true,
      message: '请至少选择一个角色',
      trigger: 'blur'
    }
  ],
  status: [
    {
      required: true,
      message: '请选择账号初始状态',
      trigger: 'blur'
    }
  ]
});

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
