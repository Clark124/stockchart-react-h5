import axios from 'axios';

export function post(url, data, isformData = false) {
  return new Promise((resolve, reject) => {
    let header = isformData ? null : { 'Content-type': 'application/json' };
    axios.post(url, data, header
    ).then(res => {
      console.log(res)
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

export function get(url, data) {
  return new Promise((resolve, reject) => {
    axios.get(url, { params: data }, {
    }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}

export const splitData = (rawData) => {
  var categoryData = [];
  var values = []
  let vol = []
  let changeRate = []
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0]);
    vol.push(rawData[i].splice(4, 5)[0])
    values.push(rawData[i])
    if (i > 0) {
      const change = ((rawData[i][3] - rawData[i - 1][3]) / rawData[i - 1][3]) * 100
      changeRate.push(change)
    } else {
      changeRate.push(0)
    }
  }
  return {
    categoryData: categoryData,
    values: values,
    vol,
    changeRate,
  };
}

export function splitDataMin(rawData) {
  var categoryData = [];
  var values = []
  let vol = []
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0]);
    vol.push(rawData[i].splice(4, 2)[0])
    values.push(rawData[i])
  }
  return {
    categoryData: categoryData,
    values: values,
    vol,
  };
}