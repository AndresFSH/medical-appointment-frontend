import {api} from './api';

const TYPE_URL = '/appointment-types';

export async function createAppointmentType(type) {
    return api.post(TYPE_URL, type);
}

export async function getAppointmentTypes() {
    return api.get(TYPE_URL);
}
