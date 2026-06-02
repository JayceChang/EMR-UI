<template>
  <div class="bg-gray-100 p-6 font-sans w-full bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          <span v-if="hasAnyLoading()">数据更新中，请稍候...</span>
        </div>
        <div class="flex items-center">
          <span class="mr-2 text-sm text-gray-600">统计年度</span>
          <a-select v-model:value="selectedYear" style="width: 140px" @change="handleYearChange">
            <a-select-option v-for="item in yearOptions" :key="item" :value="item">{{ item }}年</a-select-option>
          </a-select>
        </div>
      </div>
      <div v-if="hasAnyLoading()" class="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div class="top-loading-bar"></div>
      </div>
    </div>

    <!-- 医保基金总数及花销概览 -->
    <div class="relative section-container" :class="{ 'section-pending': overallLoading }">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <!-- 医保基金总数卡片 -->
        <div
          class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 border border-blue-700 hover:shadow-xl cursor-pointer"
          style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-sm font-semibold opacity-90 mb-2">
              医保资金总数
              <a-tooltip>
                <template #title>职工 & 居民基本医保统筹基金年度收入总额</template>
                <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
              </a-tooltip>
            </div>
            <div class="text-5xl font-extrabold mb-2">
              {{ formatNumber(overallData.totalFund || 0, 2) }}
            </div>
            <div class="text-lg opacity-90">亿元</div>
          </div>
          <div class="mt-4 text-sm flex items-center" :class="trendClass(overallData.fundIncrease)">
            <i v-show="hasTrendArrow(overallData.fundIncrease)" class="fas mr-2" :class="trendArrowIcon(overallData.fundIncrease)"> </i>
            <span>{{ formatNumber(overallData.fundIncrease || 0, 2) }}%</span>
            <span class="ml-1 opacity-80">同比增幅</span>
            <a-tooltip>
              <template #title>{{ yoyTooltipText }}</template>
              <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
            </a-tooltip>
          </div>
          <div class="mt-4 pt-4 border-t border-blue-500">
            <div class="text-sm font-semibold opacity-90 mb-2">
              参保总人数
              <a-tooltip>
                <template #title>当前年度职工 & 居民参保总人数</template>
                <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
              </a-tooltip>
            </div>
            <div class="text-3xl font-extrabold mb-2">
              {{ formatNumber(overallData.totalParticipants || 0) }}
            </div>
            <div class="text-sm flex items-center">
              <span class="inline-flex items-center" :class="trendClass(overallData.totalParticipantsIncreaseNum)">
                <i
                  v-show="hasTrendArrow(overallData.totalParticipantsIncreaseNum)"
                  class="fas mr-2"
                  :class="trendArrowIcon(overallData.totalParticipantsIncreaseNum)"
                >
                </i>
                <span>{{ formatNumber(overallData.totalParticipantsIncreaseNum || 0) }}</span>
              </span>
              <span class="ml-1 opacity-80">人新增</span>
              <span class="ml-4 inline-flex items-center" :class="trendClass(overallData.totalParticipantsIncreaseRate)">
                <i
                  v-show="hasTrendArrow(overallData.totalParticipantsIncreaseRate)"
                  class="fas mr-1"
                  :class="trendArrowIcon(overallData.totalParticipantsIncreaseRate)"
                >
                </i>
                {{ formatNumber(overallData.totalParticipantsIncreaseRate || 0, 2) }}%
              </span>
              <span class="ml-1 opacity-80">同比增幅</span>
              <a-tooltip>
                <template #title>{{ yoyTooltipText }}</template>
                <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
              </a-tooltip>
            </div>
          </div>
        </div>

        <!-- 进度条花销概览 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">医保资金使用进度</div>

            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  总使用额
                  <a-tooltip>
                    <template #title
                      >总使用额=当前年度医保统筹支付总费用<br />
                      占比=总使用额 / 医保资金总数 × 100%
                    </template>
                    <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                  </a-tooltip>
                </span>
                <span> {{ formatNumber(overallData.totalExpenseAmount || 0, 2) }}亿元 ({{ overallData.totalExpensePercentage || 0 }}%) </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill" :style="{ width: (overallData.totalExpensePercentage || 0) + '%' }"></div>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  职工医保使用额
                  <a-tooltip>
                    <template #title
                      >职工医保使用额=当前年度职工医保统筹支付总费用<br />
                      占比=职工医保使用额 / 职工医保资金总数 × 100%
                    </template>
                    <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                  </a-tooltip>
                </span>
                <span> {{ formatNumber(overallData.employeeExpenseAmount || 0, 2) }}亿元 ({{ overallData.employeeExpensePercentage || 0 }}%) </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill purple" :style="{ width: (overallData.employeeExpensePercentage || 0) + '%' }"></div>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  居民医保使用额
                  <a-tooltip>
                    <template #title
                      >居民医保使用额=当前年度居民医保统筹支付总费用<br />
                      占比=居民医保使用额 / 居民医保资金总数 × 100%
                    </template>
                    <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                  </a-tooltip>
                </span>
                <span> {{ formatNumber(overallData.residentExpenseAmount || 0, 2) }}亿元 ({{ overallData.residentExpensePercentage || 0 }}%) </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill orange" :style="{ width: (overallData.residentExpensePercentage || 0) + '%' }"></div>
              </div>
            </div>

            <!-- <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>住院统筹使用额</span>
                <span> {{ formatNumber(overallData.hospitalExpenseAmount || 0, 2) }}亿元 ({{ overallData.hospitalExpensePercentage || 0 }}%) </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill blue" :style="{ width: (overallData.hospitalExpensePercentage || 0) + '%' }"></div>
              </div>
            </div> -->

            <!-- <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>门诊统筹使用额</span>
                <span>
                  {{ formatNumber(overallData.outpatientExpenseAmount || 0, 2) }}亿元 ({{ overallData.outpatientExpensePercentage || 0 }}%)
                </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill red" :style="{ width: (overallData.outpatientExpensePercentage || 0) + '%' }"></div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- 住院率和外转率 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">医疗服务指标</div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-hospital-user text-purple-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    住院率
                    <a-tooltip>
                      <template #title>住院率 = 住院人次 / 参保总人数 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-2xl font-bold text-gray-800">{{ formatNumber(overallData.hospitalizationRate || 0, 2) }}%</div>
                  <div class="text-sm text-gray-500">{{ formatNumber(overallData.hospitalizationCount || 0) }}人次</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(overallData.hospitalizationIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.hospitalizationIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.hospitalizationIncrease)"
                  ></i>
                  {{ formatNumber(overallData.hospitalizationIncrease || 0, 2) }}%
                </span>
                <br />人次增幅:
                <span class="inline-flex items-center" :class="trendClass(overallData.hospitalizationCountIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.hospitalizationCountIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.hospitalizationCountIncrease)"
                  ></i>
                  {{ formatNumber(overallData.hospitalizationCountIncrease || 0) }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-plane-departure text-orange-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    外转率
                    <a-tooltip>
                      <template #title>外转率 = 外转住院人次 / 住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-2xl font-bold text-gray-800">{{ formatNumber(overallData.outwardTransferRate || 0, 2) }}%</div>
                  <div class="text-sm text-gray-500">{{ formatNumber(overallData.outwardTransferCount || 0) }}人次</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(overallData.outwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.outwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.outwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(overallData.outwardTransferIncrease || 0, 2) }}%
                </span>
                <br />人次增幅:
                <span class="inline-flex items-center" :class="trendClass(overallData.outwardTransferCountIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.outwardTransferCountIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.outwardTransferCountIncrease)"
                  ></i>
                  {{ formatNumber(overallData.outwardTransferCountIncrease || 0) }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-city text-blue-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    市域外转率
                    <a-tooltip>
                      <template #title>市域外转率 = 转往市域外住院人次 / 住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-2xl font-bold text-gray-800">{{ formatNumber(overallData.cityOutwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(overallData.cityOutwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.cityOutwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.cityOutwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(overallData.cityOutwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <i class="fas fa-globe-asia text-red-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    省域外转率
                    <a-tooltip>
                      <template #title>省域外转率 = 转往省域外住院人次 / 住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-2xl font-bold text-gray-800">{{ formatNumber(overallData.provinceOutwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(overallData.provinceOutwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(overallData.provinceOutwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(overallData.provinceOutwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(overallData.provinceOutwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="overallLoading" class="section-mask">
        <a-badge status="processing" text="更新中..." />
      </div>
      <div v-if="overallError" class="mb-6 text-sm text-red-500">医保总览数据加载失败，<a @click="retryOverall">点击重试</a></div>
    </div>

    <!-- 参保人数概览 -->
    <div class="relative section-container" :class="{ 'section-pending': insuranceLoading }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- 城镇职工参保人数 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">其中城镇职工</div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-user-tie text-green-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">参保总人数</div>
                  <div class="text-3xl font-bold text-gray-800">
                    {{ formatNumber(urbanEmployeeData.count || 0) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div class="flex items-center mb-1">
                  <i class="fas fa-user-plus text-blue-400 mr-1"> </i>
                  <span>新增: {{ formatNumber(urbanEmployeeData.increaseNum || 0) }}人</span>
                </div>
                <div class="flex items-center">
                  <span>增幅: </span>
                  <span class="inline-flex items-center ml-1" :class="trendClass(urbanEmployeeData.increaseRate)">
                    <i
                      v-show="hasTrendArrow(urbanEmployeeData.increaseRate)"
                      class="fas mr-1"
                      :class="trendArrowIcon(urbanEmployeeData.increaseRate)"
                    >
                    </i>
                    {{ formatNumber(urbanEmployeeData.increaseRate || 0, 2) }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-coins text-yellow-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">医保资金总数（亿元）</div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ formatNumber(urbanEmployeeData.fund || 0, 2) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(urbanEmployeeData.fundIncrease)">
                  <i
                    v-show="hasTrendArrow(urbanEmployeeData.fundIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(urbanEmployeeData.fundIncrease)"
                  ></i>
                  {{ formatNumber(urbanEmployeeData.fundIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <i class="fas fa-hospital-user text-purple-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    住院率
                    <a-tooltip>
                      <template #title>住院率 = 职工住院人次 / 职工参保总人数 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(urbanEmployeeData.hospitalizationRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(urbanEmployeeData.hospitalizationIncrease)">
                  <i
                    v-show="hasTrendArrow(urbanEmployeeData.hospitalizationIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(urbanEmployeeData.hospitalizationIncrease)"
                  ></i>
                  {{ formatNumber(urbanEmployeeData.hospitalizationIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center">
                <i class="fas fa-plane-departure text-orange-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    外转率
                    <a-tooltip>
                      <template #title>外转率 = 职工外转住院人次 / 职工住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(urbanEmployeeData.outwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(urbanEmployeeData.outwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(urbanEmployeeData.outwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(urbanEmployeeData.outwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(urbanEmployeeData.outwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 居民参保人数 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">其中城乡居民</div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-users text-indigo-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">参保总人数</div>
                  <div class="text-3xl font-bold text-gray-800">
                    {{ formatNumber(residentData.count || 0) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div class="flex items-center mb-1">
                  <i class="fas fa-user-plus text-blue-400 mr-1"> </i>
                  <span>新增: {{ formatNumber(residentData.increaseNum || 0) }}人</span>
                </div>
                <div class="flex items-center">
                  <span>增幅: </span>
                  <span class="inline-flex items-center ml-1" :class="trendClass(residentData.increaseRate)">
                    <i v-show="hasTrendArrow(residentData.increaseRate)" class="fas mr-1" :class="trendArrowIcon(residentData.increaseRate)"> </i>
                    {{ formatNumber(residentData.increaseRate || 0, 2) }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <AccountBookOutlined class="text-yellow-500 text-2xl mr-3" />
                <div>
                  <div class="text-sm text-gray-600">医保资金总数（亿元）</div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ formatNumber(residentData.fund || 0, 2) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(residentData.fundIncrease)">
                  <i v-show="hasTrendArrow(residentData.fundIncrease)" class="fas mr-1" :class="trendArrowIcon(residentData.fundIncrease)"></i>
                  {{ formatNumber(residentData.fundIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center">
                <i class="fas fa-hospital-user text-purple-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    住院率
                    <a-tooltip>
                      <template #title>住院率 = 居名住院人次 / 居民参保总人数 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(residentData.hospitalizationRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(residentData.hospitalizationIncrease)">
                  <i
                    v-show="hasTrendArrow(residentData.hospitalizationIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(residentData.hospitalizationIncrease)"
                  ></i>
                  {{ formatNumber(residentData.hospitalizationIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center">
                <i class="fas fa-plane-departure text-orange-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    外转率
                    <a-tooltip>
                      <template #title>外转率 = 居民外转住院人次 / 居民住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(residentData.outwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(residentData.outwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(residentData.outwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(residentData.outwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(residentData.outwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="insuranceLoading" class="section-mask">
        <a-badge status="processing" text="更新中..." />
      </div>
      <div v-if="urbanError || residentError" class="mb-6 text-sm text-red-500">
        参保人数数据加载失败，
        <a @click="retryInsurance">点击重试</a>
      </div>
    </div>

    <!-- 医疗集团数据概览 -->
    <div class="relative section-container" :class="{ 'section-pending': medicalGroupLoading }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- 安阳市人民医院医疗集团 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">安阳市人民医院医疗集团</div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-hospital text-blue-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">居民参保总人数</div>
                  <div class="text-3xl font-bold text-gray-800">
                    {{ formatNumber(medicalGroupData.rmyy?.residentCount || 0) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div class="flex items-center mb-1">
                  <i class="fas fa-user-plus text-blue-400 mr-1"> </i>
                  <span>新增: {{ formatNumber(medicalGroupData.rmyy?.residentIncreaseNum || 0) }}人</span>
                </div>
                <div class="flex items-center">
                  <span>增幅: </span>
                  <span class="inline-flex items-center ml-1" :class="trendClass(medicalGroupData.rmyy?.residentIncreaseRate)">
                    <i
                      v-show="hasTrendArrow(medicalGroupData.rmyy?.residentIncreaseRate)"
                      class="fas mr-1"
                      :class="trendArrowIcon(medicalGroupData.rmyy?.residentIncreaseRate)"
                    >
                    </i>
                    {{ formatNumber(medicalGroupData.rmyy?.residentIncreaseRate || 0, 2) }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-coins text-yellow-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">医保资金总数 (亿元)</div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ formatNumber(medicalGroupData.rmyy?.residentFund || 0, 2) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.rmyy?.residentFundIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.rmyy?.residentFundIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.rmyy?.residentFundIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.rmyy?.residentFundIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-hospital-user text-purple-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    住院率
                    <a-tooltip>
                      <template #title>住院率 = 住院人次 / 参保总人数 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(medicalGroupData.rmyy?.hospitalizationRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.rmyy?.hospitalizationIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.rmyy?.hospitalizationIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.rmyy?.hospitalizationIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.rmyy?.hospitalizationIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-plane-departure text-orange-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    外转率
                    <a-tooltip>
                      <template #title>外转率 = 外转住院人次 / 住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(medicalGroupData.rmyy?.outwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.rmyy?.outwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.rmyy?.outwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.rmyy?.outwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.rmyy?.outwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>医保基金使用进度</span>
                <span>
                  {{ formatNumber(medicalGroupData.rmyy?.totalExpenseAmount || 0, 2) }}亿元 ({{
                    medicalGroupData.rmyy?.totalExpensePercentage || 0
                  }}%)
                </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill" :style="{ width: (medicalGroupData.rmyy?.totalExpensePercentage || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 安阳市中医院医疗集团 -->
        <div
          class="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border border-gray-200 transform hover:scale-105 transition-transform duration-300 hover:shadow-xl cursor-pointer"
          @click="void 0"
        >
          <div class="card-content">
            <div class="text-lg font-semibold text-gray-700 mb-4">安阳市中医院医疗集团</div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-hospital-alt text-green-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">居民参保总人数</div>
                  <div class="text-3xl font-bold text-gray-800">
                    {{ formatNumber(medicalGroupData.zyyy?.residentCount || 0) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                <div class="flex items-center mb-1">
                  <i class="fas fa-user-plus text-blue-400 mr-1"> </i>
                  <span>新增: {{ formatNumber(medicalGroupData.zyyy?.residentIncreaseNum || 0) }}人</span>
                </div>
                <div class="flex items-center">
                  <span>增幅: </span>
                  <span class="inline-flex items-center ml-1" :class="trendClass(medicalGroupData.zyyy?.residentIncreaseRate)">
                    <i
                      v-show="hasTrendArrow(medicalGroupData.zyyy?.residentIncreaseRate)"
                      class="fas mr-1"
                      :class="trendArrowIcon(medicalGroupData.zyyy?.residentIncreaseRate)"
                    >
                    </i>
                    {{ formatNumber(medicalGroupData.zyyy?.residentIncreaseRate || 0, 2) }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-coins text-yellow-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">医保资金总数 (亿元)</div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ formatNumber(medicalGroupData.zyyy?.residentFund || 0, 2) }}
                  </div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.zyyy?.residentFundIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.zyyy?.residentFundIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.zyyy?.residentFundIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.zyyy?.residentFundIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-hospital-user text-purple-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    住院率
                    <a-tooltip>
                      <template #title>住院率 = 住院人次 / 参保总人数 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(medicalGroupData.zyyy?.hospitalizationRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.zyyy?.hospitalizationIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.zyyy?.hospitalizationIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.zyyy?.hospitalizationIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.zyyy?.hospitalizationIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <i class="fas fa-plane-departure text-orange-500 text-2xl mr-3"> </i>
                <div>
                  <div class="text-sm text-gray-600">
                    外转率
                    <a-tooltip>
                      <template #title>外转率 = 外转住院人次 / 住院总人次 × 100%</template>
                      <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                    </a-tooltip>
                  </div>
                  <div class="text-xl font-bold text-gray-800">{{ formatNumber(medicalGroupData.zyyy?.outwardTransferRate || 0, 2) }}%</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                同比增幅:
                <a-tooltip>
                  <template #title>{{ yoyTooltipText }}</template>
                  <QuestionCircleOutlined class="ml-1 text-gray-400 cursor-help" />
                </a-tooltip>
                <span class="inline-flex items-center" :class="trendClass(medicalGroupData.zyyy?.outwardTransferIncrease)">
                  <i
                    v-show="hasTrendArrow(medicalGroupData.zyyy?.outwardTransferIncrease)"
                    class="fas mr-1"
                    :class="trendArrowIcon(medicalGroupData.zyyy?.outwardTransferIncrease)"
                  ></i>
                  {{ formatNumber(medicalGroupData.zyyy?.outwardTransferIncrease || 0, 2) }}%
                </span>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>医保基金使用进度</span>
                <span>
                  {{ formatNumber(medicalGroupData.zyyy?.totalExpenseAmount || 0, 2) }}亿元 ({{
                    medicalGroupData.zyyy?.totalExpensePercentage || 0
                  }}%)
                </span>
              </div>
              <div class="progress-bar-container h-3 w-full">
                <div class="progress-bar-fill" :style="{ width: (medicalGroupData.zyyy?.totalExpensePercentage || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="medicalGroupLoading" class="section-mask">
        <a-badge status="processing" text="更新中..." />
      </div>
      <div v-if="medicalGroupError" class="mb-6 text-sm text-red-500">医疗集团数据加载失败，<a @click="retryMedicalGroup">点击重试</a></div>
    </div>

    <!-- 各区县数据列表 -->
    <div class="relative section-container" :class="{ 'section-pending': districtLoading }">
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="card-content">
          <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <i class="fas fa-list-alt text-teal-500 mr-3"> </i>
            各区县医保数据总览
          </h2>

          <a-table
            :columns="districtTableColumns"
            :data-source="districtTableData"
            :loading="districtLoading"
            row-key="name"
            size="small"
            @change="handleDistrictTableChange"
            class="min-w-full divide-y divide-gray-200"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'totalExpense'">
                <div class="flex items-center">
                  <div class="progress-bar-container h-2 w-20">
                    <div class="progress-bar-fill" :style="{ width: record.totalExpense + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ record.totalExpense }}%</span>
                </div>
              </template>
              <template v-if="column.key === 'hospitalExpense'">
                <div class="flex items-center">
                  <div class="progress-bar-container h-2 w-20">
                    <div class="progress-bar-fill blue" :style="{ width: record.hospitalExpense + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ record.hospitalExpense }}%</span>
                </div>
              </template>
              <template v-if="column.key === 'outpatientExpense'">
                <div class="flex items-center">
                  <div class="progress-bar-container h-2 w-20">
                    <div class="progress-bar-fill red" :style="{ width: record.outpatientExpense + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ record.outpatientExpense }}%</span>
                </div>
              </template>
              <template v-if="column.key === 'increaseRate'">
                <span class="inline-flex items-center" :class="trendClass(record.increaseRate, 'table')">
                  <span v-if="hasTrendArrow(record.increaseRate)" class="mr-1">{{ trendArrowSymbol(record.increaseRate) }}</span>
                  {{ (record.increaseRate ?? 0).toFixed(2) }}%
                </span>
              </template>
              <template v-if="column.key === 'hospitalizationIncrease'">
                <span class="inline-flex items-center" :class="trendClass(record.hospitalizationIncrease, 'table')">
                  <span v-if="hasTrendArrow(record.hospitalizationIncrease)" class="mr-1">{{
                    trendArrowSymbol(record.hospitalizationIncrease)
                  }}</span>
                  {{ (record.hospitalizationIncrease ?? 0).toFixed(2) }}%
                </span>
              </template>
              <template v-if="column.key === 'outwardTransferIncrease'">
                <span class="inline-flex items-center" :class="trendClass(record.outwardTransferIncrease, 'table')">
                  <span v-if="hasTrendArrow(record.outwardTransferIncrease)" class="mr-1">{{
                    trendArrowSymbol(record.outwardTransferIncrease)
                  }}</span>
                  {{ (record.outwardTransferIncrease ?? 0).toFixed(2) }}%
                </span>
              </template>
              <template v-if="column.key === 'action'">
                <a @click="void 0">下钻</a>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div v-if="districtLoading" class="section-mask">
        <a-badge status="processing" text="更新中..." />
      </div>
      <div v-if="districtError" class="mt-2 text-sm text-red-500">区县数据加载失败，<a @click="retryDistrict">点击重试</a></div>
    </div>

    <!-- 弹窗组件 -->
    <UrbanEmployeeModal v-model:visible="urbanEmployeeModalVisible" :district-data="districtTableData" @drill-down="handleDrillDown" />

    <ResidentModal v-model:visible="residentModalVisible" :district-data="districtTableData" @drill-down="handleDrillDown" />

    <MedicalGroupModal
      v-model:visible="medicalGroupModalVisible"
      :group-type="selectedGroupType"
      :district-data="districtTableData"
      @drill-down="handleDrillDown"
    />

    <TownshipModal v-model:visible="townshipModalVisible" :district-name="selectedDistrictName" @drill-down="handleDrillDown" />

    <VillageModal v-model:visible="villageModalVisible" :district-name="selectedDistrictName" :township-name="selectedTownshipName" />
  </div>
</template>

<script setup>
  defineOptions({
    name: 'HomeDashboard',
  });

  import { ref, reactive, computed, onMounted, onBeforeUnmount, h } from 'vue';
  import { message, Tooltip } from 'ant-design-vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';

  // 导入弹窗组件
  import UrbanEmployeeModal from './modals/UrbanEmployeeModal.vue';
  import ResidentModal from './modals/ResidentModal.vue';
  import MedicalGroupModal from './modals/MedicalGroupModal.vue';
  import TownshipModal from './modals/TownshipModal.vue';
  import VillageModal from './modals/VillageModal.vue';
  import '/@/assets/css/all.min.css';

  // 导入API
  import { DashboardAPI } from '/@/api/business/dashboard/dashboard-api.js';

  // 响应式数据
  const loadingState = reactive({
    overall: false,
    urban: false,
    resident: false,
    medicalGroup: false,
    district: false,
  });

  const loadedState = reactive({
    overall: false,
    urban: false,
    resident: false,
    medicalGroup: false,
    district: false,
  });

  const errorState = reactive({
    overall: false,
    urban: false,
    resident: false,
    medicalGroup: false,
    district: false,
  });

  let activeRequestToken = 0;
  let yearChangeTimer = null;
  const dashboardCache = new Map();
  const CACHE_REFRESH_INTERVAL = 15000;
  const currentYear = new Date().getFullYear();
  const selectedYear = ref(currentYear);
  const yearOptions = ref(Array.from({ length: 10 }, (_, index) => currentYear - index));

  const yoyTooltipText = computed(() => {
    const isCurrentYear = Number(selectedYear.value) === currentYear;
    if (isCurrentYear) {
      const month = new Date().getMonth() + 1;
      return `同比口径：${selectedYear.value}年1-${month}月累计，对比${selectedYear.value - 1}年1-${month}月累计`;
    }
    return `同比口径：${selectedYear.value}年1-12月累计，对比${selectedYear.value - 1}年1-12月累计`;
  });

  // 整体数据
  const overallData = ref({});

  // 城镇职工数据
  const urbanEmployeeData = ref({});

  // 城乡居民数据
  const residentData = ref({});

  // 医疗集团数据
  const medicalGroupData = ref({
    rmyy: {},
    zyyy: {},
    tumor: {},
  });

  // 区县表格数据
  const districtTableData = ref([]);

  // 区县表格分页
  const districtPagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
  });

  // 弹窗控制
  const urbanEmployeeModalVisible = ref(false);
  const residentModalVisible = ref(false);
  const medicalGroupModalVisible = ref(false);
  const townshipModalVisible = ref(false);
  const villageModalVisible = ref(false);

  const selectedGroupType = ref('');
  const selectedDistrictName = ref('');
  const selectedTownshipName = ref('');

  const overallLoading = computed(() => loadingState.overall);
  const overallError = computed(() => errorState.overall);
  const insuranceLoading = computed(() => loadingState.urban || loadingState.resident);
  const urbanError = computed(() => errorState.urban);
  const residentError = computed(() => errorState.resident);
  const medicalGroupLoading = computed(() => loadingState.medicalGroup);
  const medicalGroupError = computed(() => errorState.medicalGroup);
  const districtLoading = computed(() => loadingState.district);
  const districtError = computed(() => errorState.district);

  const hasAnyLoading = () =>
    loadingState.overall || loadingState.urban || loadingState.resident || loadingState.medicalGroup || loadingState.district;

  // 区县表格列定义
  const districtTableColumns = [
    {
      title: '区县',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '参保总人数',
      dataIndex: 'totalParticipants',
      key: 'totalParticipants',
      sorter: true,
      customRender: ({ text }) => formatNumber(text),
    },
    {
      title: '医保资金合计 (亿元)',
      dataIndex: 'totalFund',
      key: 'totalFund',
      sorter: true,
      customRender: ({ text }) => Number(text ?? 0).toFixed(2),
    },
    {
      title: '职工人数',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      sorter: true,
      customRender: ({ text }) => formatNumber(text),
    },
    {
      title: '居民人数',
      dataIndex: 'residentCount',
      key: 'residentCount',
      sorter: true,
      customRender: ({ text }) => formatNumber(text),
    },
    {
      title: '职工医保基金 (亿元)',
      dataIndex: 'employeeFund',
      key: 'employeeFund',
      sorter: true,
      customRender: ({ text }) => Number(text ?? 0).toFixed(2),
    },
    {
      title: '居民医保基金 (亿元)',
      dataIndex: 'residentFund',
      key: 'residentFund',
      sorter: true,
      customRender: ({ text }) => Number(text ?? 0).toFixed(2),
    },
    {
      title: () =>
        h('span', { class: 'inline-flex items-center' }, [
          '同比增幅',
          h(
            Tooltip,
            { title: yoyTooltipText.value },
            {
              default: () => h(QuestionCircleOutlined, { class: 'ml-1 text-gray-400 cursor-help' }),
            }
          ),
        ]),
      dataIndex: 'increaseRate',
      key: 'increaseRate',
      sorter: true,
    },
    {
      title: '居民总使用进度',
      dataIndex: 'totalExpense',
      key: 'totalExpense',
      sorter: true,
    },
    // {
    //   title: '住院统筹使用进度',
    //   dataIndex: 'hospitalExpense',
    //   key: 'hospitalExpense',
    //   sorter: true,
    // },
    // {
    //   title: '门诊统筹使用进度',
    //   dataIndex: 'outpatientExpense',
    //   key: 'outpatientExpense',
    //   sorter: true,
    // },
    {
      title: '住院率',
      dataIndex: 'hospitalizationRate',
      key: 'hospitalizationRate',
      sorter: true,
      customRender: ({ text }) => `${Number(text ?? 0).toFixed(2)}%`,
    },
    {
      title: () =>
        h('span', { class: 'inline-flex items-center' }, [
          '住院率增幅',
          h(
            Tooltip,
            { title: yoyTooltipText.value },
            {
              default: () => h(QuestionCircleOutlined, { class: 'ml-1 text-gray-400 cursor-help' }),
            }
          ),
        ]),
      dataIndex: 'hospitalizationIncrease',
      key: 'hospitalizationIncrease',
      sorter: true,
    },
    {
      title: '外转率',
      dataIndex: 'outwardTransferRate',
      key: 'outwardTransferRate',
      sorter: true,
      customRender: ({ text }) => `${Number(text ?? 0).toFixed(2)}%`,
    },
    {
      title: () =>
        h('span', { class: 'inline-flex items-center' }, [
          '外转率增幅',
          h(
            Tooltip,
            { title: yoyTooltipText.value },
            {
              default: () => h(QuestionCircleOutlined, { class: 'ml-1 text-gray-400 cursor-help' }),
            }
          ),
        ]),
      dataIndex: 'outwardTransferIncrease',
      key: 'outwardTransferIncrease',
      sorter: true,
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   fixed: 'right',
    //   width: 80,
    // },
  ];

  // 页面加载时获取数据
  onMounted(() => {
    loadAllData();
  });

  onBeforeUnmount(() => {
    if (yearChangeTimer) {
      clearTimeout(yearChangeTimer);
      yearChangeTimer = null;
    }
  });

  const getYearParams = () => ({
    year: selectedYear.value,
  });

  const getActiveToken = () => activeRequestToken;

  const cloneData = (data) => JSON.parse(JSON.stringify(data));

  const writeCache = (year) => {
    dashboardCache.set(year, {
      overallData: { ...overallData.value },
      urbanEmployeeData: { ...urbanEmployeeData.value },
      residentData: { ...residentData.value },
      medicalGroupData: cloneData(medicalGroupData.value),
      districtTableData: cloneData(districtTableData.value),
      districtTotal: districtPagination.value.total,
      updatedAt: Date.now(),
    });
  };

  const applyCache = (cacheData) => {
    overallData.value = cacheData.overallData || {};
    urbanEmployeeData.value = cacheData.urbanEmployeeData || {};
    residentData.value = cacheData.residentData || {};
    medicalGroupData.value = cacheData.medicalGroupData || { rmyy: {}, zyyy: {}, tumor: {} };
    districtTableData.value = cacheData.districtTableData || [];
    districtPagination.value.total = cacheData.districtTotal || 0;

    loadedState.overall = true;
    loadedState.urban = true;
    loadedState.resident = true;
    loadedState.medicalGroup = true;
    loadedState.district = true;

    errorState.overall = false;
    errorState.urban = false;
    errorState.resident = false;
    errorState.medicalGroup = false;
    errorState.district = false;
  };

  const logDuration = (name, startTime) => {
    if (import.meta.env.DEV) {
      const cost = Math.round(performance.now() - startTime);
      console.info(`[dashboard] ${name} ${cost}ms`);
    }
  };

  const handleYearChange = () => {
    if (yearChangeTimer) {
      clearTimeout(yearChangeTimer);
    }
    yearChangeTimer = setTimeout(() => {
      loadAllData();
    }, 120);
  };

  // 加载所有数据
  const loadAllData = async (options = {}) => {
    const { forceRefresh = false } = options;
    const requestToken = ++activeRequestToken;
    const cacheData = dashboardCache.get(selectedYear.value);
    if (cacheData) {
      applyCache(cacheData);
    }

    if (!forceRefresh && cacheData?.updatedAt && Date.now() - cacheData.updatedAt < CACHE_REFRESH_INTERVAL) {
      return;
    }

    await Promise.all([
      loadOverallData(requestToken),
      loadUrbanEmployeeData(requestToken),
      loadResidentData(requestToken),
      loadMedicalGroupData(requestToken),
      loadDistrictData(requestToken),
    ]);

    if (requestToken === activeRequestToken) {
      writeCache(selectedYear.value);
    }
  };

  // 加载整体数据
  const loadOverallData = async (requestToken = getActiveToken()) => {
    const startTime = performance.now();
    loadingState.overall = true;
    errorState.overall = false;
    try {
      const response = await DashboardAPI.getOverallData(getYearParams());
      if (requestToken !== activeRequestToken) {
        return;
      }
      if (response.data) {
        overallData.value = response.data;
      }
      loadedState.overall = true;
      writeCache(selectedYear.value);
    } catch (error) {
      if (requestToken !== activeRequestToken) {
        return;
      }
      console.error('加载整体数据失败:', error);
      errorState.overall = true;
      // 使用模拟数据
      if (!loadedState.overall) {
        overallData.value = {
          totalFund: 125.68,
          fundIncrease: 8.25,
          totalParticipants: 4750000,
          totalParticipantsIncreaseNum: 130000,
          totalParticipantsIncreaseRate: 3.0,
          totalExpensePercentage: 65,
          totalExpenseAmount: 81.7,
          hospitalExpensePercentage: 40,
          hospitalExpenseAmount: 50.27,
          outpatientExpensePercentage: 25,
          outpatientExpenseAmount: 31.42,
          employeeExpensePercentage: 35,
          employeeExpenseAmount: 43.99,
          residentExpensePercentage: 30,
          residentExpenseAmount: 37.71,
          hospitalizationRate: 12.34,
          hospitalizationCount: 150000,
          hospitalizationIncrease: 1.5,
          hospitalizationCountIncrease: 5000,
          outwardTransferRate: 3.87,
          outwardTransferCount: 20000,
          outwardTransferIncrease: -0.5,
          outwardTransferCountIncrease: -500,
          cityOutwardTransferRate: 1.25,
          cityOutwardTransferIncrease: 0.1,
          provinceOutwardTransferRate: 0.85,
          provinceOutwardTransferIncrease: -0.05,
        };
        loadedState.overall = true;
      }
    } finally {
      if (requestToken === activeRequestToken) {
        loadingState.overall = false;
      }
      logDuration('overall', startTime);
    }
  };

  // 加载城镇职工数据
  const loadUrbanEmployeeData = async (requestToken = getActiveToken()) => {
    const startTime = performance.now();
    loadingState.urban = true;
    errorState.urban = false;
    try {
      const response = await DashboardAPI.getUrbanEmployeeData(getYearParams());
      if (requestToken !== activeRequestToken) {
        return;
      }
      if (response.data) {
        urbanEmployeeData.value = response.data;
      }
      loadedState.urban = true;
      writeCache(selectedYear.value);
    } catch (error) {
      if (requestToken !== activeRequestToken) {
        return;
      }
      console.error('加载城镇职工数据失败:', error);
      errorState.urban = true;
      // 使用模拟数据
      if (!loadedState.urban) {
        urbanEmployeeData.value = {
          count: 1250000,
          increaseNum: 50000,
          increaseRate: 4.17,
          fund: 80.5,
          fundIncrease: 7.5,
          hospitalizationRate: 15.2,
          hospitalizationIncrease: 1.8,
          outwardTransferRate: 4.5,
          outwardTransferIncrease: -0.2,
        };
        loadedState.urban = true;
      }
    } finally {
      if (requestToken === activeRequestToken) {
        loadingState.urban = false;
      }
      logDuration('urban', startTime);
    }
  };

  // 加载城乡居民数据
  const loadResidentData = async (requestToken = getActiveToken()) => {
    const startTime = performance.now();
    loadingState.resident = true;
    errorState.resident = false;
    try {
      const response = await DashboardAPI.getResidentData(getYearParams());
      if (requestToken !== activeRequestToken) {
        return;
      }
      if (response.data) {
        residentData.value = response.data;
      }
      loadedState.resident = true;
      writeCache(selectedYear.value);
    } catch (error) {
      if (requestToken !== activeRequestToken) {
        return;
      }
      console.error('加载城乡居民数据失败:', error);
      errorState.resident = true;
      // 使用模拟数据
      if (!loadedState.resident) {
        residentData.value = {
          count: 3500000,
          increaseNum: 80000,
          increaseRate: 2.35,
          fund: 45.18,
          fundIncrease: 6.8,
          hospitalizationRate: 10.5,
          hospitalizationIncrease: 1.2,
          outwardTransferRate: 3.1,
          outwardTransferIncrease: -0.3,
        };
        loadedState.resident = true;
      }
    } finally {
      if (requestToken === activeRequestToken) {
        loadingState.resident = false;
      }
      logDuration('resident', startTime);
    }
  };

  // 加载医疗集团数据
  const loadMedicalGroupData = async (requestToken = getActiveToken()) => {
    const startTime = performance.now();
    loadingState.medicalGroup = true;
    errorState.medicalGroup = false;
    try {
      const response = await DashboardAPI.getMedicalGroupList(getYearParams());
      if (requestToken !== activeRequestToken) {
        return;
      }
      if (response.data) {
        medicalGroupData.value = response.data;
      }
      loadedState.medicalGroup = true;
      writeCache(selectedYear.value);
    } catch (error) {
      if (requestToken !== activeRequestToken) {
        return;
      }
      console.error('加载医疗集团数据失败:', error);
      errorState.medicalGroup = true;
      // 使用模拟数据
      if (!loadedState.medicalGroup) {
        medicalGroupData.value = {
          rmyy: {
            residentCount: 430032,
            residentIncreaseNum: 5432,
            residentIncreaseRate: 3.45,
            residentFund: 46.56,
            residentFundIncrease: 0.34,
            hospitalizationRate: 7.65,
            hospitalizationIncrease: 0.42,
            outwardTransferRate: 5.43,
            outwardTransferIncrease: 0.39,
            totalExpenseAmount: 23.34,
            totalExpensePercentage: 43,
          },
          zyyy: {
            residentCount: 765490,
            residentIncreaseNum: -543,
            residentIncreaseRate: -2.24,
            residentFund: 85.65,
            residentFundIncrease: 0.4,
            hospitalizationRate: 8.54,
            hospitalizationIncrease: 0.49,
            outwardTransferRate: 6.5,
            outwardTransferIncrease: 0.54,
            totalExpenseAmount: 54.4,
            totalExpensePercentage: 43,
          },
          tumor: {
            residentCount: 300000,
            residentIncreaseNum: 1500,
            residentIncreaseRate: 0.5,
            residentFund: 35.2,
            residentFundIncrease: 0.25,
            hospitalizationRate: 6.8,
            hospitalizationIncrease: 0.15,
            outwardTransferRate: 4.2,
            outwardTransferIncrease: 0.2,
            totalExpenseAmount: 18.5,
            totalExpensePercentage: 42,
          },
        };
        loadedState.medicalGroup = true;
      }
    } finally {
      if (requestToken === activeRequestToken) {
        loadingState.medicalGroup = false;
      }
      logDuration('medicalGroup', startTime);
    }
  };

  // 加载区县数据
  const loadDistrictData = async (requestToken = getActiveToken()) => {
    const startTime = performance.now();
    loadingState.district = true;
    errorState.district = false;
    try {
      const response = await DashboardAPI.getDistrictList(getYearParams());
      if (requestToken !== activeRequestToken) {
        return;
      }
      if (response.data) {
        districtTableData.value = response.data || [];
        districtPagination.value.total = Array.isArray(response.data) ? response.data.length : 0;
      }
      loadedState.district = true;
      writeCache(selectedYear.value);
    } catch (error) {
      if (requestToken !== activeRequestToken) {
        return;
      }
      console.error('加载区县数据失败:', error);
      errorState.district = true;
      // 使用模拟数据
      if (!loadedState.district) {
        districtTableData.value = [
          {
            name: '文峰区',
            totalParticipants: 850000,
            totalFund: 25.3,
            employeeCount: 300000,
            residentCount: 550000,
            employeeFund: 18.5,
            residentFund: 6.8,
            increaseRate: 5.2,
            totalExpense: 70,
            hospitalExpense: 45,
            outpatientExpense: 25,
            hospitalizationRate: 13.5,
            hospitalizationIncrease: 0.8,
            outwardTransferRate: 4.2,
            outwardTransferIncrease: -0.1,
          },
          {
            name: '北关区',
            totalParticipants: 720000,
            totalFund: 21.8,
            employeeCount: 280000,
            residentCount: 440000,
            employeeFund: 16.0,
            residentFund: 5.8,
            increaseRate: 4.8,
            totalExpense: 68,
            hospitalExpense: 42,
            outpatientExpense: 26,
            hospitalizationRate: 12.8,
            hospitalizationIncrease: 0.5,
            outwardTransferRate: 3.9,
            outwardTransferIncrease: 0.2,
          },
        ];
        districtPagination.value.total = districtTableData.value.length;
        loadedState.district = true;
      }
    } finally {
      if (requestToken === activeRequestToken) {
        loadingState.district = false;
      }
      logDuration('district', startTime);
    }
  };

  const retryOverall = () => loadAllData({ forceRefresh: true });
  const retryInsurance = async () => {
    await Promise.all([loadUrbanEmployeeData(getActiveToken()), loadResidentData(getActiveToken())]);
  };
  const retryMedicalGroup = () => loadMedicalGroupData(getActiveToken());
  const retryDistrict = () => loadDistrictData(getActiveToken());

  // 格式化数字
  const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '-';
    if (decimals > 0) {
      return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return Number(num).toLocaleString('zh-CN');
  };

  const normalizeTrendValue = (value, decimals = 2) => {
    const v = Number(value ?? 0);
    if (!Number.isFinite(v)) {
      return 0;
    }
    const factor = 10 ** decimals;
    return Math.round(v * factor) / factor;
  };

  const trendClass = (value, scene = 'card', decimals = 2) => {
    const v = normalizeTrendValue(value, decimals);
    if (v === 0) {
      return '';
    }
    if (scene === 'table') {
      return v < 0 ? 'text-green-600' : 'text-red-600';
    }
    return v < 0 ? 'text-green-500' : 'text-red-500';
  };

  const hasTrendArrow = (value, decimals = 2) => {
    const v = normalizeTrendValue(value, decimals);
    return Math.abs(v) >= 0.5 / 10 ** decimals;
  };

  const trendArrowIcon = (value, decimals = 2) => {
    const v = normalizeTrendValue(value, decimals);
    if (v === 0) {
      return '';
    }
    return v < 0 ? 'fa-arrow-down' : 'fa-arrow-up';
  };

  const trendArrowSymbol = (value, decimals = 2) => {
    const v = normalizeTrendValue(value, decimals);
    if (v === 0) {
      return '';
    }
    return v < 0 ? '↓' : '↑';
  };

  // 显示城镇职工弹窗
  const showUrbanEmployeeModal = () => {
    urbanEmployeeModalVisible.value = true;
  };

  // 显示城乡居民弹窗
  const showResidentModal = () => {
    residentModalVisible.value = true;
  };

  // 显示医疗集团弹窗
  const showMedicalGroupModal = (groupType) => {
    selectedGroupType.value = groupType;
    medicalGroupModalVisible.value = true;
  };

  // 处理区县表格变化
  const handleDistrictTableChange = (pag) => {
    districtPagination.value.current = pag.current;
    districtPagination.value.pageSize = pag.pageSize;
    loadDistrictData();
  };

  // 处理区县下钻
  const handleDistrictDrillDown = (record) => {
    selectedDistrictName.value = record.name;
    townshipModalVisible.value = true;
  };

  // 处理下钻事件
  const handleDrillDown = (type, data) => {
    if (type === 'township') {
      selectedTownshipName.value = data.townshipName;
      villageModalVisible.value = true;
    }
  };

  // 显示医保资金总数弹窗（使用已有组件或未来添加）
  const showTotalFundModal = () => {
    message.info('医保资金总数下钻功能开发中...');
  };

  // 显示医保资金使用进度弹窗（使用已有组件或未来添加）
  const showFundUsageModal = () => {
    message.info('医保资金使用进度下钻功能开发中...');
  };

  // 显示医疗服务指标弹窗（使用已有组件或未来添加）
  const showMedicalServiceModal = () => {
    message.info('医疗服务指标下钻功能开发中...');
  };
</script>

<style scoped>
  /* 自定义进度条样式 */
  .progress-bar-container {
    background-color: #e5e7eb; /* 更浅的灰色 */
    border-radius: 9999px; /* 使得进度条两端是圆的 */
    overflow: hidden;
  }
  .progress-bar-fill {
    background-color: #22c55e; /* 扁平化绿色 */
    height: 100%;
    border-radius: 9999px;
    transition: width 0.5s ease-in-out;
  }
  .progress-bar-fill.red {
    background-color: #ef4444; /* 扁平化红色 */
  }
  .progress-bar-fill.blue {
    background-color: #3b82f6; /* 扁平化蓝色 */
  }
  .progress-bar-fill.purple {
    background-color: #9333ea; /* 扁平化紫色 */
  }
  .progress-bar-fill.orange {
    background-color: #f97316; /* 扁平化橙色 */
  }

  .section-mask {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    padding: 3px 10px;
  }

  .top-loading-bar {
    width: 35%;
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.18) 0%, #3b82f6 50%, rgba(59, 130, 246, 0.18) 100%);
    animation: loading-slide 1.2s ease-in-out infinite;
  }

  .section-container {
    transition: opacity 0.2s ease;
  }

  .section-pending {
    opacity: 0.9;
  }

  @keyframes loading-slide {
    0% {
      transform: translateX(-120%);
    }
    100% {
      transform: translateX(320%);
    }
  }
</style>
