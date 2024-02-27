import * as signalR from "@microsoft/signalr";

import { getBaseUrl } from "./http";

export function getSignalr() {
  // withAutomaticReconnect开启重连，默认重连4次，分别时间间隔为：0、2、10和30秒
  const reconnectTimeArray = [];
  // 重连规则：重连次数<100：间隔3s;重试次数<500:间隔10s;重试次数>500:间隔30s
  for (let i = 1; i < 1000; i++) {
    const count = i / 100;
    let second = 30;
    if (count < 1) {
      second = 3;
    } else if (count < 5) {
      second = 10;
    }
    reconnectTimeArray.push(second * 1000);
  }
  return new signalR.HubConnectionBuilder()
    .withUrl(getBaseUrl("DOMAIN_BUS") + "/SignalR/Hubs/HomeNotifyHub")
    .withAutomaticReconnect(reconnectTimeArray)
    .configureLogging(signalR.LogLevel.Error)
    .build();
}
