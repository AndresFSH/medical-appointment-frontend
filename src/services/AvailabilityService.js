import {api} from './api';

export async function getAvailabilitySlots(doctorId, date, appointmentTypeId) {
    return api.get(`/availability/doctors/${doctorId}?date=${date}&appointmentTypeId=${appointmentTypeId}`);
}