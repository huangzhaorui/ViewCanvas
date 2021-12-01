/*
    基础元素
*/
import Animation from './Animation';
import Tool from './Tool'
import View from "../main";
import Img from "../element/common/Img";
import Gradient from "../element/common/Gradient";

export default class Element {
    constructor(config) {
        let {id, sceneId, x, y, zIndex, type, actions = {}, otherRender, animations = {}, parent, data} = config;//基础配置
        if (config.params === undefined) config.params = {};
        this.CONFIG = config;//图形配置项
        this.id = id;
        if (Tool.judgeType(data)) this.data = JSON.parse(JSON.stringify(data))
        this.parent = parent;
        this.sceneId = sceneId;
        this.type = type;//元素类型
        this.x = x || 0;
        this.y = y || 0;
        this.oX = 0;//x移动偏移量
        this.oY = 0;//y移动偏移量
        this.defaultZIndex = zIndex || 0;//默认元素层级
        this.renderZIndex = zIndex || 0;//渲染元素层级
        this.style = {
            /**
             * 基础
             * backgroundColor：String
             * imgUrl：String
             */
            /**
             * 文字：
             * fontText：String
             * fontIcon：String
             * fontClass：String
             * fontSize：Number
             * fontColor：String
             * fontPosition：top | center | bottom
             */
            /**
             * 边框：
             * borderSize：Number
             * borderColor：String
             * borderType
             */
            /**
             * 阴影
             * shadowSize：Number
             * shadowOffsetX：Number
             * shadowOffsetY：Number
             * shadowColor：String
             */
            /**
             * 线段
             * lineWidth：Number,
             *lineColor：String,
             *lineDash：Array<Number>,
             *lineCap：round | butt,
             */
            /**
             * 箭头
             * arrowSize：Number,
             * arrowColor：String,
             */
        }//默认样式
        this.actions = {change: {}};//默认、移入、点击、拖拽动作
        this.animations = {};//动画配置
        this.scale = 1;//缩放层级
        this.canRender = true;//是否可渲染
        this.disabled = Tool.setDefaultValue(config.params.disabled, false);//是否禁用动作
        this.canHover = Tool.setDefaultValue(config.params.canHover, true);//是否响应移入
        this.canClick = Tool.setDefaultValue(config.params.canClick, true);//是否响应点击
        this.canDrag = Tool.setDefaultValue(config.params.canDrag, true);//是否响应推拽
        this.canSelect = Tool.setDefaultValue(config.params.canSelect, true);//是否可框选
        this.canEdit = Tool.setDefaultValue(config.params.canEdit, true);//是否可通过编辑节点调整大小
        this.isHasAction = true;//是否有动作
        this.isSelect = false;//是否被框选
        this.isTransition = Tool.setDefaultValue(config.params.isTransition, true);//是否使用过渡
        this.imgRender = {};//图片渲染对象
        if (!!otherRender) this.otherRender = otherRender;//特殊渲染
        this.boundaries = [];//计算元素的矩形边界，4个点，左上，右上，右下，左下
        this.center = {x: 0, y: 0};//中心点
        this.relationEl = {};//关联元素列表，改变元素x，y时，若存在关联元素，将调用关联元素relationChange方法
        this.feedbackCall = null;//反馈回调，如当拖拽导致元素x，y改变时触发
        this.actionRenderCall = null;//触发自定义动作渲染
        this.showTestLine = config.params.showTestLine || false;//辅助测试线框
        this.cursorStyle = Tool.setDefaultValue(config.params.cursorStyle, '');//元素鼠标样式
        this.isShowEditPoint = Tool.setDefaultValue(config.params.isShowEditPoint, false);//是否显示拖拽节点
        this.editPoints = []
        this.editPointsR = Tool.setDefaultValue(config.params.editPointsR, 6);//编辑节点的半径
        this.elementStyleMerge(actions);
        this.setAnimations(animations);
        Object.defineProperties(this, {
            _isHover_: {
                value: false,
                writable: true
            },
            _isClick_: {
                value: false,
                writable: true
            },
            _isDrag_: {
                value: false,
                writable: true
            },
            //是否鼠标移入
            isHover: {
                get() {
                    return this._isHover_
                },
                set(val) {
                    this.actionsTrigger('Hover', val)
                }
            },
            //是否单击选中
            isClick: {
                get() {
                    return this._isClick_
                },
                set(val) {
                    this.actionsTrigger('Click', val)
                }
            },
            //是否被拖拽
            isDrag: {
                get() {
                    return this._isDrag_
                },
                set(val) {
                    this.actionsTrigger('Drag', val)
                }
            }
        })
    }

    //渲染
    render(context, scale, oX, oY) {
        //可视区判断
        this.judgeIsInSceneViewArea()
        if (!this.canRender) return
        //动画渲染
        this.animationsRender();
        this.scale = scale;
        this.oX = oX;
        this.oY = oY;
        context.save();
        //当有动作变化时，调用动作渲染
        if (this.isHasAction) this.optionRender(context);
        this.setShadow(context)
        //特殊的渲染，自定义元素时需要实现
        if (!!this.otherRender) this.otherRender(context);
        //默认渲染
        else this.backgroundRender(context);
        context.restore();
        if (!!this.actionRenderCall) this.actionRenderCall(context, this)
        //是否被框选
        if (this.isSelect) this.selectRender(context)
        //扩展渲染，如文字之类
        if (!!this.preRender) this.preRender(context)
        //子元素渲染
        if (!!this.childrenRender) this.childrenRender(context)
        //边界渲染（线段类有单独的方法）
        if (!['BrokenLine', 'StraightLine'].includes(this.type) && !!this.showTestLine) this.selectRender(context, 'black', false)
    }

    //动作触发
    actionsTrigger(key, val) {
        if (this.disabled) return;
        if (!this[`can${key}`]) return;
        let type = `is${key}`
        if (this[`_${type}_`] !== val) {
            // console.log(key, val)
            this.isHasAction = true
            this[`_${type}_`] = val
            /**
             * 过渡效果，通过transition属性实现
             */
            if (!this.isTransition) return;
            let actionsKey = key.toLocaleLowerCase()
            const {isHover, isClick, isDrag} = this;
            const optionsKey = `${actionsKey}:${isHover - 0}-${isClick - 0}-${isDrag - 0}`
            const optionsObj = {
                'hover:0-0-0': 'default',
                'hover:1-0-0': 'hover',
                'hover:1-1-0': '',
                'click:0-0-0': 'default',
                'click:1-1-0': 'click',
                'click:1-0-0': 'hover',
                'drag:0-0-1': 'drag',
                'drag:0-1-1': 'drag',
                'drag:0-1-0': 'click',
            }
            const optionsType = optionsObj[optionsKey]
            if (!optionsType) return;
            let style = this.actionsParamsMerge(optionsType, false);
            //解析transition属性
            let transitionConfig = this.actions.transition
            let animations = {}
            //可以过渡的样式属性
            const canTransitionStyle = [
                'backgroundColor',
                'fontSize',
                'fontColor',
                'borderSize',
                'borderColor',
                'shadowSize',
                'shadowOffsetX',
                'shadowOffsetY',
                'shadowColor',
                'lineWidth',
                'lineColor',
                'arrowSize',
                'arrowColor'
            ]
            for (const k in transitionConfig) {
                if (canTransitionStyle.includes(k)) {
                    let v1 = this.style[k];
                    let v2 = style[k];
                    // if (Tool.judgeType(v1) || Tool.judgeType(v2)) continue;
                    if (Tool.checkNone(v1) && Tool.checkNone(v2)) {
                        animations[k] = {process: {0: v1, 100: v2}, duration: transitionConfig[k], loop: false}
                    }
                }
            }
            this.setAnimations(animations)
        }
    }

    //元素样式合并
    elementStyleMerge(actions) {
        const defaultElementActions = View.Style.Element
        const defaultActions = View.Style[this.type];
        ['default', 'hover', 'click', 'drag', 'transition'].forEach(key => {
            this.actions[key] = Tool.paramsMerge(defaultElementActions[key], defaultActions[key], actions[key])
            //当存在...RenderCall时，将使用用户自定义的渲染
            if (actions[key + 'RenderCall']) this.actions[key + 'RenderCall'] = actions[key + 'RenderCall']
        })
        //监听动作属性更新，重新渲染
        for (const key in this.actions) {
            Tool.observe(this.actions[key], () => this.isHasAction = true)
        }
    }

    //操作状态渲染
    optionRender(context) {
        if (this.isDrag) {
            this.actionRender(context, 'drag');
            return;
        }
        if (this.isClick) {
            this.actionRender(context, 'click');
            return;
        }
        if (this.isHover) {
            this.actionRender(context, 'hover');
            return;
        }
        this.actionRender(context);
    }

    /**
     * 动作渲染
     * type：default | hover | click | drag
     */
    actionRender(context, type) {
        let style = this.actionsMerge(type)
        if (!!style) this.style = style
        if (!!this[type + 'Render']) this[type + 'Render'](context)
        this.isHasAction = false
        // let {backgroundColor} = this.style;
        // if (['transparent'].includes(backgroundColor)) return
        // let color = Tool.getColor(backgroundColor);
        // color.a = .5;
        // context.fillStyle = Tool.setColor(color)
    }

    //动作合并
    actionsMerge(type) {
        const {actions} = this;
        //如果存在自定义动作渲染
        if (actions[type + 'RenderCall']) {
            this.actionRenderCall = actions[type + 'RenderCall']
            return null
        } else {
            this.actionRenderCall = null
            return this.actionsParamsMerge(type)
        }
    }

    //动作参数合并
    actionsParamsMerge(type, flag = true) {
        const {actions} = this;
        if (type === 'default') {//默认动作
            return Tool.paramsMerge(actions.default, flag ? actions.change : {})
        } else {//其他动作
            return Tool.paramsMerge(actions.default, actions[type], flag ? actions.change : {})
        }
    }

    //设置shadow
    setShadow(context) {
        const {shadowSize, shadowOffsetX, shadowOffsetY, shadowColor} = this.style
        if (['', 0, null, undefined].includes(shadowSize)) return
        context.shadowBlur = shadowSize
        context.shadowOffsetX = shadowOffsetX
        context.shadowOffsetY = shadowOffsetY
        context.shadowColor = shadowColor
    }

    //背景渲染
    backgroundRender(context) {
        let {backgroundColor, imgUrl} = this.style;
        //背景色渲染
        if (!!backgroundColor) {
            context.beginPath()
            if (Tool.judgeType(backgroundColor) && backgroundColor.type) {
                context.fillStyle = new Gradient({context, el: this, ...backgroundColor}).getColor()
            } else context.fillStyle = backgroundColor;
            this.pathRender(context);
            context.fill()
        }
        //背景图渲染
        if (!!imgUrl) {
            if (!this.imgRender[imgUrl]) {
                this.loadImg(imgUrl)
            } else {
                this.loadImgData({context, url: imgUrl})
            }
        }
    }

    /**
     *
     * @param data
     * context, url, type, x, y, width, height, r, start, end
     */
    loadImgData(data) {
        let {context, url, type} = data;
        if (!this.imgRender[url]) {
            this.loadImg(url)
        } else {
            context.fillStyle = 'transparent';
            context.beginPath()
            context.save();
            if (!type) this.pathRender(context);
            else this[`draw${type}`](data)
            context.clip();
            if (!type) this.imageRender(context);
            else this[`drawImgBy${type}`](data)
            context.restore();
        }
    }

    //加载图片资源
    loadImg(imgUrl) {
        if (View.IMAGE_LIST[imgUrl]) this.imgRender[imgUrl] = View.IMAGE_LIST[imgUrl]
        else new Img(imgUrl, this)
    }

    //将图片绘制在矩形中
    drawImgByRect({context, x, y, width, height, url}) {
        let imgData = this.imgRender[url]
        context.drawImage(imgData, 0, 0, imgData.width, imgData.height, x, y, width, height);
    }

    //将图片绘制在圆形中
    drawImgByCircle({context, x, y, r, url}) {
        let imgData = this.imgRender[url]
        context.drawImage(imgData, 0, 0, imgData.width, imgData.height, x, y, r * 2, r * 2);
    }

    //绘制矩形
    drawRect(data) {
        let {context, x, y, width, height} = data;
        context.rect(x, y, width, height);
    }

    //绘制圆形
    drawCircle(data) {
        let {context, x, y, r, start = 0, end = 2 * Math.PI} = data;
        context.arc(x + r, y + r, r, start, end);
    }

    //边框渲染
    selectRender(context, color = 'blue', flag = true) {
        const {boundaries} = this;
        if (boundaries.length === 0) return
        context.beginPath();
        context.save()
        context.strokeStyle = color;
        if (flag) context.setLineDash([5, 5, 5]);
        let x = boundaries[0][0];
        let y = boundaries[0][1];
        let width = boundaries[2][0] - x
        let height = boundaries[2][1] - y
        context.rect(x, y, width, height);
        context.stroke();
        context.restore();
    }

    //设置编辑节点
    showEditPoint() {
        if (!this.canEdit) return
        this.showTestLine = true;
        let {sceneId, editPointsR} = this;
        let points = this.getEditPointsPosition()
        this.editPoints = points.map(({x, y, cursorStyle, position}, i) => {
            let point = View.SCENE_LIST[sceneId].add({
                type: 'EditPoint',
                x,
                y,
                params: {
                    r: editPointsR,
                    cursorStyle
                },
                position
            })
            point.feedbackCall = this.pointFeedBack.bind(this)
            return point
        })
    }

    //清除编辑节点
    clearEditPoint() {
        if (!this.canEdit) return
        this.showTestLine = false;
        if (this.editPoints.length) {
            View.SCENE_LIST[this.sceneId].remove(this.editPoints)
            this.editPoints = []
        }
    }

    //获取编辑点坐标
    getEditPointsPosition() {
        let {boundaries, editPointsR} = this;
        let p1 = boundaries[0];
        let p2 = boundaries[1];
        let p3 = boundaries[2];
        let p4 = boundaries[3];
        return [
            {x: p1[0] - editPointsR, y: p1[1] - editPointsR, cursorStyle: 'lt_rb_arrow', position: 'l_t'},
            {x: (p1[0] + p2[0]) / 2 - editPointsR, y: p1[1] - editPointsR, cursorStyle: 't_b_arrow', position: 't'},
            {x: p2[0] - editPointsR, y: p2[1] - editPointsR, cursorStyle: 'lb_rt_arrow', position: 'r_t'},
            {x: p2[0] - editPointsR, y: (p2[1] + p3[1]) / 2 - editPointsR, cursorStyle: 'l_r_arrow', position: 'r'},
            {x: p3[0] - editPointsR, y: p3[1] - editPointsR, cursorStyle: 'lt_rb_arrow', position: 'r_b'},
            {x: (p3[0] + p4[0]) / 2 - editPointsR, y: p3[1] - editPointsR, cursorStyle: 't_b_arrow', position: 'b'},
            {x: p4[0] - editPointsR, y: p4[1] - editPointsR, cursorStyle: 'lb_rt_arrow', position: 'l_b'},
            {x: p1[0] - editPointsR, y: (p1[1] + p4[1]) / 2 - editPointsR, cursorStyle: 'l_r_arrow', position: 'l'},
        ]
    }

    //通过编辑端点的拖拽调整元素
    pointFeedBack(el, x, y) {
        //不同编辑点的位置拖拽时对元素的影响
        let positions = {
            l: {x, y: 0, width: -x, height: 0},
            r: {x: 0, y: 0, width: x, height: 0},
            t: {x: 0, y, width: 0, height: -y},
            b: {x: 0, y: 0, width: 0, height: y}
        }
        //判断编辑点的位置
        let list;
        let position = el.CONFIG.position
        if (position.indexOf("_") > -1) {
            list = position.split('_')
        } else list = [position]
        list.forEach(v => {
            for (const key in positions[v]) {
                this[key] += positions[v][key]
            }
        })
        if (!!this.judgeBoundaries) this.judgeBoundaries()
        //重新调整编辑点数据
        let points = this.getEditPointsPosition()
        this.editPoints.forEach(p => {
            let data = points.find(d => d.position === p.CONFIG.position)
            p.x = data.x;
            p.y = data.y;
        })
        //编辑事件监听
        let $ = View.SCENE_LIST[this.sceneId]
        if ($.editCall) $.editCall(el, x, y, this)
    }


    //扩展渲染
    preRender(context) {
        this.textRender(context)
        this.borderRender(context)
    }

    //文字渲染
    textRender(context) {
        let {center, boundaries, style} = this
        if (style.fontIcon || style.fontText) {
            let fontX = center.x;
            let fontY = center.y;
            new View.Elements.Text(context, fontX, fontY, style, boundaries)
        }
    }

    //元素边框渲染
    borderRender(context) {
        let {style} = this
        if (Tool.judgeType(style.borderSize, 1) && style.borderSize) {
            context.save();
            context.beginPath();
            context.strokeStyle = style.borderColor || 'black';
            context.lineWidth = style.borderSize;
            this.pathRender(context);
            context.stroke();
            context.restore();
        }
    }

    //箭头绘制
    arrowRender(context) {
        let {style, points} = this
        let lineWidth = (style.lineWidth || 0) / 2;
        context.save();
        context.beginPath();
        const finalPoint = points[points.length - 1]
        const firstPoint = points[points.length - 2]
        let {arrowSize, arrowColor} = style
        context.translate(finalPoint.x, finalPoint.y)
        let angle = Tool.judgeAngle(firstPoint, finalPoint) - (finalPoint.x - firstPoint.x >= 0 ? 180 : 0)
        context.rotate(angle * Math.PI / 180);
        context.moveTo(-1, 0)
        context.lineTo(arrowSize * 1.6, -lineWidth - arrowSize)
        context.lineTo(arrowSize * 1.6, lineWidth + arrowSize)
        context.closePath()
        context.fillStyle = arrowColor
        context.fill()
        context.translate(-finalPoint.x, -finalPoint.y)
        context.restore();
    }

    //渐变色设置
    setGradient() {

    }

    //动画渲染
    animationsRender() {
        for (const key in this.animations) {
            //动画执行完成后，将从执行动画列表中删除
            if (this.animations[key].isRender) {
                if (['x', 'y', 'width', 'height', 'r'].includes(key)) {//针对x、y、width、height、r
                    this[key] = this.animations[key].render(this[key]);
                    if (!!this.judgeBoundaries) this.judgeBoundaries();
                } else {//针对style属性
                    this.actions.change[key] = this.animations[key].render(this.actions.change[key]);
                    this.style[key] = this.actions.change[key];
                }
            }
        }
    }

    //设置动画配置
    setAnimations(animations) {
        for (const key in animations) {
            this.animations[key] = new Animation(animations[key], key, this.sceneId);
        }
    }

    //移除动画
    removeAnimations(key) {
        if (Tool.judgeType(key, 4)) {
            key.forEach(k => delete this.animations[k])
        } else if (Tool.judgeType(key, 0)) {
            delete this.animations[key]
        }
    }

    //元素鼠标样式处理
    elementMouseStyleHandler(type) {
        let {cursorStyle, disabled, canHover, canDrag} = this
        if (disabled) return 'disabled'
        if (cursorStyle) return cursorStyle;
        switch (type) {
            case 'drag':
                return canDrag ? 'drag' : 'default';
            case 'hover':
                return canHover ? 'hover' : 'default';
        }
    }

    //清空动画
    clearAnimation() {
        this.animations = {}
    }

    //判断点是否在范围内
    judgeValueIsInRange(e, context) {
        const {offsetX, offsetY} = e;
        if (!!this.pathRender) {
            context.beginPath();
            this.pathRender(context);
        }
        return context.isPointInPath(offsetX, offsetY);
    }

    //元素拖拽偏移
    elOffset(e) {
        if (this.disabled) return
        if (this.canDrag) {
            this.clearEditPoint()//清空编辑点
            const {offsetX, offsetY} = e;
            let {scale, sceneId} = this;
            let mouseDownPosition = View.SCENE_LIST[sceneId].mouseOldPosition;
            let mX = (offsetX - mouseDownPosition.offsetX) / scale
            let mY = (offsetY - mouseDownPosition.offsetY) / scale
            //非编辑端点元素处理
            if (!['EditPoint'].includes(this.type)) {
                this.x += mX;
                this.y += mY;
            }
            //元素边界重置
            if (!!this.judgeBoundaries && !this.parent) this.judgeBoundaries();
            //线段元素处理
            if (!!this.changeAllPoints) this.changeAllPoints(-mX, -mY);
            //元素拖拽反馈回调（同级元素）
            if (!!this.feedbackCall) this.feedbackCall(this, mX, mY)
            //回调关联元素的修改
            for (const id in this.relationEl) {
                let el = this.relationEl[id]
                if (!!el.relationChange) el.relationChange(this, e)
            }
        }
    }

    //通过元素边界判断是否在场景可视区内
    judgeIsInSceneViewArea() {
        const {x1, x2, y1, y2} = View.SCENE_LIST[this.sceneId].viewArea;
        const {boundaries} = this;
        if (boundaries.length !== 4) return
        //用左上角和右下角进行是否存在可视区检测
        this.canRender = x1 <= boundaries[2][0] && y1 <= boundaries[2][1] && x2 >= boundaries[0][0] && y2 >= boundaries[0][1];
    }

    destroy() {

    }
}
