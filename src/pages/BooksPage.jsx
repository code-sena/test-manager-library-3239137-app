import { useEffect, useState } from 'react'
import Banner from '../components/Banner.jsx'
import Cover from '../components/Cover.jsx'
import Pager from '../components/Pager.jsx'
import { api } from '../api.js'

const EMPTY_FORM = { title: '', author: '', isbn: '', category_id: '', total_copies: 1 }

export default function BooksPage({ isAdmin }) {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], page: 1, size: 20, total: 0 })
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    api.categories().then((data) => setCategories(data.items)).catch(setError)
  }, [])

  useEffect(() => {
    load()
  }, [page, categoryId])

  async function load() {
    setError(null)

    try {
      setResult(await api.books({ q: query, category_id: categoryId, page, size: 20 }))
    } catch (failure) {
      setError(failure)
    }
  }

  function search(event) {
    event.preventDefault()
    setPage(1)
    load()
  }

  async function save(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    try {
      if (editingId) {
        // El ISBN no se edita: identifica al libro (CA-03.2).
        await api.updateBook(editingId, {
          title: form.title,
          author: form.author,
          category_id: form.category_id,
          total_copies: Number(form.total_copies),
        })
        setMessage('Libro actualizado.')
      } else {
        await api.createBook({ ...form, total_copies: Number(form.total_copies) })
        setMessage('Libro creado.')
      }

      setForm(EMPTY_FORM)
      setEditingId(null)
      load()
    } catch (failure) {
      setError(failure)
    }
  }

  function edit(book) {
    setEditingId(book.id)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category_id: book.category.id,
      total_copies: book.total_copies,
    })
  }

  async function remove(book) {
    setError(null)
    setMessage(null)

    try {
      await api.deleteBook(book.id)
      setMessage('Libro dado de baja.')
      load()
    } catch (failure) {
      // Un libro con préstamos abiertos no se da de baja (CA-03.5).
      setError(failure)
    }
  }

  async function uploadCover(book, file) {
    setError(null)
    setMessage(null)

    try {
      await api.uploadCover(book.id, file)
      setMessage('Portada actualizada.')
      load()
    } catch (failure) {
      setError(failure)
    }
  }

  return (
    <>
      <h1>Catálogo</h1>
      <Banner error={error} message={message} />

      <form className="card row" onSubmit={search}>
        <label>
          Título o autor
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="búsqueda parcial" />
        </label>
        <label>
          Categoría
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Buscar</button>
      </form>

      {isAdmin && (
        <form className="card row" onSubmit={save}>
          <label>
            Título
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Autor
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </label>
          <label>
            ISBN
            <input
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              disabled={editingId !== null}
              placeholder="13 dígitos"
              required
            />
          </label>
          <label>
            Categoría
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
            >
              <option value="">Elegir</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ejemplares
            <input
              type="number"
              min="1"
              value={form.total_copies}
              onChange={(e) => setForm({ ...form, total_copies: e.target.value })}
              required
            />
          </label>
          <button type="submit">{editingId ? 'Guardar cambios' : 'Crear libro'}</button>
          {editingId && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_FORM)
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th />
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th>Disponibles</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {result.items.map((book) => (
              <tr key={book.id}>
                <td>
                  <Cover bookId={book.id} coverKey={book.cover_key} />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.category.name}</td>
                <td>
                  {book.available_copies} / {book.total_copies}
                </td>
                {isAdmin && (
                  <td className="row">
                    <button type="button" className="ghost" onClick={() => edit(book)}>
                      Editar
                    </button>
                    <button type="button" className="ghost" onClick={() => remove(book)}>
                      Dar de baja
                    </button>
                    <label className="muted">
                      Portada
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => e.target.files[0] && uploadCover(book, e.target.files[0])}
                      />
                    </label>
                  </td>
                )}
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="muted">
                  No hay libros que coincidan.
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
