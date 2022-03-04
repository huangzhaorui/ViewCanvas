/*
    文本
*/
import View from '../../main';
import Tool from "../../common/Tool";

export default class Text {
    constructor(context, x, y, style, boundaries) {
        this.x = x || 0;
        this.y = y || 0;
        this.style = style || {};
        this.boundaries = boundaries || []
        this.render(context);
    }

    /*
      @textAlign
        start	    默认。文本在指定的位置开始。
        end	        文本在指定的位置结束。
        center	    文本的中心被放置在指定的位置。
        left	    文本在指定的位置开始。
        right	    文本在指定的位置结束。
      @textBaseline
        alphabetic	默认。文本基线是普通的字母基线。
        top	        文本基线是 em 方框的顶端。
        hanging	    文本基线是悬挂基线。
        middle	    文本基线是 em 方框的正中。
        ideographic	文本基线是表意基线。
        bottom	    文本基线是 em 方框的底端。
    */
    render(context) {
        let {
            fontSize = View.Style.Text.default.fontSize,//字体大小
            fontColor = 'black',//字体颜色
            fontIcon,//字体图标，Unicode编码
            fontClass,//字体图标类名
            fontText,//文本内容
            fontAlign,
            fontOffsetX,
            fontOffsetY
        } = this.style;
        fontOffsetX = Tool.judgeType(fontOffsetX, 1) ? fontOffsetX : 0;
        fontOffsetY = Tool.judgeType(fontOffsetY, 1) ? fontOffsetY : 0;
        context.save()
        context.fillStyle = fontColor;
        /**
         * 当fontIcon值不为空时，fontPosition将失去效果
         */
        if (!!fontIcon) {
            context.textAlign = fontAlign || 'center';//水平对齐方式
            context.textBaseline = 'middle';//垂直对齐方式
            let {x, y} = this;
            fontClass = 'FontAwesome';
            context.font = `${fontSize}px ${fontClass}`;
            context.fillText(this.createFontIcon(fontIcon), x + fontOffsetX, y + fontOffsetY);
        }
        if (!fontIcon && !!fontText) {
            context.textBaseline = 'middle';//垂直对齐方式
            fontClass = 'sans-serif';
            context.font = `${fontSize}px ${fontClass}`;
            let {x, y, fontHeight, position, textAlign} = this.setTextPosition(context);
            context.textAlign = fontAlign || textAlign;//水平对齐方式
            //判断是否包含换行符\r\n
            if (fontText.indexOf('\r\n') > -1) {
                const textList = fontText.split('\r\n');
                if (position === 'top') {//文字在顶部
                    textList.forEach((t, i) => {
                        context.fillText(t, x + fontOffsetX, y - (textList.length - 0.5 - i) * fontSize + fontHeight / 2 + fontOffsetY);
                    })
                } else if (position === 'bottom') {//文字在中间或底部
                    textList.forEach((t, i) => {
                        context.fillText(t, x + fontOffsetX, y + (i + 0.5) * fontSize + fontHeight / 2 + fontOffsetY);
                    })
                } else {//文字在中间
                    if (textList.length % 2 === 0) {//偶数
                        let centerIndex = textList.length / 2
                        textList.forEach((t, i) => {
                            if (i === centerIndex) {
                                context.fillText(t, x + fontOffsetX, y + 0.5 * fontSize + fontHeight / 2 + fontOffsetY);
                            } else {
                                context.fillText(t, x + fontOffsetX, y - (centerIndex - i - 0.5) * fontSize + fontHeight / 2 + fontOffsetY);
                            }
                        })
                    } else {//奇数
                        let centerIndex = Math.floor(textList.length / 2)
                        textList.forEach((t, i) => {
                            if (i === centerIndex) {
                                context.fillText(t, x + fontOffsetX, y + fontHeight / 2 + fontOffsetY);
                            } else {
                                context.fillText(t, x + fontOffsetX, y - (centerIndex - i) * fontSize + fontHeight / 2 + fontOffsetY);
                            }
                        })
                    }
                }
            } else {
                if (position === 'top') {//文字在顶部
                    context.fillText(fontText, x + fontOffsetX, y - fontSize / 2 + fontOffsetY);
                } else if (position === 'bottom') {//文字在中间或底部
                    context.fillText(fontText, x + fontOffsetX, y + fontHeight + fontSize / 2 + fontOffsetY);
                } else {//文字在中间
                    context.fillText(fontText, x + fontOffsetX, y + fontHeight / 2 + fontOffsetY);
                }
            }
        }
        context.restore()
    }

    //创建字体图标
    createFontIcon(fontIcon) {
        this.font = document.createElement('i');
        this.font.innerHTML = fontIcon;
        return this.font.textContent;
    }

    //设置文本位置
    setTextPosition(context) {
        let {x, y, boundaries} = this;
        let {fontPosition, fontText} = this.style
        let {actualBoundingBoxDescent} = context.measureText(fontText)
        //文本高度
        let fontHeight = actualBoundingBoxDescent / 2;
        if (boundaries.length === 0) return {x, y, fontHeight, position: 'center', textAlign: 'center'}
        let stepX = (boundaries[2][0] - boundaries[0][0]) / 2
        let stepY = (boundaries[2][1] - boundaries[0][1]) / 2
        switch (fontPosition) {
            //上
            case 'top':
                return {x, y: y - stepY, fontHeight, position: 'top', textAlign: 'center'}
            //上-左
            case 'top-left':
                return {x: x - stepX, y: y - stepY, fontHeight, position: 'top', textAlign: 'right'}
            //上-右
            case 'top-right':
                return {x: x + stepX, y: y - stepY, fontHeight, position: 'top', textAlign: 'left'}
            //中
            case 'center':
                return {x, y, fontHeight, position: 'center', textAlign: 'center'}
            //中-左
            case 'center-left':
                return {x: x - stepX, y, fontHeight, position: 'center', textAlign: 'right'}
            //中-右
            case 'center-right':
                return {x: x + stepX, y, fontHeight, position: 'center', textAlign: 'left'}
            //下
            case 'bottom':
                return {x, y: y + stepY, fontHeight, position: 'bottom', textAlign: 'center'}
            //下-左
            case 'bottom-left':
                return {x: x - stepX, y: y + stepY, fontHeight, position: 'bottom', textAlign: 'right'}
            //下-右
            case 'bottom-right':
                return {x: x + stepX, y: y + stepY, fontHeight, position: 'bottom', textAlign: 'left'}
        }
        return {x, y, fontHeight, position: 'center', textAlign: 'center'}
    }


}
