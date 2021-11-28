/*
    编辑端点
*/
import Circle from "./Circle";

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
}
