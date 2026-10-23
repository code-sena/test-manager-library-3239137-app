import { useState } from 'react'
import Banner from '../components/Banner.jsx'
import { api } from '../api.js'

function firstDayOfThisMonth() {
  const today = new Date()

  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
}

export default function ReportPage() {
  const [from, setFrom] = useState(firstDayOfThisMonth())
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  async function run(event) {
    event.preventDefault()
    setError(null)

    try {
      const report = await api.mostBorrowed(from, to)
      setRows(report.rows)
    } catch (failure) {
      // Fin anterior al inicio da 422 (CA-10.2).
      setError(failure)
    }
  }

  return (
    <>
      <h1>Libros más prestados</h1>
      <Banner error={error} />

      <form className="card row" onSubmit={run}>
        <label>
          Desde
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </label>
        <label>
          Hasta
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
        </label>
        <button type="submit">Generar</button>
      </form>

      {rows && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Libro</th>
                <th>Categoría</th>
                <th>Veces prestado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.book_id}-${row.category_name}`}>
                  <td>{row.book_title}</td>
                  <td>{row.category_name}</td>
                  <td>{row.times_borrowed}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    Ese rango no tiene préstamos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="muted">
            El título y la categoría son los del instante del préstamo: este reporte no cambia si después se renombra
            un libro.
          </p>
        </div>
      )}
    </>
  )
}
