/*
* 场景
* */
import Layer from "./Layer";
import Base from "./Base";
import '../common/Base.less';
import View from '../main';
import Tool from "./Tool";

export default class Scene extends Base {
    constructor({parent, config, handler, name, zIndex}) {
        super();
        this.name = name;
        this.defaultZIndex = zIndex;//场景默认层级
        this.renderZIndex = zIndex;//场景渲染层级
        this.parent = parent;
        for (let key in config) {
            this[key] = config[key];
        }
        for (let key in handler) {
            this[key] = handler[key];
        }
        this.layers = {
            control: new Layer('control'),//控件层
            temporary: new Layer('temporary'),//临时层
            element: new Layer('element'),//元素层
            background: new Layer('background')//背景层
        };
        //前端渲染canvas
        this.canvasFront = document.createElement('canvas', {alpha: false});
        this.canvasFront.setAttribute('id', this.id + '_front');
        this.canvasFront.setAttribute('tabindex', zIndex);//使场景能监听键盘事件
        this.renderContext = this.canvasFront.getContext('bitmaprenderer');
        this.parent.appendChild(this.canvasFront);
        this.setSceneZIndex();
        this.resizeView();
        this.setSceneMode(this.mode);
        this.eventListener();
        this.renderHandler();
    }

    //场景模式设置
    setSceneMode(mode = View.MODE.DEFAULT) {
        this.mode = mode;
        this.canRender = mode[0];
        this.canEvent = mode[1];
        this.canDrag = mode[2];
        this.canMove = mode[3];
        this.canZoom = mode[4];
        this.canSelect = mode[5];
    }

    //场景层级设置
    setSceneZIndex() {
        let canvasStyleObj = {
            "position": "absolute",
            "background": this.background,
            "margin": "auto",
            "top": '1px',
            "left": '1px',
            "z-index": this.renderZIndex,
        }
        let canvasStyle = '';
        for (let key in canvasStyleObj) {
            canvasStyle += `${key}:${canvasStyleObj[key]};`
        }
        this.canvasFront.setAttribute("style", canvasStyle);
    }

    //重置视图
    resizeView() {
        this.width = this.parent.clientWidth - 2;
        this.height = this.parent.clientHeight - 2;
        this.canvasFront.setAttribute('width', this.width);
        this.canvasFront.setAttribute('height', this.height);
        //后台渲染canvas
        this.canvasBack = new OffscreenCanvas(this.width, this.height);
        this.context = this.canvasBack.getContext('2d');
        this.changeViewArea();
    }

    //调整可视区
    changeViewArea() {
        const scale = this.zoomObj.curZoom / 10;
        this.viewArea.x1 = -this.offsetX / scale;
        this.viewArea.y1 = -this.offsetY / scale;
        this.viewArea.x2 = (-this.offsetX + this.width) / scale;
        this.viewArea.y2 = (-this.offsetY + this.height) / scale;
    }

    //渲染处理
    renderHandler() {
        const vm = this;
        let old = new Date().getTime();

        //绘制帧
        function frame() {
            if (!vm.isRender && vm.canRender) {
                let now = new Date().getTime();
                if ((now - old) >= (1000 / vm.fps)) {
                    old = now;
                    vm.render()
                }
            }
            vm.sceneRenderFlag = requestAnimationFrame(frame);//循环渲染帧
        }

        frame();
    }

    //销毁场景
    destroyScene() {
        if (this.sceneRenderFlag) {
            cancelAnimationFrame(this.sceneRenderFlag);//停止循环渲染帧
            this.sceneRenderFlag = null;
        }
        return this.id;
    }

    //渲染
    render() {
        this.isRender = true;
        this.context.setTransform(this.zoomObj.curZoom / 10, 0, 0, this.zoomObj.curZoom / 10, this.offsetX, this.offsetY);
        this.layerRender("background");//背景层
        this.layerRender("element");//元素层
        this.layerRender("temporary");//临时层
        this.layerRender("control");//控件层
        /*其他渲染处理*/
        if (!!this.otherRenderCall) this.otherRenderCall(this);
        this.viewAreaRender();
        this.useSelectModeHandler();
        let newFrame = this.canvasBack.transferToImageBitmap();
        this.renderContext.transferFromImageBitmap(newFrame);
        this.isRender = false;
    }

    //层渲染
    layerRender(name) {
        let {context, zoomObj, offsetX, offsetY} = this;
        this.layers[name].elements
            .sort((a, b) => a.renderZIndex - b.renderZIndex)//根据渲染层级排序
            .forEach(el => el.render(context, zoomObj.curZoom / 10, offsetX, offsetY))
    }

    //可视区渲染
    viewAreaRender() {
        const {x1, y1, x2, y2} = this.viewArea;
        if (!this.showViewArea) return;
        const context = this.context;
        context.save()
        context.beginPath()
        context.strokeStyle = '#515a6e'
        context.rect(x1, y1, x2 - x1, y2 - y1);
        context.stroke()
        context.restore()
        const scale = this.zoomObj.curZoom / 10;
        const fontText = `elements：${this.layers.element.elements.length}，x：${x1}，y：${y1}，scale：${this.zoomObj.curZoom}`
        new View.Elements.Text(
            context,
            x1 + 10 / scale,
            y1 + 15 / scale,
            {
                fontText,
                fontColor: '#515a6e',
                fontSize: 16 / scale,
                fontAlign: 'left'
            })
    }

    //进入框选模式提示
    useSelectModeHandler() {
        const {x1, y2} = this.viewArea;
        const {context, canSelect, isCanUseSelect} = this;
        if (!isCanUseSelect) return
        let fontColor = '#2d8cf0'
        let fontText = `按下左Ctrl进入框选模式`
        if (canSelect) {
            fontColor = '#ed4014'
            fontText = `已进入框选模式，按下左Ctrl退出`
        }
        const scale = this.zoomObj.curZoom / 10;
        new View.Elements.Text(
            context,
            x1 + 10 / scale,
            y2 - 15 / scale,
            {
                fontText,
                fontSize: 16 / scale,
                fontColor,
                fontAlign: 'left'
            })
    }

    //事件监听
    eventListener() {
        //屏蔽鼠标默认事件
        this.canvasFront.oncontextmenu = e => {
            return false;
        }
        //鼠标按下
        this.canvasFront.onmousedown = e => {
            if (!this.canEvent) return;
            let {offsetX, offsetY} = e;
            this.mouseDownPosition = {offsetX, offsetY}
            this.mouseOldPosition = {offsetX, offsetY};
            this.mouseDownEl = this.judgeHasElementInMouseRange(e);
            this.isDown = true;
            this.mouseDownTime = new Date().getTime()
        }
        //鼠标左键双击
        this.canvasFront.ondblclick = e => {
            if (!this.canEvent) return;
            // console.log(111)
            // let {offsetX, offsetY} = e;
            // this.mouseDownPosition = {offsetX, offsetY}
            // this.mouseOldPosition = {offsetX, offsetY};
            // this.isDown = true;
        }
        //鼠标松开
        this.canvasFront.onmouseup = e => {
            if (!this.canEvent) return;
            this.mouseDownPosition = null;
            this.mouseDownTime = null;
            this.isDown = false;
            this.mouseDownEl = false;
            //处于拖拽状态，结束时，将不触发点击事件
            if (this.isDrag && !!this.dragEl) {
                this.isDrag = false;
                this.dragEl.isDrag = false;
                this.dragEl.renderZIndex = this.dragEl.defaultZIndex;
                if (['Container'].includes(this.dragEl.type)) {
                    this.dragEl.childrenDragCall(this.context, false)
                }
                if (this.dragEl.canDrag && !!this.dragEndCall) this.dragEndCall(e, this.dragEl);//拖拽结束事件判断
                this.dragEl.isHover = true;
                this.hoverEl = this.dragEl;
                this.canvasFront.classList = [this.cursorClass[this.hoverEl.elementMouseStyleHandler('hover')]];
                //还原移入事件影响
                if (['Container'].includes(this.dragEl.type)) {
                    this.dragEl.childrenHoverCall(this.context)
                } else {
                    if (!!this.hoverCall) this.hoverCall(e, this.hoverEl);
                }
                this.dragEl = null;
                return;
            }
            //处于移动状态，结束时，将不触发点击事件
            if (this.isMove) {
                this.canvasFront.classList = [this.cursorClass.default];
                this.isMove = false;
                this.setSelectRangeAndElement(e)//设置框选范围和元素
                this.layers.temporary.clear()//清空临时层元素
                return;
            }
            let flag = this.judgeMouseEnter(e);
            let el = this.judgeHasElementInMouseRange(e);
            if (!!el) {
                switch (flag) {
                    case "left":
                        if (this.judgeIsSameEl(el, 'click')) {//取消选中
                            if (['Container'].includes(el.type)) {
                                el.childrenClickCall(this.context, false)
                            } else {
                                if (!!this.clickEl) {
                                    this.clickEl.isClick = false
                                    this.handlerChildrenElementCancel(e)
                                    if (this.clickEl.canClick && !!this.cancelCall) this.cancelCall(e, this.clickEl)
                                }
                                if (this.clickEl.canClick && !!this.cancelCall) this.cancelCall(e, this.clickEl);
                                this.clickEl = null;
                            }
                            break;
                        }
                        if (!!this.clickEl) {
                            this.clickEl.isClick = false
                            this.handlerChildrenElementCancel(e)
                            if (this.clickEl.canClick && !!this.cancelCall) this.cancelCall(e, this.clickEl)
                        }
                        if (['Container'].includes(el.type)) {
                            el.childrenClickCall(this.context, true)
                        } else {
                            el.isClick = true;
                            this.clickEl = el;
                            if (el.canClick && !!this.clickCall) this.clickCall(e, el);//选中
                        }
                        break;
                    case "right":
                        if (['Container'].includes(el.type)) el = el.childrenOtherClickCall(this.context)
                        if (!!this.rightClickCall) this.rightClickCall(e, el);
                        break;
                    case "center":
                        if (['Container'].includes(el.type)) el = el.childrenOtherClickCall(this.context)
                        if (!!this.centerClickCall) this.centerClickCall(e, el);
                        break;
                }
            } else {
                if (!!this.clickEl) {
                    this.clickEl.isClick = false
                    this.handlerChildrenElementCancel(e)
                    if (this.clickEl.canClick && !!this.cancelCall) this.cancelCall(e, this.clickEl)
                }
                this.clearSelectBorderInElementLayer()
                //当没有点到元素时的回调
                if (!!this.noneClickCall) this.noneClickCall(e)
                this.clickEl = null;
            }
        }
        //鼠标移动
        this.canvasFront.onmousemove = e => {
            if (!this.canEvent) return;
            this.mouseMoveEvent = e
            let el = null;
            if (!this.isMove) el = this.judgeHasElementInMouseRange(e);
            if (!this.isMove && !!this.dragEl) {//拖拽元素中事件判断
                this.canvasFront.classList = [this.cursorClass[this.dragEl.elementMouseStyleHandler('drag')]];
                this.elDragOffset(e, this.dragEl);
                let {offsetX, offsetY} = e
                this.mouseOldPosition = {offsetX, offsetY};
                if (this.dragEl.canDrag && !!this.dragCall) this.dragCall(e, this.dragEl);
                return;
            }
            if (!this.isMove && !!el) {
                if (this.canDrag && this.mouseDownEl && this.judgeIsMouseDownAndMove()) this.isDrag = true;
                if (this.isDrag) {//拖拽元素开始事件判断
                    //清空移入事件影响
                    if (!!this.hoverEl) {
                        this.hoverEl.isHover = false;
                        this.handlerChildrenElementLeave(e);
                        if (this.hoverEl.canHover && !!this.leaveCall) this.leaveCall(e, this.hoverEl);
                        this.hoverEl = null;
                    }
                    this.dragEl = el;
                    el.isDrag = true;
                    el.renderZIndex = this.layers.element.elements.length;
                    this.elDragOffset(e, el);
                    let {offsetX, offsetY} = e
                    this.mouseOldPosition = {offsetX, offsetY};
                    if (['Container'].includes(el.type)) {
                        el.childrenDragCall(this.context, true)
                    }
                    if (el.canDrag && !!this.dragStartCall) this.dragStartCall(e, el);
                } else {
                    el.isHover = true;
                    //移入元素事件判断
                    if (this.judgeIsSameEl(el, 'hover')) {
                        if (['Container'].includes(el.type)) {
                            el.childrenHoverCall(this.context)
                        }
                    } else {
                        if (!!this.hoverEl) {
                            this.hoverEl.isHover = false
                            this.handlerChildrenElementLeave(e);
                            if (this.hoverEl.canHover && !!this.leaveCall) this.leaveCall(e, this.hoverEl);
                        }
                        this.canvasFront.classList = [this.cursorClass[el.elementMouseStyleHandler('hover')]];
                        if (el.canHover && !!this.hoverCall) this.hoverCall(e, el);
                    }
                    this.hoverEl = el;
                }
            } else {
                //框选事件判断
                if (this.canSelect && this.isDown) {
                    if (this.judgeIsMouseDownAndMove()) this.isMove = true;
                    if (!this.isMove) return;
                    let list = this.layers.temporary.get({type: 'SelectBorder'})
                    this.canvasFront.classList = [this.cursorClass.select];
                    let {offsetX, offsetY} = this.mouseDownPosition
                    const scale = this.zoomObj.curZoom / 10;
                    if (list.length) {
                        let selectBorder = list[0]
                        let width = e.offsetX - offsetX;
                        let height = e.offsetY - offsetY;
                        selectBorder.setSize(width / scale, height / scale)
                    } else {
                        this.clearSelectBorderInElementLayer()
                        this.add({
                            type: 'SelectBorder',
                            x: (offsetX - this.offsetX) / scale,
                            y: (offsetY - this.offsetY) / scale,
                            params: {width: 0, height: 0}
                        }, 'temporary')
                    }
                    return;
                }
                //移动视图事件判断
                if (this.canMove && this.isDown) {
                    if (this.judgeIsMouseDownAndMove()) this.isMove = true;
                    if (!this.isMove) return;
                    this.canvasFront.classList = [this.cursorClass.move];
                    let {offsetX, offsetY} = e;
                    this.offsetX += offsetX - this.mouseDownPosition.offsetX;
                    this.offsetY += offsetY - this.mouseDownPosition.offsetY;
                    this.mouseDownPosition.offsetX = offsetX;
                    this.mouseDownPosition.offsetY = offsetY;
                    this.changeViewArea();
                    if (!!this.moveCall) this.moveCall(e);
                    return;
                } else {
                    if (!!this.hoverEl) {
                        this.hoverEl.isHover = false;
                        this.handlerChildrenElementLeave(e);
                        this.canvasFront.classList = [this.cursorClass.default];
                        if (this.hoverEl.canHover && !!this.leaveCall) this.leaveCall(e, this.hoverEl);
                    }
                }
                this.hoverEl = null;
            }
        }
        //鼠标滚动
        this.canvasFront.onmousewheel = e => {
            if (!this.canEvent) return;
            let {offsetX, offsetY} = e;
            let z = 0
            if (e.deltaY > 0) {
                this.canvasFront.classList = [this.cursorClass.zoom_out];
                if (this.canZoom && this.zoomObj.curZoom > this.min_scale) {
                    z = -0.5;
                }
                if (!!this.zoomCall) this.zoomCall(e, -1);
            } else {
                this.canvasFront.classList = [this.cursorClass.zoom_in];
                if (this.canZoom && this.zoomObj.curZoom < this.max_scale) {
                    z = 0.5;
                }
                if (!!this.zoomCall) this.zoomCall(e, 1);
            }
            //还原鼠标样式
            setTimeout(() => {
                if (!this.hoverEl) this.canvasFront.classList = [this.cursorClass.default];
                else this.canvasFront.classList = [this.cursorClass[this.hoverEl.elementMouseStyleHandler('hover')]];
            }, 100)
            let scale = this.zoomObj.fontZoom + z
            this.zoomOffset(scale, offsetX, offsetY)
        }
        //键盘按下
        this.canvasFront.onkeydown = e => {
            if (!this.canEvent) return
            let {code} = e;
            if (code === 'ControlLeft') {
                if (!this.isCanUseSelect) return;
                if (this.canSelect) {//退出SELECT模式
                    this.clearSelectBorderInElementLayer()
                    this.setSceneMode(this.saveMode)
                } else {//进入SELECT模式
                    this.saveMode = [...this.mode];
                    this.setSceneMode(View.MODE.SELECT);
                }
            }
            this.canvasFront.focus();
        }
        //键盘松开
        // this.canvasFront.onkeyup = e => {
        //     if (!this.canEvent) return
        //     let {code} = e;
        //     if (code === 'ControlLeft') {
        //         if (!this.isCanUseSelect) return;
        //         if (this.canSelect) {//退出SELECT模式
        //             this.clearSelectBorderInElementLayer()
        //             this.setSceneMode(this.saveMode)
        //         } else {//进入SELECT模式
        //             this.saveMode = [...this.mode];
        //             this.setSceneMode(View.MODE.SELECT);
        //         }
        //     }
        //     this.canvasFront.focus();
        // }
    }

    //处理子元素移出
    handlerChildrenElementLeave(e) {
        if (this.hoverEl.children) {
            if (this.hoverEl.hoverEl) {
                this.hoverEl.hoverEl.isHover = false;
                if (this.hoverEl.hoverEl.canHover && !!this.leaveCall) this.leaveCall(e, this.hoverEl.hoverEl);
                this.hoverEl.hoverEl = null;
            }
        }
    }

    //处理子元素取消
    handlerChildrenElementCancel(e) {
        if (this.clickEl.children) {
            if (this.clickEl.clickEl) {
                this.clickEl.clickEl.isClick = false;
                if (this.clickEl.clickEl.canClick && !!this.cancelCall) this.cancelCall(e, this.clickEl.clickEl);
                this.clickEl.clickEl = null;
            }
        }
    }

    //设置框选范围和元素
    setSelectRangeAndElement(e) {
        if (this.layers.temporary.elements.length === 0) return;
        const selectBorder = this.layers.temporary.elements[0]
        const {x, y, width, height} = selectBorder;
        let elements = this.layers.element.elements.filter(el => !['BrokenLine'].includes(el.type) && el.canRender)
        let b1 = selectBorder.boundaries
        elements.forEach((el, index) => {
            const b2 = el.boundaries
            if (b2[0][0] >= b1[0][0] && b2[0][1] >= b1[0][1] && b2[2][0] <= b1[2][0] && b2[2][1] <= b1[2][1]) {
                this.isSelectElements.push(el);
            }
        })
        if (this.isSelectElements.length === 0) return
        let x1 = this.isSelectElements[0].boundaries[0][0];
        let y1 = this.isSelectElements[0].boundaries[0][1];
        let x2 = this.isSelectElements[0].boundaries[2][0];
        let y2 = this.isSelectElements[0].boundaries[2][1];
        this.isSelectElements.forEach(el => {
            el.isSelect = true;
            const {boundaries} = el
            if (x1 >= boundaries[0][0]) x1 = boundaries[0][0]
            if (x2 <= boundaries[2][0]) x2 = boundaries[2][0]
            if (y1 >= boundaries[0][1]) y1 = boundaries[0][1]
            if (y2 <= boundaries[2][1]) y2 = boundaries[2][1]
        })
        let newSelectBorder = {
            type: 'SelectBorder',
            x,
            y,
            params: {width, height},
            actions: {
                default: {
                    shadowSize: 0,
                    backgroundColor: "rgba(0,0,0,.25)"
                },
                hover: {
                    shadowSize: 0,
                    backgroundColor: "rgba(0,0,0,.25)"
                }
            },
            animations: {
                x: {process: {0: x, 100: x1}, duration: 0.1, loop: false},
                y: {process: {0: y, 100: y1}, duration: 0.1, loop: false},
                width: {process: {0: width, 100: x2 - x1}, duration: 0.1, loop: false},
                height: {process: {0: height, 100: y2 - y1}, duration: 0.1, loop: false},
                backgroundColor: {
                    process: {0: selectBorder.style.backgroundColor, 100: 'rgba(0,0,0,.25)'},
                    duration: 0.1,
                    loop: false
                },
            }
        }
        this.selectEl = this.add(newSelectBorder)
        this.selectEl.relationEl = {};
        this.isSelectElements.forEach((el, i) => {
            this.selectEl.relationEl[el.id] = el
            el.relationChange = (t, e) => {
                el.elOffset(e)
            }
        })
        //框选事件
        if (!!this.selectCall) this.selectCall(e, this.selectEl, this.isSelectElements)
    }

    //清空element层的SelectBorder
    clearSelectBorderInElementLayer() {
        let list = this.layers.element.get({type: 'SelectBorder'})
        if (list.length) {
            list[0].clearRelationEl();
            this.remove(list);
            this.isSelectElements = [];
            this.selectEl = null;
            //取消框选事件
            if (!!this.cancelSelectCall) this.cancelSelectCall()
        }
    }

    //判断当前选中或移入元素是否为同一元素
    judgeIsSameEl(el, key) {
        let isSameEl = false;
        if (!!this[`${key}El`]) isSameEl = el.id === this[`${key}El`].id;
        return isSameEl;
    }

    //判断按下鼠标那个键
    judgeMouseEnter(e) {
        let {button, buttons} = e;
        if (button === 0 && buttons === 0) return 'left';
        if (button === 2 && buttons === 0) return 'right';
        if (button === 1 && buttons === 0) return 'center'
    }

    //判断鼠标范围内是否存在元素
    judgeHasElementInMouseRange(e) {
        const elList = this.layers.element
            .get({canRender: true})
            .filter(el => el.canEvent)//只寻找能响应事件的元素
            .filter(el => el.judgeValueIsInRange(e, this.context));
        if (elList.length) {
            elList.sort((a, b) => b.renderZIndex - a.renderZIndex);
            return elList[0];
        } else return null;
    }

    //判断是否按下鼠标移动
    judgeIsMouseDownAndMove() {
        let now = new Date().getTime();
        if (this.isDown) {
            if (now - this.mouseDownTime > 60) return true
        }
        return false
    }

    //元素拖拽偏移
    elDragOffset(e, el) {
        el.elOffset(e);
    }

    //为层添加元素
    add(config, layer = 'element') {
        let {type} = config;
        config.sceneId = this.id;
        return this.layers[layer].add(View.Elements[type], config)
    }

    //删除层元素
    remove(el) {
        let list = [];
        if (Tool.judgeType(el)) {
            list = [el]
        }
        if (Tool.judgeType(el, 4)) {
            list = [...el]
        }
        list.forEach(el => {
            let {layer, id} = el;
            if (el) this.layers[layer].remove(id)
        })
    }

    //清空层元素
    clear(layer = 'element') {
        this.layers[layer].clear()
    }

    //计算整体元素边界
    computeAllElementBoundary() {
        let coordinate = {x1: 0, x2: 0, y1: 0, y2: 0};
        this.layers.element.elements.forEach((el, i) => {
            let {boundaries} = el;
            let x1 = boundaries[0][0], x2 = boundaries[2][0], y1 = boundaries[0][1], y2 = boundaries[2][1];
            if (x1 < coordinate.x1) coordinate.x1 = x1;//左上角x
            if (x2 > coordinate.x2) coordinate.x2 = x2;//右下角x
            if (y1 < coordinate.y1) coordinate.y1 = y1;//左上角y
            if (y2 > coordinate.y2) coordinate.y2 = y2;//右下角y

        })
        let {x1, y1, x2, y2} = coordinate;
        return [x1, y1, x2 - x1, y2 - y1];
    }

    //全视角
    showAllView() {
        const {width, height} = this;
        let boundaries = this.computeAllElementBoundary();
        let centerX = boundaries[0] + boundaries[2] / 2;
        let centerY = boundaries[1] + boundaries[3] / 2;
        if (width / boundaries[2] >= height / boundaries[3]) {
            this.zoomObj.curZoom = height / boundaries[3] * 10;
        } else {
            this.zoomObj.curZoom = width / boundaries[2] * 10;
        }
        // console.log(this.zoomObj.curZoom, width, height, boundaries[2], boundaries[3])
        this.setViewInPosition(centerX, centerY);
        this.zoomObj.fontX = this.offsetX;
        this.zoomObj.fontY = this.offsetY;
        this.zoomObj.fontZoom = this.zoomObj.curZoom;
    }

    //移动到某一点作为视图中心
    setViewInPosition(x, y) {
        const {zoomObj, width, height} = this;
        const scale = zoomObj.curZoom / 10;
        this.offsetX = -(x) * scale + width / 2;
        this.offsetY = -(y) * scale + height / 2;
        this.changeViewArea()
    }

    //手动缩放
    setZoom(v) {
        let scale = this.zoomObj.fontZoom + v;
        if (v > 0) scale > this.max_scale ? scale = this.max_scale : scale
        if (v < 0) scale < this.min_scale ? scale = this.min_scale : scale
        let offsetX = this.width / 2
        let offsetY = this.height / 2
        this.zoomOffset(scale, offsetX, offsetY)
    }

    //缩放偏移
    zoomOffset(scale, offsetX, offsetY) {
        this.zoomObj.curZoom = scale;
        this.offsetX = offsetX - (offsetX - this.offsetX) * this.zoomObj.curZoom / this.zoomObj.fontZoom
        this.offsetY = offsetY - (offsetY - this.offsetY) * this.zoomObj.curZoom / this.zoomObj.fontZoom
        this.zoomObj.fontY = offsetY;
        this.zoomObj.fontX = offsetX;
        this.zoomObj.fontZoom = this.zoomObj.curZoom;
        this.changeViewArea();
    }
}
