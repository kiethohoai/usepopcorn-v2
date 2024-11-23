import { useEffect, useState } from 'react';
import { options, URL } from './config';

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');

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

  return { movies, isLoading, err };
}
