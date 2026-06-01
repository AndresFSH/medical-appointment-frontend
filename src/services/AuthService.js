import {api} from './api';

const AUTH_URL = '/auth';

export async function login(email, password) {
    return api.post(`${AUTH_URL}/login`, { email, password });
}

export async function register(email, password) {
    return api.post(`${AUTH_URL}/register`, { email, password });
}

export async function createStaff(email, password, roles) {
    return api.post(`${AUTH_URL}/create-staff`, { email, password, roles });
}
