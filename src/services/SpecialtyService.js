import {api} from './api';

const SPECIALTY_URL = '/specialties';

export async function createSpecialty(payload) {
    return api.post(SPECIALTY_URL, payload);
}

export async function getSpecialties() {
    return api.get(SPECIALTY_URL);
}

