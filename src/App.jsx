import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { session } from './api.js'
import BooksPage from './pages/BooksPage.jsx'
import LendPage from './pages/LendPage.jsx'
import LoansPage from './pages/LoansPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import OverduePage from './pages/OverduePage.jsx'
import ReportPage from './pages/ReportPage.jsx'

export default function App() {
  // El rol vive en el estado para que el menú reaccione al entrar y al salir.
  const [role, setRole] = useState(session.role())
  const navigate = useNavigate()

  useEffect(() => {
    function onUnauthorized() {
      setRole(null)
      navigate('/entrar', { replace: true })
    }

    window.addEventListener('manager-library:unauthorized', onUnauthorized)

    return () => window.removeEventListener('manager-library:unauthorized', onUnauthorized)
  }, [navigate])

  function onLogin(nextRole) {
    setRole(nextRole)
    navigate('/libros')
  }

  function onLogout() {
    session.clear()
    setRole(null)
    navigate('/entrar')
  }

  if (!role) {
    return (
      <Routes>
        <Route path="/entrar" element={<LoginPage onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    )
  }

  const isAdmin = role === 'admin'

  return (
    <div className="shell">
      <header className="bar">
        <strong>Manager Library</strong>
        <nav>
          <NavLink to="/libros">Catálogo</NavLink>
          <NavLink to="/socios">Socios</NavLink>
          <NavLink to="/prestar">Prestar</NavLink>
          <NavLink to="/prestamos">Préstamos</NavLink>
          <NavLink to="/vencidos">Vencidos</NavLink>
          {/* El reporte es solo de admin (CA-10.5); la API lo exige igual. */}
          {isAdmin && <NavLink to="/reporte">Reporte</NavLink>}
        </nav>
        <span className="role">
          {role}
          <button type="button" onClick={onLogout}>
            Salir
          </button>
        </span>
      </header>

      <main>
        <Routes>
          <Route path="/libros" element={<BooksPage isAdmin={isAdmin} />} />
          <Route path="/socios" element={<MembersPage />} />
          <Route path="/prestar" element={<LendPage />} />
          <Route path="/prestamos" element={<LoansPage />} />
          <Route path="/vencidos" element={<OverduePage />} />
          <Route path="/reporte" element={isAdmin ? <ReportPage /> : <Navigate to="/libros" replace />} />
          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </main>
    </div>
  )
}
