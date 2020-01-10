import {
  calcKDJ
} from './kdj'
import calcMACD from './macd.js'
import calculateRSI from './rsi'


export default class indicateChart {
  constructor(canvas, data0, kBarBumber, ctx) {
    this.maColor = {
      ma5: "#ff6767",
      ma10: "#4fce96",
      ma20: "#ffd202"
    }
    this.KlineColoe = {
      rise: "#FF0000",
      fall: "#00CC66"
    }
    this.macdColor = {
      dif: "red",
      dea: '#333',
      barUp: 'red',
      barDown: 'green',
      m: "green"
    }
    this.rsiColor = {
      rsi1: "#ff6767",
      rsi2: "#4fce96",
      rsi3: "#ffd202",
    }

    this.indicateType = 1
    this.kBarBumber = kBarBumber //K线的数量
    this.tobalBars = kBarBumber //数量
    this.allBarsNum = kBarBumber
    this.allData = data0
    this.endPoint = 0 //最后一点距离终点的个数
    this.data0 = {
      ...data0,
      values: data0.values.slice(data0.values.length - this.kBarBumber - this.endPoint, data0.values.length - this.endPoint),
      vol: data0.vol.slice(data0.vol.length - this.kBarBumber - this.endPoint, data0.vol.length - this.endPoint),
      categoryData: data0.categoryData.slice(data0.vol.length - this.kBarBumber - this.endPoint, data0.vol.length - this.endPoint),
    }
   
    let input = this.allData.values.map((item, index) => {
      return {
        open: item[0],
        close: item[3],
        low: item[2],
        high: item[1]
      }
    })
    this.kdj = calcKDJ(9, 3, 3, input)
    this.macd = calcMACD(this.allData.values)
    this.rsi = calculateRSI(this.allData.values)

    this.canvas = canvas
    this.ctx = ctx

    this.cMargin = 16 //canvas内边距
    this.originX = this.cMargin //坐标轴原点
    this.originY = canvas.height
    this.cWidth = canvas.width - this.cMargin * 2
    this.cHeight = canvas.height

    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度
    this.bMargin = 0.5; //每个k线图间间距 

    this.maxValue = Math.max.apply(null, this.data0.vol) //所有k线图的最大值/最小值 
    this.minValue = Math.min.apply(null, this.data0.vol) //最小值 
    this.isClick = false
    this.pointArr = [] //保存每日的收盘价
    this.currentVol = ""
    this.currentKDJList = ""
    this.currentMACDList = ""
    this.currentRSIlIST = ""
  }

  //初始化数据
  initChart(indicateType) {
    const ctx = this.ctx
    this.indicateType = indicateType
    this._drawLineLabelMarkers(ctx)
    switch (indicateType) {
      case 1:
        this._drawKdj()
        this._drawKdjCurrentValue()
        break
      case 2:
        this._drawMACD()
        this._drawMacdCurrentValue()
        break
      case 3:
        this._drawRSI()
        this._drawRsiCurrentValue()
        break
      default:
        this._volBar()
        this._drawCurrentVolVal()
    }


  }
  //刷新K线
  refreshKline(value){
    const ctx = this.ctx
    let len = value.values.length
    let lastVol = value.vol[len-1]
    this.allData.vol[len-1] = lastVol
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      vol: this.allData.vol.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = Math.max.apply(null, this.data0.vol)
    this.minValue = Math.min.apply(null, this.data0.vol)

    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)
   
  }

  // 绘制图表轴、标签和标记
  _drawLineLabelMarkers(ctx) {
    ctx.lineWidth = 1
    ctx.fillStyle = '#000'
    ctx.strokeStyle = "#000"
    this._drawLine(this.originX, this.originY, this.originX + this.cWidth, this.originY);
    this._drawLine(this.originX + this.cWidth, this.originY, this.originX + this.cWidth, 0);
    this._drawLine(this.originX, this.originY, this.originX, 0);
  }
  //绘制当前成交量的值
  _drawCurrentVolVal() {
    const ctx = this.ctx
    const len = this.data0.vol.length
    let value = this.data0.vol[len - 1]
    if (this.currentVol) {
      value = this.currentVol
    }
    ctx.fillStyle = '#333'
    ctx.font = '10px Arial'
    ctx.fillText(`VOL: ${value}`, 20, 10)
  }

  //划线
  _drawLine(x, y, X, Y, color) {
    const ctx = this.ctx
    if (color) {
      ctx.strokeStyle = color
    } else {
      ctx.strokeStyle = '#EEE'
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(X, Y);
    ctx.stroke();
  }

  //绘制成交量图
  _volBar() {
    this.pointArr = []
    for (var i = 0; i < this.kBarBumber; i++) {
      let data = this.data0.values[i]
      let volVal = this.data0.vol[i]
      const date = this.data0.categoryData[i]
      var color = this.KlineColoe.fall; //绿色
      if (data[3] >= data[0]) { //涨
        color = this.KlineColoe.rise; //红色
      } else {
        color = this.KlineColoe.fall
      }
      var showH = (volVal) / (this.maxValue - this.minValue) * this.cHeight;
      showH = showH > 2 ? showH : 2;

      var barH = (this.cHeight - 20) * volVal / this.maxValue;
      var y = this.originY - barH;
      var x = this.originX + ((this.bWidth + this.bMargin) * i);
      this._drawRect(x, y, this.bWidth, this.originY - y, color); //开盘收盘  高度减一避免盖住x轴

      //保存每日的收盘价
      if (data[3] >= data[0]) {
        this.pointArr.push({
          x: x,
          y: y,
          vol: volVal,
          date
        })
      } else {
        this.pointArr.push({
          x: x,
          y: y + showH,
          vol: volVal,
          date
        })
      }
    }

  }
  //绘制KDJ图
  _drawKdj() {
    this.pointArr = []
    //计算当前KDJ值
    const len = this.allData.values.length
    const {
      kBarBumber,
      endPoint
    } = this
    let currentKDJ = {
      k: this.kdj.k.slice(len - kBarBumber - endPoint, len - endPoint),
      d: this.kdj.d.slice(len - kBarBumber - endPoint, len - endPoint),
      j: this.kdj.j.slice(len - kBarBumber - endPoint, len - endPoint),
    }
    this.currentKDJ = currentKDJ
    let max = 0
    let min = 0
    for (let key in currentKDJ) {
      let currentMax = Math.max(...currentKDJ[key])
      let currentMin = Math.min(...currentKDJ[key])
      if (currentMax > max) {
        max = parseFloat(currentMax).toFixed(2)
      }
      if (currentMin < min) {
        min = parseFloat(currentMin).toFixed(2)
      }
    }
    this._drawMaxAndMinValue(max, min)
    for (var i = 0; i < this.kBarBumber; i++) {
      const date = this.data0.categoryData[i]
      let kdj = {
        k: this.currentKDJ.k[i],
        d: this.currentKDJ.d[i],
        j: this.currentKDJ.j[i],
      }
      var x = this.originX + ((this.bWidth + this.bMargin) * i);
      this.pointArr.push({
        x,
        date,
        kdj
      })
    }
    this._drawIndicateLine(currentKDJ.k, this.maColor.ma5, max, min)
    this._drawIndicateLine(currentKDJ.d, this.maColor.ma10, max, min)
    this._drawIndicateLine(currentKDJ.j, this.maColor.ma20, max, min)
  }
  //绘制当前KDJ的值
  _drawKdjCurrentValue() {
    const ctx = this.ctx
    let len = this.currentKDJ.k.length
    let lastk = parseFloat(this.currentKDJ.k[len - 1]).toFixed(2)
    let lastd = parseFloat(this.currentKDJ.d[len - 1]).toFixed(2)
    let lastj = parseFloat(this.currentKDJ.j[len - 1]).toFixed(2)

    if (this.currentKDJList) {
      let k = parseFloat(this.currentKDJList.k).toFixed(2)
      let d = parseFloat(this.currentKDJList.d).toFixed(2)
      let j = parseFloat(this.currentKDJList.j).toFixed(2)
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`K: ${k}`, 20, 10)
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`D: ${d}`, 70, 10)
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`J: ${j}`, 120, 10)
    } else {
      ctx.font = '10px Arial'
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`K: ${lastk}`, 20, 10)
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`D: ${lastd}`, 70, 10)
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`J: ${lastj}`, 120, 10)
    }

  }

  //绘制MACD
  _drawMACD() {
    this.pointArr = []
    const len = this.allData.values.length
    const {
      kBarBumber,
      endPoint
    } = this
    //计算当前MACD值
    let currentMACD = {
      dif: this.macd.dif.slice(len - kBarBumber - endPoint, len - endPoint),
      dea: this.macd.dea.slice(len - kBarBumber - endPoint, len - endPoint),
      bar: this.macd.bar.slice(len - kBarBumber - endPoint, len - endPoint),
    }
    this.currentMACD = currentMACD

    let max = 0
    let min = 0
    for (let key in currentMACD) {
      let currentMax = Math.max(...currentMACD[key])
      let currentMin = Math.min(...currentMACD[key])
      if (currentMax > max) {
        max = currentMax
      }
      if (currentMin < min) {
        min = currentMin
      }
    }
    this._drawMaxAndMinValue(max, min)
    for (var i = 0; i < this.kBarBumber; i++) {
      const date = this.data0.categoryData[i]
      let macd = {
        dif: this.currentMACD.dif[i],
        dea: this.currentMACD.dea[i],
        m: this.currentMACD.bar[i],
      }
      var x = this.originX + ((this.bWidth + this.bMargin) * i);
      this.pointArr.push({
        x,
        date,
        macd
      })
    }
    this._drawIndicateLine(currentMACD.dif, this.maColor.ma5, max, min)
    this._drawIndicateLine(currentMACD.dea, this.maColor.ma10, max, min)
    this._drawMACDBar(currentMACD.bar, max, min)
  }
  //画MACD 的柱状图
  _drawMACDBar(data, max, min) {
    const ctx = this.ctx
    const { kBarBumber } = this
    let pointList = []
    for (let i = 0; i < kBarBumber; i++) {
      let x = this.originX + ((this.bWidth + this.bMargin) * i) + this.bWidth / 2 - 0.25;
      let y = this.originY - (this.originY - 10) * (data[i] + Math.abs(min)) / (max - min)
      pointList.push({ x, y })
    }

    let color = ''
    let origin = this.originY - (this.originY - 10) * (Math.abs(min)) / (max - min)
    for (let i = 0; i < pointList.length; i++) {
      if (pointList[i].y < origin) {
        color = this.macdColor.barUp
      } else {
        color = this.macdColor.barDown
      }
      ctx.lineWidth = 2

      this._drawLine(pointList[i].x, pointList[i].y, pointList[i].x, origin, color);

    }

  }
  //绘制当前MACD的值
  _drawMacdCurrentValue() {
    const ctx = this.ctx
    let len = this.currentMACD.dif.length
    let lastDIF = parseFloat(this.currentMACD.dif[len - 1]).toFixed(2)
    let lastdea = parseFloat(this.currentMACD.dea[len - 1]).toFixed(2)
    let lastM = parseFloat(this.currentMACD.bar[len - 1]).toFixed(2)
    ctx.font = '10px Arial'
    if (this.currentMACDList) {
      let dif = parseFloat(this.currentMACDList.dif).toFixed(2)
      let dea = parseFloat(this.currentMACDList.dea).toFixed(2)
      let m = parseFloat(this.currentMACDList.m).toFixed(2)
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`DIF: ${dif}`, 20, 10)
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`DEA: ${dea}`, 90, 10)
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`M: ${m}`, 155, 10)
    } else {
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`DIF: ${lastDIF}`, 20, 10)
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`DEA: ${lastdea}`, 90, 10)
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`M: ${lastM}`, 155, 10)
    }

  }

  //绘制RSI图
  _drawRSI() {
    this.pointArr = []
    //计算当前KDJ值
    const len = this.allData.values.length
    const {
      kBarBumber,
      endPoint
    } = this
    //计算当前的RSI值
    let currentRSI = {
      rsi1: this.rsi.rsi1.slice(len - kBarBumber - endPoint, len - endPoint),
      rsi2: this.rsi.rsi2.slice(len - kBarBumber - endPoint, len - endPoint),
      rsi3: this.rsi.rsi3.slice(len - kBarBumber - endPoint, len - endPoint),
    }
    this.currentRSI = currentRSI

    let max = 0
    let min = 100
    for (let key in currentRSI) {
      let currentMax = Math.max(...currentRSI[key].filter(item => item !== '-'))
      let currentMin = Math.min(...currentRSI[key].filter(item => item !== '-'))
      if (currentMax > max) {
        max = parseFloat(currentMax).toFixed(2)
      }
      if (currentMin < min) {
        min = parseFloat(currentMin).toFixed(2)
      }
    }
    this._drawMaxAndMinValue(max, min)
    for (var i = 0; i < this.kBarBumber; i++) {
      const date = this.data0.categoryData[i]
      let rsi = {
        rsi1: this.currentRSI.rsi1[i],
        rsi2: this.currentRSI.rsi2[i],
        rsi3: this.currentRSI.rsi3[i],
      }
      var x = this.originX + ((this.bWidth + this.bMargin) * i);
      this.pointArr.push({
        x,
        date,
        rsi
      })
    }
    this._drawRSILine(currentRSI.rsi1, this.rsiColor.rsi1, max, min)
    this._drawRSILine(currentRSI.rsi2, this.rsiColor.rsi2, max, min)
    this._drawRSILine(currentRSI.rsi3, this.rsiColor.rsi3, max, min)
  }
  //绘制当前RSI的值
  _drawRsiCurrentValue() {
    const ctx = this.ctx
    let len = this.rsi.rsi1.length
    let lastRSI1 = parseFloat(this.rsi.rsi1[len - 1]).toFixed(2)
    let lastRSI2 = parseFloat(this.rsi.rsi2[len - 1]).toFixed(2)
    let lastRSI3 = parseFloat(this.rsi.rsi3[len - 1]).toFixed(2)
    ctx.font = '10px Arial'
    if (this.currentRSIlIST) {
      let ris1 = parseFloat(this.currentRSIlIST.rsi1).toFixed(2)
      let ris2 = parseFloat(this.currentRSIlIST.rsi2).toFixed(2)
      let ris3 = parseFloat(this.currentRSIlIST.rsi3).toFixed(2)
      ctx.fillStyle = this.rsiColor.rsi1
      ctx.fillText(`RSI1: ${ris1}`, 10, 10)
      ctx.fillStyle = this.rsiColor.rsi2
      ctx.fillText(`RSI2: ${ris2}`, 75, 10)
      ctx.fillStyle = this.rsiColor.rsi3
      ctx.fillText(`RSI3: ${ris3}`, 140, 10)
    } else {
      ctx.fillStyle = this.rsiColor.rsi1
      ctx.fillText(`RSI1: ${lastRSI1}`, 10, 10)
      ctx.fillStyle = this.rsiColor.rsi2
      ctx.fillText(`RSI2: ${lastRSI2}`, 75, 10)
      ctx.fillStyle = this.rsiColor.rsi3
      ctx.fillText(`RSI3: ${lastRSI3}`, 140, 10)
    }

  }
  _drawRSILine(data, color, max, min) {
    const kBarBumber = this.kBarBumber
    let pointList = []
    for (let i = 0; i < kBarBumber; i++) {
      let x = this.originX + ((this.bWidth + this.bMargin) * i) + this.bWidth / 2 - 0.25;
      let y = this.originY - (this.originY - 10) * (data[i] - Math.abs(min)) / (max - min)
      pointList.push({
        x,
        y
      })
    }
    this._drawBezier(pointList, color)
  }
  //绘制指标线段
  _drawIndicateLine(data, color, max, min) {
    const kBarBumber = this.kBarBumber
    let pointList = []
    for (let i = 0; i < kBarBumber; i++) {
      let x = this.originX + ((this.bWidth + this.bMargin) * i) + this.bWidth / 2 - 0.25;
      let y = this.originY - (this.originY - 10) * (data[i] + Math.abs(min)) / (max - min)
      pointList.push({
        x,
        y
      })
    }
    this._drawBezier(pointList, color)
  }
  //指标最大值、最小值
  _drawMaxAndMinValue(max, min) {
    const ctx = this.ctx
    ctx.fillStyle = "#666"
    ctx.font = '10px Arial'
    ctx.fillText(`${max}`, this.originX, 25); // 文字
    ctx.fillText(`${min}`, this.originX, this.originY - 2); // 文字
  }


  //贝塞尔曲线
  _drawBezier(point, color) {
    const ctx = this.ctx
    ctx.strokeStyle = color
    ctx.lineWidth = 0.5
    ctx.beginPath();
    let hasFirstPoint = false
    for (let i = 0; i < point.length; i++) {
      if (!point[i].y || point[i].y <= 0) {
        continue
      }
      if (point[i].y && point[i].y > 0 && !hasFirstPoint) {
        ctx.moveTo(point[i].x, point[i].y);
        hasFirstPoint = true
      } else if (hasFirstPoint) { //注意是从1开始
        ctx.lineTo(point[i].x, point[i].y)
      }
    }
    ctx.stroke();
  }

  //绘制方块
  _drawRect(x, y, X, Y, color) {
    const ctx = this.ctx
    ctx.fillStyle = color
    ctx.fillRect(x, y, X, Y);
    ctx.fill()
  }


  //手指向右滑动时，重绘图
  moveRight() {
    if (this.endPoint >= this.allData.values.length - this.kBarBumber) {
      return
    }
    const ctx = this.ctx
    this.endPoint = this.endPoint + 1
    let len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      vol: this.allData.vol.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = Math.max.apply(null, this.data0.vol) //所有k线图的最大值/最小值 
    this.minValue = Math.min.apply(null, this.data0.vol) //最小值 

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)

  }
  //手指向左滑动时，重绘图
  moveLeft() {
    if (this.endPoint === 0) {
      return
    }
    const ctx = this.ctx
    this.endPoint = this.endPoint - 1
    let len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      vol: this.allData.vol.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = Math.max.apply(null, this.data0.vol) //所有k线图的最大值/最小值 
    this.minValue = Math.min.apply(null, this.data0.vol) //最小值 
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)

  }


  enlarge() {
    const ctx = this.ctx
    if (this.kBarBumber <= 10) {
      return
    }
    this.kBarBumber = this.kBarBumber - 5

    let len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      vol: this.allData.vol.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = Math.max.apply(null, this.data0.vol)
    this.minValue = Math.min.apply(null, this.data0.vol)
    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)


  }

  shrink() {
    const ctx = this.ctx
    if (this.kBarBumber + this.endPoint >= this.allData.values.length - 5) {
      return
    }
    this.kBarBumber = this.kBarBumber + 5
    let len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      vol: this.allData.vol.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = Math.max.apply(null, this.data0.vol)
    this.minValue = Math.min.apply(null, this.data0.vol)

    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)

  }

  //画十字线
  drawCrossLine(x, y) {
    const ctx = this.ctx
    for (var i = 0; i < this.pointArr.length; i++) {
      if (x >= this.pointArr[i].x && x <= (this.pointArr[i].x + this.bWidth)) {
        //指标为KDJ
        if (this.indicateType === 1) {
          this.currentKDJList = this.pointArr[i].kdj
        } else if (this.indicateType === 2) {
          this.currentMACDList = this.pointArr[i].macd
        } else if (this.indicateType === 3) {
          this.currentRSIlIST = this.pointArr[i].rsi
        }
        else {
          this.currentVol = this.pointArr[i].vol
        }

        const date = this.pointArr[i].date
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.initChart(this.indicateType)

        let x = this.pointArr[i].x + this.bWidth / 2 - 0.25
        ctx.lineWidth = 0.5
        this._drawLine(x, this.originY, x, 0, '#aaa')
        this._drawDate(date, x)

        break
      }
    }
  }
  //绘制日期
  _drawDate(date, x) {
    const ctx = this.ctx
    ctx.fillStyle = '#333'
    ctx.font = '10px Arial'
    ctx.fillText(`${date}`, x - 20, this.originY + 10)
  }

  //重绘
  clearLine(x, y) {
    const ctx = this.ctx
    this.currentVol = ""
    this.currentKDJList = ""
    this.currentMACDList = ""
    this.currentRSIlIST = ""
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.indicateType)

  }
}