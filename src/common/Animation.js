/*
* 动画
* */

import Tool from "./Tool";
import View from '../main';

export default class Animation {
    constructor(config, key, sceneId) {
        //可配置项
        this.sceneId = sceneId;//场景id
        this.key = key;//属性名
        this.loop = true;//是否循环
        this.process = {};//过程，{0:...,100:...}
        this.duration = .5;//总执行时间，单位：秒，默认1秒
        this.timingFunction = 'ease';//时间曲线
        this.isRender = true;//是否渲染
        this.startTime = 0;//开始时间
        //计算项
        this.direction = true;//执行的方向
        this.localFrame = 1;//当前帧
        this.allFrame = 0;//总帧数
        this.step = null;//每一帧的变化值
        Tool.setConfig.call(this, config);//设置动画参数
        //判断是否是颜色相关属性
        if (['backgroundColor', 'fontColor', 'borderColor', 'lineColor', 'shadowColor', 'arrowColor'].includes(this.key)) {
            this.isColor = true;
            this.colors = [Tool.getColor(this.process[0]), Tool.getColor(this.process[100])];//转换后的颜色属性
        } else this.isColor = false;
        this.computedFrame()
    }

    //计算帧数
    computedFrame() {
        let fps = View.SCENE_LIST[this.sceneId].fps;//获取场景fps
        let {duration, startTime, process} = this;
        this.allFrame = Math.floor(duration * fps);//向下取整
        if (this.isColor) {
            let color1 = this.colors[0];
            let color2 = this.colors[1]
            this.step = {
                r: (color2.r - color1.r) / this.allFrame,
                g: (color2.g - color1.g) / this.allFrame,
                b: (color2.b - color1.b) / this.allFrame,
                a: (color2.a - color1.a) / this.allFrame,
            }
        } else this.step = (process[100] - process[0]) / this.allFrame;
        this.localFrame += Math.floor(startTime * fps);
    }

    //渲染计算
    render(val) {
        let {isRender, loop, direction, allFrame} = this;
        //是否可以渲染
        if (isRender) {
            //是否循环动画
            if (loop) {
                if (direction) this.localFrame++;//正向执行
                else this.localFrame--;//反向执行
                //判断方向
                if (this.localFrame === allFrame) this.direction = false;
                else if (this.localFrame === 1) this.direction = true;
            } else {
                this.localFrame++;
                if (this.localFrame === allFrame) this.isRender = false;
            }
            return this.computedValue();
        }
        return val;
    }

    //计算动画值
    computedValue() {
        let {process, step, isColor, colors, localFrame, allFrame} = this;
        if (localFrame === 1) {//第一帧
            return process[0];
        } else if (localFrame === allFrame) {//最后一帧
            return process[100];
        } else {//其他帧
            if (isColor) {//颜色属性
                let r = colors[0].r + (localFrame - 1) * step.r;
                let g = colors[0].g + (localFrame - 1) * step.g;
                let b = colors[0].b + (localFrame - 1) * step.b;
                let a = colors[0].a + (localFrame - 1) * step.a;
                return Tool.setColor({r, g, b, a});
            } else {//数值属性
                return process[0] + (localFrame - 1) * step;
            }
        }
    }

}
