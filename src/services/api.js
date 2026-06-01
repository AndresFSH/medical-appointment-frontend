const API_URL = 'http://localhost:8080/api';

function getToken(){
    const user = localStorage.getItem('user');
    if(!user) return null;
    return JSON.parse(user).accessToken;
}

async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if(token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if(response.status === 204){
        return null;
    }

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message || 'Error ${response.status}');
    }

    return data;
}

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
};

export default api;