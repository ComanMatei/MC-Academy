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
            console.log("Spec: " + data);

            return data;
        } else {
            console.error('Error:', response.status);
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
            console.log(data);

            return data;
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
            console.log(data);

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
        console.error("Eroare la fetch:", err);
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

        if (response.ok) {
            console.log("Student validated successfully");
        }
    } catch (err) {
        console.error("Eroare la fetch:", err);
    }
};