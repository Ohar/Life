class LifeMatrix extends Array {
    getCell = (x, y) => this[this.countCellIndexByXY(x, y)]

    setCell = (x, y, val) => this[this.countCellIndexByXY(x, y)] = val

    countCellIndexByXY = (x, y) => x * window.LIFE.CELL_SIZE + y
}

const resizeField = () => {
    try {
        const field_size = window.LIFE.$cellCount.value * window.LIFE.CELL_SIZE

        window.LIFE.$canvas.width = field_size
        window.LIFE.$canvas.height = field_size
    } catch (err) {
        console.error('Инициализация проведена с ошибками', err)
    }
}

const fillFieldRandomly = () => {
    window.LIFE.fieldData = new LifeMatrix()

    for (let i = 0; i < window.LIFE.$cellCount.value; i++) {

        for (let j = 0; j < window.LIFE.$cellCount.value; j++) {
            const isAliveCell = Boolean(Math.random() > 0.6)

            window.LIFE.fieldData.push(isAliveCell)

            if (!window.LIFE.has_life && isAliveCell) {
                window.LIFE.has_life = true
            }
        }
    }

    if (!window.LIFE.has_life) {
        console.log('Жизнь не задалась… Пробуем снова!')
        fillFieldRandomly()
    }
    window.LIFE.fieldData_temp = LifeMatrix.from(window.LIFE.fieldData)
}

const drawLines = () => {
    window.LIFE.context.strokeStyle = "gray";

    for (let h = 1; h < window.LIFE.$cellCount.value; h++) {
        const horizontal = h * window.LIFE.CELL_SIZE
        const limit = window.LIFE.$cellCount.value * window.LIFE.CELL_SIZE
        window.LIFE.context.beginPath()
        window.LIFE.context.moveTo(0, horizontal);
        window.LIFE.context.lineTo(limit, horizontal)
        window.LIFE.context.stroke();
    }

    for (let v = 1; v < window.LIFE.$cellCount.value; v++) {
        const vertical = v * window.LIFE.CELL_SIZE
        const limit = window.LIFE.$cellCount.value * window.LIFE.CELL_SIZE
        window.LIFE.context.beginPath()
        window.LIFE.context.moveTo(vertical, 0);
        window.LIFE.context.lineTo(vertical, limit)
        window.LIFE.context.stroke();
    }
}


const drawCells = () => {
    const max = Number(window.LIFE.$cellCount.value)

    requestAnimationFrame(
        () => {
            for (let i = 0; i < max; i++) {
                for (let j = 0; j < max; j++) {
                    const x = i * window.LIFE.CELL_SIZE
                    const y = j * window.LIFE.CELL_SIZE
                    if (window.LIFE.fieldData_temp.getCell(i, j)) {
                        window.LIFE.context.fillStyle = "white"
                        window.LIFE.context.fillRect(x, y, window.LIFE.CELL_SIZE, window.LIFE.CELL_SIZE);
                    } else {
                        window.LIFE.context.fillStyle = "black"
                        window.LIFE.context.fillRect(x, y, window.LIFE.CELL_SIZE, window.LIFE.CELL_SIZE);
                    }
                }
            }
        }
    )

    window.LIFE.fieldData = LifeMatrix.from(window.LIFE.fieldData_temp)
}

const game_start = () => {
    window.LIFE.$message.style.display = 'block'
    window.LIFE.$message_live.style.display = 'inline'
    window.LIFE.$message_dead.style.display = 'none'
    window.LIFE.$btn_start.style.display = 'none'
    window.LIFE.$btn_stop.style.display = 'block'

    window.LIFE.ticker = setInterval(tick, window.LIFE.TICK_TIME)

    window.LIFE.$generation_index.innerText = window.LIFE.generation_index
}

const game_stop = () => {
    window.LIFE.$btn_stop.style.display = 'none'
    window.LIFE.$btn_start.style.display = 'block'
    window.LIFE.$message_live.style.display = 'none'
    window.LIFE.$message_dead.style.display = 'inline'

    clearInterval(window.LIFE.ticker)
}

const tick = () => {
    const max = Number(window.LIFE.$cellCount.value)
    let hasLife = false

    window.LIFE.$generation_index.innerText = ++window.LIFE.generation_index

    for (let i = 0; i < max; i++) {
        for (let j = 0; j < max; j++) {
            if (!window.LIFE.fieldData.getCell(i, j) && shouldCellGrowLife(i, j)) {
                window.LIFE.fieldData_temp.setCell(i, j, true)
            } else if (window.LIFE.fieldData.getCell(i, j) && shouldCellDie(i, j)) {
                window.LIFE.fieldData_temp.setCell(i, j, false)
            }

            if (!hasLife && window.LIFE.fieldData.getCell(i, j)) {
                hasLife = true
            }
        }
    }

    window.LIFE.has_life = hasLife
    drawCells()

    if (!window.LIFE.has_life) {
        game_stop()
    }
}

const shouldCellGrowLife = (x, y) => {
    if (window.LIFE.fieldData.getCell(x, y)) {
        return false
    }

    const aliveNearbyCount = countAliveNearby(x, y)

    return aliveNearbyCount === 3
}

const shouldCellDie = (x, y) => {
    if (!window.LIFE.fieldData.getCell(x, y)) {
        return false
    }

    const aliveNearbyCount = countAliveNearby(x, y)
    const shouldDie = aliveNearbyCount < 2 || aliveNearbyCount > 3

    return shouldDie
}

const countAliveNearby = (x, y) => {
    let aliveNearbyCount = 0
    const nearbyCoordsList = generateNearbyCoordsList(x, y)

    for (let i = 0; i < nearbyCoordsList.length; i++) {
        if (window.LIFE.fieldData.getCell(nearbyCoordsList[i][0], nearbyCoordsList[i][1])) {
            aliveNearbyCount++
        }

        if (aliveNearbyCount > 3) {
            break
        }
    }

    return aliveNearbyCount
}

const generateNearbyCoordsList = (x, y) => { // 1,0
    const max = Number(window.LIFE.$cellCount.value)
    const topX = x === 0 ? max-1 : x-1 // 0
    const botX = x+1 === max ? 0 : x+1 //
    const lftY = y === 0 ? max-1 : y-1
    const rgtY = y+1 === max ? 0 : y+1

    return [
        [topX, lftY],
        [botX, lftY],
        [topX, rgtY],
        [botX, rgtY],
        [x, lftY],
        [x, rgtY],
        [topX, y],
        [botX, y],
    ]
}

const init = () => {
    window.LIFE = {}
    window.LIFE.NEABY_ALIVE_TO_GROW_LIFE = 3
    window.LIFE.CELL_SIZE = 10
    window.LIFE.TICK_TIME = 1000
    window.LIFE.$cellCount = document.getElementById('cell_count')
    window.LIFE.$canvas = document.getElementById('root')
    window.LIFE.$generation_index = document.getElementById('generation_index')
    window.LIFE.$btn_start = document.getElementById('btn_start')
    window.LIFE.$btn_stop = document.getElementById('btn_stop')
    window.LIFE.$message = document.getElementById('message')
    window.LIFE.$message_live = document.getElementById('message_live')
    window.LIFE.$message_dead = document.getElementById('message_dead')
    window.LIFE.context = window.LIFE.$canvas.getContext('2d')
    window.LIFE.generation_index = 0
    window.LIFE.has_life = false
    clearInterval(window.LIFE.ticker)

    resizeField()
    fillFieldRandomly()
    drawLines()
    drawCells()
}

init()