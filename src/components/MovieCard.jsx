import { useState } from "react"
import Modal from "./Modal"
import { fetchMovieDetail } from "../utils/movieDetail"
import Spinner from "./Spinner"

const MovieCard = ({ movie, genreMap = {} }) => {
  const {
    title,
    vote_average,
    backdrop_path,
    video,
    // poster_path,
    genre_ids = [],
    id,
  } = movie
  const genres = genre_ids.map((id) => genreMap[id]).filter(Boolean)
  const [showDetail, setShowDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCardClick = async () => {
    setLoading(true)
    setError("")
    try {
      const detailedMovie = await fetchMovieDetail(id)
      setShowDetail({ movie: detailedMovie, genres })
    } catch (err) {
      console.error(`Error fetching movie detail: ${err}`)
      setError("Failed to load movie details.")
    } finally {
      setLoading(false)
    }
  }
  // console.log("MovieCard movie detail:", movie)

  return (
    <>
      {/* {showDetail && (
        <Modal
          showDetail={showDetail}
          handleCloseModal={() => {
            setShowDetail(null)
          }}
        />
      )} */}
      {loading ? (
        <div className='fixed inset-0 flex items-center justify-center bg-black/70 z-50'>
          <Spinner />
        </div>
      ) : error ? (
        <div className='fixed inset-0 flex items-center justify-center bg-black/70 z-50 text-white text-center px-4'>
          <div>
            <p className='text-red-500 mb-2'>{error}</p>
            <button onClick={() => setError("")} className='retry-btn'>
              Close
            </button>
          </div>
        </div>
      ) : showDetail ? (
        <Modal
          showDetail={showDetail}
          handleCloseModal={() => setShowDetail(null)}
        />
      ) : null}
      <div onClick={handleCardClick} className='movie-card cursor-pointer'>
        {/* <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "./no-movie.png"
          }
          alt={title}
        /> */}
        <div className='movie-img'>
          <img
            src={
              backdrop_path
                ? `https://image.tmdb.org/t/p/w500${backdrop_path}`
                : "./no-movie-bd.png"
            }
            alt={title}
          />
        </div>
        <div className='mt-4'>
          <h3>{title}</h3>
          <div className='content'>
            <div className='rating'>
              <img src='star.svg' alt='Star Icon' />
              <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
              {/* <span>•</span>
              <p className='lang'>{original_language}</p> */}
              <span>•</span>
              {/* <p className='year'>
                {release_date ? release_date.split("-")[0] : "N/A"}
              </p> */}
              <p className='type'>{!video ? "Movie" : "Video"}</p>
              <span>•</span>
              {genres.length > 0 ? (
                <p className='genres'>{genres[0]}</p>
              ) : (
                <p className='genres'>N/A</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default MovieCard
