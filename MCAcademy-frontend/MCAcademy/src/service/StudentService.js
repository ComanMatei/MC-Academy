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
            withCredentials: true
        })

        if (response.ok) {
            const data = await response.json();
            console.log(data);

            return data;
        }
    } catch (err) {
        console.error("Erorr:", err);
    }
}

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