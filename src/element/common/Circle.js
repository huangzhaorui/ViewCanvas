/*
    圆形
*/
import Element from "../../common/Element";

export default class Circle extends Element {
    constructor(config) {
        super(config);
        let {r = 0, start = 0, end = 2 * Math.PI} = config.params;
        this.r = r;
        this.start = start;
        this.end = end;
        //如果有父节点，则不渲染子节点边界
        if (!this.parent) this.judgeBoundaries();
    }

    //路径渲染
    pathRender(context) {
        let {x, y, r, start, end} = this;
        this.drawCircle({context, x, y, r, start, end})
    }

    //图片渲染
    imageRender(context) {
        let {x, y, r} = this;
        let url = this.style.imgUrl;
        this.drawImgByCircle({context, x, y, r, url})
    }

    //计算边界
    judgeBoundaries() {
        let {x, y, r} = this;
        let x1, x2, y1, y2;
        x1 = x;//左x
        x2 = x + r * 2;//右x
        y1 = y;//上y
        y2 = y + r * 2;//下y
        this.setBoundaries(x1, x2, y1, y2);
    }
}
