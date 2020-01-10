export function calculateRSI(n, data) {
  var result = [];
  const allData = data
  for (var i = 0, len = allData.length; i < len; i++) {
    if (i < n) {
      result.push('-');
      continue;
    }
    var sum1 = 0, sum2 = 0, RS
    for (var j = 0; j < n; j++) {
      if ((allData[i - j][3] < allData[i - j - 1][3])) {
        sum2 = sum2 + (allData[i - j - 1][3] - allData[i - j][3])
      } else {
        sum1 = sum1 + (allData[i - j][3] - allData[i - j - 1][3])
      }
    }
    RS = sum1 / sum2
    result.push(100 - 100 / (1 + RS));
  }
  return result
}

export default function rsi(data) {
  return {
    rsi1: calculateRSI(6, data),
    rsi2: calculateRSI(12, data),
    rsi3: calculateRSI(24, data),
  }
}