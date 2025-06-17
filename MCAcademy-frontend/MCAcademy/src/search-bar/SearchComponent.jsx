import { useEffect, useState } from "react";

import SearchBar from "./SearchBar"
import SearchResults from "./SearchResults"

import SearchBarCSS from "./searchBar.module.css";

const SearchComponent = ({ instructors, onSelectInstructor }) => {
    const [filteredInstructors, setFilteredInstructors] = useState(instructors);

    useEffect(() => {
        setFilteredInstructors(instructors);
    }, [instructors]);

    return (
        <div className={SearchBarCSS.searchContainer}>
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