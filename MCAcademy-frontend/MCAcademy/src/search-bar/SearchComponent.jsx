import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"
import "./searchcomponent.css"

import { useEffect, useState } from "react";

const SearchComponent = ({ instructors, onSelectInstructor }) => {
    const [filteredInstructors, setFilteredInstructors] = useState(instructors);

    useEffect(() => {
        setFilteredInstructors(instructors);
    }, [instructors]);

    return (
        <div className="search-container">
                <SearchBar
                    data={instructors}
                    setResults={setFilteredInstructors}
                    type="users"
                />
                <SearchResults
                    results={filteredInstructors}
                    onSelectInstructor={onSelectInstructor}
                />
        </div>
    );
};

export default SearchComponent;