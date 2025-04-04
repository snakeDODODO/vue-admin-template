import { type FormRules } from 'element-plus/lib/components/index.js'

const checkSys_name = (rule: any, value: any, callback: any) => {
  let sys_name = /^[A-Za-z]{1,19}$/
  if (!value || value.length === 0) {
    callback(new Error('角色标识不能为空'))
  } else if (!sys_name.test(value)) {
    callback(new Error('只能输入2~20个的英文字符'))
  } else {
    callback()
  }
}

const checkName = (rule: any, value: any, callback: any) => {
  let name = /^[\u4E00-\u9FA5A-Za-z0-9]{2,20}$/
  if (!value || value.length === 0) {
    callback(new Error('角色名称不能为空'))
  } else if (!name.test(value)) {
    callback(new Error('只能输入3~21个的中文、英文、数字'))
  } else {
    callback()
  }
}

export const roleRule = ref<FormRules>({
  name: [{ validator: checkName, trigger: 'blur' }],
  sys_name: [{ validator: checkSys_name, trigger: 'blur' }],
  status: [
    {
      required: true,
      message: '请选择账号初始状态',
      trigger: 'blur',
    },
  ],
})
