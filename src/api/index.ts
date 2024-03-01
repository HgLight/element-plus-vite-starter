import { http } from '../utils/http';

import { getConfig } from '~/config';
import { getBaseUrl } from '~/utils/http';

// 获取服务器时间
export const getTime = (params?: object) => {
  return http.request<any>(
    'get',
    getBaseUrl('DOMAIN_BUS') + '/api/Home/GetTime',
    {
      params,
    }
  );
};
