import { type FormRules } from 'element-plus/lib/components/index.js';

// 自定义规则
const checkname = (rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('字典名称不能为空'));
  } else if (value.length > 11 || value.length < 1) {
    callback(new Error('字典名称长度应该在2到10之间'));
  } else {
    callback();
  }
};

const checkdescription = (rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('字典描述不能为空'));
  } else if (value.length > 24 || value.length < 1) {
    callback(new Error('字典描述长度应该在2到24之间'));
  } else {
    callback();
  }
};

export const dictionaryRule = ref<FormRules>({
  name: [{ validator: checkname, trigger: 'blur' }],
  description: [{ validator: checkdescription, trigger: 'blur' }],
  status: [
    {
      required: true,
      message: '请选择字典状态',
      trigger: 'blur'
    }
  ]
});
