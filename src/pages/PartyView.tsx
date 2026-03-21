import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Sword, RefreshCw } from 'lucide-react'
import { useCampaignStore, useCharacterStore } from '../store'
import { PartyCard, CampaignCharacterCard } from '../components/campaign'
import styles from './PartyView.module.css'

export function PartyView() {
  const { id } = useParams<{ id: string }>()
  const campaign = useCampaignStore((s) => s.getCampaign(id || ''))
  const updateCampaignCharacter = useCampaignStore((s) => s.updateCampaignCharacter)
  const deleteCampaignCharacter = useCampaignStore((s) => s.deleteCampaignCharacter)
  const characters = useCharacterStore((s) => s.characters)
  const [refreshKey, setRefreshKey] = useState(0)

  if (!campaign) {
    return (
      <div className={styles.notFound}>
        <h2>Campaña no encontrada</h2>
        <Link to="/campaigns">Volver a Crónicas</Link>
      </div>
    )
  }

  const partyMembers = characters.filter((c) => campaign.characterIds.includes(c.id))
  const localChars = (campaign.campaignCharacters ?? []).filter((c) => c.inParty !== false)
  const totalMembers = partyMembers.length + localChars.length

  return (
    <div className={styles.page} key={refreshKey}>
      <header className={styles.header}>
        <Link to={`/campaigns/${campaign.id}`} className={styles.backLink}>
          <ArrowLeft size={18} />
          Volver a campaña
        </Link>
        <div className={styles.titleArea}>
          <Sword size={20} className={styles.titleIcon} />
          <h1 className={styles.title}>{campaign.name}</h1>
          <span className={styles.subtitle}>Vista del GM</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => setRefreshKey((k) => k + 1)} title="Actualizar datos">
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      {totalMembers === 0 ? (
        <div className={styles.empty}>
          <p>No hay personajes en esta campaña.</p>
          <Link to={`/campaigns/${campaign.id}`}>Ir a la campaña para añadir personajes</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {partyMembers.map((char) => (
            <PartyCard key={char.id} character={char} />
          ))}
          {localChars.map((char) => (
            <CampaignCharacterCard
              key={char.id}
              char={char}
              onUpdate={(updates) => updateCampaignCharacter(campaign.id, char.id, updates)}
              onDelete={() => deleteCampaignCharacter(campaign.id, char.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
