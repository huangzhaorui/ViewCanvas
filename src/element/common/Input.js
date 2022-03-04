/**
 * 文本框
 */
import Rect from "./Rect";
import View from "../../main";

export default class Input extends Rect {
    constructor(config) {
        super(config);
        this.createControl();
    }

    createControl() {
        const {id, sceneId} = this;
        let parent = View.SCENE_LIST[sceneId].parent;
        let el = document.createElement('input');
        el.id = id;
        el.placeholder = '请输入...'
        parent.appendChild(el);
        this.setControl();
    }

    setControl() {
        const {id, x, y, width, height, oX, oY, scale, isClick} = this;
        let el = document.getElementById(id);
        el.style.display = isClick ? 'inline-block' : 'none';
        el.style.textAlign = 'center';
        el.style.background = 'transparent';
        el.style.border = '1px dotted black';
        el.style.position = 'absolute';
        el.style.zIndex = '9999';
        el.style.width = `${((width || 120) - 20) * scale}px`;
        el.style.height = `${((height || 40) - 20) * scale}px`;
        el.style.top = `${((y || 120) + 10) * scale + oY}px`;
        el.style.left = `${((x || 120) + 10) * scale + oX}px`;
    }

    eventCall(key, val) {
        switch (key) {
            case 'click':
                if (val) {
                    // this.showEditPoint();
                    this.actions.default.fontText = '';
                } else {
                    // this.clearEditPoint();
                    let el = document.getElementById(this.id);
                    this.actions.default.fontText = el.value || '请输入...';
                }
                break;
        }
    }

    //扩展渲染
    preRender(context) {
        this.setControl();
        this.textRender(context);
    }

    destroy() {
        let el = document.getElementById(this.id);
        View.SCENE_LIST[this.sceneId].parent.removeChild(el);
    }
}