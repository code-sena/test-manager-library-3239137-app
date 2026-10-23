export default function Pager({ page, size, total, onPage }) {
  const lastPage = Math.max(1, Math.ceil(total / size))

  return (
    <div className="pager">
      <button type="button" className="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {lastPage} · {total} resultado(s)
      </span>
      <button type="button" className="ghost" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
        Siguiente
      </button>
    </div>
  )
}
