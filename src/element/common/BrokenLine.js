/*
    折线
*/

import Element from '../../common/Element';
import Tool from '../../common/Tool';
import View from "../../main";

export default class BrokenLine extends Element {
    constructor(config) {
        super(config);
        let {
            points = [],
            start = null,
            end = null,
            isAutoPath = true,
            minBrokenWidth = 15,//最小转角距离
            editPointsR = 4
        } = config.params;
        this.points = points;
        this.start = start;
        this.end = end;
        this.isAutoPath = points.length >= 2 ? false : isAutoPath
        this.minBrokenWidth = minBrokenWidth
        this.editPointsR = editPointsR;
        this.canDrag = false;
        if (this.start && this.end) {
            this.start.relationEl[this.id] = this;
            this.end.relationEl[this.id] = this;
            if (this.isAutoPath) this.setAutoPath()
            else this.judgeBoundaries();
        } else {
            this.judgeBoundaries();
        }
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
        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
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
        const lastIndex = points.length - 1;
        let lineWidth = (style.lineWidth || 0) / 2 + step;
        //上边框绘制
        for (let i = 0; i < points.length; i++) {
            let {direction} = points[i]
            if (i === 0) {
                context.moveTo(points[i].x, points[i].y + lineWidth)
                context.lineTo(points[i].x, points[i].y - lineWidth)
            } else if (i === 1) {
                context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                if (['left', 'bottom'].includes(direction.next)) context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                if (direction.next === 'left') context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
            } else if (i === lastIndex - 1) {
                if (direction.prev === 'right') context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                if (['right', 'bottom'].includes(direction.prev)) context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
            } else if (i === lastIndex) {
                context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
            } else {
                let {prev, next} = direction
                if (prev === 'left' && next === 'top') {
                    context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'left' && next === 'bottom') {
                    context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'right' && next === 'top') {
                    context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'right' && next === 'bottom') {
                    context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'top' && next === 'left') {
                    context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'top' && next === 'right') {
                    context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'bottom' && next === 'left') {
                    context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'bottom' && next === 'right') {
                    context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                }
            }
        }
        // context.moveTo(points[lastIndex].x + lineWidth, points[lastIndex].y + lineWidth)
        //下边框绘制
        for (let i = lastIndex; i >= 0; i--) {
            let {direction} = points[i]
            if (i === 0) {
                context.lineTo(points[i].x, points[i].y + lineWidth)
            } else if (i === 1) {
                if (direction.next === 'left') context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                if (['left', 'top'].includes(direction.next)) context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
            } else if (i === lastIndex - 1) {
                context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                if (['right', 'top'].includes(direction.prev)) context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                if (direction.prev === 'right') context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
            } else if (i === lastIndex) {
                context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
            } else {
                let {prev, next} = direction
                if (prev === 'left' && next === 'top') {
                    context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'left' && next === 'bottom') {
                    context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'right' && next === 'top') {
                    context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'right' && next === 'bottom') {
                    context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'top' && next === 'left') {
                    context.lineTo(points[i].x - lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'top' && next === 'right') {
                    context.lineTo(points[i].x - lineWidth, points[i].y + lineWidth)
                }
                if (prev === 'bottom' && next === 'left') {
                    context.lineTo(points[i].x + lineWidth, points[i].y - lineWidth)
                }
                if (prev === 'bottom' && next === 'right') {
                    context.lineTo(points[i].x + lineWidth, points[i].y + lineWidth)
                }
            }
        }
    }

    //扩展渲染
    preRender(context) {
        this.textRender(context)
        this.arrowRender(context)
    }

    //拖拽偏移后修改其他点
    changeAllPoints(oX, oY) {
        this.points.forEach(p => {
            p.x -= oX;
            p.y -= oY;
        })
    }

    //关联影响
    relationChange() {
        this.showTestLine = false
        this.clearEditPoint()
        this.setAutoPath();
    }

    //设置自动路径
    setAutoPath() {
        let x1 = this.start.center.x;
        let y1 = this.start.center.y;
        let x2 = this.end.center.x;
        let y2 = this.end.center.y;
        //最小转角方向
        let direction = 1;
        if (x1 > x2) direction = -1;
        if (x1 === x2) direction = 1;
        if (x1 === x2 || y1 === y2) {
            this.points = [
                {x: x1, y: y1},
                {x: x1 + this.minBrokenWidth * direction, y: y1},
                {x: x2 - this.minBrokenWidth * direction, y: y2},
                {x: x2, y: y2}]
        } else {
            let x = (x1 + x2) / 2;
            this.points = [
                {x: x1, y: y1},
                {x: x1 + this.minBrokenWidth * direction, y: y1},
                {x: x, y: y1},
                {x: x, y: y2},
                {x: x2 - this.minBrokenWidth * direction, y: y2},
                {x: x2, y: y2}]
        }
        this.judgeBoundaries();
    }

    //新增编辑节点
    addEditPoint(i, x, y) {
        this.points.splice(i, 0, {x: x + this.editPointsR, y: y + this.editPointsR})
        let point = View.SCENE_LIST[this.sceneId].add({
            type: 'EditPoint',
            x: x,
            y: y,
            params: {
                r: this.editPointsR,
                cursorStyle: 't_b_arrow'
            }
        })
        point.feedbackCall = this.pointFeedBack.bind(this)
        this.editPoints.splice(i, 0, point)
        this.editPoints.forEach((p, index) => Tool.setDirection.call(p, this.editPoints, index))
    }

    //删除编辑节点
    removeEditPoint(i) {
        this.points.splice(i, 1)
        View.SCENE_LIST[this.sceneId].remove([this.editPoints[i]])
        this.editPoints.splice(i, 1)
        this.editPoints.forEach((p, index) => Tool.setDirection.call(p, this.editPoints, index))
    }

    //显示编辑节点
    showEditPoint() {
        this.isShowEditPoint = true;
        let {sceneId, points, editPointsR} = this;
        this.editPoints = points.map(({x, y}, i) => {
            let point = View.SCENE_LIST[sceneId].add({
                type: 'EditPoint',
                x: x - editPointsR,
                y: y - editPointsR,
                params: {
                    r: editPointsR,
                    cursorStyle: 'move'
                }
            })
            //端点不可以拖动
            if ([0, 1, points.length - 2, points.length - 1].includes(i)) {
                point.disabled = true
                point.canDrag = false
            }
            point.feedbackCall = this.pointFeedBack.bind(this)
            return point
        })
        this.editPoints.forEach((p, index) => Tool.setDirection.call(p, this.editPoints, index))
    }

    //清除编辑节点
    clearEditPoint() {
        if (!this.canEdit) return
        if (this.editPoints.length) {
            View.SCENE_LIST[this.sceneId].remove(this.editPoints)
            this.editPoints = []
        }
    }

    //通过编辑端点的拖拽调整线段
    pointFeedBack(el, x, y) {
        let i = el.index;
        let flag1 = !['top', 'bottom'].includes(this.editPoints[i].direction.prev)
        let flag2 = !['top', 'bottom'].includes(this.editPoints[i].direction.next)
        if (flag1 && this.editPoints[i].judgeStartOrEndLength('prev') === 2) {
            let isInRange = Math.floor(Math.abs(this.editPoints[i].y - this.editPoints[i - 1].y)) <= Math.floor(Math.abs(y))
            if (isInRange) {
                this.addEditPoint(i, this.editPoints[i - 1].x, this.editPoints[i - 1].y)
                i++
            }
        }
        // else if (flag1 && this.editPoints[i].judgeStartOrEndLength('prev') === 3) {
        //     let isInRange = Math.floor(Math.abs(this.editPoints[i - 1].y - this.editPoints[i - 2].y)) <= Math.floor(Math.abs(y))
        //     if (isInRange) {
        //         this.removeEditPoint(i - 1)
        //         i--
        //     }
        // }
        if (flag2 && this.editPoints[i].judgeStartOrEndLength('next') === 2) {
            let isInRange = Math.floor(Math.abs(this.editPoints[i].y - this.editPoints[i + 1].y)) <= Math.floor(Math.abs(y))
            if (isInRange) {
                this.addEditPoint(i + 1, this.editPoints[i + 1].x, this.editPoints[i + 1].y)
            }
        }
        // else if (flag2 && this.editPoints[i].judgeStartOrEndLength('next') === 3) {
        //     if (Math.floor(this.editPoints[i].y) === Math.floor(this.editPoints[this.editPoints.length - 2].y)) {
        //         this.removeEditPoint(i + 1)
        //     }
        // }
        let {points} = this;
        let p = i - 1
        let n = i + 1
        let s = 1
        let e = points.length - 2
        let prev = points[p];
        let next = points[n];
        let current = points[i];
        if (['left', 'right'].includes(this.editPoints[i].direction.prev)) {
            if (![e].includes(n)) {
                current.x += x
                this.editPoints[i].x += x;
            }
            if (![s, e].includes(p)) {
                prev.y += y
                this.editPoints[p].y += y;
            }
        } else if (['top', 'bottom'].includes(this.editPoints[i].direction.prev)) {
            current.y += y
            this.editPoints[i].y += y
            if (![s, e].includes(p)) {
                prev.x += x
                this.editPoints[p].x += x;
            }
        }
        if (['left', 'right'].includes(this.editPoints[i].direction.next)) {
            if (![s].includes(p)) {
                current.x += x
                this.editPoints[i].x += x;
            }
            if (![s, e].includes(n)) {
                next.y += y
                this.editPoints[n].y += y;
            }
        } else if (['top', 'bottom'].includes(this.editPoints[i].direction.next)) {
            current.y += y
            this.editPoints[i].y += y
            if (![s, e].includes(n)) {
                next.x += x
                this.editPoints[n].x += x;
            }
        }
        this.judgeBoundaries()
    }

    judgeBoundaries() {
        const {points} = this;
        points.forEach((p, index) => Tool.setDirection.call(p, points, index))
        if (points.length < 2) return;
        const xList = points.map(p => p.x)
        const yList = points.map(p => p.y)
        const x1 = Math.min(...xList)
        const x2 = Math.max(...xList)
        const y1 = Math.min(...yList)
        const y2 = Math.max(...yList)
        this.boundaries = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
        this.center.x = (x1 + x2) / 2
        this.center.y = (y1 + y2) / 2
    }
}
