import { useEffect, useState } from 'react'
import Banner from '../components/Banner.jsx'
import { api } from '../api.js'

export default function OverduePage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .overdue()
      .then((data) => setItems(data.items))
      .catch(setError)
  }, [])

  return (
    <>
      <h1>Vencidos</h1>
      <Banner error={error} />

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Socio</th>
              <th>Venció</th>
              <th>Días de retraso</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.item_id}>
                <td>{row.book_title}</td>
                <td>{row.member_name}</td>
                <td>{row.due_at.slice(0, 10)}</td>
                <td>
                  <span className="tag overdue">{row.days_late}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No hay libros vencidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
