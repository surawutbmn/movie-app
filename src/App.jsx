import { useCallback, useEffect, useState } from "react"
import Search from "./components/Search"
import MovieCard from "./components/MovieCard"
import Spinner from "./components/Spinner"
import { useDebounce } from "react-use"
import { getTrendingMovies, updateSearchCount } from "./appwrite"
import { fetchGenres } from "./utils/genres"
// updateSearchCount
const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTION = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
}
const MAX_PAGE_LIMIT = 8

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [movieList, setMovieList] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [trendingError, setTrendingError] = useState("")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [genreMap, setGenreMap] = useState({})

  // Debounce to prevent too many API requests
  // waiting user to stop typing
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1200, [searchTerm])

  const fetchMovies = useCallback(
    async (query = "", pageNum = 1, append = false) => {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const endpoint = query
          ? `${API_BASE_URL}/search/movie?include_adult=false&query=${encodeURIComponent(
              query
            )}&page=${pageNum}`
          : `${API_BASE_URL}/discover/movie?include_adult=false&sort_by=popularity.desc&page=${pageNum}`

        const response = await fetch(endpoint, API_OPTION)
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const data = await response.json()

        if (data.Response === "False") {
          setErrorMessage(data.Error || "Failed to fetch movies")
          setMovieList([])
          setTotalPages(1)
          return
        }
        // setMovieList(data.results || [])
        setMovieList((prev) =>
          append ? [...prev, ...(data.results || [])] : data.results || []
        )
        const genreData = await fetchGenres()
        setGenreMap(genreData || {})
        setTotalPages(Math.min(data.total_pages || 1, MAX_PAGE_LIMIT))

        if (query && data.results.length > 0) {
          // Update search count in Appwrite database
          await updateSearchCount(query, data.results[0])
        }
      } catch (error) {
        console.error("Error fetching movies:", error)
        setErrorMessage("Failed to fetch movies. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const loadTrendingMovies = async () => {
    setTrendingLoading(true)
    try {
      const movies = await getTrendingMovies()

      setTrendingMovies(movies)
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`)
      setTrendingError(
        "Failed to fetch trending movies. Please try again later."
      )
    } finally {
      setTrendingLoading(false)
    }
  }

  // useEffect(() => {
  //   fetchMovies(debouncedSearchTerm)
  // }, [debouncedSearchTerm])

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, page, false)
  }, [debouncedSearchTerm, page, fetchMovies])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  // console.log(movieList)

  return (
    <>
      <main>
        <div className='pattern'></div>
        <div className='wrapper'>
          <header>
            <section className='trending'>
              <h2>Trending Movies</h2>
              <span className='text-white'>(Base on Top Search)</span>
              {trendingLoading ? (
                <Spinner />
              ) : trendingMovies.length === 0 && !trendingError ? (
                <p className='text-white'>No movies found.</p>
              ) : trendingError ? (
                <>
                  <p className='text-red-500'>{trendingError}</p>
                  <button onClick={loadTrendingMovies} className='retry-btn'>
                    Retry
                  </button>
                </>
              ) : (
                <ul>
                  {trendingMovies.map((movie, index) => (
                    <li key={movie.$id || movie.id || index}>
                      <p>{index + 1}</p>
                      <img
                        src={
                          movie.poster_url ? movie.poster_url : "./no-movie.png"
                        }
                        alt={
                          movie.title
                            ? `${movie.title} poster`
                            : "No poster available"
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {/* <img src='./hero.png' alt='Hero Banner' /> */}
            <h1>
              Find <span className='text-gradient'>Movies</span> You Love
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className='all-movies'>
            <h2>All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : movieList.length === 0 && !errorMessage ? (
              <p className='text-white'>No movies found.</p>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => {
                  return (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      genreMap={genreMap}
                    />
                  )
                })}
              </ul>
            )}
            <div className='mt-[2rem] flex justify-between gap-x-5 items-center'>
              <button
                className='text-indigo-400 bg-dark-100 rounded-2xl shadow-inner shadow-light-100/10 p-5 disabled:opacity-70'
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <i
                  className='fa-solid fa-arrow-left fa-lg'
                  title='Previous Page'
                ></i>
              </button>
              <span className='text-white flex gap-x-2 items-center'>
                {page} <p className='text-gray-100'>/ {totalPages}</p>
              </span>
              <button
                className='text-indigo-400 bg-dark-100 rounded-2xl shadow-inner shadow-light-100/10 p-4 disabled:opacity-70'
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <i
                  className='fa-solid fa-arrow-right fa-lg'
                  title='Next Page'
                ></i>
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default App
