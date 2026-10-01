import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";

const PAGE_SIZE = 20;

function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs so async requests can't overwrite newer state after unmount,
  // and the offset can grow without re-running the effect.
  const offsetRef = useRef(0);
  const isMountedRef = useRef(true);

  // Load one page and append it. Lifted out of the effect so both the
  // initial load and "Load more" can share it (only touches refs + setters).
  async function loadPage(offset) {
    const response = await fetch(
      `${API_BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const fetched = data.results || [];
    offsetRef.current += fetched.length;

    setPokemons((prev) => {
      const seen = new Set(prev.map((p) => p.name));
      return [...prev, ...fetched.filter((p) => !seen.has(p.name))];
    });
    setHasMore(fetched.length >= PAGE_SIZE);
  }

  useEffect(() => {
    isMountedRef.current = true;

    async function loadFirstPage() {
      setIsLoading(true);
      setError(null);
      try {
        await loadPage(0);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function loadMore() {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadPage(offsetRef.current);
    } catch {
      // Keep what's already loaded; the user can retry.
      setHasMore(true);
    } finally {
      if (isMountedRef.current) setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return <p className="status">Loading Pokémon…</p>;
  }

  if (error) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  return (
    <>
      <ul className="pokemon-list">
        {pokemons.map((pokemon) => {
          const id = getIdFromUrl(pokemon.url);
          return (
            <li key={pokemon.name} className="pokemon-list-item">
              <Link to={`/pokemon/${pokemon.name}`} className="pokemon-link">
                <img
                  className="pokemon-sprite"
                  src={getSpriteUrl(id)}
                  alt={pokemon.name}
                  width={72}
                  height={72}
                  loading="lazy"
                />
                <span className="pokemon-id">#{id.padStart(3, "0")}</span>
                <span className="pokemon-name">{capitalize(pokemon.name)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="load-more">
        <button
          type="button"
          className="load-more-button"
          onClick={loadMore}
          disabled={!hasMore || isLoadingMore}
        >
          {isLoadingMore ? "Loading…" : hasMore ? "Load more" : "All Pokémon loaded"}
        </button>
      </div>
    </>
  );
}

export default PokemonList;
