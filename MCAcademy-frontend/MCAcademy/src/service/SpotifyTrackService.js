
export const saveTrack = async (track, token) => {
    const trackObj = {
        name: track.name,
        artist: track.artists[0].name,
        spotifyUrl: track.external_urls.spotify,
        spotifyId: track.id
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/course/create-track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(trackObj),
            withCredentials: true
        });

        if (response.ok) {
            const data = await response.json();

            return data;
        }
    } catch (error) {
        console.error("Error on saving track:", error.response?.data || error);
    }
};