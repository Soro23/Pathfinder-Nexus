import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Map } from 'lucide-react'
import { useCampaignStore } from '../store'
import { Button, Input, Card } from '../components/ui'
import styles from './CampaignNew.module.css'

export function CampaignNew() {
  const navigate = useNavigate()
  const addCampaign = useCampaignStore((s) => s.addCampaign)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [setting, setSetting] = useState('')
  const [gmName, setGmName] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    const id = addCampaign({
      name: name.trim(),
      description: description.trim(),
      setting: setting.trim(),
      gmName: gmName.trim(),
      status: 'active',
    })
    navigate(`/campaigns/${id}`)
  }

  return (
    <div className={styles.page}>
      <Link to="/campaigns" className={styles.backLink}>
        <ArrowLeft size={18} />
        Volver a Crónicas
      </Link>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}>
            <Map size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Nueva Campaña</h1>
            <p className={styles.subtitle}>Define el escenario de tu próxima aventura</p>
          </div>
        </div>

        <Card padding="lg" className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
              <Input
                label="Nombre de la campaña *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Las Tierras Olvidadas"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <Input
              label="Ambientación"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="Golarion, Forgotten Realms..."
            />
            <Input
              label="Nombre del GM"
              value={gmName}
              onChange={(e) => setGmName(e.target.value)}
              placeholder="Tu nombre o alias"
            />
            <div className={styles.fullWidth}>
              <label className={styles.textareaLabel}>Descripción</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una breve sinopsis de la campaña, su premisa o el gancho inicial..."
                rows={4}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => navigate('/campaigns')}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
              <Map size={16} />
              Crear Campaña
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
