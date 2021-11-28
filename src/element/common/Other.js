/*
    自定义
*/
import Element from '../../common/Element';
import Tool from '../../common/Tool';

export default class Other extends Element {
    constructor(config) {
        super(config);
        Tool.setConfig.call(this, config);
    }

    //由用户实现：otherRender、pathRender两个方法
    // otherRender(context,$){}
    // pathRender(context){}
}
