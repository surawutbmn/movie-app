const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
import { CERTIFICATION_COUNTRIES } from "./certificate.js"

const API_OPTION = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
}

const movieCache = {}
export const fetchMovieDetail = async (id) => {
  if (movieCache[id]) {
    return movieCache[id]
  }
  try {
    // base details
    const detailRes = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTION)
    if (!detailRes.ok) throw new Error("Failed to fetch movie detail")
    const detailData = await detailRes.json()

    // certifications
    const certRes = await fetch(
      `${API_BASE_URL}/movie/${id}/release_dates`,
      API_OPTION
    )
    if (!certRes.ok) throw new Error("Failed to fetch movie certifications")
    const certData = await certRes.json()
    const releases = Array.isArray(certData.results) ? certData.results : []
    const { cert: certification } = getValidateCert(releases)
    // Extract&find certification
    function getValidateCert(releases) {
      const usRelease = releases.find((r) => r.iso_3166_1 === "US")
      const usCert = Array.isArray(usRelease?.release_dates)
        ? usRelease?.release_dates.find((c) => c.certification?.trim())
        : null
      if (usCert?.certification) {
        return { cert: usCert.certification, country: "US" }
      }
      // Find first valid certification from other countries
      for (const country of CERTIFICATION_COUNTRIES.filter((c) => c != "US")) {
        const release = releases.find((r) => r.iso_3166_1 === country)
        const validCert = Array.isArray(release?.release_dates)
          ? release?.release_dates.find((c) => c.certification?.trim())
          : null
        if (validCert?.certification) {
          return { cert: validCert.certification, country }
        }
      }
      return { cert: "N/A", country: "N/A" }
    }
    // const certification =
    //   getValidateCert(usRelease?.release_dates) ||
    //   "N/A"

    //video
    const videoRes = await fetch(
      `${API_BASE_URL}/movie/${id}/videos`,
      API_OPTION
    )

    if (!videoRes.ok) throw new Error("Failed to fetch movie videos")
    const videoData = await videoRes.json()
    const trailers = videoData.results.filter(
      (t) => t.site === "YouTube" && t.type === "Trailer"
    )

    // combine data
    const fullData = { ...detailData, certification, trailers }
    movieCache[id] = fullData
    return fullData
  } catch (error) {
    console.error("Movie detail fetch error:", error)
    throw error
  }
}
