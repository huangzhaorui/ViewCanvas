const rowDevices = [
    {id: 'd1', x: 0, y: 20, width: 120, height: 80, inPorts: [], outPorts: [1, 2, 3, 4]},
    {id: 'd2', x: 200, y: 10, width: 120, height: 100, inPorts: [1, 2, 3, 4], outPorts: [1, 2, 3, 4]},
    {id: 'd3', x: 400, y: 20, width: 120, height: 80, inPorts: [1, 2, 3, 4], outPorts: [1, 2, 3, 4, 5, 6]},
    {id: 'd4', x: 600, y: 10, width: 120, height: 100, inPorts: [1, 2, 3, 4, 5, 6], outPorts: [1, 2, 3, 4, 5, 6]},
    {id: 'd5', x: 800, y: 20, width: 120, height: 80, inPorts: [1, 2, 3, 4, 5, 6], outPorts: [1, 2, 3, 4, 5, 6]},
    {id: 'd6', x: 1000, y: 10, width: 120, height: 100, inPorts: [1, 2, 3, 4, 5, 6], outPorts: [1, 2, 3, 4]},
    {id: 'd7', x: 1200, y: 20, width: 120, height: 80, inPorts: [1, 2, 3, 4], outPorts: [1, 2, 3, 4]},
    {id: 'd8', x: 1400, y: 10, width: 120, height: 100, inPorts: [1, 2, 3, 4], outPorts: [1, 2, 3, 4]},
    {id: 'd9', x: 1600, y: 20, width: 120, height: 80, inPorts: [1, 2, 3, 4], outPorts: [1, 2]},
    {id: 'd10', x: 1800, y: 10, width: 120, height: 100, inPorts: [1, 2], outPorts: [1]},
    {id: 'd11', x: 2000, y: 20, width: 120, height: 80, inPorts: [1], outPorts: [1, 2]},
    {id: 'd12', x: 2200, y: 10, width: 120, height: 100, inPorts: [1, 2], outPorts: []},
]

let step = 0
const row = 10
let devices = []
let links = []
for (let i = 1; i <= row; i++) {
    let list = []
    rowDevices.forEach(d => {
        list.push({...d, id: d.id + '-' + i, y: d.y + step});
    })
    devices.push(...list)
    list.forEach((d, index) => {
        if (index !== 11) {
            let D = list[index + 1];
            d.outPorts.forEach(n => {
                links.push({inId: D.id, inPort: n, outId: d.id, outPort: n})
            })
        }
    })
    step += 120
}