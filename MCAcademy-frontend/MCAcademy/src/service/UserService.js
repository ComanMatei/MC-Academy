const url = 'http://localhost:8080/api/v1/user';

export const getUserById = async (id, token) => {
    try {
        const response = await fetch(`${url}/info/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.status === 403) {
            window.location.href = "/unauthorized";
            return;
        }

        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getUsersValidatorById = async (userId, token) => {

    try {
        const response = await fetch(`${url}/validator/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            return data;
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const listOfUsers = async (role, status, token) => {

    try {
        const response = await fetch(`${url}/${role}/${status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            return data;
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getCourse = async (userId, id, token) => {
    try {
        const response = await fetch(`${url}/${userId}/only/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.status === 403) {
            // Redirecționează utilizatorul
            window.location.href = "/unauthorized";
            return;
        }

        if (response.ok) {
            return await response.json();
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

export const getAllInstruments = async (token) => {
    try {
        const response = await fetch(`${url}/instruments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        })

        if (response.ok) {
            const data = await response.json();

            return data;
        }
    } catch (err) {
        console.error("Error:", err);
    }
}