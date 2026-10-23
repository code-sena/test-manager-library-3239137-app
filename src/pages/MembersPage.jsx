import { useEffect, useState } from 'react'
import Banner from '../components/Banner.jsx'
import Pager from '../components/Pager.jsx'
import { api } from '../api.js'

export default function MembersPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], page: 1, size: 20, total: 0 })
  const [form, setForm] = useState({ full_name: '', document_number: '' })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    load()
  }, [page])

  async function load() {
    setError(null)

    try {
      setResult(await api.members({ q: query, page, size: 20 }))
    } catch (failure) {
      setError(failure)
    }
  }

  function search(event) {
    event.preventDefault()
    setPage(1)
    load()
  }

  async function create(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    try {
      await api.createMember(form)
      setForm({ full_name: '', document_number: '' })
      setMessage('Socio creado.')
      load()
    } catch (failure) {
      // El documento es único: repetido da 409 (CA-05.1).
      setError(failure)
    }
  }

  return (
    <>
      <h1>Socios</h1>
      <Banner error={error} message={message} />

      <form className="card row" onSubmit={search}>
        <label>
          Nombre o documento
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>

      <form className="card row" onSubmit={create}>
        <label>
          Nombre completo
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </label>
        <label>
          Documento
          <input
            value={form.document_number}
            onChange={(e) => setForm({ ...form, document_number: e.target.value })}
            required
          />
        </label>
        <button type="submit">Crear socio</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((member) => (
              <tr key={member.id}>
                <td>{member.full_name}</td>
                <td>{member.document_number}</td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={2} className="muted">
                  No hay socios que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pager page={result.page} size={result.size} total={result.total} onPage={setPage} />
      </div>
    </>
  )
}
