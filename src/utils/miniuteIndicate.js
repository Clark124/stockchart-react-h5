export default class MiniuteChart {
    constructor(canvas, data, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.cMargin = 16 //canvas内边距
        this.originX = this.cMargin //坐标轴原点
        this.originY = canvas.height - 20
        this.cWidth = canvas.width - this.cMargin * 2 //canvas中部的宽/高  
        this.cHeight = canvas.height - 20
        this.bWidth = this.cWidth / 240

        const allBarsNum = data.values.length

        let value = data.values.map(item => {
            return item[3]
        })

        this.averageValueList = []
        for (let i = 0; i < value.length; i++) {
            let averageValue = value.slice(0, i + 1).reduce((pre, current) => {
                return pre + current
            })
            this.averageValueList.push(parseFloat(averageValue / (i + 1)).toFixed(2))
        }
       

        this.currentData = {
            ...data,
            values: value,
            valueList: data.values,
            categoryData: data.categoryData,
            vol: data.vol
        }
        let volLen = this.currentData.vol.length
        this.lastVol = this.currentData.vol[volLen - 1]
        this.currentVol = ""
    }

    initChart() {
        const ctx = this.ctx
        this._drawLineLabelMarkers(ctx)
        this._drawVol()
        this._drawLastVol(ctx)
    }

    refreshChart(data) {
        const allBarsNum = data.values.length
        let date = new Date()
        const year = date.getFullYear()
        let month = date.getMonth() + 1

        if (month.toString().length === 1) {
            month = '0' + month
        }
        let day = date.getDate()
        if (day.toString().length === 1) {
            day = '0' + day
        }
        let fullDay = "" + year + month + day + '0931'
        const index = data.categoryData.indexOf(parseInt(fullDay))
        let value = ''
        if (index > 0) {
            value = data.values.slice(index - 1, allBarsNum).map(item => {
                return item[3]
            })
        } else {
            value = data.values.slice(allBarsNum - 240 - 1, allBarsNum).map(item => {
                return item[3]
            })
        }
        this.averageValueList = []
        for (let i = 0; i < value.length; i++) {
            let averageValue = value.slice(0, i + 1).reduce((pre, current) => {
                return pre + current
            })
            this.averageValueList.push(parseFloat(averageValue / (i + 1)).toFixed(2))
        }

        this.currentData = {
            ...data,
            values: value,
            valueList: index > 0 ? data.values.slice(index, allBarsNum) : data.values.slice(allBarsNum - 240, allBarsNum),
            categoryData: index > 0 ? data.categoryData.slice(index, allBarsNum) : data.categoryData.slice(allBarsNum - 240, allBarsNum),
            vol: index > 0 ? data.vol.slice(index, allBarsNum) : data.vol.slice(allBarsNum - 240, allBarsNum)
        }
        let volLen = this.currentData.vol.length
        this.lastVol = this.currentData.vol[volLen - 1]
        this.currentVol = ""
        const ctx = this.ctx
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.initChart()
    }


    // 绘制图表轴、分割线及底部时间
    _drawLineLabelMarkers(ctx) {
        ctx.lineWidth = 1
        ctx.strokeStyle = "#eaeaea"
        //画标记
        ctx.strokeRect(this.originX, 0, this.cWidth, this.canvas.height)
        this._drawLine(this.originX, this.originY, this.originX + this.cWidth, this.originY)
        this._drawLine(this.originX + this.cWidth / 2, this.originY, this.originX + this.cWidth / 2, 0)
        ctx.setLineDash([3, 2], 5)
        this._drawLine(this.originX, this.originY / 2, this.originX + this.cWidth, this.originY / 2)
        this._drawLine(this.originX + this.cWidth / 4, this.originY, this.originX + this.cWidth / 4, 0)
        this._drawLine(this.originX + this.cWidth * 3 / 4, this.originY, this.originX + this.cWidth * 3 / 4, 0)
        ctx.setLineDash([])
        this._drawFootDate(ctx)

    }
    //底部三段时间
    _drawFootDate(ctx) {
        ctx.font = '12px Arial'
        ctx.fillStyle = '#999'
        ctx.fillText('9:30', this.originX + 3, this.originY + 15);
        ctx.fillText('11:30', this.originX + this.cWidth / 2 - 15, this.originY + 15);
        ctx.fillText('15:00', this.originX + this.cWidth - 35, this.originY + 15);
    }

    //划线
    _drawLine(x, y, X, Y, color) {
        const ctx = this.ctx
        if (color) {
            ctx.strokeStyle = color
        } else {
            ctx.strokeStyle = '#eaeaea'
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(X, Y);
        ctx.stroke();
    }
    //画成交量
    _drawVol() {
        const dataList = this.currentData
        const ctx = this.ctx
        this.maxVol = Math.max.apply(null, dataList.vol)
        this.minVol = Math.min.apply(null, dataList.vol)
        this.pointWith = this.cWidth / 240
        //计算每个点的坐标
        this.pointsList = []

        for (var i = 0; i < dataList.vol.length; i++) {
            let data = dataList.valueList[i]
            let volVal = dataList.vol[i]
            const date = dataList.categoryData[i]
            let color = "#53b900"; //绿色
            // //开盘0 最高1 最低2 收盘3  
            if (data[3] >= data[0]) { //涨
                color = '#ff6339' //红色
            }

            var barH = parseFloat(this.cHeight * (volVal) / (this.maxVol));
            var y = this.cHeight - barH;
            var x = this.bWidth * i + this.originX;
            this.pointsList.push({ x: parseFloat(x).toFixed(2), date: date, vol: volVal })
            ctx.fillStyle = color
            ctx.fillRect(x, y, this.bWidth, barH);
        }
    }
    //成交量的数值
    _drawLastVol(ctx) {
        ctx.fillStyle = '#999'
        if (this.currentVol) {
            ctx.fillText(`vol:${this.currentVol}`, 20, 10)
        } else {
            ctx.fillText(`vol:${this.lastVol}`, 20, 10)
        }
    }



    //画十字线
    drawCrossLine(x) {
        const ctx = this.ctx
        for (var i = 0; i < this.pointsList.length; i++) {
            if (x >= parseFloat(this.pointsList[i].x) && x <= (parseFloat(this.pointsList[i].x) + this.pointWith)) {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.clickPoint = [{ x: x + this.pointWith / 2 ,date:this.pointsList[i].date}]

                this.currentVol = this.pointsList[i].vol
                this.initChart()
                this.showCrollLine(ctx)
                break
            }
        }
    }

    showCrollLine(ctx) {
        const x = this.clickPoint[0].x
        const date =  this.clickPoint[0].date.toString()
        this._drawLine(x, this.originY, x, 0, '#aaa')
        ctx.fillStyle = '#333'
        ctx.font = '13px Arial'
        ctx.fillText(date.substring(8,12),x-15,this.originY-5)
    }
    //重绘
    clearLine() {
        const ctx = this.ctx
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.clickPoint = []
        this.currentVol = ''
        this.initChart()

    }
}