/*
    直线
*/

import Element from '../../common/Element';
import Tool from '../../common/Tool';
import View from "../../main";

export default class StraightLine extends Element {
    constructor(config) {
        super(config);
        let {
            points = [],
            start,
            end
        } = config.params;
        this.points = points;
        this.start = start;
        this.end = end;
        this.canDrag = false;
        this.canEdit = false;
        if (this.start && this.end) {
            this.start.relationEl[this.id] = this;
            this.end.relationEl[this.id] = this;
            this.setAutoPath()
        }
        this.judgeBoundaries();
    }

    //其他渲染
    otherRender(context) {
        let {points, showTestLine, style} = this;
        let {lineWidth, lineColor, lineDash, lineCap} = style;
        if (points === undefined || points.length < 2) return
        context.beginPath();
        context.save()
        context.setLineDash(lineDash || []);
        context.strokeStyle = lineColor || 'black';
        context.lineWidth = lineWidth || 1;
        context.lineCap = lineCap || 'butt';
        context.moveTo(points[0].x, points[0].y);
        context.lineTo(points[1].x, points[1].y);
        this.optionRender(context);
        context.stroke();
        context.restore();
        //辅助检测线段
        if (showTestLine) {
            context.beginPath()
            this.pathRender(context)
            context.stroke();
        }
    }

    //路径渲染
    pathRender(context) {
        const {points, style} = this;
        if (points === undefined || points.length < 2) return
        const step = 3;//用于检测到线的空间值
        let lineWidth = (style.lineWidth || 0) / 2 + step;
        const lastIndex = points.length - 1;
        //绘制线的上检测区
        for (let i = 0; i < points.length; i++) {
            if (![lastIndex, 0].includes(i)) {
                const f1 = points[i].x === points[i - 1].x;//与前一个点x坐标相同
                const f2 = points[i].x === points[i + 1].x;//与后一个点x坐标相同
                const f3 = points[i].y > points[i - 1].y;//比前一个点y坐标大
                const f4 = points[i].y > points[i + 1].y;//比后一个点y坐标大
                if (f1 || f2) {
                    if (f3) context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth);
                    else context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth);
                    if (f4) context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth);
                    else context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth);
                    continue
                }
                context.lineTo(points[i].x, points[i].y - lineWidth);
            } else if (i === 0) {
                if (points[0].x === points[1].x) {
                    context.moveTo(points[0].x - lineWidth, points[0].y);
                    context.lineTo(points[0].x + lineWidth, points[0].y);
                } else {
                    context.moveTo(points[0].x, points[0].y - lineWidth);
                }
            } else {
                if (points[lastIndex].x === points[lastIndex - 1].x) {
                    context.lineTo(points[lastIndex].x + lineWidth, points[lastIndex].y);
                } else {
                    context.lineTo(points[lastIndex].x, points[lastIndex].y - lineWidth);
                }
            }
        }
        //绘制线的下检测区
        for (let i = lastIndex; i >= 0; i--) {
            if (![lastIndex, 0].includes(i)) {
                const f1 = points[i].x === points[i - 1].x;//与前一个点x坐标相同
                const f2 = points[i].x === points[i + 1].x;//与后一个点x坐标相同
                const f3 = points[i].y > points[i - 1].y;//比前一个点y坐标大
                const f4 = points[i].y > points[i + 1].y;//比后一个点y坐标大
                if (f1 || f2) {
                    if (f3) context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth);
                    else context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth);
                    if (f4) context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth);
                    else context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth);
                    continue
                }
                context.lineTo(points[i].x, points[i].y + lineWidth);
            } else if (i === 0) {
                if (points[0].x === points[1].x) {
                    context.lineTo(points[0].x - lineWidth, points[0].y);
                } else {
                    context.lineTo(points[0].x, points[0].y + lineWidth);
                    context.lineTo(points[0].x, points[0].y - lineWidth);
                }
            } else {
                if (points[lastIndex].x === points[lastIndex - 1].x) {
                    context.lineTo(points[lastIndex].x - lineWidth, points[lastIndex].y);
                } else {
                    context.lineTo(points[lastIndex].x, points[lastIndex].y - lineWidth);
                    context.lineTo(points[lastIndex].x, points[lastIndex].y + lineWidth);
                }
            }
        }
    }

    //扩展渲染
    preRender(context) {
        this.textRender(context)
        this.arrowRender(context)
    }

    //关联影响
    relationChange() {
        this.setAutoPath();
    }

    //设置自动路径
    setAutoPath() {
        let x1 = this.start.center.x;
        let y1 = this.start.center.y;
        let x2 = this.end.center.x;
        let y2 = this.end.center.y;
        this.points = [{x: x1, y: y1}, {x: x2, y: y2}]
    }

    judgeBoundaries() {
        const {points} = this;
        const xList = points.map(p => p.x)
        const yList = points.map(p => p.y)
        const x1 = Math.min(...xList)
        const x2 = Math.max(...xList)
        const y1 = Math.min(...yList)
        const y2 = Math.max(...yList)
        this.setBoundaries(x1, x2, y1, y2);
    }
}
