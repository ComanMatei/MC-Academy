const url = 'http://localhost:8080/api/v1/course';

export const getAllCourses = async (instructorId, selectedInstrument, isHistory, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/${isHistory}?instrument=${selectedInstrument}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Fetched courses:", data);

            return data;
        } else {
            console.error('Error:', response.status);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

export const shareCourses = async (instructorId, assignCourses, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/assign-students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignCourses),
            withCredentials: true
        });

        if (response.ok) {
            console.log("Sanded!");
        }
    } catch (err) {
        console.error("Error: ", err);
    }
};

export const deleteCourse = async (instructorId, courseId, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/delete/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        })
    } catch (err) {
        console.error("Error to fetch:", err);
    }
}

export const markCourseAsHistory = async (courseId, token) => {
    try {
        const response = await fetch(`${url}/mark-history/${courseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        })
    } catch (err) {
        console.error("Error to mark course:", err);
    }
}