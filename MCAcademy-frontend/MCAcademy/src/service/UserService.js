
export const getUserByEmail = async (email) => {

    try {
        const response = await fetch(`http://localhost:8080/api/v1/user/email/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);

            return data;
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getUserById = async (id) => {

    try {
        const response = await fetch(`http://localhost:8080/api/v1/user/id/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);

            return data;
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getInstructor = async (email) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/instructor/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            return data;
        }
        else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getStudent = async (email) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/student/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            return data;
        }
        else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}