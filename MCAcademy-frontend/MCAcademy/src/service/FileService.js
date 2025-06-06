
// Create images for components
export const createImages = async (files, token) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('file', file);
    });

    try {
        const response = await fetch('http://localhost:8080/api/v1/file/create-image', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                return data;
            } else {
                console.error("Unexpected response structure:", data);
            }
        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Failed to upload files:', error);
    }
};

// Create videos for components
export const createVideos = async (files, token) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('file', file);
    });

    try {
        const response = await fetch('http://localhost:8080/api/v1/file/create-video', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {

                return data;
            } else {
                console.error("Unexpected response structure:", data);
            }
        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Failed to upload files:', error);
    }
};

// Create profile picture
export const createprofilePicture = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('file', file);
    });

    try {
        const response = await fetch('http://localhost:8080/api/v1/file/profile-pic', {
            method: 'POST',
            body: formData,
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {

                return data;
            }
        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Failed to upload files:', error);
    }
};