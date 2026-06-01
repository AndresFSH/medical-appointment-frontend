import {api} from './api';

const PATIENT_URL = '/patients';

export async function createPatient(fullname, email) {
    return api.post(PATIENT_URL, { fullname, email });
}

export async function getPatientById(id) {
    return api.get(`${PATIENT_URL}/${id}`);
}

export async function getAllPatients() {
    return api.get(PATIENT_URL);
}

export async function updatePatient(id, fullname, email, status) {
    return api.put(`${PATIENT_URL}/${id}`, { fullname, email, status });
}