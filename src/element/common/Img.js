/*
    图片
*/
import View from "../../main";

export default class Img {
    constructor(url, el) {
        let img = new Image();
        img.src = url;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            el.imgRender[url] = img;
            View.IMAGE_LIST[url] = img;
        }
    }
}
