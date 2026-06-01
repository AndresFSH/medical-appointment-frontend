import {api} from './api';

const REPORT_URL = '/reports';

export async function getOfficeOccupancy(from, to) {
    return api.get(`${REPORT_URL}/office-occupancy?from=${from}&to=${to}`);
}

export async function getDoctorProductivity() {
    return api.get(`${REPORT_URL}/doctor-productivity`);
}

export async function getNoShowPatients(from, to) {
    return api.get(`${REPORT_URL}/no-show-patients?from=${from}&to=${to}`);
}