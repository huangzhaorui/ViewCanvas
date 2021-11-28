/*
    矩形
*/
import Element from "../../common/Element";
import View from "../../main";
import Tool from '../../common/Tool'

export default class Rect extends Element {
    constructor(config) {
        super(config);
        let {width, height} = config.params;
        this.width = width;
        this.height = height;
        //如果有父节点，则不渲染子节点边界
        if (!this.parent) this.judgeBoundaries();
    }

    //路径渲染
    pathRender(context) {
        let {x, y, width, height} = this;
        this.drawRect({context, x, y, width, height})
    }

    //图片渲染
    imageRender(context) {
        let {x, y, width, height} = this;
        let url = this.style.imgUrl;
        this.drawImgByRect({context, x, y, width, height, url})
    }

    //计算边界
    judgeBoundaries() {
        let {x, y, width, height} = this
        let x1, x2, y1, y2;
        x1 = x;//左x
        x2 = x + width;//右x
        y1 = y;//上y
        y2 = y + height;//下y
        this.boundaries = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
        this.center.x = (x1 + x2) / 2
        this.center.y = (y1 + y2) / 2
    }
}
