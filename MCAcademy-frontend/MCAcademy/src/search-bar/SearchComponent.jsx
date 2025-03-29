import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"
import "./searchcomponent.css"

import { useState } from "react";

const SearchComponent = ({ instructors = [], onSelectInstructor }) => {

    const [results, setResults] = useState([]);

    return (
        <div className="container">
            <div className="search-bar-container">
                <SearchBar data={instructors} setResults={setResults} type="instructors"/>
                <SearchResults results={results.length > 0 ? results : instructors} onSelectInstructor={onSelectInstructor} />
            </div>
        </div>
    )
}

export default SearchComponent