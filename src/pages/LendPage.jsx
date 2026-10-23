import { useEffect, useState } from 'react'
import Banner from '../components/Banner.jsx'
import { api } from '../api.js'

const MAX_ITEMS = 3

export default function LendPage() {
  const [members, setMembers] = useState([])
  const [memberId, setMemberId] = useState('')
  const [memberQuery, setMemberQuery] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const [books, setBooks] = useState([])
  const [chosen, setChosen] = useState([])
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    searchMembers()
  }, [])

  async function searchMembers() {
    try {
      const result = await api.members({ q: memberQuery, size: 20 })
      setMembers(result.items)
    } catch (failure) {
      setError(failure)
    }
  }

  async function searchBooks(event) {
    event.preventDefault()
    setError(null)

    try {
      const result = await api.books({ q: bookQuery, size: 20 })
      setBooks(result.items)
    } catch (failure) {
      setError(failure)
    }
  }

  function toggle(book) {
    setMessage(null)

    if (chosen.some((item) => item.id === book.id)) {
      setChosen(chosen.filter((item) => item.id !== book.id))

      return
    }

    // El mismo libro no se repite y no pasan de tres (CA-06.1, CA-06.2).
    if (chosen.length >= MAX_ITEMS) {
      return
    }

    setChosen([...chosen, book])
  }

  async function lend() {
    setError(null)
    setMessage(null)

    try {
      const loan = await api.createLoan(
        memberId,
        chosen.map((book) => book.id),
      )
      setMessage(`Préstamo registrado. Vence el ${loan.items[0].due_at.slice(0, 10)}.`)
      setChosen([])
    } catch (failure) {
      // Aquí caen las tres negativas del spec: sin ejemplares (409), socio con
      // vencidos (409) y tope de tres libros (422).
      setError(failure)
    }
  }

  const ready = memberId !== '' && chosen.length > 0

  return (
    <>
      <h1>Prestar</h1>
      <Banner error={error} message={message} />

      <div className="card">
        <div className="row">
          <label>
            Buscar socio
            <input value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
          </label>
          <button type="button" className="ghost" onClick={searchMembers}>
            Buscar
          </button>
          <label>
            Socio
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Elegir socio</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} · {member.document_number}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <form className="card row" onSubmit={searchBooks}>
        <label>
          Buscar libro
          <input value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>

      <div className="card">
        <p className="muted">
          Elegidos: {chosen.length} de {MAX_ITEMS}
        </p>
        <table>
          <thead>
            <tr>
              <th />
              <th>Título</th>
              <th>Autor</th>
              <th>Disponibles</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={chosen.some((item) => item.id === book.id)}
                    disabled={book.available_copies === 0 && !chosen.some((item) => item.id === book.id)}
                    onChange={() => toggle(book)}
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.available_copies}</td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  Busque un libro para empezar.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pager">
          <button type="button" disabled={!ready} onClick={lend}>
            Registrar préstamo
          </button>
          <span>El plazo es de 14 días desde hoy.</span>
        </div>
      </div>
    </>
  )
}
