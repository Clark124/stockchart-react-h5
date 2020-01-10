import React, { Component } from 'react';
import './stockChart.css'
import StockChart from '../../utils/stockChart.js'
import IndicateChart from '../../utils/indicateChart.js'

const win_width = window.innerWidth;
class App extends Component {
    constructor() {
        super()
        this.state = {
            status: 'loading',
            indicateType: 0,
            indicateList: [
                'VOL',
                'KDJ',
                'MACD',
                // 'RSI',
            ],
            tabIndex: 1,
            isShowBoll: false,
            isShowCrossLine: false,
            hasValue:false, //数据是否传过来

        }
    }
    UNSAFE_componentWillMount() {
        document.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }

    init(data, option) {
        if(!data.values || !data.categoryData || !data.vol){
            return
        }
        const type = this.state.indicateType
        let number = 50;
        if (data.values.length < 50) {
            number = data.values.length;
        }
        this.setState({hasValue:true})

        const ctx = this.chart1.getContext("2d");
        ctx.clearRect(0, 0, win_width, (520 / 750) * win_width);
        ctx.scale(2, 2)
        const ctxIndicate = this.chart2.getContext("2d");
        ctxIndicate.clearRect(0, 0, win_width, (160 / 750) * win_width);
        ctxIndicate.scale(2, 2)
        let Chart = new StockChart({
            width: win_width,
            height: (520 / 750) * win_width
        }, data, number, ctx)

        let indicateChart = new IndicateChart({
            width: win_width,
            height: (160 / 750) * win_width
        }, data, number, ctxIndicate)


        if (option.alerts && option.alerts.length > 0) {
            Chart.setStrategyPoint(option.alerts);
        } else {
            Chart.initChart(this.state.isShowBoll)
        }

        indicateChart.initChart(type)
        this.ctx = ctx
        this.ctxIndicate = ctxIndicate
        this.Chart = Chart
        this.IndicateChart = indicateChart

    }
    //刷新最后一根K线
    refreshKline(value) {
        if (this.state.isShowCrossLine) {
            return
        }
        this.Chart.refreshKline(value)
        this.IndicateChart.refreshKline(value)
    }

    //切换指标
    changeIndicate(index) {
        this.setState({ indicateType: index })
        const ctx = this.chart2.getContext("2d");
        ctx.clearRect(0, 0, win_width, (160 / 750) * win_width);
        this.IndicateChart.initChart(index)
    }

    showBoll() {
        this.setState({ isShowBoll: !this.state.isShowBoll }, () => {

            const ctx = this.chart1.getContext("2d");
            ctx.clearRect(0, 0, win_width, (520 / 750) * win_width);
            this.Chart.initChart(this.state.isShowBoll)
        })
    }

    //画十字线
    showAcrossLine(e) {
        if (e.touches.length === 1) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            this.setState({ isShowCrossLine: true })
            // this.Chart.saveDrawingSurface()
            this.Chart.drawCrossLine(x, y, (res) => {

                if (res.date) {
                    // this.triggerEvent('getSellPointInfo', res)
                    return
                }
                this.IndicateChart.drawCrossLine(x)
            })

        }
    }

    //隐藏十字线
    hideAcrossLine() {
        this.newDistance = ""
        this.oldDistance = ""
        this.setState({ isShowCrossLine: false })
        this.Chart.clearLine()
        this.IndicateChart.clearLine()
    }

    //移动手指
    moveTouch(e) {
        if (e.touches.length === 1) {
            const x = e.touches[0].clientX;
            this.IndicateChart.drawCrossLine(x)
            this.Chart.drawCrossLine(x)

        } else if (e.touches.length === 2) {
            let xMove = Math.abs(e.touches[1].x - e.touches[0].x);
            if (!this.newDistance) {
                this.newDistance = xMove
            } else {
                this.oldDistance = this.newDistance
                this.newDistance = xMove
                let distanceDiff = this.newDistance - this.oldDistance
                console.log(distanceDiff)
            }
        }
    }

    //放大K线图
    enlarge() {
        this.Chart.enlarge()
        this.IndicateChart.enlarge()

    }
    //缩小K线图
    shrink() {
        this.Chart.shrink()
        this.IndicateChart.shrink()
    }
    moveLeft() {
        this.Chart.moveLeft()
        this.IndicateChart.moveLeft()

    }
    moveRight() {
        this.Chart.moveRight()
        this.IndicateChart.moveRight()
    }
    longPressLeft() {
        this.moveingLeft = setInterval(() => {
            this.moveLeft()
        }, 100)
    }
    endlongPressLeft() {
        clearInterval(this.moveingLeft)
    }
    longPressRight() {
        this.moveingRight = setInterval(() => {
            this.moveRight()
        }, 100)
    }
    endlongPressRight() {
        clearInterval(this.moveingRight)
    }
    setPoint(sellPoint) {
        this.Chart.setStrategyPoint(sellPoint)
    }

    render() {
        // const { stockId } = this.props
        const { status, indicateList, indicateType, isShowBoll } = this.state

        return (
            <div className="chart-canvas">

                <canvas className='canvas1' width={win_width * 2} height={(520 / 750) * win_width * 2} style={{ width: win_width, height: (520 / 750) * win_width }}
                    onTouchStart={this.showAcrossLine.bind(this)} onTouchEnd={this.hideAcrossLine.bind(this)} onTouchMove={this.moveTouch.bind(this)} ref={(chart1)=>this.chart1 = chart1}>
                </canvas>
                <canvas className='canvas2' width={win_width * 2} height={(160 / 750) * win_width * 2} style={{ width: win_width, height: (160 / 750) * win_width }}
                    onTouchStart={this.showAcrossLine.bind(this)} onTouchEnd={this.hideAcrossLine.bind(this)} onTouchMove={this.moveTouch.bind(this)} ref={(chart2)=>this.chart2 = chart2}>
                </canvas>
                <div className='btn-wrapper' >
                    <span className="btn" onClick={this.moveRight.bind(this)} onTouchStart={this.longPressRight.bind(this)} onTouchEnd={this.endlongPressRight.bind(this)}>＜</span>
                    <span className="btn" onClick={this.enlarge.bind(this)}>＋</span>
                    <span className="btn" onClick={this.shrink.bind(this)}>－</span>
                    <span className="btn" onClick={this.moveLeft.bind(this)} onTouchStart={this.longPressLeft.bind(this)} onTouchEnd={this.endlongPressLeft.bind(this)}>＞</span>
                </div>
                <div className="indicate-list">
                    {indicateList.map((item, index) => {
                        return (
                            <span
                                onClick={this.changeIndicate.bind(this, index)}
                                className={indicateType === index ? "indicate-item active" : 'indicate-item'}
                                key={index}>{item}</span>
                        )

                    })}
                    <span
                        onClick={this.showBoll.bind(this)}
                        className={isShowBoll ? "indicate-item active" : 'indicate-item'}
                    >BOLL</span>
                </div>

            </div>
        );


    }
}

export default App;