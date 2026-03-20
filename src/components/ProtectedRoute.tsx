import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCharacterStore } from '../store'
import { useCampaignStore } from '../store'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const fetchCharacters = useCharacterStore((s) => s.fetchCharacters)
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns)

  useEffect(() => {
    if (session) {
      fetchCharacters()
      fetchCampaigns()
    }
  }, [session, fetchCharacters, fetchCampaigns])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-secondary)' }}>
        Cargando...
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}
