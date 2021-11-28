//工具
import Tool from './common/Tool';
//舞台
import Stage from './common/Stage';
//元素
import Element from './common/Element';
//内置元素
import Elements from './element'
//默认样式
import Style from './style'

export default class View {
    //图片资源列表
    static IMAGE_LIST = {};
    //视频资源列表
    static VIDEO_LIST = {};
    //全局层变量
    static SCENE_LIST = {};
    //模式
    static MODE = {
        //渲染、事件、拖拽、移动、缩放、框选
        DEFAULT: [1, 1, 0, 0, 0, 0],//默认
        EDIT: [1, 1, 1, 1, 1, 0],//编辑
        DRAG: [1, 1, 1, 0, 0, 0],//拖拽
        MOVE: [1, 1, 0, 1, 0, 0],//移动
        ZOOM: [1, 1, 0, 0, 1, 0],//缩放
        SELECT: [1, 1, 1, 0, 1, 1],//框选
        PREVIEW: [1, 1, 0, 1, 1, 0],//预览
        FREEZE: [0, 0, 0, 0, 0, 0],//冻结，切换场景时，停止其他场景的渲染，减少浏览器开销
    }
    //工具
    static Tool = Tool;
    //舞台
    static Stage = Stage;
    //元素
    static Element = Element;
    //内置元素
    static Elements = Elements;
    //默认样式
    static Style = Style
}

(function ($) {
    $.View = View;
})(window)
