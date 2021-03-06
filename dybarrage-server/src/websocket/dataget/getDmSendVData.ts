import { RoomUtil } from '../RoomManager';
import IGetChartData from './IGetChartData';
import { clientConfig, DATA_SEND_INTERVAL } from '../../config';
import * as moment from 'moment';

const arrLen = 120;

const getXAxis = (): Array<string> => {
  let res = [];
  let now = Date.now();

  for (let i = arrLen; i > 0; i--) {
    res.push(moment(now).format('HH:mm:ss'));
    now -= DATA_SEND_INTERVAL;
  }
  return res;
};

const getStyle = () => {
  return JSON.stringify({
    title: {
      text: '实时弹幕发送速度',
      x: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: clientConfig.primaryColor
        }
      },
      formatter: `{b} 速度{c}条/s`
    },
    xAxis: {
      name: '时间',
      type: 'category',
      data: getXAxis(),
      boundaryGap: true,
      axisTick: {
        alignWithLabel: true,
        interval: 10
      },
      axisLabel: {
        interval: 10
      }
    },
    yAxis: {
      name: '弹幕发送速度',
      type: 'value'
    },
    series: {
      type: 'line',
      lineStyle: {
        color: clientConfig.primaryColor
      },
      symbol: 'none'
    }
  });
};

const getSeries = async (util: RoomUtil) => {
  const { dmSendV, crawlDmNum } = util;
  if (dmSendV.yData.length === 0) {
    util.dmSendV.yData = Array(arrLen).fill(0);
  }
  if (dmSendV.xData.length === 0) {
    util.dmSendV.xData = getXAxis();
  }

  util.dmSendV.xData.shift();
  util.dmSendV.yData.shift();
  util.dmSendV.yData.push((crawlDmNum - dmSendV.lastCrawlDmNum) / (DATA_SEND_INTERVAL / 1000));
  util.dmSendV.xData.push(moment(Date.now()).format('HH:mm:ss'));
  util.dmSendV.lastCrawlDmNum = crawlDmNum;

  return JSON.stringify({
    series: {
      data: dmSendV.yData
    },
    xAxis: {
      data: dmSendV.xData
    }
  });
};

const getDmSendVData: IGetChartData = {
  getStyle,
  getSeries
};

export default getDmSendVData;
