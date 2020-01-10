## stockchart of react in mobile

Create highly customizable stock charts in mobile

Built with React 

### Installation
```
npm install --save stockchart-react-h5

```

### Usage
```
import {  KChart, MinChart, splitData, splitDataMin, klineTestData, minTestData } from 'stockchart-react-h5'

class App extends Component {
  componentDidMount() {
    this.initKline()
    this.initMinLine()
  }
  initKline() {
    const values = splitData(klineTestData)
    const option = {
      alerts: [
        { time: "20191126", type: 1 },
        { time: "20191211", type: 3 }
      ]
    }
    this.chart.init(values, option)
  }

  initMinLine() {
    const values = splitDataMin(minTestData)
    this.minchart.init(values)
  }

  render() {
    return (
      <div className="App">
        <KChart
          ref={chart => this.chart = chart}
        />
        <br />
        <MiniuteGraph
          ref={chart => this.minchart = chart}
        />
      </div>
    )
  }
}

```

####  tips:
klineTestData and minTestData is test data

#### data format for one item
```
["min_time","open_px","high_px","low_px","close_px","business_amount","business_balance"]
```
#### data format example
```
[
    [202001070931,3085.49,3088.16,3085.49,3087.49,7356204,7383898321],
    [202001070932,3088.0,3089.95,3087.7,3089.61,3230937,3398731435],
    [202001070935,3090.62,3090.62,3089.36,3090.09,2943816,3157349039],
    .......
]

```

### contact
if you has some question, can contact with me
QQ:53799906  wecheat:clark0124

##### more options and api will update in future

