import {api} from './api';

const PATIENT_URL = '/patients';

export async function createPatient(patient) {
    return api.post(PATIENT_URL, patient);
}

export async function getPatientById(id) {
    return api.get(`${PATIENT_URL}/${id}`);
}

export async function getAllPatients() {
    return api.get(PATIENT_URL);
}

export async function updatePatient(id, patient) {
    return api.put(`${PATIENT_URL}/${id}`, patient);
}