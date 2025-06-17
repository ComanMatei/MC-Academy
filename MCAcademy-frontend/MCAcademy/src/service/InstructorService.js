const url = 'http://localhost:8080/api/v1/instructor';

export const getInstructorSpecId = async (validatorId, instrument, token) => {
    try {
        const response = await fetch(`${url}/${validatorId}/spec/${instrument}`, {
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

export const findAllSpec = async (instructorId, token) => {
    try {
        const response = await fetch(`${url}/specs/${instructorId}`, {
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

export const saveSelectedInstrument = async (selectedInstrument, instructorId, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ instrument: selectedInstrument }),
            withCredentials: true
        })

        return response;
        
    } catch (err) {
        console.error("Error:", err);
    }
}

export const getInstrInstruments = async (instructorId, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/instruments`, {
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
        console.error("Error:", err);
    }
};

export const getAssignedStudents = async (instructorId, status, selectedInstrument, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/assigned/${status}?instrument=${selectedInstrument}`, {
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

export const validateStudentSpec = async (instructorId, assignStudentId, answer, token) => {
    try {
        const response = await fetch(`${url}/${instructorId}/validation/${assignStudentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answer: answer }),
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
        console.error("Error:", err);
        throw err;
    }
};