import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, List, ListItem, ListItemText } from "@mui/material";

const SpotifySearch = ({onTrackSave}) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [token, setToken] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

    // Apelare automată când query-ul se schimbă
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query) searchSongs();
        }, 500); // Așteaptă 500ms după ce utilizatorul a tastat

        return () => clearTimeout(delayDebounce); // Curăță timeout-ul
    }, [query, token]);

    // Obține token la montare
    useEffect(() => {
        getAuthToken();
    }, []);

    // Obține tokenul de autentificare
    const getAuthToken = async () => {
        const clientId = "3d889e63395e4bdb9ff8c447c41f23b1";
        const clientSecret = "330d10e440114439ab77d79286cac9f3";
        const authString = btoa(`${clientId}:${clientSecret}`);

        try {
            const response = await axios.post(
                "https://accounts.spotify.com/api/token",
                "grant_type=client_credentials",
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Basic ${authString}`,
                    },
                }
            );

            setToken(response.data.access_token);
            console.log("Token obținut:", response.data.access_token);
        } catch (error) {
            console.error("Eroare la obținerea tokenului:", error.response?.data || error);
        }
    };

    // Căutare melodii pe Spotify
    const searchSongs = async () => {
        if (!query.trim()) return;
        if (!token) return;

        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setResults(response.data.tracks.items);
        } catch (error) {
            console.error("Eroare la căutare:", error.response?.data || error);
        }
    };

    const saveTrack = async (track) => {
        const trackObj = {
            name: track.name,
            artist: track.artists[0].name,
            spotifyUrl: track.external_urls.spotify,
            spotifyId: track.id
        };

        console.log("Track obiect trimis către backend:", trackObj);

        try {
            const response = await fetch('http://localhost:8080/api/v1/course/create-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(trackObj),
                withCredentials: true
            });

            if (response.ok) {
                const data = await response.json();  // Așteaptă răspunsul JSON
                console.log("Piesa salvată:", data);

                if (onTrackSave) {
                    onTrackSave(data);  
                    console.log("Track ID trimis către CourseComponent:", data);
                }
            } else {
                // Dacă statusul nu este 2xx, aruncă o eroare
                throw new Error(`Eroare la salvarea piesei: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Eroare la salvarea piesei:", error.response?.data || error);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true); // Deschide dialogul
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setQuery(""); 
        setResults([]); 
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                Add song to course
            </Button>

            {/* Dialogul care conține căutarea pieselor */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>Căutare Piese Spotify</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Caută piesă"
                        variant="outlined"
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchSongs()}
                        margin="normal"
                    />

                    <List>
                        {results.map((track) => (
                            <ListItem key={track.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                                <ListItemText
                                    primary={track.name}
                                    secondary={track.artists[0].name}
                                    style={{ marginBottom: "10px" }}
                                />
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${track.id}`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    style={{ marginBottom: "10px", borderRadius: "8px" }}
                                ></iframe>
                                <br />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => saveTrack(track)}
                                    style={{
                                        backgroundColor: "#1DB954", // Spotify Green
                                        padding: "10px 20px",
                                        borderRadius: "20px",
                                    }}
                                >
                                    Salvează piesa
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Închide
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SpotifySearch;
