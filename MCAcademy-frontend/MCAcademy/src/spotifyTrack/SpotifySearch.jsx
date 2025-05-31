import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, List, ListItem, ListItemText } from "@mui/material";

import SpotifyTrackCSS from './spotifyTrack.module.css'

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

    // Gets authorization to use spotify track
    const getAuthToken = async () => {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
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
            console.error("Error:", error.response?.data || error);
        }
    };

    // Build spotify track object
    const handleTrackSelect = (track) => {
        setSelectedTrack({
            name: track.name,
            artist: track.artists[0]?.name,
            spotifyUrl: track.external_urls?.spotify,
        });

        handleCloseDialog();
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth={false}
                PaperProps={{ className: SpotifyTrackCSS.dialogPaper }}>

                {/* Search spotify tracks */}
                <DialogTitle className={SpotifyTrackCSS.dialogTitle}>Search Spotify track</DialogTitle>
                <DialogContent className={SpotifyTrackCSS.dialogContent}>
                    <TextField
                        label="Search track"
                        variant="outlined"
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key == 'Enter' && searchSongs()}
                        margin="normal"
                        className={SpotifyTrackCSS.textField}
                    />

                    {/* List of spotify tracks */}
                    <List className={SpotifyTrackCSS.list}>
                        {results.map((track) => (
                            <ListItem
                                key={track.id}
                                className={SpotifyTrackCSS.listItem}
                            >
                                <ListItemText
                                    primary={track.name}
                                    secondary={track.artists[0].name}
                                    className={SpotifyTrackCSS.listItemText}
                                />
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${track.id}`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    className={SpotifyTrackCSS.iframe}
                                    title={`Spotify track ${track.name}`}
                                ></iframe>
                                <br />
                                <Button
                                    variant="contained"
                                    onClick={() => handleTrackSelect(track)}
                                    className={SpotifyTrackCSS.selectButton}
                                >
                                    Select track
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions className={SpotifyTrackCSS.dialogActions}>
                    <Button onClick={handleCloseDialog} className={SpotifyTrackCSS.closeButton}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SpotifySearch;
