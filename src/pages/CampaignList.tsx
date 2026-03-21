import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Map, Users, BookOpen, Scroll, Trash2 } from 'lucide-react'
import { useCampaignStore } from '../store'
import type { Campaign } from '../store'
import { Button, Card } from '../components/ui'
import styles from './CampaignList.module.css'

const STATUS_LABELS: Record<Campaign['status'], string> = {
  active: 'Activa',
  paused: 'En pausa',
  completed: 'Completada',
}

export function CampaignList() {
  const campaigns = useCampaignStore((s) => s.campaigns)
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign)
  const navigate = useNavigate()

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`¿Eliminar la campaña "${name}"? Esta acción no se puede deshacer.`)) {
      deleteCampaign(id)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Crónicas</h1>
          <p className={styles.subtitle}>Gestiona tus campañas y aventuras</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/campaigns/new')}>
          <PlusCircle size={18} />
          Nueva Campaña
        </Button>
      </header>

      {campaigns.length === 0 ? (
        <div className={styles.empty}>
          <Map size={56} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Ninguna crónica iniciada</h2>
          <p className={styles.emptyDesc}>
            Crea tu primera campaña para organizar personajes, notas de sesión y NPCs.
          </p>
          <Button variant="primary" onClick={() => navigate('/campaigns/new')}>
            <PlusCircle size={18} />
            Crear Primera Campaña
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((c) => (
            <Link key={c.id} to={`/campaigns/${c.id}`} className={styles.cardLink}>
              <Card padding="md" hoverable className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardAvatar}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.cardMeta}>
                    <h2 className={styles.cardName}>{c.name}</h2>
                    <span className={styles.cardSetting}>{c.setting || 'Sin ambientación'}</span>
                  </div>
                  <span className={`${styles.statusChip} ${styles[`status_${c.status}`]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>

                {c.description && (
                  <p className={styles.cardDesc}>{c.description}</p>
                )}

                <div className={styles.cardStats}>
                  <span className={styles.cardStat}>
                    <Users size={13} />
                    {c.characterIds.length} PJs
                  </span>
                  <span className={styles.cardStat}>
                    <BookOpen size={13} />
                    {c.sessions?.length ?? c.sessionCount} sesiones
                  </span>
                  <span className={styles.cardStat}>
                    <Scroll size={13} />
                    {c.notes.length} notas
                  </span>
                  {(c.quests?.filter((q) => q.status === 'active').length ?? 0) > 0 && (
                    <span className={styles.cardStat}>
                      <Scroll size={13} />
                      {c.quests!.filter((q) => q.status === 'active').length} misiones
                    </span>
                  )}
                  {c.gmName && (
                    <span className={styles.cardGm}>GM: {c.gmName}</span>
                  )}
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, c.id, c.name)}
                  title="Eliminar campaña"
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
