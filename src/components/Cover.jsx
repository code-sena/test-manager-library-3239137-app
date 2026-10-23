import { useEffect, useState } from 'react'
import { api, session } from '../api.js'

/**
 * La portada se pide con el token, así que no sirve un src directo: hay que
 * traer el binario y convertirlo en una URL de objeto.
 */
export default function Cover({ bookId, coverKey }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!coverKey) {
      return undefined
    }

    let objectUrl = null
    let cancelled = false

    fetch(api.coverUrl(bookId), { headers: { Authorization: `Bearer ${session.token()}` } })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob)
          setSrc(objectUrl)
        }
      })
      .catch(() => setSrc(null))

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [bookId, coverKey])

  if (!coverKey) {
    return <div className="cover" title="Sin portada" />
  }

  return src ? <img className="cover" src={src} alt="" /> : <div className="cover" />
}
