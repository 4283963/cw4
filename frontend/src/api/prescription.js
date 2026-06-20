import request from '@/utils/request';

export function getPrescriptionList(params) {
  return request({
    url: '/prescriptions',
    method: 'get',
    params
  });
}

export function getPrescriptionDetail(id) {
  return request({
    url: `/prescriptions/${id}`,
    method: 'get'
  });
}

export function createPrescription(data) {
  return request({
    url: '/prescriptions',
    method: 'post',
    data
  });
}

export function updatePrescription(id, data) {
  return request({
    url: `/prescriptions/${id}`,
    method: 'put',
    data
  });
}

export function submitForReview(id) {
  return request({
    url: `/prescriptions/${id}/submit-review`,
    method: 'post'
  });
}

export function deletePrescription(id) {
  return request({
    url: `/prescriptions/${id}`,
    method: 'delete'
  });
}

export function firstReview(id, data) {
  return request({
    url: `/prescriptions/${id}/first-review`,
    method: 'post',
    data
  });
}

export function secondReview(id, data) {
  return request({
    url: `/prescriptions/${id}/second-review`,
    method: 'post',
    data
  });
}

export function getReviewRecords(id) {
  return request({
    url: `/prescriptions/${id}/review-records`,
    method: 'get'
  });
}

export function getReviewStatistics() {
  return request({
    url: '/prescriptions/statistics',
    method: 'get'
  });
}

export function checkPrescriptionConflicts(id) {
  return request({
    url: `/prescriptions/${id}/check-conflicts`,
    method: 'get'
  });
}

export function verifyPrescriptionByToken(token) {
  return request({
    url: `/prescriptions/verify/${token}`,
    method: 'get'
  });
}
