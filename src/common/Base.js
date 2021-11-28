/*
    基础属性定义
*/

import Tool from "./Tool";

export default class Base {
    constructor() {
        this.id = Tool.getUUID('view_canvas:');
        //鼠标样式
        this.cursorClass = {
            default: "cursor_default",
            hover: "cursor_pointer",
            move: "cursor_move",
            drag: "cursor_grab",
            wait: "cursor_wait",
            select: "cursor_select",
            l_r_arrow: "cursor_l_r_arrow",
            t_b_arrow: "cursor_t_b_arrow",
            lb_rt_arrow: "cursor_lb_rt_arrow",
            lt_rb_arrow: "cursor_lt_rb_arrow",
            text: "cursor_text",
            disabled: "cursor_disabled",
            zoom_in: "cursor_zoom_in",
            zoom_out: "cursor_zoom_out",
        }
        //基础配置
        this.fps = 60;//刷新率
        this.mode = View.MODE.DEFAULT;//默认模式
        this.saveMode = [];//保存的模式
        this.beforeFreezeMode = null;//场景冻结前的模式
        this.width = 0;//宽
        this.height = 0;//高
        this.isResize = true;//是否视图缩放
        this.background = 'transparent';//背景颜色
        this.offsetX = 0;//层x轴移动偏移量
        this.offsetY = 0;//层y轴移动偏移量
        this.zoomObj = {
            fontX: 0,//前次的x
            fontY: 0,//前次的y
            fontZoom: 10,//前次缩放等级
            curZoom: 10,//本次缩放等级
        }
        this.min_scale = 1;//最小缩放等级
        this.max_scale = 30;//最大缩放等级
        //显示配置
        this.canRender = false;//是否可以渲染
        this.canEvent = false;//是否监听事件
        this.canDrag = false;//是否可以拖拽元素
        this.canMove = false;//是否可以移动视图
        this.canZoom = false;//是否可以缩放
        this.canSelect = false;//是否可以框选
        //渲染中状态
        this.isRender = false;//是否渲染中
        this.isDown = false;//鼠标是否按下
        this.isMove = false;//鼠标是否移动中
        this.isDrag = false;//元素是否被拖拽中
        this.isCanUseSelect = false;//是否可以使用框选
        //渲染中元素
        this.mouseDownEl = null;//鼠标按下时选中元素
        this.clickEl = null;//被选中元素
        this.hoverEl = null;//移入元素
        this.dragEl = null;//拖拽元素
        this.selectEl = null;//框选元素
        this.isSelectElements = [];//被框选元素列表
        //其他
        this.mouseDownPosition = null;//鼠标按下位置
        this.mouseOldPosition = null;//鼠标上一次位置
        this.mouseMoveEvent = null;//鼠标移动事件
        this.sceneRenderFlag = null;//场景渲染标志
        this.mouseDownTime = null;//鼠标按下时间
        this.showViewArea = false;//是否显示可视区范围框
        this.viewArea = {x1: 0, y1: 0, x2: 0, y2: 0};//可视区大小，坐标系左上角点和右上角坐标，受偏移影响
    }
}
