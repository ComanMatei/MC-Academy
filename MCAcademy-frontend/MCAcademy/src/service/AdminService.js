

export const usersValidation = async (validatorId, id, answer, token) => {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/${validatorId}/validation/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answer: answer }),
            withCredentials: true
        });

        if (response.ok) {
            console.log(await response.json());

        }
    } catch (err) {
        console.error("Error to fetch:", err);
    }
};