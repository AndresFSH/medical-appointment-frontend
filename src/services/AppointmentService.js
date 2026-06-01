import {api} from './api';

const APPOINTMENT_URL= '/appointments';

export async function createAppointment(data){
    return api.post(APPOINTMENT_URL, data);
}

export async function getAppointmentById(id) {
    return api.get(`${APPOINTMENT_URL}/${id}`);
}

export async function getAppointments() {
    return api.get(APPOINTMENT_URL);
}

export async function confirmAppointment(id) {
    return api.put(`${APPOINTMENT_URL}/${id}/confirm`);
}

export async function cancelAppointment(id, cancellationReason) {
    return api.put(`${APPOINTMENT_URL}/${id}/cancel`, { cancellationReason });
}

export async function completeAppointment(id, observations) {
    return api.put(`${APPOINTMENT_URL}/${id}/complete`, { observations });
}

export async function setAsNoShowAppointment(id) {
    return api.put(`${APPOINTMENT_URL}/${id}/no-show`);
}