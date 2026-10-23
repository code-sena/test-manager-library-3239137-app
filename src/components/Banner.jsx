// Mensaje de error o de éxito. El texto viene del backend tal cual: ya llega
// en español y con el detalle que corresponde.
export default function Banner({ error, message }) {
  if (error) {
    return (
      <p className="banner error">
        {error.message}
        {error.details?.length > 0 && (
          <span className="muted">
            {' '}
            ({error.details.map((d) => `${d.field}: ${d.issue}`).join('; ')})
          </span>
        )}
      </p>
    )
  }

  return message ? <p className="banner ok">{message}</p> : null
}
