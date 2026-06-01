import {api} from './api';

const OFFICE_URL = '/offices';

export async function createOffice(name, location) {
    return api.post(OFFICE_URL, { name, location });
}

export async function getOffices() {
    return api.get(OFFICE_URL);
}

export async function updateOffice(id, name, location, status) {
    return api.put(`${OFFICE_URL}/${id}`, { name, location, status });
}