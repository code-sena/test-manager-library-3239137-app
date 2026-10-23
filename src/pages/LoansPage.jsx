import { useEffect, useState } from 'react'
import Banner from '../components/Banner.jsx'
import Pager from '../components/Pager.jsx'
import { api } from '../api.js'

const STATUS_LABEL = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' }

export default function LoansPage() {
  const [filters, setFilters] = useState({ from: '', to: '', status: '' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], page: 1, size: 20, total: 0 })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    load()
  }, [page])

  async function load() {
    setError(null)

    try {
      setResult(await api.loans({ ...filters, page, size: 20 }))
    } catch (failure) {
      setError(failure)
    }
  }

  function search(event) {
    event.preventDefault()
    setPage(1)
    load()
  }

  async function giveBack(loanId, itemId) {
    setError(null)
    setMessage(null)

    try {
      await api.returnItem(loanId, itemId)
      setMessage('Devolución registrada.')
      load()
    } catch (failure) {
      // Devolver dos veces la misma línea da 409 (CA-07.2).
      setError(failure)
    }
  }

  return (
    <>
      <h1>Préstamos</h1>
      <Banner error={error} message={message} />

      <form className="card row" onSubmit={search}>
        <label>
          Desde
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </label>
        <label>
          Hasta
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </label>
        <label>
          Estado
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="overdue">Vencido</option>
            <option value="closed">Cerrado</option>
          </select>
        </label>
        <button type="submit">Filtrar</button>
      </form>

      {result.items.map((loan) => (
        <div className="card" key={loan.id}>
          <div className="row">
            <strong>{loan.loaned_at.slice(0, 10)}</strong>
            <span className={`tag ${loan.status}`}>{STATUS_LABEL[loan.status]}</span>
            <span className="muted">socio {loan.member_id.slice(0, 8)}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Libro</th>
                <th>ISBN</th>
                <th>Categoría</th>
                <th>Vence</th>
                <th>Devuelto</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loan.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.book_title}</td>
                  <td>{item.isbn}</td>
                  <td>{item.category_name}</td>
                  <td>{item.due_at.slice(0, 10)}</td>
                  <td>{item.returned_at ? item.returned_at.slice(0, 10) : <span className="muted">sin devolver</span>}</td>
                  <td>
                    {!item.returned_at && (
                      <button type="button" className="ghost" onClick={() => giveBack(loan.id, item.id)}>
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {result.items.length === 0 && <p className="card muted">No hay préstamos que coincidan.</p>}

      <Pager page={result.page} size={result.size} total={result.total} onPage={setPage} />
    </>
  )
}
