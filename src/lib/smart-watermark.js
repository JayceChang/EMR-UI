/*
 * 水印
 *





 */

import dayjs from 'dayjs';

/**
 *  水印DOM id
 */
const WATER_MARK_DOM_ID = 'smart_admin_water_mark';
let smartAdminWaterMarkIntervalId = null;

/**
 *
 * 因为modal的z-index为1000，所以为了modal的黑色背景隐藏掉，z-index为 999
 *
 * @param id
 * @param str
 * @returns
 */

function setWatermark(id, str) {
    //删掉之前的水印
    if (document.getElementById(WATER_MARK_DOM_ID) !== null) {
        document.getElementById(WATER_MARK_DOM_ID).remove();
    }

    // 支持 <br/> 或 \n 换行，将文本拆分成多行
    const lines = str.split(/<br\s*\/?>|\n/);
    // 时间戳单独作为最后一行
    lines.push(dayjs().format('YYYY-MM-DD HH:mm'));

    //创建一个画布
    const can = document.createElement('canvas');
    //设置画布的长宽
    can.width = 600;
    can.height = 200;

    const cans = can.getContext('2d');
    //旋转角度
    cans.rotate((-15 * Math.PI) / 150);
    cans.font = '16px Microsoft JhengHei';
    //设置填充绘画的颜色、渐变或者模式
    cans.fillStyle = 'rgba(150, 150, 150, 0.1)';
    cans.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    //设置文本内容的当前对齐方式
    cans.textAlign = 'left';
    //设置在绘制文本时使用的当前文本基线
    cans.textBaseline = 'middle';

    //在画布上绘制填色的文本（支持多行）
    const lineHeight = 30; // 行高
    const startY = can.height / 2 - ((lines.length - 1) * lineHeight) / 2; // 垂直居中
    lines.forEach((line, index) => {
        cans.fillText(line, can.width / 8, startY + index * lineHeight);
    });

    const div = document.createElement('div');
    div.id = WATER_MARK_DOM_ID;
    div.style.pointerEvents = 'none';
    div.style.top = '100px';
    div.style.left = '100px';
    div.style.position = 'fixed';
    div.style.zIndex = '9999';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat';
    document.getElementById(id).appendChild(div);
}

const watermark = {
    show: function () {
        document.getElementById(WATER_MARK_DOM_ID).style.display = 'block';
    },
    hide: function () {
        document.getElementById(WATER_MARK_DOM_ID).style.display = 'hide';
    },
    // 该方法只允许调用一次
    set: function (id, str) {
        // 如果存在水印，则不允许再调用了
        if (document.getElementById(WATER_MARK_DOM_ID) !== null) {
            return;
        }

        setWatermark(id, str);

        //每隔1分钟检查一次水印
        smartAdminWaterMarkIntervalId = setInterval(() => {
            setWatermark(id, str);
        }, 60000);

        window.onresize = () => {
            setWatermark(id, str);
        };
    },
    // 清空水印
    clear: function () {
        let watermarkDom = document.getElementById(WATER_MARK_DOM_ID);
        if (watermarkDom) {
            watermarkDom.remove();
        }

        window.removeEventListener('resize', setWatermark);
        if (smartAdminWaterMarkIntervalId) {
            clearInterval(smartAdminWaterMarkIntervalId);
            smartAdminWaterMarkIntervalId = null;
        }
    },
};
export default watermark;
