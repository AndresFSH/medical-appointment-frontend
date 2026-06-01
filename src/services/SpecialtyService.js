import {api} from './api';

const SPECIALTY_URL = '/specialties';

export async function createSpecialty(name) {
    return api.post(SPECIALTY_URL, { name });
}

export async function getSpecialties() {
    return api.get(SPECIALTY_URL);
}

