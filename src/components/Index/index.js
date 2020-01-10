import React, { Component } from 'react';
import './index.css'

import StockChart from '../StockChart/StockChart'
import MiniuteGraph from '../MiniuteGraph/MiniuteGraph'
import { splitDataMin, splitData } from "../../utils/util";
import { minTestData } from '../../../min'
import { klineTestData } from '../../../data.kline'

class Index extends Component {
  constructor() {
    super()
    this.state = {

    }
  }
  componentDidMount() {
    this.initKline()
    this.initMinLine()
  }

  initKline() {
    let values = splitData(klineTestData)
    const option = {
      alerts: [
        { time: "20191126", type: 1 },
        { time: "20191211", type: 3 }
      ]
    }
    this.chart.init(values, option)
  }

  initMinLine() {
    let values = splitDataMin(minTestData)
    this.minchart.init(values)
  }

  render() {
    return (
      <div className="App">
        <div className="header-title">stockchart of react in mobile</div>
        <StockChart
          ref={chart => this.chart = chart}
        />
        <br />
        <MiniuteGraph
          ref={chart => this.minchart = chart}
        />
      </div>
    );
  }
}

export default Index;
