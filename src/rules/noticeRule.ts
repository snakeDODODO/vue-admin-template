import { type FormRules } from 'element-plus/lib/components/index.js';

export const noticeRule = ref<FormRules>({
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 50, message: '通知标题长度在2到50个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 2, max: 500, message: '通知内容长度在2到500个字符之间', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择通知等级', trigger: 'blur' }],
  publish_status: [{ required: true, message: '请选择发布状态', trigger: 'blur' }],
  selected_users: [
    {
      validator: (rule: any, value: any, callback: any) => {
        // 只有当选择了指定用户时才验证
        if (!value || value.length === 0) {
          callback(new Error('请选择至少一个用户'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});
