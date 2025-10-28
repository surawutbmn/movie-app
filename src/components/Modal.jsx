import { useEffect, useState } from "react"
import ReactDom from "react-dom"
import { FaImdb, FaGlobe } from "react-icons/fa6"

export default function Modal({ showDetail, handleCloseModal }) {
  const { movie, genres } = showDetail || {}
  const [expanded, setExpanded] = useState(false)
  const isMobile = typeof window != "undefined" && window.innerWidth < 768

  useEffect(() => {
    if (!showDetail) return
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleCloseModal()
      }
    }

    document.body.style.overflow = "hidden" // prevent scroll when modal is open
    document.addEventListener("keydown", handleEsc)

    return () => {
      document.body.style.overflow = "auto" // restore scroll
      document.removeEventListener("keydown", handleEsc)
    }
  }, [showDetail, handleCloseModal])

  if (!showDetail) return null
  // format runtime from minutes to "Xh Ym"
  function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  function dateFormat(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-Us", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  const SeperadedList = ({ items, render }) => {
    return items.map((item, index) => (
      <p key={index}>
        {index > 0 && <span className='mx-2'>•</span>}
        {render(item)}
      </p>
    ))
  }
  // console.log("Modal movie detail:", movie)
  // console.log(movie.certification)

  return ReactDom.createPortal(
    <div className='modal-container'>
      {/* Clickable background */}
      <button className='modal-underlay' onClick={handleCloseModal} />
      {/* Modal content box */}
      <section className='modal-content' role='dialog' aria-modal='true'>
        <button
          onClick={handleCloseModal}
          aria-label='Close modal'
          className='modal-close-btn'
        >
          &times;
        </button>
        {/* Modal content */}
        <div className='modal-content-con'>
          <div className='grid grid-cols mt-2 md:mt-0 md:grid-cols-2 gap-4 items-end'>
            {/* Modal head */}
            <div className='flex flex-col gap-1'>
              <h2>{movie.title}</h2>
              <div className='flex flex-wrap gap-1 text-gray-400'>
                <p className='year'>
                  {movie.release_date
                    ? movie.release_date.split("-")[0]
                    : "N/A"}
                </p>
                <span>•</span>
                <p className='certification'>{movie.certification}</p>
                <span>•</span>
                <p className='runtime'>
                  {movie.runtime ? formatRuntime(movie.runtime) : "N/A"}
                </p>
                <div className='flex items-center'>
                  <img
                    src='star.svg'
                    alt='Star Icon'
                    className='w-[1.3rem] mx-0'
                  />
                  <p>
                    {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                    <span className='text-gray-400'>
                      /10 (
                      {movie.vote_count >= 1000
                        ? `${(movie.vote_count / 1000).toFixed(1)}k`
                        : movie.vote_count}
                      )
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Modal image and vdo */}
          <div className='poster-trailer'>
            <div className='poster'>
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "./no-movie.png"
                }
                alt={movie.title}
              />
            </div>
            <div className='trailer'>
              {movie.trailers?.length > 0 ? (
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailers[0].key}`}
                  title={movie.trailers[0].name}
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>
              ) : (
                <p className='text-gray-400'>No trailer available</p>
              )}
            </div>
          </div>
          {/* movie detail content */}
          <div className='modal-section'>
            <h3 className='modal-label'>Genre</h3>
            <div className='modal-value flex flex-wrap gap-1 justify-between'>
              <div className='flex flex-wrap gap-1'>
                {genres?.length > 0
                  ? genres.map((g) => (
                      <p
                        key={g}
                        className='genres p-2 bg-indigo-500/30 rounded'
                      >
                        {g}
                      </p>
                    ))
                  : "No genres available."}
              </div>
              <div className='flex flex-wrap gap-1'>
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-btn imdb-btn'
                  >
                    <FaImdb className='text-2xl' />
                    IMDb
                  </a>
                )}
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-btn web-btn'
                  >
                    <FaGlobe className='text-xl' />
                    Official Site
                  </a>
                )}
              </div>
            </div>
            <h3 className='modal-label'>Overview</h3>
            <div className='modal-value'>
              <p
                className={`overview ${
                  !expanded && isMobile ? "line-clamp-3" : ""
                }`}
              >
                {movie.overview ? movie.overview : "No Overview."}
              </p>
              {isMobile && movie.overview && movie.overview.length > 200 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className='text-sm text-indigo-200'
                  aria-expanded={expanded}
                >
                  {!expanded ? "read more" : "show less"}
                </button>
              )}
            </div>
            <h3 className='modal-label'> Release Date</h3>
            <p className='modal-value'>
              {movie.release_date ? dateFormat(movie.release_date) : "N/A"}
            </p>
            <h3 className='modal-label'> Status</h3>
            <p className='modal-value'>
              {movie.status ? movie.status : "Status Unknow."}
            </p>
            <h3 className='modal-label'> Countries</h3>
            <div className='modal-value item-list'>
              {movie.production_countries?.length > 0 ? (
                <SeperadedList
                  items={movie.production_countries}
                  render={(countries) => countries.name}
                />
              ) : (
                "N/A"
              )}
            </div>
            <h3 className='modal-label'> Languages </h3>
            <div className='modal-value item-list'>
              {movie.spoken_languages?.length > 0 ? (
                <SeperadedList
                  items={movie.spoken_languages}
                  render={(lang) => lang.english_name}
                />
              ) : (
                "Unknown Languages."
              )}
            </div>
            <h3 className='modal-label'> Budget </h3>
            <p className='modal-value'>
              {movie.budget > 0
                ? movie.budget >= 1e6
                  ? `${(movie.budget / 1e6).toFixed(1)} million`
                  : movie.budget
                : "Unknown Budget."}
            </p>
            <h3 className='modal-label'> Revenue </h3>
            <p className='modal-value'>
              {movie.revenue > 0
                ? movie.revenue >= 1e6
                  ? `${(movie.revenue / 1e6).toFixed(1)} million`
                  : movie.revenue
                : "Unknown Revenue."}
            </p>
            <h3 className='modal-label'> Tagline </h3>
            <p className='modal-value'>{movie.tagline || "No Tagline."}</p>
            <h3 className='modal-label'> Production Companies </h3>
            <div className='modal-value item-list'>
              {movie.production_companies?.length > 0 ? (
                <SeperadedList
                  items={movie.production_companies}
                  render={(company) => company.name}
                />
              ) : (
                "Unkown Conpanies."
              )}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.getElementById("portal")
  )
}
