export default function boll(dayCount, data) {
  let mbList = [], upList = [], downList = [];
  const allData = data
  for (var i = 0, len = allData.values.length; i < len; i++) {
    if (i < dayCount) {
      mbList.push('-');
      upList.push('-');
      downList.push('-');
      continue;
    }
    let sum = 0, sum1 = 0, sum2 = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += allData.values[i - j][3];
    }
    for (let j = 0; j < (dayCount - 1); j++) {
      sum1 += allData.values[i - j][3];
    }

    let ma = sum / dayCount
    let mb = sum1 / (dayCount - 1)

    for (let k = 0; k < dayCount; k++) {
      let c = allData.values[i - k][3]
      sum2 += Math.pow((c - ma), 2)
    }
    let md = Math.sqrt(sum2 / dayCount)
    let up = mb + 2 * md
    let down = mb - 2 * md
    mbList.push(Number(parseFloat(mb).toFixed(2)))
    upList.push(Number(parseFloat(up).toFixed(2)))
    downList.push(Number(parseFloat(down).toFixed(2)))
  }

  return {
    mb: mbList,
    up: upList,
    down: downList
  }
}



