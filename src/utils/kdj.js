
var calcLLV, calcHHV, calcSMA, calcRSV;
/*
 * K线数据
 * 开盘价，收盘价，最低价，最高价
 */


/*
 * 计算最小值
 * @param {number} pos 最新值索引
 * @param {number} n 取最小值范围周期
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
calcLLV = function (pos, n, data, field) {
  var i, l, min;
  n--;
  min = data[pos][field];
  l = pos - n;

  // l<0 ? l=0:1;
  l = l < 0 ? 0 : l

  for (i = pos; i >= l; i--) {
    if (min > data[i][field]) {
      min = data[i][field];
    }
  }
  return min;
};

/*
 * 计算最大值
 * @param {number} pos 最新值索引
 * @param {number} n 取最大值范围周期
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
calcHHV = function (pos, n, data, field) {
  var i, l, max;
  n--;
  max = data[pos][field];
  l = pos - n;
  // l<0 ? l=0:1;
  l = l < 0 ? 0 : l
  for (i = pos; i >= l; i--) {
    if (max < data[i][field]) {
      max = data[i][field];
    }
  }
  return max;
};

/*
 * 计算SMA，加权移动平均指标
 * @param {number} n 时间窗口
 * @param {number} m 权重
 * @param {array} data 输入数据
 */
calcSMA = function (n, m, data) {
  var i, l, sma;
  sma = [100];
  for (i = 1, l = data.length; i < l; i++) {
    sma.push((data[i] * m + sma[i - 1] * (n - m)) / n);
  }
  return sma;
};

/*
 * 计算RSV，未成熟随机值指标
 * @param {number} n 计算最高价/最低价的时间窗口
 * @param {array} data 输入股价数据
 */
calcRSV = function (n, data) {
  var i, l, rsv, low, tempValue;
  rsv = [];
  for (i = 0, l = data.length; i < l; i++) {
    low = calcLLV(i, n, data, "low");
    tempValue = 100 * (data[i].close - low) / (calcHHV(i, n, data, "high") - low);
    if (isNaN(tempValue)) {
      if (i === 0) {
        tempValue = 100;
      } else {
        tempValue = rsv[i - 1];
      }
    }
    rsv.push(tempValue);
  }
  return rsv;
};

/*
 * 计算KDJ
 * @param {number} n 计算rsv的时间窗口
 * @param {number} m1 计算K的时间窗口
 * @param {number} m2 计算D的时间窗口
 */

export function calcKDJ(n, m1, m2, data) {
  var i, l, rsv, k, d, j;
  rsv = calcRSV(n, data);
  k = calcSMA(m1, 1, rsv);
  d = calcSMA(m2, 1, k);
  j = [];
  for (i = 0, l = k.length; i < l; i++) {
    j.push(3 * k[i] - 2 * d[i]);
  }
  return {
    k: k,
    d: d,
    j: j
  };
};

// kdj=calcKDJ(9,3,3,input);
// console.log("K:",kdj.k);
// console.log("D:",kdj.d);
// console.log("J:",kdj.j);

