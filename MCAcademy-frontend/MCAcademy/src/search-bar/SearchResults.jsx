import "./searchResults.css";

const SearchResults = ({ results = [], onSelectInstructor }) => {
    return (
        <div className="results-list">
            {results.length > 0 ? (
                results.map((result) => (
                    <div 
                        key={result.id} 
                        className="result-item"
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
