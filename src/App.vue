<!--
  * 主应用页面
-->

<template>
  <a-config-provider
    :locale="antdLocale"
    :theme="{
      algorithm: compactFlag ? theme.compactAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: themeColors[colorIndex].primaryColor,
        colorLink: themeColors[colorIndex].primaryColor,
        colorLinkActive: themeColors[colorIndex].activeColor,
        colorLinkHover: themeColors[colorIndex].hoverColor,
        colorIcon: themeColors[colorIndex].primaryColor,
        borderRadius: borderRadius,
      },
      components: {
        Button: {
          colorLink: themeColors[colorIndex].primaryColor,
          colorLinkActive: themeColors[colorIndex].activeColor,
          colorLinkHover: themeColors[colorIndex].hoverColor,
        },
        Icon: {
          colorIcon: themeColors[colorIndex].primaryColor,
        },
      },
    }"
    :transformCellText="transformCellText"
  >
    <!---全局loading--->
    <a-spin :spinning="spinning" tip="稍等片刻，我在拼命加载中..." size="large">
      <!--- 路由 -->
      <RouterView />
    </a-spin>
  </a-config-provider>
</template>

<script setup>
  import dayjs from 'dayjs';
  import { computed, h, useSlots } from 'vue';
  import { messages } from '/@/i18n';
  import { useAppConfigStore } from '/@/store/modules/system/app-config';
  import { useSpinStore } from '/@/store/modules/system/spin';
  import { theme } from 'ant-design-vue';
  import { themeColors } from '/@/theme/color.js';
  import { Popover } from 'ant-design-vue';
  import SmartCopyIcon from '/@/components/framework/smart-copy-icon/index.vue';
  import _ from 'lodash';
  const slots = useSlots();
  const antdLocale = computed(() => messages[useAppConfigStore().language].antdLocale);
  const dayjsLocale = computed(() => messages[useAppConfigStore().language].dayjsLocale);
  dayjs.locale(dayjsLocale);

  // 全局loading
  let spinStore = useSpinStore();
  const spinning = computed(() => spinStore.loading);
  // 是否紧凑
  const compactFlag = computed(() => useAppConfigStore().compactFlag);
  // 主题颜色
  const colorIndex = computed(() => {
    return useAppConfigStore().colorIndex;
  });
  // 圆角
  const borderRadius = computed(() => {
    return useAppConfigStore().borderRadius;
  });
  function transformCellText({ text, column, record, index }) {
    if (column && column.textEllipsisFlag === true) {
      return h(
        Popover,
        { placement: 'bottom' },
        {
          default: () =>
            h('div', { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, id: `${column.dataIndex}${index}` }, text),
          content: () =>
            h('div', { style: { display: 'flex' } }, [
              h('div', text),
              h(SmartCopyIcon, { value: document.getElementById(`${column.dataIndex}${index}`).innerText }),
            ]),
        }
      );
    } else {
      return text;
    }
  }

</script>
<style scoped lang="less">
  :deep(.ant-table-column-sorters) {
    align-items: flex-start !important;
  }
</style>
<style>
/* 多列子菜单样式 */
.multi-column-submenu .ant-dropdown-menu {
  display: flex;
  flex-wrap: wrap;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.multi-column-submenu .ant-dropdown-menu-item {
  width: 200px;
  margin: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 为了更好的视觉分隔，可以添加列分隔线 */
.multi-column-submenu .ant-dropdown-menu::after {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background-color: #f0f0f0;
  left: 220px; /* 第一列后的分隔线 */
}

.multi-column-submenu .ant-dropdown-menu::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background-color: #f0f0f0;
  left: 440px; /* 第二列后的分隔线 */
}
</style>
