import {api} from './api';

const DOCTOR_URL = '/doctors';

export async function createDoctor(fullname, specialtyId) {
    return api.post(DOCTOR_URL, { fullname, specialtyId });
}

export async function getDoctorById(id) {
    return api.get(`${DOCTOR_URL}/${id}`);
}

export async function getAllDoctors() {
    return api.get(DOCTOR_URL);
}

export async function updateDoctor(id, fullname, active,specialtyId) {
    return api.put(`${DOCTOR_URL}/${id}`, { fullname, active, specialtyId });
}