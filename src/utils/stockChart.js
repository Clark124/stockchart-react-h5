import calculateBoll from './boll'
//找到最大值和最小值
function maxAndMinData(values) {
  let maxValue = 0
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (values[i][j] > maxValue) {
        maxValue = values[i][j]
      }
    }
  }
  let minValue = maxValue
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (values[i][j] < minValue) {
        minValue = values[i][j]
      }
    }
  }
  return {
    minValue,
    maxValue
  };
}


export default class StockChart {
  constructor(canvas, data0, kBarBumber, ctx, option) {
    this.maColor = {
      ma5: "#ff6767",
      ma10: "#4fce96",
      ma20: "#ffd202"
    }
    this.KlineColoe = {
      rise: "#FF0000",
      fall: "#00CC66"
    }
    this.option = option
    this.kBarBumber = kBarBumber //K线的数量
    this.tobalBars = kBarBumber //数量
    this.allData = data0
    this.endPoint = 0 //最后一点距离终点的个数

    //建立买卖点
    const allBarsNum = data0.values.length
    let sellPoint = []
    for (let i = 0; i < allBarsNum; i++) {
      sellPoint.push(0)
    }
    data0.sellPoint = sellPoint

    this.data0 = {
      ...data0,
      sellPoint: sellPoint.slice(allBarsNum - this.kBarBumber - this.endPoint, allBarsNum - this.endPoint),
      values: data0.values.slice(data0.values.length - this.kBarBumber - this.endPoint, data0.values.length - this.endPoint),
      categoryData: data0.categoryData.slice(data0.categoryData.length - this.kBarBumber - this.endPoint, data0.categoryData.length - this.endPoint),
      changeRate: data0.changeRate.slice(allBarsNum - this.kBarBumber - this.endPoint, allBarsNum - this.endPoint),
    }
    this.canvas = canvas
    this.ctx = ctx

    this.boll = calculateBoll(20, this.allData)

    this.MA5 = this._calculateMA(5, data0)
    this.MA10 = this._calculateMA(10, data0)
    this.MA20 = this._calculateMA(20, data0)


    this.cMargin = 16 //canvas内边距
    this.originX = this.cMargin //坐标轴原点
    this.originY = canvas.height
    this.cWidth = canvas.width - this.cMargin * 2 //canvas中部的宽/高  
    this.cHeight = canvas.height - this.cMargin * 2 - 15

    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度
    this.bMargin = 0.5; //每个k线图间间距

    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01

    this.totalYNomber = 4 //y轴上的标识数量

    this.pointArr = [] //保存每日的收盘价
    this.isClick = false
    this.maList = ""
    this.bollList = ""
    this.sellPonitRange = [] //买卖点可点击的范围
    this.drawingSurfaceImageData = ""
  }
  //计算均线点
  _calculateMA(dayCount) {
    var result = [];
    for (var i = 0, len = this.allData.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += this.allData.values[i - j][3];
      }
      result.push(parseFloat(sum / dayCount).toFixed(2));
    }
    return result

  }
  //初始化数据
  initChart(isShowBoll, showCroll, info) {
    this.isShowBoll = isShowBoll
    this.point_MA5 = []
    this.point_MA10 = []
    this.point_MA20 = []
    this.point_MA30 = []
    const ctx = this.ctx
    this._drawLineLabelMarkers(ctx)
    this._drawKBar()
    if (isShowBoll) {
      this._drawBOLL()
    } else {
      this._drawMAline()
    }

    if (!showCroll) {
      const pointInfo = this.pointArr[this.pointArr.length - 1]
      const info = {
        barVal: pointInfo.barVal,
        date: pointInfo.date,
        changeRate: parseFloat(pointInfo.changeRate).toFixed(2),
      }
      this.Ma5Title = pointInfo.Ma5Title
      this.Ma10Title = pointInfo.Ma10Title
      this.Ma20Title = pointInfo.Ma20Title
      this._drawStockInfo(info)
    } else {
      this.Ma5Title = info.Ma5Title
      this.Ma10Title = info.Ma10Title
      this.Ma20Title = info.Ma20Title
      this._drawStockInfo(info)
    }
    if (isShowBoll) {
      this._drawBollCurrentVal()
    } else {
      this._drawMaTitle()
    }

    this._drawMarkerValues()
  }
  //刷新K线
  refreshKline(value) {

    const len = value.values.length
    const lastKValue = value.values[len - 1]
    const lastKChangeRate = value.changeRate[len - 1]
    const ctx = this.ctx

    this.allData.values[len - 1] = lastKValue
    this.allData.changeRate[len - 1] = lastKChangeRate
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01
    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度
    this.bMargin = 0.5; //每个k线图间间距距

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)

  }
  // 绘制图表轴、标签和标记
  _drawLineLabelMarkers(ctx) {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#eaeaea"

    //画标记
    ctx.strokeRect(this.originX, 0, this.cWidth, this.originY)
    ctx.fillStyle = '#eee'
    ctx.fillRect(this.originX, 0, this.cWidth, 25)
    this._drawMarkers();

  }
  //绘制当前页面第一天和最后一天日期
  _drawFootDate() {
    let len = this.data0.categoryData.length
    let dateList = this.data0.categoryData
    this._drawDate(dateList[0], 35)
    this._drawDate(dateList[len - 1], this.cWidth - 12)
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

  // 绘制标记
  _drawMarkers() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#E0E0E0'
    // 绘制 y
    var oneVal = (this.maxValue - this.minValue) / this.totalYNomber;
    for (var i = 1; i <= this.totalYNomber; i++) {
      var markerVal = parseFloat(i * oneVal + this.minValue).toFixed(2);
      markerVal = Number(markerVal)
      var yMarker = parseFloat(this.originY - this.cHeight * (markerVal - this.minValue) / (this.maxValue - this.minValue)).toFixed(2);
      yMarker = Number(yMarker)
      if (i > 0) {
        this._drawLine(this.originX + this.cWidth, yMarker, this.originX, yMarker, '#eaeaea');
      }
    }
  };
  //
  _drawMarkerValues() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#E0E0E0'
    ctx.font = '10px Arial'
    // 绘制 y
    var oneVal = (this.maxValue - this.minValue) / this.totalYNomber;
    //绘制最小值
    ctx.fillStyle = "#679E20"
    ctx.fillText(`${parseFloat(this.minValue).toFixed(2)}`, this.originX + 2, this.originY - 2);

    ctx.fillStyle = "#666"

    for (var i = 1; i <= this.totalYNomber; i++) {
      var markerVal = parseFloat(i * oneVal + this.minValue).toFixed(2);
      markerVal = Number(markerVal)
      var xMarker = this.originX;
      var yMarker = parseFloat(this.originY - this.cHeight * (markerVal - this.minValue) / (this.maxValue - this.minValue)).toFixed(2);
      yMarker = Number(yMarker)
      if (i === this.totalYNomber) {
        ctx.fillStyle = "#FE3C3B"
      }
      ctx.fillText(`${markerVal}`, xMarker + 2, yMarker - 3); // 文字
    }
  }
  //绘制日期
  _drawDate(date, x) {
    const ctx = this.ctx
    ctx.fillStyle = '#333'
    ctx.font = '10px Arial'
    ctx.fillText(`${date}`, x - 20, this.originY + 15)
  }

  //绘制K线图及计算均线点
  _drawKBar() {
    this.pointArr = []
    this.sellPonitRange = []

    //开始计算均线点
    let { MA5, MA10, MA20 } = this
    const allBarsNum = this.allData.values.length
    const kBarBumber = this.kBarBumber
    const endPoint = this.endPoint


    MA5 = MA5.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint);
    MA10 = MA10.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint);
    MA20 = MA20.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint);
    // MA30 = MA30.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint);

    let currentBOLL = {
      up: this.boll.up.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint),
      down: this.boll.down.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint),
      middle: this.boll.mb.slice(allBarsNum - kBarBumber - endPoint, allBarsNum - endPoint),
    }
    this.currentBOLL = currentBOLL

    //开始计算均线点
    for (var i = 0; i < this.kBarBumber; i++) {
      let data = this.data0.values[i]
      let date = this.data0.categoryData[i]
      let changeRate = this.data0.changeRate[i]
      var color = this.KlineColoe.fall; //绿色
      var barVal = data[0];
      var disY = 0; //开盘价与收盘价的差值 
      //开盘0 最高1 最低2 收盘3  
      if (data[3] >= data[0]) { //涨
        color = this.KlineColoe.rise; //红色
        barVal = data[3];
        disY = data[3] - data[0];
      } else {
        disY = data[0] - data[3];
      }
      var showH = disY / (this.maxValue - this.minValue) * this.cHeight; //每根K线的高度（在Y轴上，开盘到收盘
      showH = showH > 2 ? showH : 2;
      var barH = this.cHeight * (barVal - this.minValue) / (this.maxValue - this.minValue);
      var y = this.originY - barH;

      var x = this.originX + (this.bWidth + this.bMargin) * i;

      this._drawRect(x, y, this.bWidth, showH, color); //开盘收盘  

      let boll = {
        up: this.currentBOLL.up[i],
        middle: this.currentBOLL.middle[i],
        down: this.currentBOLL.down[i]
      }

      //保存每日的收盘价
      if (data[3] >= data[0]) {
        this.pointArr.push({
          x: x,
          y: y,
          barVal: data[3],
          date,
          changeRate,
          Ma5Title: MA5[i], Ma10Title: MA10[i], Ma20Title: MA20[i], boll,

        })
      } else {
        this.pointArr.push({
          x: x,
          y: y + showH,
          barVal: data[3],
          date,
          changeRate,
          Ma5Title: MA5[i], Ma10Title: MA10[i], Ma20Title: MA20[i], boll,
        })
      }

      //计算每个均线点线的X坐标
      this._calculateMaX(i, MA5, MA10, MA20)

      //最高最低的线
      showH = (data[1] - data[2]) / (this.maxValue - this.minValue) * this.cHeight;
      showH = showH > 2 ? showH : 2;

      y = this.originY - parseInt(this.cHeight * (data[1] - this.minValue) / (this.maxValue - this.minValue));
      this._drawRect(x + parseFloat(this.bWidth / 2) - 0.25, y, 0.5, showH, color); //最高最低  高度减一避免盖住x轴

      //绘制买卖点
      let sellPoint = this.data0.sellPoint[i]
      let info = {
        type: sellPoint,
        date: date
      }
      this._drawSellPoint(sellPoint, x, y, showH, info)
    }

  }
  _drawMaCurrentVal() {
    const ctx = this.ctx
    let len = this.allData.values.length
    let Ma5Title = this.MA5[len - 1]
    let Ma10Title = this.MA10[len - 1]
    let Ma20Title = this.MA20[len - 1]
    ctx.font = '12px Arial'
    if (this.maList) {
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`MA5:${this.maList.Ma5Title}`, 10, 20);
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`MA10:${this.maList.Ma10Title}`, 90, 20);
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`MA20:${this.maList.Ma20Title}`, 180, 20);
    } else {
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`MA5:${Ma5Title}`, 10, 20);
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`MA10:${Ma10Title}`, 90, 20);
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`MA20:${Ma20Title}`, 180, 20);
    }
  }

  //计算均线点的坐标
  _drawMA(MA, i, x, type) {
    var MA5_ox1, MA5_oy1;
    var MA10_ox1, MA10_oy1;
    var MA20_ox1, MA20_oy1;
    var MA30_ox1, MA30_oy1;

    var MAVal = MA[i];
    var MAH = parseInt(this.cHeight * (MAVal - this.minValue) / (this.maxValue - this.minValue));
    var MAy = this.originY - MAH;
    if (type === "MA5") {
      MA5_ox1 = x + this.bWidth / 2;
      MA5_oy1 = MAy;
      this.point_MA5.push({
        x: MA5_ox1,
        y: MA5_oy1
      });
    }
    if (type === "MA10") {
      MA10_ox1 = x + this.bWidth / 2;
      MA10_oy1 = MAy;
      this.point_MA10.push({
        x: MA10_ox1,
        y: MA10_oy1
      });
    }
    if (type === "MA20") {
      MA20_ox1 = x + this.bWidth / 2;
      MA20_oy1 = MAy;
      this.point_MA20.push({
        x: MA20_ox1,
        y: MA20_oy1
      });
    }
    if (type === "MA30") {
      MA30_ox1 = x + this.bWidth / 2;
      MA30_oy1 = MAy;
      this.point_MA30.push({
        x: MA30_ox1,
        y: MA30_oy1
      });
    }
  }

  //计算每个均线点线的X坐标
  _calculateMaX(i, MA5, MA10, MA20, MA30) {
    var x = this.originX + ((this.bWidth + this.bMargin) * i);
    this._drawMA(MA5, i, x, "MA5");
    this._drawMA(MA10, i, x, "MA10");
    this._drawMA(MA20, i, x, "MA20");
    // this._drawMA(this.MA30, i, x, "MA30");
  }

  //绘制均须
  _drawMAline() {
    //画均线
    this._drawBezier(this.point_MA5, this.maColor.ma5, 0);
    this._drawBezier(this.point_MA10, this.maColor.ma10, 0);
    this._drawBezier(this.point_MA20, this.maColor.ma20, 0);
  }
  //绘制3条布林线
  _drawBOLL() {
    let currentBOLL = this.currentBOLL
    this._drawBollLine(currentBOLL.up, this.maColor.ma5);
    this._drawBollLine(currentBOLL.middle, this.maColor.ma10);
    this._drawBollLine(currentBOLL.down, this.maColor.ma20);
  }
  //绘制计算单挑布林线
  _drawBollLine(data, color) {
    const {
      kBarBumber
    } = this
    let pointList = []
    for (let i = 0; i < kBarBumber; i++) {
      let x = this.originX + ((this.bWidth + this.bMargin) * i);
      let MAx = parseInt(x + this.bWidth / 2);
      var MAH = parseInt(this.cHeight * (data[i] - this.minValue) / (this.maxValue - this.minValue));
      var MAy = this.originY - MAH;
      pointList.push({
        x: MAx,
        y: MAy
      });
    }
    let result = this._drawBezier(pointList, color)
    return result
  }
  //绘制当前BOLL的值
  _drawBollCurrentVal() {
    const ctx = this.ctx
    let len = this.currentBOLL.up.length
    let upTitle = parseFloat(this.currentBOLL.up[len - 1]).toFixed(2)
    let middleTitle = parseFloat(this.currentBOLL.middle[len - 1]).toFixed(2)
    let downTitle = parseFloat(this.currentBOLL.down[len - 1]).toFixed(2)
    ctx.font = '10px Arial'
    if (this.bollList) {
      let up = parseFloat(this.bollList.up).toFixed(2)
      let middle = parseFloat(this.bollList.middle).toFixed(2)
      let down = parseFloat(this.bollList.down).toFixed(2)
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`MID:${middle}`, 60, 40);
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`UP:${up}`, 140, 40);
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`LOW:${down}`, 220, 40);
    } else {
      ctx.fillStyle = this.maColor.ma10
      ctx.fillText(`MID:${middleTitle}`, 60, 40);
      ctx.fillStyle = this.maColor.ma5
      ctx.fillText(`UP:${upTitle}`, 140, 40);
      ctx.fillStyle = this.maColor.ma20
      ctx.fillText(`LOW:${downTitle}`, 220, 40);
    }
  }


  //画均线标题
  _drawMaTitle() {
    const ctx = this.ctx
    ctx.font = '10px Arial'
    ctx.fillStyle = this.maColor.ma5
    ctx.fillText(`MA5:${this.Ma5Title}`, 60, 40);
    ctx.fillStyle = this.maColor.ma10
    ctx.fillText(`MA10:${this.Ma10Title}`, 130, 40);
    ctx.fillStyle = this.maColor.ma20
    ctx.fillText(`MA20:${this.Ma20Title}`, 200, 40);
  }

  //贝塞尔曲线
  _drawBezier(point, color, num) {
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
    // ctx.fill()
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
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)


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
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)

  }

  enlarge() {
    const ctx = this.ctx
    if (this.kBarBumber <= 10) {
      return
    }
    this.kBarBumber = this.kBarBumber - 5
    const len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01
    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度
    this.bMargin = 0.5; //每个k线图间间距距

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)


  }

  shrink() {
    const ctx = this.ctx
    if (this.kBarBumber + this.endPoint >= this.allData.values.length - 5) {
      return
    }
    this.kBarBumber = this.kBarBumber + 5
    const len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.maxValue = maxAndMinData(this.data0.values).maxValue //所有k线图的最大值/最小值 
    this.maxValue = this.maxValue + this.maxValue * 0.01
    this.minValue = maxAndMinData(this.data0.values).minValue //最小值
    this.minValue = this.minValue - this.minValue * 0.01
    this.tobalBars = this.kBarBumber //数量
    this.bWidth = (this.cWidth / (this.kBarBumber + 1)) - 0.5; //K线图的宽度

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)

  }

  //画十字线
  drawCrossLine(x, y, callback) {
    const ctx = this.ctx
    for (var i = 0; i < this.pointArr.length; i++) {
      if (x >= this.pointArr[i].x && x <= (this.pointArr[i].x + this.bWidth)) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const data = {
          barVal: this.pointArr[i].barVal,
          date: this.pointArr[i].date,
          changeRate: parseFloat(this.pointArr[i].changeRate).toFixed(2),
          Ma5Title: this.pointArr[i].Ma5Title,
          Ma10Title: this.pointArr[i].Ma10Title,
          Ma20Title: this.pointArr[i].Ma20Title,
        }
        this.bollList = this.pointArr[i].boll
        this.initChart(this.isShowBoll, 'showCroll', data)

        this._drawBarVal(this.pointArr[i].barVal, this.pointArr[i].y, i)
        // const date = this.pointArr[i].date
        // this._drawDate(date, x)

        break
      }
    }
    if (callback) {
      callback(false)
    }
  }

  //绘制均线的值
  _drawMaVal(i) {
    this.Ma5Title = this.pointArr[i].Ma5Value
    this.Ma10Title = this.pointArr[i].Ma10Value
    this.Ma20Title = this.pointArr[i].Ma20Value
    this._drawMaTitle()
  }

  //绘制十字的值
  _drawBarVal(value, y, i) {
    const ctx = this.ctx
    ctx.lineWidth = 0.5
    this._drawLine(this.originX, this.pointArr[i].y, this.originX + this.cWidth, this.pointArr[i].y, '#aaa')
    this._drawLine(this.pointArr[i].x + this.bWidth / 2 - 0.25, this.originY, this.pointArr[i].x + this.bWidth / 2 - 0.25, 25, '#aaa')
    ctx.fillStyle = '#eee'
    ctx.fillRect(this.originX, y - 15, 55, 30)
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.fillText(`${parseFloat(value).toFixed(2)}`, this.originX + 5, y + 5)
  }

  //绘制K线头部信息
  _drawStockInfo(data) {
    const ctx = this.ctx
    ctx.fillStyle = '#000'
    ctx.font = '12px Arial'
    let date = data.date.toString()
    date = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8)
    let price = data.barVal
    let changeRate = data.changeRate
    ctx.fillText(`${date}`, this.originX + 5, 18)
    if (changeRate >= 0) {
      ctx.fillStyle = '#FF4052'
    } else {
      ctx.fillStyle = '#679E20'
    }

    ctx.font = '10px Arial'
    ctx.fillText(`${price}`, this.originX + 100, 18)
    ctx.fillText(`${changeRate}%`, this.originX + 170, 18)

  }

  //重绘
  clearLine(x, y) {
    const ctx = this.ctx
    this.maList = ""
    this.bollList = ""
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initChart(this.isShowBoll)

  }
  // //设置买点
  // setBuyPoint(status) {
  //   // this.moveRight()
  //   const { endPoint } = this.state
  //   let data = this.state.data
  //   if (status === 0) {
  //     data.sellPoint[data.sellPoint.length - endPoint - 1] = 1
  //   } else {
  //     data.sellPoint[data.sellPoint.length - endPoint - 1] = 2
  //   }

  //   this.setState({ data })
  // }
  //设置策略的买卖点
  setStrategyPoint(signalList) {
    let data = this.allData
    let timeList = data.categoryData
    data.sellPoint.forEach((item, pointIndex) => {
      data.sellPoint[pointIndex] = 0
    })
    signalList.forEach((item, itemIndex) => {
      let index = timeList.indexOf(parseInt(item.time))
      if (index > -1) {
        if (data.sellPoint[index] > 0) {
          data.sellPoint[index] = 3
        } else {
          if (item.type === 1) {
            data.sellPoint[index] = 1
          } else if (item.type === 3) {
            data.sellPoint[index] = 2
          }
        }
      }

    })

    this.allData = data
    let len = this.allData.values.length
    this.data0 = {
      ...this.allData,
      values: this.allData.values.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      categoryData: this.allData.categoryData.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      sellPoint: this.allData.sellPoint.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
      changeRate: this.allData.changeRate.slice(len - this.kBarBumber - this.endPoint, len - this.endPoint),
    }
    this.initChart(this.isShowBoll)

  }

  _drawSellPoint(sellPoint, x, y, showH, info) {
    const ctx = this.ctx

    let r = 6
    let fontSize = 8
    let xt = x + this.bWidth / 2 - 4
    if (this.kBarBumber >= 80 && this.kBarBumber <= 150) {
      r = 3
      fontSize = 1
    } else if (this.kBarBumber > 150) {
      r = 2
      fontSize = 1
    } else if (this.kBarBumber < 25) {
      r = 8
      fontSize = 10
      xt = xt - 1
    }

    ctx.font = fontSize + 'px Arial'
    if (sellPoint === 1) {
      //买
      ctx.beginPath()
      ctx.arc(x + this.bWidth / 2, y + showH + r + 3, r, 0, 2 * Math.PI)
      ctx.fillStyle = '#FE3C3B'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText('买', xt, y + showH + r + 6)
      this.sellPonitRange.push({
        x0: x + this.bWidth / 2 - 10,
        x1: x + this.bWidth / 2 + 10,
        y0: y + showH + r + 3 - 10,
        y1: y + showH + r + 3 + 10,
        info
      })

    } else if (sellPoint === 2) {
      ctx.beginPath()
      ctx.fillStyle = '#00AD2E'
      ctx.arc(x + this.bWidth / 2, y - r - 2, r, 0, 2 * Math.PI)

      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText('卖', xt, y - r + 1)
      this.sellPonitRange.push({
        x0: x + this.bWidth / 2 - 10,
        x1: x + this.bWidth / 2 + 10,
        y0: y - r - 2 - 10,
        y1: y - r - 2 + 10,
        info
      })
    } else if (sellPoint === 3) {
      //买
      ctx.beginPath()
      ctx.arc(x + this.bWidth / 2, y + showH + r + 3, r, 0, 2 * Math.PI)
      ctx.fillStyle = '#FE3C3B'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText('买', xt, y + showH + r + 6)
      this.sellPonitRange.push({
        x0: x + this.bWidth / 2 - 10,
        x1: x + this.bWidth / 2 + 10,
        y0: y + showH + r + 3 - 10,
        y1: y + showH + r + 3 + 10,
        info
      })
      ctx.beginPath()
      ctx.arc(x + this.bWidth / 2, y - r - 2, r, 0, 2 * Math.PI)
      ctx.fillStyle = '#00AD2E'
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText('卖', xt, y - r + 1)
      this.sellPonitRange.push({
        x0: x + this.bWidth / 2 - 10,
        x1: x + this.bWidth / 2 + 10,
        y0: y - r - 2 - 10,
        y1: y - r - 2 + 10,
        info
      })
    }
  }

  saveDrawingSurface() {
    const ctx = this.ctx
    this.drawingSurfaceImageData = ctx.getImageData(0, 0,
      this.canvas.width,
      this.canvas.height);
  }
  restoreDrawingSurface() {
    const ctx = this.ctx
    ctx.putImageData(this.drawingSurfaceImageData, 0, 0);
  }
}