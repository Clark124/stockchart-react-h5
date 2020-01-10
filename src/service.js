import { get } from './utils/util';

const server = {
    quoteUrl: "https://real.pushutech.com"
}
//获取K线数据
export function getKlineData(data) {
    return get(server.quoteUrl + '/quote/internal/kline', data)
}

//获取股票信息
export function getStockInfo(data) {
    return get(server.quoteUrl + '/quote/realbycode', data)
}
