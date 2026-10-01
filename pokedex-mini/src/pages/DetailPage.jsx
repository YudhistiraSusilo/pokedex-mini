import { useEffect, useState, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getSpriteUrl, getTypeColor, formatHeight, formatWeight, parseEvolutionChain } from "../utils.js";

function DetailPage() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);
      setEvolution([]);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);

        if (response.status === 404) {
          throw new Error(`We couldn't find a Pokémon named "${capitalize(name)}".`);
        }

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        if (!isCurrent) return;
        setPokemon(data);

        // Load the evolution chain so we can show the full family.
        try {
          const speciesRes = await fetch(data.species.url);
          if (speciesRes.ok) {
            const species = await speciesRes.json();
            const chainRes = await fetch(species.evolution_chain.url);
            if (chainRes.ok) {
              const chain = await chainRes.json();
              if (isCurrent) {
                setEvolution(parseEvolutionChain(chain.chain));
              }
            }
          }
        } catch {
          // Evolution data is a nice-to-have; a missing chain shouldn't
          // break the rest of the page.
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isCurrent = false;
    };
  }, [name]);

  if (isLoading) {
    return (
      <p className="status">
        Loading <span className="capitalize">{name}</span>…
      </p>
    );
  }

  if (error) {
    return (
      <div className="detail-page status-block">
        <div className="status-emoji" aria-hidden="true">
          🔍
        </div>
        <p className="status status-error">{error}</p>
        <Link to="/" className="back-link">
          ← Back to list
        </Link>
      </div>
    );
  }

  const officialArt = pokemon.sprites?.other?.["official-artwork"]?.front_default;
  const artwork = officialArt || getSpriteUrl(pokemon.id);
  const abilities = (pokemon.abilities || [])
    .filter((a) => !a.is_hidden)
    .slice(0, 3);

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">
        ← Back to list
      </Link>

      <div className="detail-card">
        <div className="detail-art" style={{ background: getTypeColor(pokemon.types?.[0]?.type?.name) }}>
          <img
            src={artwork}
            alt={pokemon.name}
            width={150}
            height={150}
          />
        </div>

        <p className="detail-id">#{String(pokemon.id).padStart(3, "0")}</p>
        <h2>{capitalize(pokemon.name)}</h2>

        <div className="type-badges">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className="type-badge"
              style={{ background: getTypeColor(t.type.name) }}
            >
              {capitalize(t.type.name)}
            </span>
          ))}
        </div>

        <dl className="detail-meta">
          <div>
            <dt>Height</dt>
            <dd>{formatHeight(pokemon.height)}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{formatWeight(pokemon.weight)}</dd>
          </div>
        </dl>

        {abilities.length > 0 && (
          <div className="detail-abilities">
            {abilities.map((a) => (
              <span key={a.ability.name} className="ability-chip">
                {capitalize(a.ability.name)}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="stat-section">
        <h3>Base stats</h3>
        <ul className="stat-list">
          {pokemon.stats.map((s) => (
            <li key={s.stat.name}>
              <span className="stat-name">{capitalize(s.stat.name)}</span>
              <div className="stat-bar-track">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${Math.min(100, (s.base_stat / 200) * 100)}%` }}
                />
              </div>
              <span className="stat-value">{s.base_stat}</span>
            </li>
          ))}
        </ul>
      </section>

      {evolution.length > 0 && (
        <section className="evo-section">
          <h3>Evolution family</h3>
          <div className="evo-flow">
            {evolution.map((level, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="evo-arrow" aria-hidden="true">→</span>}
                <div className="evo-level">
                  {level.map((node) => {
                    const isCurrent = String(node.id) === String(pokemon.id);
                    return (
                      <Link
                        key={node.id}
                        to={`/pokemon/${node.name}`}
                        className={`evo-node${isCurrent ? " evo-node-current" : ""}`}
                      >
                        <img
                          className="evo-sprite"
                          src={getSpriteUrl(node.id)}
                          alt={node.name}
                          width={56}
                          height={56}
                          loading="lazy"
                        />
                        <span className="evo-name">{capitalize(node.name)}</span>
                        {isCurrent && <span className="evo-tag">current</span>}
                      </Link>
                    );
                  })}
                </div>
              </Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DetailPage;
