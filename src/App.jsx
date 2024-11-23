import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating/StarRating';

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

/* API DATA */
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YmQwZWU2ZTc2ZDNlYzJlOWIyZTkzOWM4NTBkOTM0YiIsIm5iZiI6MTczMjAyNzM2Mi44OTk3MDgzLCJzdWIiOiI2NmUwZmRhMjBiNmUwNzU0ZjdhZmRlMzEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.UeDSIArLT_v5eZsjrGLvyZUhasN6KCl5lu5OUT6jytM',
  },
};
const URL = `https://api.themoviedb.org/3/search/movie`;
// const TEMP_QUERY = `interstellar`;

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });

  function handleConvertData(data) {
    const dataMovies = data.results.map((data) => {
      return {
        imdbID: data.id,
        Title: data.original_title,
        Year: data.release_date,
        Poster: `https://image.tmdb.org/t/p/w500/${data.poster_path}`,
      };
    });
    return dataMovies;
  }

  function handleSelectMovie(id) {
    setSelectedMovieId((curId) => (curId === id ? null : +id));
  }

  function handleCloseMovie() {
    setSelectedMovieId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((mov) => mov.imdbID !== id));
  }

  // Save watched movies to localStorage
  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setErr('');
          const res = await fetch(
            `${URL}?query=${query}&include_adult=false&language=en-US&page=1`,
            { signal: controller.signal, ...options },
          );
          if (!res.ok) throw new Error(`Something went wrong. Fail to fetch movies!`);
          const data = await res.json();
          const results = handleConvertData(data);
          setMovies(results);
        } catch (error) {
          console.error(`error:`, error);
          if (error.name !== 'AbortError') {
            setErr(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      // Guard
      if (query.length <= 3) {
        setMovies([]);
        setErr('');
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !err && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {err && <ErrorMessage message={err} />}
        </Box>

        <Box>
          {selectedMovieId ? (
            <MovieDetails
              selectedMovieId={selectedMovieId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return;

      if (e.code === 'Enter') {
        inputEl.current.focus();
        setQuery('');
      }
    }
    document.addEventListener('keydown', callback);
    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedMovieId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);

  const countRef = useRef(0);

  const isWatched = watched.map((mov) => mov.imdbID).includes(selectedMovieId);
  const watchedUserRating = watched.find(
    (item) => item.imdbID === selectedMovieId,
  )?.userRating;

  const curMovie = {
    imdbID: selectedMovieId,
    Title: movie.title,
    Year: movie.release_date,
    Poster: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
    runtime: movie.runtime,
    imdbRating: movie.vote_average,
    Plot: movie.overview,
    Released: movie.release_date,
    Actors: 'Actors',
    Director: 'Director',
    Genre: movie.original_title,
  };

  function handleAdd() {
    const newMovie = {
      imdbID: selectedMovieId,
      Poster: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      Title: movie.title,
      imdbRating: movie.vote_average,
      userRating: userRating ? userRating : 0,
      runtime: movie.runtime,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newMovie);
    onCloseMovie();
  }

  useEffect(() => {
    if (userRating) countRef.current = countRef.current + 1;
  }, [userRating]);

  useEffect(() => {
    function callback(e) {
      if (e.code === 'Escape') {
        onCloseMovie();
      }
    }

    document.addEventListener('keydown', callback);

    return () => {
      document.removeEventListener('keydown', callback);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${selectedMovieId}?language=en-US`,
        options,
      );

      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedMovieId]);

  // Changging title of web page
  useEffect(() => {
    document.title = `Movie: ${movie.title ? movie.title : ''}`;

    return () => {
      document.title = `usePopcorn`;
    };
  }, [movie]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={curMovie.Poster} alt={curMovie.Title} />
            <div className="details-overview">
              <h2>{curMovie.Title}</h2>
              <p>
                {curMovie.Released} &bull; {curMovie.runtime} mins
              </p>
              <p>{curMovie.Genre} </p>
              <p>
                <span>⭐</span>
                {curMovie.imdbRating?.toFixed(1)} IMDb Rating
              </p>
            </div>
          </header>

          <section>
            {isWatched ? (
              <div className="rating">
                <p>You rated this movie with ⭐{watchedUserRating} </p>
              </div>
            ) : (
              <>
                <div className="rating">
                  <StarRating size={26} maxRating={10} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={() => handleAdd()}>
                      + Add to list
                    </button>
                  )}
                </div>
              </>
            )}

            <p>
              <em>{curMovie.Plot} </em>
            </p>
            <p>Staring {curMovie.Actors}</p>
            <p>Directed by {curMovie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating?.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating?.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime?.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating?.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}
