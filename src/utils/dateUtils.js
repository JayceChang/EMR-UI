/**
 * 日期时间工具函数
 */

/**
 * 格式化日期时间
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @param {string} format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(date) {
    return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的时间字符串 (HH:mm:ss)
 */
export function formatTime(date) {
    return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化相对时间
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date) {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const diffMinutes = Math.floor(diff / (1000 * 60))
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    return formatDate(date)
}

/**
 * 获取日期范围
 * @param {string} range 范围类型：'today', 'yesterday', 'week', 'month', 'quarter', 'year'
 * @returns {Object} 包含开始和结束日期的对象
 */
export function getDateRange(range) {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            break

        case 'yesterday':
            start.setDate(start.getDate() - 1)
            start.setHours(0, 0, 0, 0)
            end.setDate(end.getDate() - 1)
            end.setHours(23, 59, 59, 999)
            break

        case 'week':
            const dayOfWeek = start.getDay()
            start.setDate(start.getDate() - dayOfWeek)
            start.setHours(0, 0, 0, 0)
            end.setDate(end.getDate() + (6 - dayOfWeek))
            end.setHours(23, 59, 59, 999)
            break

        case 'month':
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            end.setMonth(end.getMonth() + 1)
            end.setDate(0)
            end.setHours(23, 59, 59, 999)
            break

        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            start.setMonth(quarter * 3)
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            end.setMonth((quarter + 1) * 3)
            end.setDate(0)
            end.setHours(23, 59, 59, 999)
            break

        case 'year':
            start.setMonth(0, 1)
            start.setHours(0, 0, 0, 0)
            end.setMonth(11, 31)
            end.setHours(23, 59, 59, 999)
            break

        default:
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
    }

    return {
        start: formatDate(start),
        end: formatDate(end),
        startDate: start,
        endDate: end
    }
}

/**
 * 获取最近N天的日期范围
 * @param {number} days 天数
 * @returns {Object} 包含开始和结束日期的对象
 */
export function getLastNDays(days) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    return {
        start: formatDate(start),
        end: formatDate(end),
        startDate: start,
        endDate: end
    }
}

/**
 * 获取月份范围
 * @param {number} months 月份数
 * @returns {Object} 包含开始和结束日期的对象
 */
export function getLastNMonths(months) {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - months + 1)
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    return {
        start: formatDate(start),
        end: formatDate(end),
        startDate: start,
        endDate: end
    }
}

/**
 * 检查日期是否有效
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @returns {boolean} 是否有效
 */
export function isValidDate(date) {
    if (!date) return false

    const d = new Date(date)
    return !isNaN(d.getTime())
}

/**
 * 比较两个日期
 * @param {Date|string|number} date1 第一个日期
 * @param {Date|string|number} date2 第二个日期
 * @returns {number} 比较结果：-1表示date1早于date2，0表示相等，1表示date1晚于date2
 */
export function compareDates(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return 0
    }

    if (d1 < d2) return -1
    if (d1 > d2) return 1
    return 0
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|string|number} date1 第一个日期
 * @param {Date|string|number} date2 第二个日期
 * @returns {number} 天数差
 */
export function getDaysBetween(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return 0
    }

    const timeDiff = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * 计算两个日期之间的小时差
 * @param {Date|string|number} date1 第一个日期
 * @param {Date|string|number} date2 第二个日期
 * @returns {number} 小时差
 */
export function getHoursBetween(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return 0
    }

    const timeDiff = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(timeDiff / (1000 * 3600))
}

/**
 * 格式化持续时间
 * @param {number} milliseconds 毫秒数
 * @returns {string} 格式化的持续时间
 */
export function formatDuration(milliseconds) {
    if (!milliseconds || milliseconds < 0) return '0秒'

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
        return `${days}天${hours % 24}小时`
    } else if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`
    } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`
    } else {
        return `${seconds}秒`
    }
}

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳
 */
export function getCurrentTimestamp() {
    return Date.now()
}

/**
 * 获取ISO格式的当前时间
 * @returns {string} ISO格式的时间字符串
 */
export function getCurrentISOString() {
    return new Date().toISOString()
}

/**
 * 解析ISO时间字符串
 * @param {string} isoString ISO时间字符串
 * @returns {Date} 日期对象
 */
export function parseISOString(isoString) {
    if (!isoString) return null

    const date = new Date(isoString)
    return isNaN(date.getTime()) ? null : date
}

/**
 * 格式化中文日期
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @returns {string} 中文格式的日期字符串
 */
export function formatChineseDate(date) {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = d.getMinutes()

    return `${year}年${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * 获取星期几
 * @param {Date|string|number} date 日期对象、日期字符串或时间戳
 * @param {boolean} short 是否使用简称
 * @returns {string} 星期几
 */
export function getDayOfWeek(date, short = false) {
    if (!date) return '-'

    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const weekdays = short
        ? ['日', '一', '二', '三', '四', '五', '六']
        : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

    return weekdays[d.getDay()]
}
