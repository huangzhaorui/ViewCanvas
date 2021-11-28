/*
* 工具
* */
import {v4 as createUuid} from 'uuid';
import Color from 'color';

export default class Tool {

    //获取UUID
    static getUUID(str) {
        return str + createUuid();
    }

    //防抖，当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次
    static debounce(fn, wait = 50) {
        let timeout = null;
        return function () {
            if (timeout !== null) clearTimeout(timeout);
            timeout = setTimeout(fn, wait);
        }
    }

    //节流，当持续触发事件时，保证一定时间段内只调用一次事件处理函数
    static throttle(fn, delay = 50) {
        let prev = Date.now();
        return function () {
            let context = this;
            let args = arguments;
            let now = Date.now();
            if (now - prev >= delay) {
                fn.apply(context, args);
                prev = Date.now();
            }
        }
    }

    //设置配置
    static setConfig(config) {
        for (const key in config) {
            this[key] = config[key]
        }
    }

    //获取颜色值，返回10进制数和透明度
    static getColor(c) {
        let {color, valpha} = Color(c);
        return {r: color[0], g: color[1], b: color[2], a: valpha}
    }

    //设置颜色值
    static setColor({r, g, b, a = 1}) {
        return Color({r, g, b}).alpha(a)
    }

    //判断是否为非零空值
    static checkNone(v) {
        let noneList = ['', null, undefined]
        return !noneList.includes(v)
    }

    //检测值类型（默认检测对象）
    static judgeType(v, i = 3) {
        let types = ['String', 'Number', 'Boolean', 'Object', 'Array', 'Function', 'undefined', 'Null']
        return Object.prototype.toString.call(v) === `[object ${types[i]}]`
    }

    //设置默认值
    static setDefaultValue(v, d) {
        return [undefined, null].includes(v) ? d : v
    }

    //参数合并
    static paramsMerge() {
        let newObj = {}
        for (let i = 0; i < arguments.length; i++) {
            let obj1 = {...newObj}
            let obj2 = arguments[i] || {}
            for (const key in obj1) {
                if (!['', undefined].includes(obj2[key])) {
                    obj1[key] = obj2[key]
                }
            }
            newObj = {...obj2, ...obj1}
        }
        return newObj
    }

    //只保留小数点后num位
    static toFixed(data, num = 2) {
        return Math.floor(data)
        // return parseFloat(data).toFixed(num)
    }


    /**
     * 设置前后点的方向
     * prev 前
     * next 后
     * left | top | right bottom
     */
    static setDirection(points, index) {
        /**
         * p1：当前点
         * p1：相邻点
         */
        function judgeDirection(p1, p2) {
            let num1 = Math.floor(p1.x) - Math.floor(p2.x)
            let num2 = Math.floor(p1.y) - Math.floor(p2.y)
            if (num1 === 0) return num2 < 0 ? 'bottom' : 'top'
            if (num2 === 0) return num1 < 0 ? 'right' : 'left'
        }

        let start = 0
        let end = points.length - 1
        let prev = null;
        let next = null;
        this.index = index;
        this.prev = null;
        this.next = null;
        if (index === start) {//当前点是开始点
            next = judgeDirection(points[index], points[index + 1])
            this.next = points[index + 1]
        } else if (index === end) {//当前点是结束点
            prev = judgeDirection(points[index], points[index - 1])
            this.prev = points[index - 1]
        } else {//其他点
            prev = judgeDirection(points[index], points[index - 1])
            next = judgeDirection(points[index], points[index + 1])
            this.prev = points[index - 1]
            this.next = points[index + 1]
        }
        this.direction = {prev, next}
    }

    /**
     * 计算角度，返回一个角度（数字）
     */
    static judgeAngle(start, end) {
        let diff_x = end.x - start.x;
        let diff_y = end.y - start.y;
        //返回角度,不是弧度
        return 360 * Math.atan(diff_y / diff_x) / (2 * Math.PI);
    }


    /**
     * 对象监听
     */
    static observe(obj, setFn) {
        Object.keys(obj).forEach(key => {
            let val = obj[key]
            Object.defineProperty(obj, key, {
                set(newVal) {
                    // console.info(`${obj[key]}----->${newVal}`);
                    if (setFn) setFn()
                    val = newVal;
                },
                get() {
                    // console.info(`get....${key}`)
                    return val;
                }
            })
        })
    }

}
