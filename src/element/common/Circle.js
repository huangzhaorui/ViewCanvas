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
        this.judgeBoundaries();
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

    //扩展渲染
    preRender(context) {
        context.save();
        let {x, y, style} = this
        //是否进行文字渲染
        if (style.fontIcon || style.fontText)
            new View.Elements.Text(context, x, y, style)
        context.restore();
    }

    //计算边界
    judgeBoundaries() {
        let {x, y, r} = this;
        let x1, x2, y1, y2;
        x1 = x;//左x
        x2 = x + r * 2;//右x
        y1 = y;//上y
        y2 = y + r * 2;//下y
        this.boundaries = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
        this.center.x = (x1 + x2) / 2
        this.center.y = (y1 + y2) / 2
    }
}
