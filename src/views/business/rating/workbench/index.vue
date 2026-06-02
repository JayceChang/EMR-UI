<template>
  <div class="workbench-container">
    <!--统计栏-->
    <div class="statistics-container">
      <div class="statistics-content">
        <template v-for="(item, index) in statisticsData" :key="index">
          <div class="statistics-card">
            <div class="card-main">
              <div class="card-icon">
                <div class="icon-wrapper">
                  <img :src="item.iconSrc" :alt="item.title" class="custom-icon" />
                </div>
              </div>
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-count-wrapper">
                  <span class="card-count">{{ item.count }}</span>
                  <span class="card-unit">个</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="index < statisticsData.length - 1" class="divider-line"></div>
        </template>
      </div>
    </div>

    <div>
      <a-row :gutter="16">
        <!-- 未读消息、公告 -->
        <a-col :span="14">
          <div class="message-panel">
            <div class="message-header">
              <div class="message-title">通知消息</div>
              <div class="quick-menu-config">
                <a-button type="text" size="small" @click="toRouter(messageType)">
                  <MoreOutlined />
                  更多
                </a-button>
              </div>
            </div>
            <div class="message-tabs">
              <a-badge :count="messageStore.unreadMessageCount">
                <div class="message-tab" :class="{ active: messageType === '1' }" @click="messageType = '1'">未读消息</div>
              </a-badge>
              <a-badge :count="messageStore.unreadNoticeCount">
                <div class="message-tab" :class="{ active: messageType === '2' }" @click="messageType = '2'">未读公告</div>
              </a-badge>
            </div>

            <div class="message-list" v-if="currentMessageList.length != 0">
              <div v-for="(item, index) in currentMessageList" :key="index" class="message-item" @click="handleMessageClick(item)">
                <div class="message-content">
                  <div class="message-number">
                    <div class="number-circle">{{ index + 1 }}</div>
                  </div>
                  <div class="message-info">
                    <div class="message-title">{{ item.title }}</div>
                  </div>
                </div>
                <div class="message-meta">
                  <div class="message-author">{{ item.author }}</div>
                  <div class="message-time">{{ item.createTime }}</div>
                </div>
              </div>
            </div>
            <div v-else-if="currentMessageList.length == 0" class="empty-list">
              <img src="/@/assets/images/workbench/empty-message.png" />
            </div>
          </div>
        </a-col>
        <a-col :span="10">
          <!--快捷菜单-->
          <div class="quick-menu-panel">
            <div class="quick-menu-header">
              <div class="header-left">
                <!-- <div class="header-icon">
                  <img src="/@/assets/images/workbench/icons/outing-approval-icon.svg" alt="快捷菜单" class="focus-icon" />
                </div> -->
                <div class="focus-indicators-title">快捷菜单</div>
              </div>
              <div class="quick-menu-config">
                <a-button type="text" size="small" @click="handleConfigQuickMenu">
                  <SettingOutlined />
                  配置
                </a-button>
              </div>
            </div>
            <div class="quick-menu-content">
              <div v-for="(item, index) in quickMenuItems" :key="index" class="quick-menu-item" @click="handleQuickMenuClick(item)">
                <div class="menu-icon">
                  <div class="icon-bg">
                    <img :src="item.iconSrc" :alt="item.title" class="menu-icon-img" />
                  </div>
                </div>
                <div class="menu-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
          <!--预警信息-->
          <div class="warning-panel">
            <div class="warning-header">
              <div class="header-left">
                <!-- <div class="warning-icon">
                  <img src="/@/assets/images/workbench/icons/warning.svg" alt="预警" class="warning-icon-img" />
                </div> -->
                <div class="warning-title">预警信息</div>
                <div class="warning-count">
                  <span class="count-number">{{ warningCount }}</span>
                </div>
              </div>
              <div class="quick-menu-config">
                <a-button type="text" size="small" @click="handleMoreWarnings">
                  <MoreOutlined />
                  更多
                </a-button>
              </div>
            </div>

            <div class="warning-content">
              <div class="warning-table-header">
                <div class="header-item indicator-name">预警指标</div>
                <div class="header-item status">状态</div>
                <div class="header-item date">异常日期</div>
              </div>

              <div class="warning-list">
                <div v-for="(item, index) in warningList" :key="index" class="warning-item">
                  <div class="warning-indicator">
                    <a-tooltip placement="topLeft" :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }">
                      <template #title>
                        <span :title="text">{{ item.indicator }}</span>
                      </template>
                      <span>{{ item.indicator }}</span>
                    </a-tooltip>
                    <!-- {{ item.indicator }} -->
                  </div>
                  <div class="warning-status">
                    <span class="status-text">{{ item.status }}</span>
                  </div>
                  <div class="warning-date">{{ item.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="14">
          <div class="progress-panel">
            <div class="progress-header">
              <div class="header-left">
                <div class="progress-title">填报进度</div>
              </div>
            </div>

            <div class="progress-content">
              <div class="progress-table-header">
                <div class="header-item chapter-name">章节</div>
                <div class="header-item total">总项</div>
                <div class="header-item unfilled">待填报</div>
                <div class="header-item filled">已完成</div>
                <div class="header-item unopened">未开展</div>
              </div>

              <div class="progress-list">
                <div v-for="(item, index) in currentProgressList" :key="index" class="progress-item">
                  <div class="progress-chapter">{{ item.name }}</div>
                  <div class="progress-total">{{ item.total }}</div>
                  <div class="progress-unfilled" @click="handleClickReportingProgress(0, undefined,item.id)" :class="{ 'zero-value': item.unfilled === 0 }">
                    {{ item.unfilled }}
                  </div>
                  <div class="progress-filled" @click="handleClickReportingProgress(1, undefined,item.id)" :class="{ 'zero-value': item.filled === 0 }">
                    {{ item.filled }}
                  </div>
                  <div class="progress-unopened" @click="handleClickReportingProgress(undefined, 2,item.id)" :class="{ 'zero-value': item.unopened === 0 }">
                    {{ item.unopened }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="10">
          <div class="focus-indicators-panel">
            <div class="focus-indicators-header">
              <div class="header-left">
                <!-- <div class="header-icon">
                  <img src="/@/assets/images/workbench/icons/leave-approval-icon.svg" alt="关注指标" class="focus-icon" />
                </div> -->
                <div class="focus-indicators-title">关注指标</div>
                <div class="focus-count">
                  <span class="count-number">{{ focusIndicatorCount }}</span>
                </div>
              </div>

              <div class="quick-menu-config">
                <a-button type="text" size="small" @click="handleMoreUserFocusIndicator">
                  <MoreOutlined />
                  更多
                </a-button>
              </div>
            </div>

            <div class="focus-indicators-content" v-if="currentIndicatorList.length != 0">
              <div class="focus-indicators-table-header">
                <div class="header-item indicator-name">指标名称</div>
                <div class="header-item focus-person">责任人</div>
                <div class="header-item department">责任科室</div>
              </div>

              <div class="focus-indicators-list">
                <div v-for="(item, index) in currentIndicatorList" :key="index" class="focus-indicators-item">
                  <div class="focus-indicators-indicator-name">
                    <a-tooltip placement="topLeft" :overlayStyle="{ maxWidth: '600px', whiteSpace: 'pre-wrap' }">
                      <template #title>
                        <span>{{ item.name || item.indicator_name }}</span>
                      </template>
                      <span>{{ item.name || item.indicator_name }}</span>
                    </a-tooltip>
                  </div>
                  <div class="focus-indicators-person">{{ item.focusPersonName || '-' }}</div>
                  <div class="focus-indicators-department">{{ item.focusPersonDeptName || '-' }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-list">
              <img src="/@/assets/images/workbench/empty-message.png" />
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
  <MessageDetailModal ref="messageDetailModalRef" @refresh="handleMessageRefresh" />
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
  import { useUserStore } from '/@/store/modules/system/user';
  import { useMessageStore } from '/@/store/modules/system/message';
  import { workbenchApi } from '/@/api/business/rating/workbench/workbench-api';
  import MessageDetailModal from '/@/layout/components/header-user-space/header-message-detail-modal.vue';
  import { useRouter } from 'vue-router';
  import { Alert } from 'ant-design-vue';
  import { SettingOutlined, MoreOutlined } from '@ant-design/icons-vue';
  import { warningApi } from '/@/api/business/rating/indicator/warning/warning-api';

  const userStore = useUserStore();
  const messageStore = useMessageStore(); // 添加消息 store
  const employeeId = userStore.$state.employeeId; //用户ID
  const avatar = userStore.avatar; //用户头像
  const messageType = ref('1'); //默认选中未读消息
  const messageDetailModalRef = ref(); //消息弹出框引用
  const show = ref(false);

  // 关注指标相关
  const focusIndicators = ref([
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
    // { name: '核定床位数', value: '1123' },
  ]);

  // 预警信息相关
  const warningCount = computed(() => {
    return warningList.value.length;
  });
  const warningList = ref([
    // {
    //   indicator: '20.2 国家基本药物配备使用金...',
    //   status: '数据趋势异常',
    //   date: '2025年一月',
    // },
    // {
    //   indicator: '20.2 国家基本药物配备使用金...',
    //   status: '数据趋势异常',
    //   date: '2025年一月',
    // },
    // {
    //   indicator: '19.2 住院患者基本药物使用占比111111111111111111',
    //   status: '数据趋势异常',
    //   date: '2025年一月',
    // },
    // {
    //   indicator: '19.2 住院患者基本药物使用占比111111111111111111',
    //   status: '数据趋势异常',
    //   date: '2025年一月',
    // },
    // {
    //   indicator: '19.2 住院患者基本药物使用占比111111111111111111',
    //   status: '数据趋势异常',
    //   date: '2025年一月',
    // },
  ]);

  // 指标填报进度相关
  const progressType = ref('chapter'); // 默认选中章节
  const progressData = ref({
    chapter: [
      // 添加一些测试数据来验证computed计算
      { name: '测试章节', total: 100, unfilled: 10, filled: 20, unopened: 30 },
    ],
  });

  // 计算unfilled、filled、unopened的合计值
  const progressSummary = computed(() => {
    console.log('progressSummary computed - progressData.value:', progressData.value);
    console.log('progressSummary computed - chapter data:', progressData.value?.chapter);

    // 初始化合计值
    let totalUnfilled = 0;
    let totalFilled = 0;
    let totalUnopened = 0;

    // 安全检查和遍历所有章节数据
    const chapters = progressData.value?.chapter || [];
    console.log('progressSummary computed - chapters length:', chapters.length);

    chapters.forEach((chapter, index) => {
      console.log(`progressSummary computed - chapter ${index}:`, chapter);

      // 安全处理数据，防止undefined或null值
      const unfilled = Number(chapter?.unfilled) || 0;
      const filled = Number(chapter?.filled) || 0;
      const unopened = Number(chapter?.unopened) || 0;

      totalUnfilled += unfilled;
      totalFilled += filled;
      totalUnopened += unopened;
    });

    const result = {
      totalUnfilled,
      totalFilled,
      totalUnopened,
    };

    console.log('progressSummary computed - final result:', result);

    // 返回计算后的合计对象
    return result;
  });

  function closeMessage() {
    show.value = false;
  }

  function showMessageDetail(data) {
    console.log('消息：', data);

    messageDetailModalRef.value.show(data);
    closeMessage();
  }

  //快捷路由
  const router = useRouter();
  function toRouter(pathUrl) {
    if (pathUrl == '1') {
      //消息管理
      router.push({
        path: '/message',
      });
    } else if (pathUrl == '2') {
      //公告管理
      router.push({
        path: '/oa/notice/notice-list',
      });
    } else {
      router.push({
        path: pathUrl,
      });
    }
  }

  // 当前显示的消息列表 - 使用 WebSocket store 的数据
  const currentMessageList = computed(() => {
    // 先获取原始数组，不存在则用空数组兜底
    const originalList = messageStore.workbenchMessages[messageType.value] || [];
    // 截取前6条并返回
    return originalList.slice(0, 6);
  });

  // 当前未读通知消息数量
  const currentTotalMessageCount = computed(() => {
    // 先获取原始数组，不存在则用空数组兜底
    const messageList = messageStore.workbenchMessages[1] || [];
    const noticeList = messageStore.workbenchMessages[2] || [];
    return messageList.length + noticeList.length;
  });

  // 当前显示的指标列表
  const currentIndicatorList = computed(() => {
    return focusIndicators.value.slice(0, 6);
  });

  // 关注指标数量
  const focusIndicatorCount = computed(() => {
    return focusIndicators.value.length;
  });

  // 当前显示的进度列表
  const currentProgressList = computed(() => {
    return progressData.value[progressType.value] || [];
  });

  // 处理消息点击
  const handleMessageClick = (item) => {
    console.log('点击消息:', item);

    // 根据当前选中的消息类型标记为已读
    const msgType = messageType.value === '1' ? 'message' : 'notice';
    //messageStore.markAsRead(item.messageId, msgType);

    if (msgType === 'notice') {
      router.push({ path: '/oa/notice/notice-employee-detail', query: { noticeId: item.messageId } });
    } else if (msgType === 'message') {
      // router.push({ path: '/message/detail', query: { id: item.messageId } });
      showMessageDetail(item);
    }
  };

  // 快捷菜单数据
  const quickMenuItems = ref([]);

  // 默认快捷菜单配置
  const defaultQuickMenuItems = [
    {
      title: '指标管理',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-order-icon.svg', import.meta.url).href,
      action: 'indicator-manage',
    },
    {
      title: '指标查询',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-evaluation-icon.svg', import.meta.url).href,
      action: 'report-query',
    },
    {
      title: '指标分配',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-meeting-icon.svg', import.meta.url).href,
      action: 'indicator-align',
    },
    {
      title: '文件管理',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-project-icon.svg', import.meta.url).href,
      action: 'file-manage',
    },
  ];

  // 加载快捷菜单配置
  const loadQuickMenuConfig = () => {
    try {
      const savedConfig = localStorage.getItem('quickMenuConfig');
      if (savedConfig) {
        const configData = JSON.parse(savedConfig);
        quickMenuItems.value = configData.map((config) => ({
          title: config.title,
          iconSrc: config.iconSrc,
          action: config.action,
        }));
      } else {
        // 使用默认配置
        quickMenuItems.value = [...defaultQuickMenuItems];
      }
    } catch (error) {
      console.error('加载快捷菜单配置失败:', error);
      quickMenuItems.value = [...defaultQuickMenuItems];
    }
  };

  // 处理快捷菜单点击
  const handleQuickMenuClick = (item) => {
    console.log('点击快捷菜单:', item);
    // 这里可以添加对应的业务逻辑
    switch (item.action) {
      case 'indicator-manage':
        // 跳转到指标管理
        toRouter('/indicator/manage');
        break;
      case 'report-query':
        // 跳转到报表查询
        toRouter('/indicator/report-query');
        break;
      case 'indicator-align':
        // 跳转到指标分配
        toRouter('/Indicator/decomposition/index');
        break;
      case 'file-manage':
        // 跳转到文件管理
        toRouter('/file/filelist');
        break;
      case 'user-manage':
        // 跳转到用户管理
        toRouter('/system/user');
        break;
      case 'role-manage':
        // 跳转到角色管理
        toRouter('/system/role');
        break;
      case 'data-analysis':
        // 跳转到数据分析
        toRouter('/analysis/data');
        break;
      case 'system-config':
        // 跳转到系统配置
        toRouter('/system/config');
        break;
      default:
        console.log('未知的快捷菜单操作:', item.action);
    }
  };

  // 处理填报进度点击
  const handleClickReportingProgress = (isFillFlag, developmentStatus, chapterId) => {
    router.push({
      path: '/indicator/report-query',
      query: {
        isFillFlag: isFillFlag, // 是否填报
        developmentStatus: developmentStatus, // 是否开展
        chapter: chapterId, // 指标章id
      },
    });
  };

  // 处理配置快捷菜单
  const handleConfigQuickMenu = () => {
    router.push('/indicator/workbench/quick-menu-config');
  };

  // 监听路由变化，当从配置页面返回时刷新快捷菜单
  const handleRouteChange = () => {
    loadQuickMenuConfig();
  };

  // 监听存储变化，当配置更新时自动刷新
  const handleStorageChange = (e) => {
    if (e.key === 'quickMenuConfig') {
      loadQuickMenuConfig();
    }
  };

  // 处理更多预警点击
  const handleMoreWarnings = () => {
    toRouter('/indicator/warning-query');
  };

  // 处理更多关注指标点击
  const handleMoreUserFocusIndicator = () => {
    toRouter('/Indicator/attention/index');
  };

  // 用户信息数据
  const userInfo = ref({
    // name: '李昭欣',
    // position: '信息化办公室主任',
    // department: '明镜集团/桃花源分公司/营销部',
    // userId: '25524934542848',
    // account: 'wangerxiao',
    // title: '高级职称',
    // phone: '123 1234 1234',
    // email: 'wangerxiao@163.com',
  });

  const loadUserInfo = async () => {
    try {
      const response = await workbenchApi.userInfo(employeeId);
      if (response.data) {
        // 更新用户信息
        userInfo.value = response.data;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 使用默认数据
    }
  };

  // 复制用户ID
  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userInfo.value.userId);
      console.log('用户ID已复制到剪贴板');
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
      // 这里可以添加失败提示
    }
  };

  // 获取关注指标数据
  const loadFocusIndicators = async () => {
    try {
      const response = await workbenchApi.getFocusIndicators(employeeId);
      if (response.data) {
        focusIndicators.value = response.data;
      }

      return focusIndicators;
    } catch (error) {
      console.error('获取关注指标失败:', error);
    }
  };

  // 获取关注指标数据
  const loadWarningMessage = async () => {
    try {
      const response = await warningApi.getWarningList({
        pageNum: 1,
        pageSize: 10,
      });
      if (response.data) {
        warningList.value = response.data.list;
      }
      return warningList.value;
    } catch (error) {
      console.error('获取预警消息失败:', error);
    }
  };

  // 获取填报进度
  const loadReportingProgress = async () => {
    console.log('loadReportingProgress 开始加载填报进度数据...');
    try {
      const response = await workbenchApi.getReportingProgress(employeeId);
      console.log('loadReportingProgress API响应:', response);

      if (response.data) {
        console.log('loadReportingProgress 设置progressData.value为:', response.data);
        progressData.value = response.data;
        console.log('loadReportingProgress 设置完成后 progressData.value:', progressData.value);
      } else {
        console.log('loadReportingProgress API响应无数据');
      }

      return progressData;
    } catch (error) {
      console.error('获取填报进度失败:', error);
    }
  };

  // 日历相关数据和方法
  const currentDate = ref(new Date()); // 2020年9月，月份从0开始
  const weekdays = ref(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);

  // 当前月份文本
  const currentMonthText = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth() + 1;
    return `${year}年${month}月`;
  });

  // 生成日历天数数据
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取当月第一天是星期几（0=周日，1=周一...）
    // 转换为周一=1, 周二=2, ..., 周日=7的格式
    const firstDayWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

    // 获取当月天数
    const daysInMonth = lastDay.getDate();

    // 获取上月最后几天
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const days = [];

    // 添加上月的最后几天（如果当月1号不是周一的话）
    for (let i = firstDayWeek - 1; i > 0; i--) {
      days.push({
        day: daysInPrevMonth - i + 1,
        isOtherMonth: true,
        isToday: false,
        events: [],
      });
    }

    // 添加当月的天数
    for (let day = 1; day <= daysInMonth; day++) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const isToday = day === new Date().getDate() && month === currentMonth && year === currentYear; // 设置当天为今天
      const events = getEventsForDate(year, month, day);

      days.push({
        day,
        isOtherMonth: false,
        isToday,
        events,
      });
    }

    // 添加下月的前几天，补齐到42个格子（6行7列）
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isOtherMonth: true,
        isToday: false,
        events: [],
      });
    }

    return days;
  });

  // 获取指定日期的事件
  const getEventsForDate = (year, month, day) => {
    // 模拟事件数据
    const eventMap = {
      1: [{ type: 'green' }, { type: 'orange' }],
      3: [{ type: 'red' }, { type: 'orange' }],
      11: [{ type: 'red' }, { type: 'blue' }, { type: 'green' }, { type: 'orange' }],
      15: [{ type: 'blue' }],
      16: [{ type: 'green' }, { type: 'blue' }, { type: 'red' }],
      26: [{ type: 'green' }, { type: 'blue' }],
      30: [{ type: 'red' }, { type: 'orange' }],
    };

    return eventMap[day] || [];
  };

  // 上一月
  const previousMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.value = newDate;
  };

  // 下一月
  const nextMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
  };

  // 选择日期
  const selectDate = (day) => {
    if (!day.isOtherMonth) {
      console.log('选择日期:', day);
      // 这里可以添加日期选择的逻辑
    }
  };

  // 统计数据 - 改为计算属性，确保数据更新时自动重新计算
  const statisticsData = computed(() => {
    console.log('statisticsData computed - progressSummary:', {
      totalUnfilled: progressSummary.value.totalUnfilled,
      totalFilled: progressSummary.value.totalFilled,
      totalUnopened: progressSummary.value.totalUnopened,
    });

    return [
      {
        title: '通知信息',
        count: currentTotalMessageCount.value,
        type: 'leave',
        iconSrc: new URL('/@/assets/images/workbench/icons/unread_message.svg', import.meta.url).href,
      },
      {
        title: '关注指标',
        count: focusIndicatorCount.value,
        type: 'leave',
        iconSrc: new URL('/@/assets/images/workbench/icons/leave-approval-icon.svg', import.meta.url).href,
      },
      {
        title: '预警信息',
        count: warningCount.value,
        type: 'cancel_leave',
        iconSrc: new URL('/@/assets/images/workbench/icons/alert.svg', import.meta.url).href,
      },
      {
        title: '待填报',
        count: progressSummary.value.totalUnfilled,
        type: 'outing',
        iconSrc: new URL('/@/assets/images/workbench/icons/un_write.svg', import.meta.url).href,
      },
      {
        title: '已完成',
        count: progressSummary.value.totalFilled,
        type: 'seal',
        iconSrc: new URL('/@/assets/images/workbench/icons/write_done.svg', import.meta.url).href,
      },
      {
        title: '未开展',
        count: progressSummary.value.totalUnopened,
        type: 'expense',
        iconSrc: new URL('/@/assets/images/workbench/icons/un_open.svg', import.meta.url).href,
      },
    ];
  });

  // 获取统计数据
  const getStatisticsData = async () => {
    try {
      const response = await workbenchApi.getApprovalStatistics();
      if (response.data) {
        // 更新统计数据
        statisticsData.value.forEach((item) => {
          if (response.data[item.type] !== undefined) {
            item.count = response.data[item.type];
          }
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 使用默认数据
    }
  };

  onMounted(async () => {
    await loadUserInfo();
    await loadFocusIndicators();
    await loadReportingProgress();
    await loadWarningMessage();
    loadQuickMenuConfig();
    // getStatisticsData();

    // 监听存储变化
    window.addEventListener('storage', handleStorageChange);
  });

  // 组件卸载时清理事件监听器
  onUnmounted(() => {
    // WebSocket 连接由全局管理，这里不需要清理
    window.removeEventListener('storage', handleStorageChange);
  });
</script>

<style lang="less" scoped>
  .workbench-container {
    .statistics-container {
      background: url('/@/assets/images/workbench/workbench-bg.png') #009688 50% / cover no-repeat;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 194, 124, 0.2);
      margin-bottom: 12px;

      .statistics-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        padding: 0 48px 0 24px;
        background-color: #009688;
        opacity: 80%;
        min-height: 80px;
        border-radius: 12px;

        .statistics-card {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
          }

          .card-main {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 28px 0;

            .card-icon {
              .icon-wrapper {
                width: 56px;
                height: 56px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;

                .custom-icon {
                  width: 32px;
                  height: 32px;
                  filter: brightness(0) invert(1);
                  opacity: 0.9;
                }
              }
            }

            .card-content {
              display: flex;
              flex-direction: column;
              gap: 8px;
              color: #fff;

              .card-title {
                font-family:
                  'OPPOSans',
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  Roboto,
                  sans-serif;
                font-size: 16px;
                font-weight: 600;
                line-height: 1.32;
                margin: 0;
                color: #fff;
              }

              .card-count-wrapper {
                display: flex;
                align-items: flex-end;
                gap: 4px;

                .card-count {
                  font-family:
                    'OPPOSans',
                    -apple-system,
                    BlinkMacSystemFont,
                    'Segoe UI',
                    Roboto,
                    sans-serif;
                  font-size: 24px;
                  font-weight: 400;
                  line-height: 0.83;
                }

                .card-unit {
                  font-family:
                    'OPPOSans',
                    -apple-system,
                    BlinkMacSystemFont,
                    'Segoe UI',
                    Roboto,
                    sans-serif;
                  font-size: 12px;
                  font-weight: 400;
                  line-height: 1.17;
                }
              }
            }
          }
        }

        .divider-line {
          width: 1px;
          height: 64px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.6) 48.96%, rgba(255, 255, 255, 0.08) 100%);
          flex-shrink: 0;
        }
      }
    }

    .quick-menu-config {
      .ant-btn {
        color: #009688;
        border: none;
        box-shadow: none;
        font-size: 14px;
        font-weight: 400;
        &:hover {
          color: #40a9ff;
          background: rgba(0, 150, 136, 0.05);
        }
      }
    }

    .message-panel {
      background: #ffffff;
      // background: linear-gradient(135deg, rgba(12, 225, 200, 0.12) 0%, rgba(68, 255, 227, 0.02) 100%);
      border-radius: 8px;
      padding: 18px 24px;
      height: 100%;

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .message-title {
          font-family:
            'OPPOSans',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            sans-serif;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.33;
          color: #1d1d1d;
          margin: 0;
        }

        .message-more {
          .more-text {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            color: #009688;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              color: #40a9ff;
            }
          }
        }

        .message-dropdown {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          .dropdown-icon {
            width: 7.5px;
            height: 15.5px;
            filter: brightness(0) saturate(100%) invert(70%) sepia(8%) saturate(463%) hue-rotate(169deg) brightness(95%) contrast(88%);
          }
        }
      }

      .message-tabs {
        display: flex;
        justify-content: center;
        align-items: center;
        width: fit-content;
        gap: 8px;
        background: rgba(0, 194, 124, 0.08);
        border-radius: 8px;
        padding: 4px;

        .message-tab {
          font-family:
            'OPPOSans',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.3em;
          color: rgba(29, 29, 29, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 8px 16px;
          border-radius: 6px;
          position: relative;
          min-width: 80px;
          text-align: center;

          &.active {
            font-size: 16px;
            color: #009688;
            font-weight: 600;
            background: #ffffff;
            box-shadow:
              0 2px 4px rgba(0, 194, 124, 0.15),
              0 1px 2px rgba(0, 194, 124, 0.1);
            transform: translateY(-1px);
          }

          &:hover:not(.active) {
            color: #1d1d1d;
            background: rgba(255, 255, 255, 0.5);
          }
        }
      }

      .empty-list {
        display: flex;
        justify-content: space-evenly;
        align-items: self-end;
      }

      .empty-list img {
        filter: grayscale(60%);
        opacity: 80%;
      }

      .message-list {
        display: flex;
        flex-direction: column;

        .message-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 12px 0;

          &:hover {
            background: rgba(0, 194, 124, 0.05);
            border-radius: 8px;
          }

          .message-content {
            display: flex;
            align-items: center;
            gap: 12px;

            .message-number {
              width: 24px;
              height: 24px;
              position: relative;

              .number-circle {
                width: 24px;
                height: 24px;
                background: #009688;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family:
                  'PingFang SC',
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  Roboto,
                  sans-serif;
                font-size: 14px;
                font-weight: 600;
                line-height: 1.57;
                color: #ffffff;
              }
            }

            .message-info {
              .message-title {
                font-family:
                  'OPPOSans',
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  Roboto,
                  sans-serif;
                font-size: 14px;
                font-weight: 400;
                line-height: 1.3em;
                color: #1d1d1d;
                margin: 0;
                width: 300px; /* 固定宽度 */
                white-space: nowrap; /* 核心：强制文本在一行显示 */
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          .message-meta {
            display: flex;
            align-items: center;
            gap: 24px;

            .message-author {
              width: 42px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 400;
              line-height: 1.3em;
              color: rgba(29, 29, 29, 0.6);
              text-align: center;
              width: 150px;
            }

            .message-time {
              width: 144px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 400;
              line-height: 1.3em;
              color: rgba(29, 29, 29, 0.6);
              text-align: left;
            }

            .message-arrow {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;

              .arrow-icon {
                width: 15px;
                height: 14px;
                filter: brightness(0) saturate(100%) invert(70%) sepia(8%) saturate(463%) hue-rotate(169deg) brightness(95%) contrast(88%);
                transition: all 0.3s ease;
              }
            }
          }

          &:hover .message-arrow .arrow-icon {
            filter: brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(1352%) hue-rotate(134deg) brightness(96%) contrast(101%);
          }
        }
      }
    }

    .quick-menu-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 18px 24px;
      height: 40%;

      .quick-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .header-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            .focus-icon {
              width: 24px;
              height: 24px;
              filter: brightness(0) saturate(100%) invert(47%) sepia(69%) saturate(959%) hue-rotate(121deg) brightness(98%) contrast(86%);
            }
          }

          .focus-indicators-title {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.33;
            color: #1d1d1d;
            margin: 0;
          }
        }

        .quick-menu-title {
          font-family:
            'OPPOSans',
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            sans-serif;
          font-size: 20px;
          font-weight: 400;
          line-height: 1.3em;
          color: #1d1d1d;
        }
      }

      .quick-menu-content {
        display: flex;
        align-items: center;
        gap: 64px;

        .quick-menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);

            .menu-icon .icon-bg {
              background: rgba(0, 194, 124, 0.15);
            }

            .menu-title {
              color: #009688;
            }
          }

          .menu-icon {
            width: 40px;
            height: 40px;

            .icon-bg {
              width: 40px;
              height: 40px;
              background: #f7f8fa;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;

              .menu-icon-img {
                width: 22px;
                height: 24px;
                filter: brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(1352%) hue-rotate(134deg) brightness(96%) contrast(101%);
              }
            }
          }

          .menu-title {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.67em;
            color: #1d1d1d;
            text-align: center;
            transition: all 0.3s ease;
          }
        }
      }
    }

    .warning-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 18px 24px;
      margin-top: 12px;
      height: calc(60% - 12px);

      .warning-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .warning-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            .warning-icon-img {
              width: 24px;
              height: 24px;
              filter: brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(7471%) hue-rotate(356deg) brightness(91%) contrast(135%);
            }
          }

          .warning-title {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.33;
            color: #1d1d1d;
            margin: 0;
          }

          .warning-count {
            background: #ff4d4f;
            border-radius: 12px;
            padding: 2px 8px;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;

            .count-number {
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 12px;
              font-weight: 600;
              line-height: 1;
              color: #ffffff;
            }
          }
        }

        .warning-more {
          .more-text {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            color: #009688;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              color: #40a9ff;
            }
          }
        }
      }

      .warning-content {
        .warning-table-header {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 8px;

          .header-item {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.3;
            color: rgba(29, 29, 29, 0.85);

            &.indicator-name {
              flex: 2;
              min-width: 180px;
            }

            &.status {
              flex: 1;
              text-align: center;
              min-width: 80px;
            }

            &.date {
              flex: 1;
              text-align: center;
              min-width: 80px;
            }
          }
        }

        .warning-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 150px;
          /* 或固定高度，根据需求选，如 height: 300px; */
          overflow-y: auto;
          /* 仅垂直方向滚动，内容超出高度时显示滚动条，水平方向若不需要可设 hidden */
          overflow-x: hidden;

          .warning-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 77, 79, 0.04);
              border-radius: 6px;
              // padding: 12px 8px;
            }

            .warning-indicator {
              flex: 2;
              min-width: 180px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 400;
              line-height: 1.3;
              color: #1d1d1d;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .warning-status {
              flex: 1;
              text-align: center;
              min-width: 80px;

              .status-text {
                font-family:
                  'OPPOSans',
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  Roboto,
                  sans-serif;
                font-size: 14px;
                font-weight: 400;
                line-height: 1.3;
                color: #ff8c00;
                background: rgba(255, 140, 0, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
                white-space: nowrap;
              }
            }

            .warning-date {
              flex: 1;
              text-align: right;
              min-width: 80px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 400;
              line-height: 1.3;
              color: rgba(29, 29, 29, 0.6);
            }
          }
        }
      }
    }

    .focus-indicators-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      height: 400px; /* 与填报进度面板保持一致的高度 */
      min-height: 400px;
      margin-top: 12px;
      display: flex;
      flex-direction: column;

      .focus-indicators-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .focus-count {
            background: #ff4d4f;
            border-radius: 12px;
            padding: 2px 8px;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;

            .count-number {
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 12px;
              font-weight: 600;
              line-height: 1;
              color: #ffffff;
            }
          }

          .header-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            .focus-icon {
              width: 24px;
              height: 24px;
              filter: brightness(0) saturate(100%) invert(47%) sepia(69%) saturate(959%) hue-rotate(121deg) brightness(98%) contrast(86%);
            }
          }

          .focus-indicators-title {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.33;
            color: #1d1d1d;
            margin: 0;
          }
        }

        .warning-more {
          .more-text {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            color: #009688;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              color: #40a9ff;
            }
          }
        }
      }

      .focus-indicators-tabs {
        margin-bottom: 20px;

        .indicator-tabs {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 8px;
          background: rgba(0, 194, 124, 0.08);
          border-radius: 8px;
          padding: 4px;
          width: fit-content;

          .indicator-tab {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 1.3em;
            color: rgba(29, 29, 29, 0.6);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 6px;
            position: relative;
            min-width: 80px;
            text-align: center;

            &.active {
              font-size: 16px;
              color: #009688;
              font-weight: 600;
              background: #ffffff;
              box-shadow:
                0 2px 4px rgba(0, 194, 124, 0.15),
                0 1px 2px rgba(0, 194, 124, 0.1);
              transform: translateY(-1px);
            }

            &:hover:not(.active) {
              color: #1d1d1d;
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }

      .focus-indicators-content {
        flex: 1; /* 让内容区域占据剩余空间 */
        display: flex;
        flex-direction: column;
        overflow: hidden; /* 防止内容溢出 */
        .focus-indicators-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);

          .header-item {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.3;
            color: rgba(29, 29, 29, 0.8);

            &.indicator-name {
              flex: 2;
              min-width: 140px;
            }

            &.focus-person {
              flex: 1;
              text-align: center;
              min-width: 80px;
            }

            &.department {
              flex: 1.5;
              text-align: center;
              min-width: 100px;
            }
          }
        }
      }

      .focus-indicators-list {
        flex: 1; /* 占据剩余空间 */
        display: flex;
        gap: 8px;
        flex-direction: column;
        overflow-y: auto; /* 内容超出时显示滚动条 */
        overflow-x: hidden;

        .focus-indicators-item {
          display: flex;
          align-items: center;
          padding: 8px 0px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(0, 194, 124, 0.05);
            border-radius: 8px;
          }

          &:last-child {
            border-bottom: none;
          }

          .focus-indicators-indicator-name {
            flex: 2;
            min-width: 140px;
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3em;
            color: #1d1d1d;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .focus-indicators-person {
            flex: 1;
            text-align: center;
            min-width: 80px;
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            color: rgba(29, 29, 29, 0.6);
          }

          .focus-indicators-department {
            flex: 1.5;
            text-align: center;
            min-width: 100px;
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.3;
            color: rgba(29, 29, 29, 0.6);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .empty-list {
        display: flex;
        justify-content: space-evenly;
        align-items: self-end;
      }

      .empty-list img {
        filter: grayscale(60%);
        opacity: 80%;
      }
    }

    .progress-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      margin-top: 12px;
      height: 400px; /* 设置固定高度 */
      min-height: 400px;
      display: flex;
      flex-direction: column;

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;

          .progress-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;

            .progress-icon-img {
              width: 24px;
              height: 24px;
              filter: brightness(0) saturate(100%) invert(47%) sepia(69%) saturate(959%) hue-rotate(121deg) brightness(98%) contrast(86%);
            }
          }

          .progress-title {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.33;
            color: #1d1d1d;
            margin: 0;
          }
        }

        .progress-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 194, 124, 0.08);
          border-radius: 8px;
          padding: 4px;

          .progress-tab {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 1.3em;
            color: rgba(29, 29, 29, 0.6);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 6px;
            position: relative;
            min-width: 60px;
            text-align: center;

            &.active {
              font-size: 16px;
              color: #009688;
              font-weight: 600;
              background: #ffffff;
              box-shadow:
                0 2px 4px rgba(0, 194, 124, 0.15),
                0 1px 2px rgba(0, 194, 124, 0.1);
              transform: translateY(-1px);
            }

            &:hover:not(.active) {
              color: #1d1d1d;
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }

      .progress-content {
        flex: 1; /* 让内容区域占据剩余空间 */
        display: flex;
        flex-direction: column;
        overflow: hidden; /* 防止内容溢出 */
        .progress-table-header {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 8px;

          .header-item {
            font-family:
              'OPPOSans',
              -apple-system,
              BlinkMacSystemFont,
              'Segoe UI',
              Roboto,
              sans-serif;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.3;
            color: rgba(29, 29, 29, 0.85);
            text-align: center;

            &.chapter-name {
              flex: 2;
              text-align: left;
              min-width: 80px;
            }

            &.total {
              flex: 1;
              min-width: 80px;
            }

            &.unfilled {
              flex: 1;
              min-width: 80px;
            }

            &.filled {
              flex: 1;
              min-width: 80px;
            }

            &.unopened {
              flex: 1;
              min-width: 80px;
            }
          }
        }

        .progress-list {
          flex: 1; /* 占据剩余空间 */
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto; /* 内容超出时显示滚动条 */
          overflow-x: hidden;

          .progress-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(0, 194, 124, 0.04);
              border-radius: 6px;
              // padding: 16px 8px;
            }

            .progress-chapter {
              flex: 2;
              text-align: left;
              min-width: 80px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 400;
              line-height: 1.3;
              color: #1d1d1d;
            }

            .progress-total {
              flex: 1;
              text-align: center;
              cursor: pointer;
              min-width: 80px;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.3;
              color: #1d1d1d;
            }

            .progress-unfilled {
              flex: 1;
              text-align: center;
              min-width: 80px;
              cursor: pointer;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.3;

              color: #ff4d4f;

              &.zero-value {
                color: #d9d9d9;
              }
            }

            .progress-filled {
              flex: 1;
              text-align: center;
              min-width: 80px;
              cursor: pointer;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.3;
              color: #1890ff;

              &.zero-value {
                color: #d9d9d9;
              }
            }

            .progress-unopened {
              flex: 1;
              text-align: center;
              min-width: 80px;
              cursor: pointer;
              font-family:
                'OPPOSans',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
              font-size: 14px;
              font-weight: 600;
              line-height: 1.3;
              color: #52c41a;

              &.zero-value {
                color: #d9d9d9;
              }
            }
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .workbench-container {
      .statistics-container {
        .statistics-content {
          flex-wrap: wrap;
          gap: 16px;
          padding: 20px;

          .statistics-card {
            min-width: calc(33.333% - 12px);
          }

          .divider-line {
            display: none;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .workbench-container {
      .statistics-container {
        .statistics-content {
          flex-direction: column;
          gap: 16px;
          padding: 20px;

          .statistics-card {
            width: 100%;
            min-width: auto;

            .card-main {
              justify-content: center;
              padding: 20px 0;
            }
          }

          .divider-line {
            display: none;
          }
        }
      }
    }
  }
</style>
