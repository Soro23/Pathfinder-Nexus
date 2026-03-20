import { X, UserPlus, UserMinus } from 'lucide-react'
import { useCharacterStore, useCampaignStore, calculateModifier } from '../../store'
import { getClassById, getSaveForLevel, useSRDStore } from '../../data'
import { Button } from '../ui'
import styles from './CharacterAssigner.module.css'

const KEY_SKILL_IDS = ['perception', 'stealth']

interface CharacterAssignerProps {
  campaignId: string
  assignedIds: string[]
  onClose: () => void
}

export function CharacterAssigner({ campaignId, assignedIds, onClose }: CharacterAssignerProps) {
  const { skills: SKILLS } = useSRDStore()
  const characters = useCharacterStore((s) => s.characters)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const addCharacterToCampaign = useCampaignStore((s) => s.addCharacterToCampaign)
  const removeCharacterFromCampaign = useCampaignStore((s) => s.removeCharacterFromCampaign)

  const assign = (charId: string) => {
    addCharacterToCampaign(campaignId, charId)
    updateCharacter(charId, { campaignId })
  }

  const unassign = (charId: string) => {
    removeCharacterFromCampaign(campaignId, charId)
    updateCharacter(charId, { campaignId: undefined })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Gestionar Personajes</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {characters.length === 0 ? (
          <p className={styles.empty}>No hay personajes creados aún.</p>
        ) : (
          <div className={styles.list}>
            {characters.map((char) => {
              const isAssigned = assignedIds.includes(char.id)
              const inOtherCampaign = char.campaignId && char.campaignId !== campaignId
              const classStr = char.classes.map((c) => `${c.id} ${c.level}`).join('/')

              // Compute key stats
              const classData = getClassById(char.classes[0]?.id || '')
              const dexMod = calculateModifier(char.abilities.dexterity)
              const equippedArmor = (char.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
              const equippedShield = (char.armor ?? []).find((a) => a.equipped && a.type === 'shield')
              const effectiveDex = equippedArmor
                ? Math.min(dexMod, equippedArmor.maxDex ?? 99)
                : dexMod
              const ca = 10 + effectiveDex + (equippedArmor?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0)
              const fort = getSaveForLevel(char.level, classData?.fortitudeSave || 'poor') + calculateModifier(char.abilities.constitution)
              const ref = getSaveForLevel(char.level, classData?.reflexSave || 'poor') + dexMod
              const will = getSaveForLevel(char.level, classData?.willSave || 'poor') + calculateModifier(char.abilities.wisdom)
              const classSkills = classData?.classSkills ?? []
              const keySkills = KEY_SKILL_IDS.map((skillId) => {
                const skill = SKILLS.find((s) => s.id === skillId)
                if (!skill) return null
                const rankEntry = char.skills.find((s) => s.id === skillId)
                const ranks = rankEntry?.ranks ?? 0
                const abilityMod = calculateModifier(char.abilities[skill.ability])
                const classBonus = ranks > 0 && classSkills.includes(skillId) ? 3 : 0
                return { name: skill.name, total: ranks + abilityMod + classBonus }
              }).filter(Boolean) as { name: string; total: number }[]

              return (
                <div key={char.id} className={`${styles.row} ${isAssigned ? styles.rowAssigned : ''}`}>
                  <div className={styles.charAvatar}>{char.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.charInfo}>
                    <span className={styles.charName}>{char.name}</span>
                    <span className={styles.charMeta}>{char.race} · {classStr} · Nv.{char.level}</span>
                    <div className={styles.charStats}>
                      <span className={styles.statPill}>CA {ca}</span>
                      <span className={styles.statPill}>Fort {fort >= 0 ? '+' : ''}{fort}</span>
                      <span className={styles.statPill}>Ref {ref >= 0 ? '+' : ''}{ref}</span>
                      <span className={styles.statPill}>Vol {will >= 0 ? '+' : ''}{will}</span>
                      {keySkills.map((s) => (
                        <span key={s.name} className={styles.statPill}>
                          {s.name.substring(0, 4)} {s.total >= 0 ? '+' : ''}{s.total}
                        </span>
                      ))}
                    </div>
                    {inOtherCampaign && (
                      <span className={styles.otherCampaign}>En otra campaña</span>
                    )}
                  </div>
                  {isAssigned ? (
                    <button className={`${styles.actionBtn} ${styles.removeBtn}`} onClick={() => unassign(char.id)}>
                      <UserMinus size={14} />
                      Quitar
                    </button>
                  ) : (
                    <button className={`${styles.actionBtn} ${styles.addBtn}`} onClick={() => assign(char.id)}>
                      <UserPlus size={14} />
                      Añadir
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>
          <Button variant="primary" onClick={onClose}>Hecho</Button>
        </div>
      </div>
    </div>
  )
}
