/*
    矩形
*/
import Element from "../../common/Element";
import Tool from "../../common/Tool";
import View from '../../main';

export default class Container extends Element {
    constructor(config) {
        super(config);
        let {width, height} = config.params;
        this.width = width;
        this.height = height;
        /**
         * 添加的子元素取容器的左上角作为x,y的0,0点
         */
        this.children = [];//子元素列表
        //加载配置的子元素
        if (config.children && config.children instanceof Array) {
            config.children.forEach(c => this.add(c))
        }
        this.hoverEl = null;//移入子元素
        this.clickEl = null;//点击子元素
        this.judgeBoundaries();
    }

    //路径渲染
    pathRender(context) {
        let {x, y, width, height} = this;
        context.rect(x, y, width, height);
    }

    //图片渲染
    imageRender(context) {
        let {x, y, width, height} = this;
        context.drawImage(this.imgRender, 0, 0, this.imgRender.width, this.imgRender.height, x, y, width, height);
    }

    //检测子元素
    checkChildren(context) {
        if (this.children.length > 0) return this.judgeHasElementInMouseRange(context);//判断是否移入到子元素中
        else return null;
    }

    //子元素移入处理
    childrenHoverCall(context) {
        if (this.disabled) return
        if (!this.canHover) return
        let el = this.checkChildren(context);
        let $ = View.SCENE_LIST[this.sceneId];
        if (el) {//有子元素
            el.isHover = true
            if (this.hoverEl) {
                if (!this.judgeIsSameEl(el, 'hover')) {
                    if (!this.hoverEl.disabled && this.hoverEl.canHover && !!$.leaveCall) $.leaveCall($.mouseMoveEvent, this.hoverEl);
                    this.hoverEl.isHover = false;
                    this.hoverEl = el;
                    $.canvasFront.classList = [$.cursorClass[el.elementMouseStyleHandler('hover')]];
                    if (!el.disabled && el.canHover && !!$.hoverCall) $.hoverCall($.mouseMoveEvent, el);
                }
            } else {
                this.hoverEl = el;
                $.canvasFront.classList = [$.cursorClass[el.elementMouseStyleHandler('hover')]];
                if (!el.disabled && el.canHover && !!$.hoverCall) $.hoverCall($.mouseMoveEvent, el);
            }
        } else {//无子元素
            if (this.hoverEl) {
                this.hoverEl.isHover = false;
                if (!this.hoverEl.disabled && this.hoverEl.canHover && !!$.leaveCall) $.leaveCall($.mouseMoveEvent, this.hoverEl);
                this.hoverEl = null;
                $.canvasFront.classList = [$.cursorClass[this.elementMouseStyleHandler('hover')]];
                if (!!$.hoverCall) $.hoverCall($.mouseMoveEvent, this);
            }
        }
    }

    //子元素点击处理
    childrenClickCall(context, flag) {
        if (this.disabled) return
        if (!this.canClick) return
        let el = this.checkChildren(context);
        let $ = View.SCENE_LIST[this.sceneId];
        if (flag) {//容器不是场景的clickEl
            $.clickEl = this;
            if (el) {//点击到了容器中的子元素
                el.isClick = true
                this.clickEl = el;
                if (!el.disabled && el.canClick && !!$.clickCall) $.clickCall($.mouseMoveEvent, el);
            } else {//没有点击到容器中的子元素
                this.isClick = true
                if (!!$.clickCall) $.clickCall($.mouseMoveEvent, this);
            }
        } else {//容器是场景的clickEl
            if (el) {//点击到了容器中的子元素
                if (this.clickEl) {//容器有clickEl
                    if (!this.clickEl.disabled && this.clickEl.canClick && !!$.cancelCall) $.cancelCall($.mouseMoveEvent, this.clickEl);
                    if (this.judgeIsSameEl(el, 'click')) {//点击到的子元素是容器的clickEl，清空容器的clickEl
                        this.clickEl.isClick = false;
                        this.clickEl = null;
                        if (!!$.cancelCall) $.cancelCall($.mouseMoveEvent, this);
                        $.clickEl = null;
                    } else {//点击到的子元素不是容器的clickEl
                        this.clickEl.isClick = false;
                        el.isClick = true
                        this.clickEl = el;
                        if (!el.disabled && el.canClick && !!$.clickCall) $.clickCall($.mouseMoveEvent, el);
                    }
                } else {//容器没有clickEl
                    if (!!$.cancelCall) $.cancelCall($.mouseMoveEvent, this);
                    el.isClick = true
                    this.clickEl = el;
                    if (!el.disabled && el.canClick && !!$.clickCall) $.clickCall($.mouseMoveEvent, el);
                }
            } else {//没有点击到容器中的子元素
                if (this.clickEl) {//容器有clickEl，清空clickEl
                    this.isClick = true;
                    this.clickEl.isClick = false;
                    if (!this.clickEl.disabled && this.clickEl.canClick && !!$.cancelCall) $.cancelCall($.mouseMoveEvent, this.clickEl);
                    this.clickEl = null;
                    if (!!$.clickCall) $.clickCall($.mouseMoveEvent, this);
                } else {//容器没有clickEl，清空场景clickEl
                    this.isClick = false
                    if (!!$.cancelCall) $.cancelCall($.mouseMoveEvent, this);
                    $.clickEl = null;
                }
            }
        }
    }

    //子元素拖拽处理
    childrenDragCall(context, flag) {
        if (!this.canEvent) return;
        if (this.disabled) return
        if (!this.canDrag) return
        // let el = this.checkChildren(context);
        if (flag) this.children.forEach(el => el.isDrag = true)
        else this.children.forEach(el => el.isDrag = false)
    }

    //子元素右键或中间键处理
    childrenOtherClickCall(context) {
        let el = this.checkChildren(context);
        if (el) return el;//有子元素，返回子元素
        else return this;//没有子元素，返回容器
    }

    //判断当前选中或移入元素是否为同一元素
    judgeIsSameEl(el, key) {
        let isSameEl = false;
        if (!!this[`${key}El`]) isSameEl = el.id === this[`${key}El`].id;
        return isSameEl;
    }

    //判断鼠标范围内是否存在元素
    judgeHasElementInMouseRange(context) {
        let mouseMoveEvent = View.SCENE_LIST[this.sceneId].mouseMoveEvent;
        context.save();
        this.setRotate(context);
        const elList = this.children.filter(el => el.canEvent && el.judgeValueIsInRange(mouseMoveEvent, context));
        context.restore();
        if (elList.length) {
            elList.sort((a, b) => b.renderZIndex - a.renderZIndex);
            return elList[0];
        } else return null;
    }

    //计算边界
    judgeBoundaries() {
        let {x, y, width, height, children} = this
        let x1, x2, y1, y2;
        x1 = x;//左x
        x2 = x + width;//右x
        y1 = y;//上y
        y2 = y + height;//下y
        this.setBoundaries(x1, x2, y1, y2);
        //父元素计算边界时，调整子元素x,y，并计算子元素边界
        children.forEach(c => {
            /**
             * 子元素参数赋值渲染
             */
            let {x, y, params} = c.CONFIG;
            //x
            if (Tool.judgeType(x, 0)) c.x = this.x + Tool.evalMathStr(x, this.width);
            else c.x = this.x + x;
            //y
            if (Tool.judgeType(y, 0)) c.y = this.y + Tool.evalMathStr(y, this.height);
            else c.y = this.y + y;
            //width
            if (Tool.judgeType(params.width, 0)) c.width = Tool.evalMathStr(params.width, this.width);
            else c.width = params.width;
            //height
            if (Tool.judgeType(params.height, 0)) c.height = Tool.evalMathStr(params.height, this.height);
            else c.height = params.height;
            if (c.judgeBoundaries()) c.judgeBoundaries();
            //回调关联元素的修改
            for (const id in c.relationEl) {
                let el = c.relationEl[id]
                if (!!el.relationChange) el.relationChange(c)
            }
        })
    }

    //新增子元素
    add(config) {
        let {children} = this;
        if (!config.id) config.id = Tool.getUUID('view_canvas_el_child:');//设置默认id
        config.sceneId = this.sceneId;
        config.parent = this;
        config.zIndex = children.length;
        let child = new View.Elements[config.type](config)
        child.canEdit = false;//子元素不能通过编辑节点编辑大小
        children.push(child)
    }

    //移除单个子元素
    remove(id) {

    }

    //移除全部子元素
    removeAll() {

    }

    //通过id寻找子元素
    find(id) {

    }

    //寻找全部子元素
    findAll() {

    }

    //子元素渲染
    childrenRender(context) {
        let {scale, oX, oY, children} = this;
        if (children.length === 0) return;
        children.forEach(c => {
            c.isSelect = false
            c.render(context, scale, oX, oY)
        })
    }
}
