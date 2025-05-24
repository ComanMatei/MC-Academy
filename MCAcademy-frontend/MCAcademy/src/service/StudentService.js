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
            console.log("Received data:", data);

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

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return { success: true, data };
        } else {
            let error = {};
            if (contentType && contentType.includes('application/json')) {
                error = await response.json();
            } else {
                error.message = await response.text();
            }

            console.error("Backend error:", error);
            return { success: false, error };
        }
    } catch (err) {
        console.error("Network/client error:", err);
        return { success: false, error: { message: err.message } };
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