import {api} from './api';

const TYPE_URL = '/appointment-types';

export async function createAppointmentType(name, durationMinutes) {
    return api.post(TYPE_URL, { name, durationMinutes });
}

export async function getAppointmentTypes() {
    return api.get(TYPE_URL);
}
