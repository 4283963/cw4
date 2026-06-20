import request from '@/utils/request';

export function getDrugList(params) {
  return request({
    url: '/drugs',
    method: 'get',
    params
  });
}

export function getDrugDetail(id) {
  return request({
    url: `/drugs/${id}`,
    method: 'get'
  });
}

export function createDrug(data) {
  return request({
    url: '/drugs',
    method: 'post',
    data
  });
}

export function getDrugConflictList(params) {
  return request({
    url: '/drug-conflicts',
    method: 'get',
    params
  });
}

export function createDrugConflict(data) {
  return request({
    url: '/drug-conflicts',
    method: 'post',
    data
  });
}

export function checkDrugIdsConflicts(drugIds) {
  return request({
    url: '/drug-conflicts/check',
    method: 'post',
    data: { drugIds }
  });
}
