/*
* 图层
* */

import Tool from "./Tool";

export default class Layer {
    constructor() {
        this.elements = []
    }

    //挂载元素
    add(type, config) {
        if (!config.id) config.id = Tool.getUUID('view_canvas_el:');//设置默认id
        config.zIndex = this.elements.length;
        const el = new type(config)
        this.elements.push(el)
        return el;
    }

    //获取元素
    get(params) {
        let {type, id, canRender} = params;
        if (type !== undefined) return this.elements.filter(el => el.type === type);
        if (id !== undefined) return this.elements.find(el => el.id === id);
        if (canRender !== undefined) return this.elements.filter(el => el.canRender === canRender);
    }

    //移除元素
    remove(id) {
        if (!!id) {
            let index = this.elements.findIndex(el => el.id === id);
            this.elements.splice(index, 1);
        }
    }

    //清空层
    clear() {
        this.elements.forEach(el => el.destroy())
        this.elements = []
    }

}
