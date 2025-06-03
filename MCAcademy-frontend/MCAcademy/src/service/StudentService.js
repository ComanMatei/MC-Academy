const url = 'http://localhost:8080/api/v1/student';

export const getStudentSpecializations = async (studentId, token) => {
    try {
        const response = await fetch(`${url}/${studentId}/specializations`, {
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
        }
    } catch (err) {
        console.error("Error: ", err);
    }
}

export const assignStudent = async (studentId, assign, token) => {
    try {
        const response = await fetch(`${url}/${studentId}/assign-spec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assign),
            credentials: 'include'
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
        throw err;
    }
};

export const getStudentCourses = async (studentId, instructorId, isHistory, instrument, token) => {
    try {
        const response = await fetch(`${url}/${studentId}/courses/${instructorId}/${isHistory}/${instrument}`, {
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
        }
    } catch (err) {
        console.error("Error: ", err);
    }
};

export const instructorSpecs = async (studentId, instrument, token) => {

    try {
        const response = await fetch(`${url}/${studentId}/instructor-spec/${instrument}`, {
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