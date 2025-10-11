const BACKEND_BASE_URL = "http://localhost:5000"; 

async function renewAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        window.location.href = 'login.html'; 
        return null;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access); 
            return data.access;
        } else {
            window.location.href = 'login.html'; 
            return null;
        }
    } catch (error) {
        return null;
    }
}

async function authenticatedFetch(url, options = {}, retry = true) {
    let accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.href = 'login.html';
        return null;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
    };

    let response = await fetch(url, options);

    if ((response.status === 401 || response.status === 403) && retry) {
        const newAccessToken = await renewAccessToken();

        if (newAccessToken) {
            options.headers['Authorization'] = `Bearer ${newAccessToken}`;
            response = await authenticatedFetch(url, options, false); 
        } else {
            return null;
        }
    }
    
    return response;
}