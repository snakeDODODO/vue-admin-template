import { type FormRules } from 'element-plus/lib/components/index.js';

// 自定义规则
const checkDictionaryname = (rule: any, value: any, callback: any) => {
  let dictionary_name = /^[A-Za-z]{1,19}$/;
  if (!value || value.length === 0) {
    callback(new Error('字典标签不能为空'));
  } else if (value.length > 11 || value.length < 1) {
    callback(new Error('字典标签长度应该在2到10之间'));
  } else if (!dictionary_name.test(value)) {
    callback(new Error('字典标签的格式只能输入英文'));
  } else {
    callback();
  }
};

const checkDictionaryvalue = (_rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('字典详情不能为空'));
  } else if (value.length > 24 || value.length < 1) {
    callback(new Error('字典详情长度应该在2到24之间'));
  } else {
    callback();
  }
};

export const dictionarydataRule = ref<FormRules>({
  dictionaryname: [{ validator: checkDictionaryname, trigger: 'blur' }],
  dictionaryvalue: [{ validator: checkDictionaryvalue, trigger: 'blur' }],
  status: [
    {
      required: true,
      message: '请选择字典状态',
      trigger: 'blur'
    }
  ]
});
