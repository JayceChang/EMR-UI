<template>
  <div>
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-light-1">
            <th class="text-left py-3 px-4 text-sm font-semibold text-dark-2">排名</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-dark-2">药店名称</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-dark-2">所属区域</th>
            <th class="text-right py-3 px-4 text-sm font-semibold text-dark-2">门诊人次</th>
            <th class="text-right py-3 px-4 text-sm font-semibold text-dark-2">总费用(元)</th>
            <th class="text-right py-3 px-4 text-sm font-semibold text-dark-2">同比增长</th>
            <th class="text-center py-3 px-4 text-sm font-semibold text-dark-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pharmacy, index) in sortedData" :key="pharmacy.id" class="border-b border-light-1 hover:bg-light-1/50 transition-colors">
            <td class="py-4 px-4">
              <div class="flex items-center">
                <span :class="getRankClass(index)" class="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
                  {{ getGlobalRank(index) }}
                </span>
              </div>
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center">
                <span class="font-medium text-sm">
                  {{ pharmacy.name }}
                </span>
              </div>
            </td>
            <td class="py-4 px-4 text-sm text-dark-2">
              {{ pharmacy.region }}
            </td>
            <td class="py-4 px-4 text-right font-medium text-sm">
              {{ pharmacy.outpatient.toLocaleString() }}
            </td>
            <td class="py-4 px-4 text-right text-sm">
              {{ pharmacy.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
            </td>
            <td class="py-4 px-4 text-right">
              <span :class="trendClass(pharmacy.yoy)" class="text-sm flex items-center justify-end">
                <i v-if="hasTrendArrow(pharmacy.yoy)" :class="trendArrowIcon(pharmacy.yoy)" class="mr-1"></i>
                {{ Math.abs(pharmacy.yoy) }}%
              </span>
            </td>
            <td class="py-4 px-4 text-center">
              <button class="text-primary text-sm hover:underline flex items-center justify-center" @click="handleViewDetail(pharmacy)">
                查看详情
                <i class="fas fa-angle-right ml-1"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between items-center mt-5">
      <div class="text-sm text-info">显示 {{ startIndex }}-{{ endIndex }} 条，共 {{ totalCount }} 条</div>
      <div class="flex space-x-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-light-2 text-info text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-info text-sm"> ... </span>
          <button
            v-else
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors',
              currentPage === page ? 'bg-primary text-white' : 'border border-light-2 text-dark-2 hover:border-primary hover:text-primary',
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-light-2 text-info text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <i class="fas fa-angle-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    sortBy: {
      type: String,
      default: 'outpatient',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
  });

  const emit = defineEmits(['view-detail']);

  // 分页状态
  const currentPage = ref(1);

  // 当数据变化时重置到第一页
  watch(
    () => props.data,
    () => {
      currentPage.value = 1;
    }
  );

  // Sort data based on sortBy prop
  const allSortedData = computed(() => {
    return [...props.data].sort((a, b) => {
      if (props.sortBy === 'outpatient') {
        return b.outpatient - a.outpatient;
      } else if (props.sortBy === 'totalCost') {
        return b.totalCost - a.totalCost;
      }
      return 0;
    });
  });

  // Total count
  const totalCount = computed(() => props.data.length);

  // 总页数
  const totalPages = computed(() => Math.ceil(totalCount.value / props.pageSize));

  // 当前页数据
  const sortedData = computed(() => {
    const start = (currentPage.value - 1) * props.pageSize;
    const end = start + props.pageSize;
    return allSortedData.value.slice(start, end);
  });

  // 显示的起始索引
  const startIndex = computed(() => (currentPage.value - 1) * props.pageSize + 1);

  // 显示的结束索引
  const endIndex = computed(() => Math.min(currentPage.value * props.pageSize, totalCount.value));

  // 计算显示的页码列表
  const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  });

  // 分页操作
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  // Get rank styling class (基于全局排名)
  const getRankClass = (index) => {
    const globalIndex = (currentPage.value - 1) * props.pageSize + index;
    if (globalIndex === 0) {
      return 'bg-primary text-white';
    } else if (globalIndex === 1) {
      return 'bg-primary/80 text-white';
    } else if (globalIndex === 2) {
      return 'bg-primary/60 text-white';
    }
    return 'bg-light-2 text-dark-2';
  };

  // 获取全局排名
  const getGlobalRank = (index) => {
    return (currentPage.value - 1) * props.pageSize + index + 1;
  };

  // Handle view detail
  const handleViewDetail = (pharmacy) => {
    emit('view-detail', pharmacy);
  };

  const trendClass = (value) => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num) || Math.abs(num) < 0.005) return '';
    return num > 0 ? 'text-danger' : 'text-success';
  };

  const hasTrendArrow = (value) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) && Math.abs(num) >= 0.005;
  };

  const trendArrowIcon = (value) => {
    const num = Number(value ?? 0);
    return num > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  };
</script>

<style scoped></style>
