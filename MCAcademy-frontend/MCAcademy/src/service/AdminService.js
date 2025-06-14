export const usersValidation = async (adminId, userId, answer, token) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/${adminId}/validation/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answer }),
            withCredentials: true
        });

        const contentType = response.headers.get('Content-Type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            const errorData = isJson ? await response.json() : { message: 'Unknown error' };
            throw {
                status: response.status,
                message: errorData.message || 'An error occurred'
            };
        }

        return await response.json();

    } catch (err) {
        console.error("Error to fetch:", err);
        throw err;
    }
};
