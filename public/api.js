export function getApiBaseUrl() {
    const currentUrl = window.location.origin;

    if (currentUrl.includes('onrender.com')) {
        return currentUrl + '/api';
    }

    return 'http://localhost:3000/api';
}

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Error ${response.status}: ${message}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error API:", error);

        if (error.message.includes("Failed to fetch")) {
            throw new Error("OFFLINE_MODE");
        }

        throw error;
    }
}
