import StockChart from './components/Index/index'
import KChart from './components/StockChart/StockChart'
import MinChart from './components/MiniuteGraph/MiniuteGraph'
import { splitData, splitDataMin } from './utils/util'
import { klineTestData } from '../data.kline'
import { minTestData } from '../min'

export { StockChart, KChart, MinChart, splitData, splitDataMin, klineTestData, minTestData }