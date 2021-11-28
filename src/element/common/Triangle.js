/*
    三角形
*/

import Element from "../../common/Element";

export default class Triangle extends Element {
    constructor(config) {
        super(config);
        let {points} = config.params;
        this.points = points;
    }

    //背景渲染
    backgroundRender(context) {
        //如果有url，就将背景色设置为透明
        let {background, url} = this.style;
        let {x, y, points, scale} = this;
        if (!!url) {
            if (!this.imgRender) {
                let img = new Image();
                img.src = url;
                img.onload = () => {
                    this.imgRender = img;
                }
            } else {
                context.save();
                this.pathRender(context);
                context.clip();
                context.drawImage(this.imgRender, 0, 0, this.imgRender.width, this.imgRender.height, x * scale, y * scale, width * scale, height * scale);
                context.restore();
            }
        } else {
            context.fillStyle = !!background ? background : 'transparent';
        }
    }

    //路径渲染
    pathRender(context) {
        let {x, y, points, scale} = this;
        context.beginPath();
        context.rect(x * scale, y * scale, width * scale, height * scale);
    }

    //初始化渲染，复位清空操作渲染改变的context属性
    initializationRender(context) {
        context.shadowOffsetX = null;
        context.shadowOffsetY = null;
        context.shadowColor = null;
        context.shadowBlur = null;
        context.fillStyle = 'transparent';
    }

    //默认渲染
    defaultRender(context) {
        let {shadowColor, shadowBlur} = this.style;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowColor = shadowColor || "black";
        context.shadowBlur = shadowBlur || 8;
    }

    //拖拽渲染
    dragRender(context) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowColor = "yellow";
        context.shadowBlur = 20;
    }

    //单击渲染
    clickRender(context) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowColor = "#eee";
        context.shadowBlur = 20;
    }

    //移入渲染
    hoverRender(context) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowColor = "#eee";
        context.shadowBlur = 10;
    }

    //元素拖拽偏移
    elOffset(e) {
        const {offsetX, offsetY} = e;
        const {width, height, scale} = this;
        this.x = offsetX / scale - width / 2;
        this.y = offsetY / scale - height / 2;
    }
}
