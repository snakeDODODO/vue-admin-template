<script lang="ts">
export default {
  name: 'resource'
};
</script>
<script setup lang="ts">
import { reqeustResourceList, requestAddResource, requestUpdateResource, requestDeleteResource } from '@/api/resource';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import { hidden } from '@/enum';
import { ElMessage, ElMessageBox, FormInstance, type Action } from 'element-plus/lib/components/index.js';
import { convertToVueRouterRoutes, handleTreeOptimized } from '@/utils/RouteConvert';
import { MenuItem } from '@/types/resource';
import { dayjs } from 'element-plus';
import { resourceRule } from '@/rules/resourceRule';
import { ref, onMounted } from 'vue';
const ResourceList = ref();
const expandedRows = ref<string[]>([]);
const dialogTitle = ref<string>('');
let dialogFormVisible = ref(false);
let resourceForm = ref<MenuItem>({} as MenuItem);
let resourceFormRef = ref<FormInstance>();
let formLabelWidth = '90px';
const menuOptions = ref([] as MenuItem[]);
const selectForm = ref<MenuItem>({} as MenuItem);
let selectFormRef = ref<FormInstance>();
const loading = ref(true);
const isExpanded = ref(false);

// 获取资源列表
const getResourceList = async () => {
  let queryInfo = {};
  let result = await reqeustResourceList(false, queryInfo);
  if (!result) {
    loading.value = false;
    return ElMessage.error('资源列表获取失败');
  }
  ResourceList.value = convertToVueRouterRoutes(result);
  let menu = { id: '0', title: '主类目', children: [] as MenuItem[] } as unknown as MenuItem;
  menu.children = convertToVueRouterRoutes(result);
  menuOptions.value.push(menu);
  loading.value = false;
};

// 提交资源表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid, fields) => {
    if (!valid) return console.log('提交失败，请检查输入的字段是否有问题', fields);
    let res: string;
    if (dialogTitle.value === '添加菜单' || dialogTitle.value === '新增菜单') {
      resourceForm.value.createtime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      res = await requestAddResource(resourceForm.value);
    } else if (dialogTitle.value === '编辑菜单') {
      resourceForm.value.createtime = dayjs(resourceForm.value.createtime).format('YYYY-MM-DD HH:mm:ss');
      res = await requestUpdateResource(resourceForm.value.id, resourceForm.value);
    } else {
      return ElMessage.error('无法识别对菜单的操作');
    }
    if (res! !== 'success') return ElMessage.error('操作失败');
    ElMessage.success({
      message: '操作成功',
      type: 'success'
    });
    dialogFormVisible.value = false;
    getResourceList();
  });
};

// 删除资源方法
const delResource = (id: string) => {
  ElMessageBox.confirm('请确认是否要删除菜单，若为目录，则其所属子菜单会一并删除', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    callback: async (action: Action) => {
      if (action === 'cancel') {
        return ElMessage.info('操作已经取消');
      }
      let result = await requestDeleteResource(id);
      if (result !== 'success') return ElMessage.error('删除菜单失败');
      ElMessage.success({
        message: '删除成功',
        type: 'success'
      });
      getResourceList();
    }
  });
};

// 查询资源列表方法
const selectResource = async (formEl: FormInstance | undefined) => {
  let res = await reqeustResourceList(false, selectForm.value);
  if (!res) return ElMessage.error('查询失败');
  ResourceList.value = handleTreeOptimized(res);
  ElMessage.success({
    message: '查询成功',
    type: 'success'
  });
  resetForm(formEl);
};

// 重置表单方法
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};

// 打开对话框回调
const openDialog = (title: string, row?: MenuItem) => {
  dialogFormVisible.value = true;
  dialogTitle.value = title;
  resourceForm.value.type = 0;

  if (!row) return;
  if (dialogTitle.value === '新增菜单') {
    resourceForm.value = Object.assign({});
    resourceForm.value.parent_id = row.id;
    resourceForm.value.show_parent = 1; // 设置默认值
    return;
  }
  resourceForm.value = Object.assign({}, row);
  // 如果编辑现有菜单且没有 show_parent 属性，设置默认值
  if (resourceForm.value.show_parent === undefined) {
    resourceForm.value.show_parent = 1;
  }
};

// 关闭对话框回调
const closeDialog = (formEl: FormInstance | undefined) => {
  dialogTitle.value = '';
  formEl?.clearValidate();
  resourceForm.value = Object.assign({});
};

// 新增方法来切换展开/折叠状态
const toggleExpandCollapse = () => {
  if (isExpanded.value) {
    collapseAll();
  } else {
    expandAll();
  }
  isExpanded.value = !isExpanded.value;
};

// 展开所有节点的方法
const expandAll = () => {
  expandedRows.value = ResourceList.value.map((item: { id: any }) => item.id);
  console.log('展开所有节点');
};

// 折叠所有节点的方法
const collapseAll = () => {
  expandedRows.value = [];
  console.log('折叠所有节点');
};

// 重置表单数据的方法
const resetFormData = () => {
  resetForm(resourceFormRef.value);
};

onMounted(() => {
  getResourceList();
});
</script>

<template>
  <div class="box-card">
    <el-card class="card-select">
      <el-form :inline="true" :model="selectForm" ref="selectFormRef" class="demo-form-inline">
        <el-form-item label="菜单名称" prop="title" label-width="80">
          <el-input v-model="selectForm.title" autocomplete="off" class="select-input-width" />
        </el-form-item>
        <el-form-item label="状态" prop="hidden" label-width="50">
          <el-select v-model="selectForm.hidden" placeholder="请选择状态" class="select-input-width">
            <el-option label="隐藏" value="1" />
            <el-option label="显示" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="group-button-right">
        <el-button :icon="Refresh" @click="resetForm(selectFormRef)">重置</el-button>
        <el-button type="primary" :icon="Search" @click="selectResource(selectFormRef)">查询</el-button>
      </div>
    </el-card>
    <el-card class="card-content">
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <div class="button-group">
            <el-button type="primary" :icon="Plus" @click="openDialog('添加菜单')">添加菜单</el-button>
            <el-button type="primary" @click="toggleExpandCollapse">
              {{ isExpanded ? '折叠' : '展开' }}
            </el-button>
          </div>
        </div>
      </template>
      <div class="text item">
        <el-table :data="ResourceList" v-loading="loading" style="width: 100%; margin-bottom: 20px" row-key="id" :expand-row-keys="expandedRows">
          <el-table-column label="菜单名称" width="140">
            <template #default="scope">
              {{ scope.row.title }}
            </template>
          </el-table-column>
          <el-table-column label="类型" align="center" width="100">
            <template #default="scope">
              <el-tag type="warning" v-if="scope.row.type === 0">目录</el-tag>
              <el-tag v-else-if="scope.row.type === 1">菜单</el-tag>
              <el-tag type="danger" v-else-if="scope.row.type === 2">按钮</el-tag>
              <el-tag type="info" v-else>接口</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="图标" align="center" width="100">
            <template #default="scope">
              <el-icon :size="18">
                <iconify-icon :icon="scope.row.icon"></iconify-icon>
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column label="排序" width="100">
            <template #default="scope">
              {{ scope.row.sort }}
            </template>
          </el-table-column>
          <el-table-column prop="path" label="路由地址" width="150" />
          <el-table-column prop="component" label="组件地址" width="300" />
          <el-table-column label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.hidden === 0 ? 'success' : 'info'">
                {{ hidden[scope.row.hidden] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="操作" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openDialog('编辑菜单', scope.row)">编辑</el-button>
              <el-button size="small" type="success" @click="openDialog('新增菜单', scope.row)" v-if="scope.row.type !== 2">新增</el-button>
              <el-button size="small" type="danger" @click="delResource(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 菜单详情弹框 -->
    <el-dialog v-model="dialogFormVisible" draggable width="650" :title="dialogTitle" @close="closeDialog(resourceFormRef)" class="dialog-resource">
      <el-form :model="resourceForm" label-position="right" :inline="true" :rules="resourceRule" ref="resourceFormRef" hide-required-asterisk>
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parent_id" :label-width="formLabelWidth" style="width: 100%">
              <el-tree-select :data="menuOptions" :props="{ value: 'id', label: 'title', children: 'children' }" v-model="resourceForm.parent_id" value-ley="id" placeholder="请选择上级菜单" check-strictly class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-tabs v-model="resourceForm.type" @tab-click="resetFormData">
              <el-tab-pane label="目录" :name="0"></el-tab-pane>
              <el-tab-pane label="菜单" :name="1"></el-tab-pane>
              <el-tab-pane label="按钮" :name="2"></el-tab-pane>
            </el-tabs>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item label="菜单图标" :label-width="formLabelWidth" prop="icon">
              <el-input v-model="resourceForm.icon" placeholder="请选择菜单图标" autocomplete="off" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label-width="formLabelWidth" prop="title">
              <el-input v-model="resourceForm.title" placeholder="请输入菜单名称" autocomplete="off" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="菜单的显示名字，例如'菜单管理'或者'about'" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  菜单名称
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item :label-width="formLabelWidth" prop="path">
              <el-input v-model="resourceForm.path" placeholder="请输入路由地址" autocomplete="off" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="通过route方法或者url地址导向的path路径，例如'role'" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  路由地址
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" :label-width="formLabelWidth" prop="sort">
              <el-input-number v-model="resourceForm.sort" placeholder="请输入排序编号" class="input-width" :min="1" :max="10" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type == 1">
            <el-form-item :label-width="formLabelWidth" prop="component">
              <el-input v-model="resourceForm.component" placeholder="请输入组件路径" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="routes文件中需要渲染的组件component,通常为组件存放的相对路径，例如'/settings/resource'" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  组件路径
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item :label-width="formLabelWidth" prop="name">
              <el-input v-model="resourceForm.name" placeholder="请输入组件名" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="组件内部template定义的组件名（name），例如'role'或者'User'" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  组件名
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type == 0">
            <el-form-item :label-width="formLabelWidth" prop="redirect">
              <el-input v-model="resourceForm.redirect" placeholder="请输入组件名称" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="目录类型需要有一个默认渲染的子页面，例如'/settings/user'" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  重定向
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="permission" :label-width="formLabelWidth">
              <el-input placeholder="请输入权限标识" v-model="resourceForm.permission" class="input-width" />
              <template #label>
                <span class="tips">
                  <el-tooltip content="输入权限标识，例如：permission:btn:add" placement="top">
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  权限标识
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item label="是否缓存" prop="cache" :label-width="formLabelWidth">
              <el-radio-group v-model="resourceForm.cache">
                <el-radio :label="1">缓存</el-radio>
                <el-radio :label="0">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type == 1">
            <el-form-item label="固定缓存" prop="affix" :label-width="formLabelWidth">
              <el-radio-group v-model="resourceForm.affix">
                <el-radio :label="1">固定</el-radio>
                <el-radio :label="0">不固定</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item label="面包屑" prop="breadcrumb" :label-width="formLabelWidth">
              <el-radio-group v-model="resourceForm.breadcrumb">
                <el-radio :label="0">显示</el-radio>
                <el-radio :label="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="resourceForm.type != 2">
            <el-form-item label="显示状态" prop="hidden" :label-width="formLabelWidth">
              <el-radio-group v-model="resourceForm.hidden">
                <el-radio :label="0">显示</el-radio>
                <el-radio :label="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 新增父级菜单显示/隐藏选项 -->
          <el-col :span="12" v-if="resourceForm.type === 0 || resourceForm.type === 1">
            <el-form-item label="父级菜单" prop="show_parent" :label-width="formLabelWidth">
              <el-radio-group v-model="resourceForm.show_parent">
                <el-radio :label="1">显示</el-radio>
                <el-radio :label="0">隐藏</el-radio>
              </el-radio-group>
              <template #label>
                <span class="tips">
                  <el-tooltip
                    content="选择“显示”，即使目录或菜单下只有一个子节点，也会显示父节点。
                             选择“隐藏”，如果目录或菜单下只有一个子节点，则只显示该子节点，隐藏父节点。
                             如果是叶子节点，请选择“否”。"
                    placement="top"
                  >
                    <el-icon size="14">
                      <iconify-icon icon="ep-info-filled"></iconify-icon>
                    </el-icon>
                  </el-tooltip>
                  权限标识
                </span>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm(resourceFormRef)">提交</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
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
  flex-direction: column;
}
.card-select {
  margin-bottom: 5px;
}
.card-content {
  flex: 1;
}
.input-width {
  width: 100%;
}
.select-input-width {
  width: 225px;
}

.demo-form-inline .el-form-item {
  margin-right: 0px;
}
.dialog-resource {
  .el-form-item {
    margin-right: 0px;
    width: 100%;
  }
}
.tips {
  display: flex;
  align-items: center;
  i {
    padding-right: 5px;
  }
}
</style>

function dayjs() { throw new Error('Function not implemented.') }
