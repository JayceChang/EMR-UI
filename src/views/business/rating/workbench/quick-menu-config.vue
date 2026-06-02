<template>
  <div class="quick-menu-config-container">
    <a-card title="快捷菜单配置" :bordered="false">
      <template #extra>
        <a-space>
          <a-button @click="handleBack">
            <ArrowLeftOutlined />
            返回工作台
          </a-button>
          <a-button @click="handleReset">重置默认</a-button>
          <a-button type="primary" @click="handleSave" :loading="saving">保存配置</a-button>
        </a-space>
      </template>

      <div class="config-content">
        <div class="config-section">
          <h3>可选菜单项</h3>
          <div class="available-menus">
            <div 
              v-for="menu in availableMenus" 
              :key="menu.id"
              class="menu-item"
              :class="{ disabled: isMenuSelected(menu.id) }"
              @click="handleAddMenu(menu)"
            >
              <div class="menu-icon">
                <img :src="menu.iconSrc" :alt="menu.title" />
              </div>
              <div class="menu-title">{{ menu.title }}</div>
              <div class="menu-description">{{ menu.description }}</div>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h3>当前快捷菜单 (拖拽排序)</h3>
          <div class="selected-menus">
            <draggable 
              v-model="selectedMenus" 
              group="menus" 
              @start="drag = true" 
              @end="drag = false"
              item-key="id"
              class="draggable-list"
            >
              <template #item="{ element, index }">
                <div class="selected-menu-item">
                  <div class="drag-handle">
                    <DragOutlined />
                  </div>
                  <div class="menu-content">
                    <div class="menu-icon">
                      <img :src="element.iconSrc" :alt="element.title" />
                    </div>
                    <div class="menu-info">
                      <div class="menu-title">{{ element.title }}</div>
                      <div class="menu-description">{{ element.description }}</div>
                    </div>
                  </div>
                  <div class="menu-actions">
                    <a-button 
                      type="text" 
                      danger 
                      size="small"
                      @click="handleRemoveMenu(index)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </div>
                </div>
              </template>
            </draggable>
            
            <div v-if="selectedMenus.length === 0" class="empty-state">
              <a-empty description="暂无快捷菜单，请从左侧添加" />
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { DragOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
  import draggable from 'vuedraggable';
  import { useUserStore } from '/@/store/modules/system/user';
  import { useRouter } from 'vue-router';
  import { quickMenuApi } from '/@/api/business/rating/workbench/quick-menu-api';

  const userStore = useUserStore();
  const router = useRouter();
  const saving = ref(false);
  const drag = ref(false);

  // 可选的菜单项
  const availableMenus = ref([
    {
      id: 'indicator-manage',
      title: '指标管理',
      description: '管理和维护系统指标',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-order-icon.svg', import.meta.url).href,
      action: 'indicator-manage',
      path: '/indicator/manage'
    },
    {
      id: 'report-query',
      title: '指标查询',
      description: '查询和管理各类报表',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-evaluation-icon.svg', import.meta.url).href,
      action: 'report-query',
      path: '/indicator/report-query'
    },
    {
      id: 'indicator-align',
      title: '指标分配',
      description: '分配和调整指标权限',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-meeting-icon.svg', import.meta.url).href,
      action: 'indicator-align',
      path: '/Indicator/decomposition/index'
    },
    {
      id: 'file-manage',
      title: '文件管理',
      description: '管理系统文件和文档',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-project-icon.svg', import.meta.url).href,
      action: 'file-manage',
      path: '/file/filelist'
    },
    {
      id: 'user-manage',
      title: '用户管理',
      description: '管理系统用户信息',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-order-icon.svg', import.meta.url).href,
      action: 'user-manage',
      path: '/system/user'
    },
    {
      id: 'role-manage',
      title: '角色管理',
      description: '管理用户角色权限',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-evaluation-icon.svg', import.meta.url).href,
      action: 'role-manage',
      path: '/system/role'
    },
    {
      id: 'data-analysis',
      title: '数据分析',
      description: '进行数据统计分析',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-meeting-icon.svg', import.meta.url).href,
      action: 'data-analysis',
      path: '/analysis/data'
    },
    {
      id: 'system-config',
      title: '系统配置',
      description: '配置系统参数设置',
      iconSrc: new URL('/@/assets/images/workbench/icons/new-project-icon.svg', import.meta.url).href,
      action: 'system-config',
      path: '/system/config'
    }
  ]);

  // 当前选中的菜单项
  const selectedMenus = ref([]);

  // 默认快捷菜单配置
  const defaultMenus = [
    'indicator-manage',
    'report-query', 
    'indicator-align',
    'file-manage'
  ];

  // 检查菜单是否已被选中
  const isMenuSelected = (menuId) => {
    return selectedMenus.value.some(menu => menu.id === menuId);
  };

  // 添加菜单到快捷菜单
  const handleAddMenu = (menu) => {
    if (isMenuSelected(menu.id)) {
      message.warning('该菜单已添加');
      return;
    }
    
    if (selectedMenus.value.length >= 8) {
      message.warning('最多只能添加8个快捷菜单');
      return;
    }

    selectedMenus.value.push({ ...menu });
    message.success(`已添加 ${menu.title}`);
  };

  // 从快捷菜单中移除
  const handleRemoveMenu = (index) => {
    const menu = selectedMenus.value[index];
    selectedMenus.value.splice(index, 1);
    message.success(`已移除 ${menu.title}`);
  };

  // 重置为默认配置
  const handleReset = () => {
    selectedMenus.value = availableMenus.value.filter(menu => 
      defaultMenus.includes(menu.id)
    );
    message.success('已重置为默认配置');
  };

  // 保存配置
  const handleSave = async () => {
    try {
      saving.value = true;
      
      // 构建保存的数据格式
      const configData = selectedMenus.value.map((menu, index) => ({
        id: menu.id,
        title: menu.title,
        iconSrc: menu.iconSrc,
        action: menu.action,
        path: menu.path,
        order: index
      }));

      // 保存到本地存储
      localStorage.setItem('quickMenuConfig', JSON.stringify(configData));
      
      // 这里可以调用API保存到服务器
      // await quickMenuApi.saveConfig(configData);
      
      message.success('快捷菜单配置保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    } finally {
      saving.value = false;
    }
  };

  // 返回工作台
  const handleBack = () => {
    router.push('/indicator/workbench');
  };

  // 加载配置
  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem('quickMenuConfig');
      if (savedConfig) {
        const configData = JSON.parse(savedConfig);
        selectedMenus.value = configData.map(config => {
          const menu = availableMenus.value.find(m => m.id === config.id);
          return menu ? { ...menu } : config;
        });
      } else {
        // 使用默认配置
        handleReset();
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      handleReset();
    }
  };

  onMounted(() => {
    loadConfig();
  });
</script>

<style lang="less" scoped>
  .quick-menu-config-container {
    padding: 24px;
    background: #f5f5f5;
    min-height: 100vh;

    .config-content {
      display: flex;
      gap: 24px;

      .config-section {
        flex: 1;

        h3 {
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1d;
        }

        .available-menus {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;

          .menu-item {
            background: #ffffff;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover:not(.disabled) {
              border-color: #009688;
              box-shadow: 0 2px 8px rgba(0, 150, 136, 0.15);
            }

            &.disabled {
              opacity: 0.5;
              cursor: not-allowed;
              background: #f5f5f5;
            }

            .menu-icon {
              width: 40px;
              height: 40px;
              margin-bottom: 12px;

              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            }

            .menu-title {
              font-size: 14px;
              font-weight: 600;
              color: #1d1d1d;
              margin-bottom: 4px;
            }

            .menu-description {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }
          }
        }

        .selected-menus {
          .draggable-list {
            min-height: 200px;
          }

          .selected-menu-item {
            background: #ffffff;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;

            &:hover {
              border-color: #009688;
              box-shadow: 0 2px 8px rgba(0, 150, 136, 0.15);
            }

            .drag-handle {
              color: #999;
              cursor: move;
              font-size: 16px;

              &:hover {
                color: #009688;
              }
            }

            .menu-content {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 12px;

              .menu-icon {
                width: 32px;
                height: 32px;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
              }

              .menu-info {
                .menu-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #1d1d1d;
                  margin-bottom: 2px;
                }

                .menu-description {
                  font-size: 12px;
                  color: #666;
                }
              }
            }

            .menu-actions {
              .ant-btn {
                border: none;
                box-shadow: none;
              }
            }
          }

          .empty-state {
            text-align: center;
            padding: 40px 0;
            background: #ffffff;
            border: 1px dashed #d9d9d9;
            border-radius: 8px;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .config-content {
      flex-direction: column;
    }
  }
</style>