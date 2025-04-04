<script setup lang="ts">
import 'iconify-icon';
import { useSettings } from '@/stores/modules/settings';
import { useUserStore } from '@/stores/modules/user';
import { ElMessage, ElNotification } from 'element-plus/lib/components/index.js';
import screenfull from 'screenfull';
import { useRouter, useRoute, type RouteLocationMatched } from 'vue-router';
import { usePermissionStore } from '@/stores/modules/permission';
import { getAvatarUrl } from '@/utils/url';
import { UserFilled } from '@element-plus/icons-vue';
import { reqeustMessageList, requestUpdateMessageStatus, requestUpdateMessageAll } from '@/api/message';
import type { ConsultMessageParams } from '@/types/consult';
import { Message } from '@/types/message';
import { dayjs } from 'element-plus';
// import { BreadcrumbItemProps } from '@/types/tabsview'
// import { resetRouter } from '@/router'

const Settingstore = useSettings();
const UserStore = useUserStore();
const CurrenFullscreenIcon = ref<string>('ep-full-screen');
const permissionStore = usePermissionStore();
const currentRoute = useRoute();
const router = useRouter();
let searchCriteria = ref<ConsultMessageParams>({} as ConsultMessageParams); // 搜索条件
const activeName = ref('first');
// 使用对象形式跟踪每个通知的悬停状态，以ID为键
// const hoverStatus = ref<Record<number, boolean>>({});
let Total = ref();
const messageOfStartList = ref<Message[]>([]);
const loading = ref(false);
const messageOfUnstartList = ref<Message[]>([]);
const is_dot = ref<boolean>(false);

// 监听未读消息数量
// 使用计算属性监听两个列表的总数量
const totalUnreadCount = computed(() => {
  return messageOfStartList.value.length + messageOfUnstartList.value.length;
});

// 监听计算属性的变化
watch(
  totalUnreadCount,
  newValue => {
    is_dot.value = (newValue > 0) as boolean;
  },
  { immediate: true } // 立即执行一次
);

const getMessagetionOfStartList = async () => {
  searchCriteria.value.currentPage = 1;
  searchCriteria.value.pageSize = 3;
  searchCriteria.value.is_read = 0;
  let queryInfo = {
    ...searchCriteria.value,
    time_comparison: 'greater_than'
  };
  loading.value = true;
  let result = await reqeustMessageList(UserStore.user.id, queryInfo);
  loading.value = false;
  if (!result) return ElMessage.error('获取消息列表失败');
  Total.value = result.count;
  messageOfStartList.value = result.rows;
};

const getMessagetionOfUnstartList = async () => {
  searchCriteria.value.currentPage = 1;
  searchCriteria.value.pageSize = 3;
  searchCriteria.value.is_read = 0;
  let queryInfo = {
    ...searchCriteria.value,
    time_comparison: 'less_than'
  };
  // loading.value = true;
  let result = await reqeustMessageList(UserStore.user.id, queryInfo);
  // loading.value = false;
  if (!result) return ElMessage.error('获取未开始消息列表失败');
  // Total.value = result.count;
  messageOfUnstartList.value = result.rows;
};

// 开启全屏方法
const CurrenFullscreen = () => {
  // screenfull.isEnabled  此方法返回布尔值，判断当前能不能进入全屏
  // if (!screenfull.isEnabled) {
  //   return false
  // }
  // screenfull.toggle 此方法是执行全屏化操作。如果已是全屏状态，则退出全屏
  screenfull.toggle();
};

// 退出登录方法
const logout = () => {
  // 清空用户信息跳转登录界面
  let result = UserStore.delUser();
  if (result === 'fail') return ElMessage.error('退出失败');
  permissionStore.permissionRoutes = [];
  ElMessage.success({
    message: '退出成功',
    type: 'success'
  });
  // resetRouter()
  // router.removeRoute('settings')
  // router.removeRoute('bill')
  // console.log(router.getRoutes())
  router.replace('/login');
  // location.href = '/login'
};

const breadcrumbList = computed<RouteLocationMatched[]>(() => {
  let breadcrumbs = [] as RouteLocationMatched[];
  let matched = currentRoute.matched.filter(item => item.meta && item.meta.title);
  const first = matched[0];
  if (first.name !== 'home') {
    matched.unshift({ path: '/home', meta: { title: '首页' } } as any);
  }
  breadcrumbs = matched.filter(item => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== 0;
  });
  return breadcrumbs;
});

// 计算面包屑数组
// const breadcrumbList = computed<BreadcrumbItemProps[]>(() => {
//   // 取出我们之前处理好的路由记录数组
//   let result = currentRoute.meta.breadcrumb as BreadcrumbItemProps[]
//   // 如果result中是undefined，说明当前路由是工作台workbench
//   if (!result) {
//     result = [{ name: 'home', title: '首页', path: '/home' }]
//   }
//   // 如果路由记录数组中的第一个路由不是工作台，那就把工作台放在第一位
//   if (result[0].name !== 'home') {
//     result.unshift({ name: 'home', title: '首页', path: '/home' })
//   }
//   return result
// })

// 连接WebSocket
const connectWebSocket = (userId: string) => {
  const ws = new WebSocket(`ws://localhost:3000/ws/notice?userId=${userId}`);

  ws.onopen = () => {
    console.log('WebSocket连接已建立');
  };

  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log('收到消息:', data);

    // 使用ElNotification显示通知
    if (data.type === 'connection') return;
    ElNotification({
      title: data.title || '新消息通知',
      message: data.content || data.message || '您有一条新消息',
      type: data.type === 'warning' ? 'warning' : data.type === 'error' ? 'error' : data.type === 'success' ? 'success' : 'info',
      duration: 4500,
      onClick: () => {
        // 点击通知后的操作，例如跳转到消息中心
        router.push('/settings/message');
      }
    });

    // 收到新消息后刷新消息列表
    getMessagetionOfStartList();
    getMessagetionOfUnstartList();
  };

  ws.onclose = () => {
    console.log('WebSocket连接已关闭');
    // 可以在这里添加重连逻辑
    setTimeout(() => {
      connectWebSocket(userId);
    }, 5000);
  };

  ws.onerror = error => {
    console.error('WebSocket错误:', error);
  };

  return ws;
};

// 标记所有通知为已读
const markAllAsRead = async () => {
  // 这里添加标记所有通知为已读的逻辑
  let result = await requestUpdateMessageAll(UserStore.user.id);
  if (result !== 'success') return ElMessage.error('状态修改失败');
  messageOfStartList.value = [];
  messageOfUnstartList.value = [];
  ElMessage.success('已全部标记为已读');
};

// 查看所有通知
const viewAllNotifications = () => {
  // 使用绝对路径跳转到通知中心页面，避免路径重复问题
  router.push('/settings/message');
};

// 标记单个通知为已读
const markAsRead = async (id: number, event: Event, noticeType: number) => {
  event.stopPropagation(); // 阻止事件冒泡
  // 这里添加标记单个通知为已读的逻辑
  let MessageToRead = [];
  if (noticeType === 0) {
    let notificationIndex = messageOfStartList.value.findIndex(item => item.id === id);
    if (notificationIndex !== -1) {
      // 在实际应用中，这里应该调用API将通知标记为已读
      MessageToRead.push(id);
      let result = await requestUpdateMessageStatus(MessageToRead);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success(`已将"${messageOfStartList.value[notificationIndex].title}"标记为已读`);
      messageOfStartList.value.splice(notificationIndex, 1);
      getMessagetionOfStartList();
    }
  } else {
    let notificationIndex = messageOfUnstartList.value.findIndex(item => item.id === id);
    if (notificationIndex !== -1) {
      // 在实际应用中，这里应该调用API将通知标记为已读
      MessageToRead.push(id);
      let result = await requestUpdateMessageStatus(MessageToRead);
      if (result !== 'success') return ElMessage.error('状态修改失败');
      ElMessage.success(`已将"${messageOfUnstartList.value[notificationIndex].title}"标记为已读`);
      getMessagetionOfUnstartList();
    }
  }
};

onMounted(() => {
  screenfull.on('change', () => {
    if (!screenfull.isFullscreen) {
      CurrenFullscreenIcon.value = 'ep-full-screen';
    } else {
      CurrenFullscreenIcon.value = 'ep-rank';
    }
  });
  getMessagetionOfStartList();
  getMessagetionOfUnstartList();
  // websocket连接
  connectWebSocket(UserStore.user.id);
});
// 添加通知数据
const notifications1 = ref([
  {
    id: 1,
    title: '系统消息',
    content: '您有一个新的任务需要处理',
    time: '09-18',
    type: '通知' // 添加通知类型
  },
  {
    id: 2,
    title: '系统更新',
    content: '系统将于今晚22:00进行维护更新',
    time: '09-17',
    type: '更新' // 添加通知类型
  },
  {
    id: 3,
    title: '安全提醒',
    content: '您的账户有异常登录，请及时查看',
    time: '09-16',
    type: '警告' // 添加通知类型
  }
]);
</script>

<template>
  <div class="navbar">
    <div class="navbar-left">
      <div class="navbar-item" @click="Settingstore.ChangeisCollapsed">
        <el-icon :size="20">
          <iconify-icon :icon="Settingstore.isCollapsedValue === true ? 'ep-expand' : 'ep-fold'"></iconify-icon>
        </el-icon>
      </div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: item.path }" v-for="item in breadcrumbList" :key="item.name">
          <span>{{ item.meta.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="navbar-right">
      <div class="navbar-item">
        <el-dropdown trigger="click" placement="bottom-end">
          <el-badge class="notice-badge" :is-dot="is_dot">
            <el-icon :size="18">
              <iconify-icon icon="ep-bell"></iconify-icon>
            </el-icon>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu class="notice-dropdown" style="width: 330px">
              <el-tabs v-model="activeName" class="notice-tabs" stretch="true">
                <el-tab-pane label="通知" name="first">
                  <div class="noteiceList">
                    <template v-if="messageOfStartList.length > 0">
                      <div v-for="item in messageOfStartList" :key="item.id" class="notice-item">
                        <!-- 现有的通知内容 -->
                        <!-- <div class="notice-content" @mousemove="hoverStatus[item.id] = true" @mouseleave="hoverStatus[item.id] = false"> -->
                        <div class="notice-content">
                          <div class="notice-container">
                            <div class="notice-title">
                              <span>{{ item.type === 1 ? '系统消息' : '公告通知' }}</span>
                              <el-tag v-if="dayjs().isBefore(item.terminate_time)">进行中</el-tag>
                              <el-tag type="danger" v-else>已过期</el-tag>
                            </div>
                            <div class="notice-text">
                              <span>{{ item.title }}</span>
                            </div>
                            <div class="notice-text-time">
                              <span class="time">{{ dayjs(item.create_time).format('MM-DD') }}</span>
                            </div>
                          </div>
                          <!-- 添加悬浮显示的已读按钮 -->
                          <div class="read-btn-wrapper">
                            <button class="read-btn" @click="markAsRead(item.id, $event, item.type)">已读</button>
                          </div>
                          <!-- <Transition class="read-btn-wrapper" name="slide-up">
                            <span class="time" v-if="!hoverStatus[item.id]">{{ dayjs(item.create_time).format('MM-DD') }}</span>
                            <div v-else>
                              <button class="read-btn" @click="markAsRead(item.id, $event)">已读</button>
                            </div>
                          </Transition> -->
                        </div>
                        <!-- 为所有通知添加分割线 -->
                        <el-divider class="notice-divider" />
                      </div>
                      <!-- 底部操作栏 -->
                      <div class="notice-footer">
                        <div class="notice-footer-item" @click="markAllAsRead">全部已读</div>
                        <el-divider direction="vertical" />
                        <div class="notice-footer-item" @click="viewAllNotifications">查看更多</div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="empty-notice">
                        <el-icon :size="48"><iconify-icon icon="ep-bell" /></el-icon>
                        <p>暂无通知</p>
                      </div>
                    </template>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="消息" name="second">
                  <div class="noteiceList">
                    <template v-if="notifications1.length > 0">
                      <div v-for="item in notifications1" :key="item.id" class="notice-item">
                        <div class="notice-content">
                          <el-avatar :icon="UserFilled" size="30" class="notice-content-avatar" />
                          <div class="notice-container">
                            <div class="notice-title">
                              <span>{{ item.title }}</span>
                            </div>
                            <div class="notice-text">
                              <span>{{ item.content }}</span>
                            </div>
                            <div class="notice-text-type">
                              <span class="type">{{ item.type }}</span>
                            </div>
                          </div>
                          <!-- 添加悬浮显示的已读按钮 -->
                          <div class="read-btn-wrapper">
                            <button class="read-btn">已读</button>
                          </div>
                        </div>
                        <!-- 为所有通知添加分割线 -->
                        <el-divider class="notice-divider" />
                      </div>
                      <!-- 底部操作栏 -->
                      <div class="notice-footer">
                        <div class="notice-footer-item" @click="markAllAsRead">全部已读</div>
                        <el-divider direction="vertical" />
                        <div class="notice-footer-item" @click="viewAllNotifications">查看更多</div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="empty-notice">
                        <el-icon :size="48"><iconify-icon icon="ep-chat-dot-round" /></el-icon>
                        <p>暂无消息</p>
                      </div>
                    </template>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="待办" name="third">
                  <div class="noteiceList">
                    <template v-if="messageOfUnstartList.length > 0">
                      <div v-for="item in messageOfUnstartList" :key="item.id" class="notice-item">
                        <div class="notice-content">
                          <div class="notice-container">
                            <div class="notice-title">
                              <span>{{ item.type === 1 ? '系统消息' : '公告通知' }}</span>
                              <el-tag type="info">未开始</el-tag>
                            </div>
                            <div class="notice-text">
                              <span>{{ item.title }}</span>
                            </div>
                            <div class="notice-text-time">
                              <span class="time">{{ dayjs(item.create_time).format('MM-DD') }}</span>
                            </div>
                          </div>
                          <!-- 添加悬浮显示的已读按钮 -->
                          <div class="read-btn-wrapper">
                            <button class="read-btn" @click="markAsRead(item.id, $event, item.type)">已读</button>
                          </div>
                        </div>
                        <!-- 为所有通知添加分割线 -->
                        <el-divider class="notice-divider" />
                      </div>
                      <!-- 底部操作栏 -->
                      <div class="notice-footer">
                        <div class="notice-footer-item" @click="markAllAsRead">全部已读</div>
                        <el-divider direction="vertical" />
                        <div class="notice-footer-item" @click="viewAllNotifications">查看更多</div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="empty-notice">
                        <el-icon :size="48"><iconify-icon icon="ep-tickets" /></el-icon>
                        <p>暂无待办</p>
                      </div>
                    </template>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="navbar-item" @click="CurrenFullscreen">
        <el-icon :size="18">
          <iconify-icon :icon="CurrenFullscreenIcon"></iconify-icon>
        </el-icon>
      </div>
      <div class="navbar-item">
        <el-dropdown>
          <span class="el-dropdown-link">
            <i class="user-avatar" style="margin-right: 12px">
              <el-avatar :size="30" :src="getAvatarUrl(UserStore.user.avatar)" fit="cover" />
            </i>
            <span>{{ UserStore.user.username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <router-link :to="'/profile/userprofile'"> 个人中心 </router-link>
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-deep() {
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: 400 !important;
  }
}
.navbar {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  padding-right: 10px;
  align-items: center;
  position: relative;
}
.navbar-left {
  display: flex;
  line-height: 50px;
}
.el-breadcrumb {
  display: flex;
  align-items: center;
}
.navbar-right {
  display: flex;
  align-items: center;
}
.navbar-item {
  cursor: pointer;
  padding: 0 15px;
  transition: background 0.3s;
  height: 50px;
  display: flex;
  align-items: center;
}
.navbar-item:hover {
  background-color: rgba(0, 0, 0, 0.025);
}
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}
::v-deep() .el-tabs__nav-wrap {
  padding: 0 30px;
}
.noteiceList {
  padding: 0px 24px 0;

  .notice-item {
    &:last-child {
      margin-bottom: 0; // 移除最后一个通知的底部间距
    }
  }

  .notice-divider {
    margin: 0;
  }

  // 添加底部操作栏样式
  .notice-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;

    .notice-footer-item {
      cursor: pointer;
      color: #409eff;
      font-size: 13px;
      padding: 0 10px;

      &:hover {
        color: #66b1ff;
      }
    }

    .el-divider--vertical {
      height: 14px;
      margin: 0;
    }
  }
}
.notice-content {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  position: relative; // 添加相对定位

  .notice-content-avatar {
    margin-right: 16px;
  }

  .notice-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    .notice-title {
      cursor: pointer;
      display: flex;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5715;
      margin-bottom: 8px;
      justify-content: space-between;
    }
    .notice-text {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notice-text-time {
      margin-top: 4px;
      color: #00000073;
    }
  }

  // 添加已读按钮样式
  .read-btn-wrapper {
    position: absolute;
    right: 0;
    bottom: 8px;
    display: none;

    .read-btn {
      background-color: white;
      border: 1px solid rgba(0, 0, 0, 0.5);
      color: rgba(0, 0, 0, 0.5);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f5f5; // 修改为灰色背景
        border-color: rgb(121, 187, 255);
        color: rgb(121, 187, 255);
      }
    }
    .time {
      margin-top: 4px;
      color: #00000073;
    }
  }

  // 当鼠标悬停在通知内容上时显示按钮
  &:hover {
    .read-btn-wrapper {
      display: block;
    }
  }
}
.empty-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;

  .el-icon {
    margin-bottom: 16px;
    color: #dcdfe6;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
