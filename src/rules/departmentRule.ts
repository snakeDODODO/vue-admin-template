import { type FormRules } from 'element-plus/lib/components/index.js';

// 自定义规则
const checkcompany_name = (rule: any, value: any, callback: any) => {
  if (!value || value.length === 0) {
    callback(new Error('部门名称不能为空'));
  } else if (value.length > 11 || value.length < 1) {
    callback(new Error('部门名称长度应该在2到10之间'));
  } else {
    callback();
  }
};

export const departmentRule = ref<FormRules>({
  parent_id: [
    {
      required: true,
      message: '请选择上级部门',
      trigger: 'blur'
    }
  ],
  company_name: [{ validator: checkcompany_name, trigger: 'blur' }],
  sort: [
    {
      required: true,
      message: '请输入排序编号',
      trigger: 'blur'
    }
  ],
  status: [
    {
      required: true,
      message: '请选择部门状态',
      trigger: 'blur'
    }
  ]
});
