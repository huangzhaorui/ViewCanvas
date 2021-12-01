/*
* 舞台
* */
import Scene from './Scene';
import View from '../main';

export default class Stage {
    constructor(el, params) {
        console.warn('view-----start');
        this.parent = el;//父节点
        this.params = params;//配置和事件监听
        this.sceneList = [];
        this.currentScene = null;//默认场景
        this.sceneLimitNum = 999;//生成场景限制数量
        this.useRightMenu = true;//是否使用右键菜单
        this.createScene('default');//创建默认场景
        this.switchScene('default');//切换至默认场景
        this.eventListener();//事件监听
    }

    //事件监听
    eventListener() {
        let vm = this;
        let resize = () => {
            vm.sceneList.forEach(s => {
                if (s.isResize) s.resizeView();
            })
        }
        // 父元素大小改变时，自动调整canvas大小
        this.resizeObserver = new ResizeObserver(resize);
        this.resizeObserver.observe(this.parent);
        // window.addEventListener('resize', this.resize)
    }

    //创建场景
    createScene(name, otherConfig = {}) {
        if (this.sceneList.length >= this.sceneLimitNum) {
            alert('已达到创建场景上限，无法继续创建！');
            return;
        }
        let {parent, params} = this;
        let {config, handler} = params;
        let zIndex = this.sceneList.length + 1;
        let scene = new Scene({parent, config: Object.assign(config || {}, otherConfig), handler, name, zIndex})
        this.sceneList.push(scene);
        View.SCENE_LIST[scene.id] = scene;//加入到全局变量，方便使用
        return scene;
    }

    //获取场景，没找到返回undefined
    getScene(name) {
        return this.sceneList.find(s => s.name === name);
    }

    //获取场景下标，没找到返回-1
    getSceneIndex(name) {
        return this.sceneList.findIndex(s => s.name === name);
    }

    //切换场景
    switchScene(name) {
        this.currentScene = this.sceneList.find(s => s.name === name);
        //开始当前场景的渲染，停止其他场景的渲染
        this.sceneList.forEach(s => {
            if (!s.beforeFreezeMode)
                s.beforeFreezeMode = [...s.mode]; //保存冻结前的场景模式
            s.setSceneMode(View.MODE.FREEZE); //冻结场景
            s.renderZIndex = s.defaultZIndex;//恢复默认场景层级
        });
        this.currentScene.setSceneMode(this.currentScene.beforeFreezeMode);
        this.currentScene.beforeFreezeMode = null;
        this.currentScene.renderZIndex = 1000;//设置场景层级为最高
        this.currentScene.setSceneZIndex();//设置场景层级
        this.currentScene.canvasFront.focus();//切换场景时获取焦点
    }

    //移除场景
    removeScene(name) {
        let index = this.sceneList.findIndex(s => s.name === name);
        let id = this.sceneList[index].destroyScene();//停止渲染
        delete View.SCENE_LIST[id];//从全局变量中移除场景
        this.parent.removeChild(this.sceneList[index].canvasFront);//从父元素中删除场景
        this.sceneList.splice(index, 1);//从场景列表中去除
    }

    //为场景增加元素
    addEl(el, layer = 'element', scene = 'currentScene') {
        let elConfig = {...el};
        return this[scene].add(elConfig, layer);
    }

    //清空舞台
    destroy() {
        this.sceneList.forEach(el => {
            let id = el.destroyScene();
            delete View.SCENE_LIST[id];
        })
        this.resizeObserver.unobserve(this.parent);
        this.resizeObserver = null;
        this.sceneList = [];
        this.parent.innerHTML = '';
        // window.removeEventListener('resize', this.resize)
        console.warn('view-----destroy');
    }

}
