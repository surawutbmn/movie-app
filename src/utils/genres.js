const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTION = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
}

export const fetchGenres = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTION)
    if (!res.ok) throw new Error("Network response was not ok")

    const data = await res.json()
    const map = {}
    data.genres.forEach((g) => (map[g.id] = g.name))
    return map
  } catch (error) {
    console.error("Error fetching genres:", error)
    return {}
  }
}
