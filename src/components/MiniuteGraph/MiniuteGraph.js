import React, { Component } from 'react'
import { getKlineData } from "../../service";
// import { splitData } from "../../utils/util.js";
import MiniuteChart from '../../utils/miniuteChart';
import IndicateChart from '../../utils/miniuteIndicate'
import './index.css'

const win_width = window.innerWidth;

function splitData(rawData) {
    var categoryData = [];
    var values = []
    let vol = []
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        vol.push(rawData[i].splice(4, 5)[0])
        values.push(rawData[i])
    }

    return {
        categoryData: categoryData,
        values: values,
        vol,
    };
}


export default class MiniuteGraph extends Component {
    constructor() {
        super()
        this.state = {
            isShowCrossLine: false
        }
    }
    UNSAFE_componentWillMount() {
        document.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }
    componentWillUnmount() {
        if (this.refreshing) {
            clearInterval(this.refreshing)
        }
    }
    init(values) {
        const ctx = this.minChart1.getContext("2d");
        const ctxIndicate = this.minChart2.getContext("2d");

        ctx.clearRect(0, 0, win_width, (520 / 750) * win_width);
        ctx.scale(2, 2)
        ctxIndicate.scale(2, 2)
        let Chart = new MiniuteChart({
            width: win_width,
            height: (520 / 750) * win_width
        }, values, ctx)

        let indicateChart = new IndicateChart({
            width: win_width,
            height: (160 / 750) * win_width
        }, values, ctxIndicate)

        Chart.initChart()
        indicateChart.initChart()
        this.Chart = Chart
        this.indicateChart = indicateChart
    }

    refreshChart(values) {
        if (this.state.isShowCrossLine) {
            return
        }
        this.Chart.refreshChart(values)
        this.indicateChart.refreshChart(values)

    }

    showAcrossLine(e) {
        if (e.touches.length === 1) {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            this.setState({ isShowCrossLine: true })
            this.Chart.drawCrossLine(x, y, (res) => {

            })
            this.indicateChart.drawCrossLine(x)

        }
    }
    hideAcrossLine() {
        this.setState({ isShowCrossLine: false })
        this.Chart.clearLine()
        this.indicateChart.clearLine()
    }
    moveTouch(e) {
        if (e.touches.length === 1) {
            const x = e.touches[0].clientX;
            this.indicateChart.drawCrossLine(x)
            this.Chart.drawCrossLine(x)

        }
    }
    render() {
        const { stockId } = this.props
        return (
            <div className="miniute-wrapper">
                <canvas className='canvas1' width={win_width * 2} height={(520 / 750) * win_width * 2} style={{ width: win_width, height: (520 / 750) * win_width }}
                    onTouchStart={this.showAcrossLine.bind(this)} onTouchEnd={this.hideAcrossLine.bind(this)} onTouchMove={this.moveTouch.bind(this)} ref={(minChart1) => this.minChart1 = minChart1}>
                </canvas>
                <canvas className='canvas2' width={win_width * 2} height={(160 / 750) * win_width * 2} style={{ width: win_width, height: (160 / 750) * win_width }}
                    onTouchStart={this.showAcrossLine.bind(this)} onTouchEnd={this.hideAcrossLine.bind(this)} onTouchMove={this.moveTouch.bind(this)} ref={(minChart2) => this.minChart2 = minChart2}>
                </canvas>

            </div>
        )
    }
}