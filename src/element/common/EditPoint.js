/*
    编辑端点
*/
import Circle from "./Circle";
import View from "../../main";

export default class EditPoint extends Circle {
    constructor(config) {
        super(config);
        this.canClick = false;
        this.isTransition = false;
    }

    //判断到开始或结束端点的距离
    judgeStartOrEndLength(key, num = 0) {
        if (!['prev', 'next'].includes(key)) return null
        if (this[key] !== null) {
            num += this[key].judgeStartOrEndLength(key, num)
            num++
        }
        return num
    }

    relationChange(el, e) {
        const {offsetX, offsetY} = e;
        let {scale, sceneId} = this;
        let mouseDownPosition = View.SCENE_LIST[sceneId].mouseOldPosition;
        let mX = (offsetX - mouseDownPosition.offsetX) / scale
        let mY = (offsetY - mouseDownPosition.offsetY) / scale
        this.x += mX;
        this.y += mY;
    }
}
