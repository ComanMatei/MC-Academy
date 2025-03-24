import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, List, ListItem, ListItemText } from "@mui/material";

const SpotifySearch = ({ openDialog, setOpenDialog, setSelectedTrack }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [token, setToken] = useState("");

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query) searchSongs();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query, token]);

    useEffect(() => {
        getAuthToken();
    }, []);

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
            console.log("Token obtained:", response.data.access_token);
        } catch (error) {
            console.error("Error getting token: ", error.response?.data || error);
        }
    };

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

    const handleTrackSelect = (track) => {
        console.log("Selected track:", track);
        setSelectedTrack(track); 
        handleCloseDialog();
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div>
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>Căutare Piese Spotify</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Search track"
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
                                    onClick={() => handleTrackSelect(track)} 
                                    style={{
                                        backgroundColor: "#1DB954", 
                                        padding: "10px 20px",
                                        borderRadius: "20px",
                                    }}
                                >
                                    Selectează piesa
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
