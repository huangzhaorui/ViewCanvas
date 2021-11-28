import Rect from "./Rect";

export default class SelectBorder extends Rect {
    constructor(config) {
        super(config);
    }

    //设置width,height
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.judgeBoundaries();
    }

    //清空关联元素设置
    clearRelationEl() {
        for (const id in this.relationEl) {
            let el = this.relationEl[id]
            el.isSelect = false;
            el.relationChange = null;
        }
    }
}