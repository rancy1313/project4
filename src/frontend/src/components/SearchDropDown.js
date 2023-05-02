import { useState, useEffect } from 'react';
import { FormControl } from 'react-bootstrap';


const SearchDropdown = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // fetch search results from API using the query
    // and update the results state
    const fetchResults = async () => {
      //const response = await fetch(`https://api.example.com/search?q=${query}`);
      //const data = await response.json();
      //setResults(data.results);
      setResults([{"id":"1", "title":"blue"}])
    };
    fetchResults();
  }, [query]);

  return (
    <div className="search-dropdown-container">
      <FormControl
        className="search-dropdown-input"
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <div className="search-dropdown-results">
          {results.map((result) => (
            <div
              key={result.id}
              className="search-dropdown-item"
              onClick={() => {
                setQuery(result.title);
                setResults([]);
              }}
            >
              {result.title}
            </div>
          ))}
          <button className="search-dropdown-button">View All Results</button>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;

