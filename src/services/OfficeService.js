import {api} from './api';

const OFFICE_URL = '/offices';

export async function createOffice(office) {
    return api.post(OFFICE_URL, office);
}

export async function getOffices() {
    return api.get(OFFICE_URL);
}

export async function updateOffice(id, office) {
    return api.put(`${OFFICE_URL}/${id}`, office);
}