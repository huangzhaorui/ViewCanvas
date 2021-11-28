/*
    渐变
    type：Linear | Radial
    range：[x1,y1,x2,y2] | [x1,y1,r1,x2,y2,r2]
    context：上下文对象
    colors：[]    [['white',0.1]]
    direction：t_b | l_r | lt_rb | lb_rt  只对Linear有效
 */
import Tool from '../../common/Tool'

export default class Gradient {
    constructor(config) {
        const {type, context, el, range, direction, colors} = config;
        let newRange = []
        let {boundaries, center} = el;
        //线性渐变
        if (type === 'Linear') {
            const directions = {
                t_b: [0, 3],
                l_r: [0, 1],
                lt_rb: [0, 2],
                lb_rt: [3, 1]
            }
            const data = directions[direction || 't_b']
            newRange = [boundaries[data[0]][0], boundaries[data[0]][1], boundaries[data[1]][0], boundaries[data[1]][1]]
        }
        //径向/圆渐变
        if (type === 'Radial') {
            let {x, y} = center;
            let r1 = Math.abs(boundaries[0][0] - boundaries[2][0]) / 2
            let r2 = Math.abs(boundaries[0][1] - boundaries[2][1]) / 2
            let r = r1 >= r2 ? r2 : r1
            newRange = [x, y, r / 2, x, y, r]
            // newRange = [x, y, r1, x, y, r2]
        }
        if (Tool.judgeType(range, 4) && ![4, 6].includes(range.length)) newRange = [...range]
        this.gradient = context[`create${type}Gradient`](...newRange)
        colors.forEach(d => {
            this.addColorStop(d[1], d[0])
        })
    }

    getColor() {
        return this.gradient
    }

    addColorStop(p, c) {
        this.gradient.addColorStop(p, c)
    }
}