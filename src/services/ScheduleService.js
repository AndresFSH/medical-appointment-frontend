import {api} from './api';

export async function createSchedule(doctorId, data) {
    return api.post(`/doctors/${doctorId}/schedules`, data);
}

export async function getDoctorSchedule(doctorId) {
    return api.get(`/doctors/${doctorId}/schedules`);
}