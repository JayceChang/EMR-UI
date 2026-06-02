<!--
  * 首页
  *





  *
-->
<template>
  <!--  顶部用户信息-->
  <a-row>
    <HomeHeader />
  </a-row>
  <!--下方左右布局-->
  <a-row :gutter="[10, 10]">
    <!--左侧-->
    <a-col :span="16">
      <a-row :gutter="[10, 10]">
        <!--公告信息-->
        <a-col :span="12">
          <HomeNotice title="公告" :noticeTypeId="1" />
        </a-col>
      </a-row>
    </a-col>
<!--    <AdModal/>-->
  </a-row>
</template>
<script setup>
  import { computed } from 'vue';
  import HomeHeader from './home-header.vue';
  import HomeNotice from './home-notice.vue';
  import OfficialAccountCard from './components/official-account-card.vue';
  import ToBeDoneCard from './components/to-be-done-card/home-to-be-done.vue';
  import ChangelogCard from './components/changelog-card.vue';
  import Category from './components/echarts/category.vue';
  import Pie from './components/echarts/pie.vue';
  import Gradient from './components/echarts/gradient.vue';
  // import AdModal from './ad-modal.vue';

  // 业绩完成百分比
  const saleTargetPercent = computed(() => {
    return 75;
  });
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
