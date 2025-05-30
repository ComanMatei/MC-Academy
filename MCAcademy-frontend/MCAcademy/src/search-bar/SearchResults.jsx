import SeachResultCSS from "./searchResults.module.css";
import SearchBarCSS from "./searchBar.module.css";

const SearchResults = ({ results = [], onSelectInstructor }) => {
    return (
        <div className={SearchBarCSS.resultsList}>
            {results.length > 0 ? (
                results.map((result, index) => (
                    <div
                        key={result.id || `${result.firstname}-${result.lastname}-${index}`}
                        className={SeachResultCSS.resultItem}
                        onClick={() => onSelectInstructor(result)}
                    >
                        {result.firstname} {result.lastname}
                    </div>
                ))
            ) : (
                <p>No instructors found.</p>
            )}
        </div>
    );
};

export default SearchResults;
