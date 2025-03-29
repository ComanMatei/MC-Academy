import { FaSearch } from "react-icons/fa";
import "./searchBar.css"

import { useState, useEffect } from "react";

const SearchBar = ({ data, setResults, type }) => {
    const [input, setInput] = useState('');

    // Reset text input when refresh 
    useEffect(() => {
        setInput('');
        setResults(data);
    }, [data, setResults]);

    const handleChange = (value) => {
        setInput(value);
        let filteredData;

        if (type == "courses" || type == "instructors") {
            filteredData = data.filter((data) => {
                const fullName = `${data.name}`.toLowerCase();
                return fullName.includes(value.toLowerCase());
            });
        }

        if (type == "users") {
            filteredData = data.filter((item) => {
                const name = `${item.firstname} ${item.lastname}`.toLowerCase();
                return name.includes(value.toLowerCase());
            });
        }

        setResults(filteredData);
    };

    return (
        <div className="input-wrapper">
            <FaSearch id="search-icon" />
            <input placeholder="Type to search..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;