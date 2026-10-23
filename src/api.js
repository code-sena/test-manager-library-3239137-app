// Único punto por donde el frontend habla con la API.
//
// Todo error del backend llega con el mismo cuerpo { code, message, details },
// así que aquí se convierte en una excepción con ese código: las pantallas
// deciden qué decir según el código, no leyendo textos.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'No se pudo completar la operación.')
    this.status = status
    this.code = body?.code ?? 'UNKNOWN'
    this.details = body?.details ?? []
  }
}

const TOKEN_KEY = 'manager-library.token'
const ROLE_KEY = 'manager-library.role'

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  role: () => localStorage.getItem(ROLE_KEY),
  save(token, role) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
  },
}

async function request(method, path, { body, query, raw } = {}) {
  const url = new URL(BASE_URL + path)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  }

  const headers = {}
  const token = session.token()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    // Un 401 en cualquier punto significa que la sesión ya no sirve.
    const payload = await response.json().catch(() => null)

    if (response.status === 401) {
      session.clear()
      window.dispatchEvent(new Event('manager-library:unauthorized'))
    }

    throw new ApiError(response.status, payload)
  }

  return raw ? response.blob() : response.json()
}

export const api = {
  login: (username, password) => request('POST', '/auth/login', { body: { username, password } }),

  categories: () => request('GET', '/categories'),

  books: (query) => request('GET', '/books', { query }),
  book: (id) => request('GET', `/books/${id}`),
  createBook: (body) => request('POST', '/books', { body }),
  updateBook: (id, body) => request('PUT', `/books/${id}`, { body }),
  deleteBook: (id) => request('DELETE', `/books/${id}`),
  uploadCover: (id, file) => {
    const form = new FormData()
    form.append('file', file)

    return request('PUT', `/books/${id}/cover`, { body: form })
  },
  coverUrl: (id) => `${BASE_URL}/books/${id}/cover`,

  members: (query) => request('GET', '/members', { query }),
  member: (id) => request('GET', `/members/${id}`),
  createMember: (body) => request('POST', '/members', { body }),

  createLoan: (memberId, bookIds) =>
    request('POST', '/loans', {
      body: { member_id: memberId, items: bookIds.map((bookId) => ({ book_id: bookId })) },
    }),
  loans: (query) => request('GET', '/loans', { query }),
  loan: (id) => request('GET', `/loans/${id}`),
  returnItem: (loanId, itemId) => request('POST', `/loans/${loanId}/items/${itemId}/return`),
  overdue: () => request('GET', '/loans/overdue'),

  mostBorrowed: (from, to) => request('GET', '/reports/most-borrowed', { query: { from, to } }),

  createLibrarian: (body) => request('POST', '/users', { body }),
}
