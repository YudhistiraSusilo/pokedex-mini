import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    const raw = query.trim();

    if (raw === "") {
      setError("Type a Pokémon name or number first.");
      return;
    }

    // "#12" or "12" → pokeapi supports lookup by id as well as name.
    const target = raw.replace(/^#/, "").toLowerCase();
    const idMatch = target.match(/^(\d{1,4})$/);
    const url = idMatch ? idMatch[1] : target;

    setError(null);
    navigate(`/pokemon/${url}`);
    setQuery("");
  }

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Search by name or number…"
          className="search-input"
          aria-label="Search Pokémon by name or number"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error ? (
        <p className="status status-error">{error}</p>
      ) : (
        <p className="search-hint">Tip: try “charizard” or “#25”</p>
      )}
    </div>
  );
}

export default SearchForm;
