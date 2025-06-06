const url = 'http://localhost:8080/api/v1/course';

export const assignFilesToCourse = async (courseFilesobj, token) => {
    try {
        await fetch(`${url}/assign-files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseFilesobj),
            withCredentials: true
        });

    } catch (err) {
        console.error("Error: ", err);
    }
};

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
        await fetch(`${url}/${instructorId}/assign-students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignCourses),
            withCredentials: true
        });

    } catch (err) {
        console.error("Error: ", err);
    }
};

export const deleteCourse = async (instructorId, courseId, token) => {
    try {
        await fetch(`${url}/${instructorId}/delete/${courseId}`, {
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
        await fetch(`${url}/mark-history/${courseId}`, {
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