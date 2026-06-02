import {api} from './api';

const DOCTOR_URL = '/doctors';

export async function createDoctor(doctor) {
    return api.post(DOCTOR_URL, doctor);
}

export async function getDoctorById(id) {
    return api.get(`${DOCTOR_URL}/${id}`);
}

export async function getAllDoctors() {
    return api.get(DOCTOR_URL);
}

export async function updateDoctor(id, doctor) {
    return api.put(`${DOCTOR_URL}/${id}`, doctor);
}