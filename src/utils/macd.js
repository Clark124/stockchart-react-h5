
function formartNumber(n) {
  return Number(n.toFixed(2));
}

function calcEMA(n, preEMA, close) {
  let value = 2 / (n + 1) * close + (n - 1) / (n + 1) * preEMA
  return value
}


function EMAList(n, data) {
  let emaList = []
  for (var i = 0; i < data.length; i++) {
    if (i === 0) {
      emaList.push(data[i][3])
    } else {
      emaList.push(calcEMA(n, emaList[i - 1], data[i][3]))
    }
  }
  return emaList
}

function calcDif(data) {

  let EMAS = EMAList(12, data);
  let EMAL = EMAList(26, data);

  let DIFs = [];
  for (let i = 0; i < EMAL.length; i++) {
    DIFs.push(formartNumber(EMAS[i] - EMAL[i]));
  }
  return DIFs;
}

function calcDEA(dif, data, n) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(0);
    } else {
      result.push(formartNumber(calcEMA(n, result[i - 1], dif[i])));
    }
  }
  return result;
}

export default function calcMACD(data) {
  let dif = calcDif(data);
  let dea = calcDEA(dif, data, 9);
  let bar = [];
  for (let i = 0; i < data.length; i++) {
    bar.push(2 * (formartNumber(dif[i] - dea[i])));
  }
  return {
    dif,
    dea,
    bar
  };
}





