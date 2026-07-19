import type { ClassFeature, SpellsPerDayTable } from './classes'

export type ReplacementType = 'replaces' | 'changes' | 'optional'

export interface ArchetypeReplacement {
  featureName: string
  // Puede venir sin nivel: la página SRD de origen no siempre declara "at Nth level"
  // (típico en competencias de armas o rasgos de nivel 1 implícitos).
  atLevel: number | null
  type: ReplacementType
}

export interface Archetype {
  id: string
  classId: string
  name: string
  description: string
  replaces: ArchetypeReplacement[]
  features: ClassFeature[]
  classSkillsAdded?: string[]
  classSkillsRemoved?: string[]
  spellsPerDayOverride?: SpellsPerDayTable
}

export const ARCHETYPES: Archetype[] = [
  // ─── BARBARIAN ───────────────────────────────────────────────────────────────
  {
    id: 'invulnerable-rager',
    classId: 'barbarian',
    name: 'Invulnerable Rager',
    description: 'Cambia la resistencia estándar por invulnerabilidad y resistencia al daño que crece con el nivel.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
      { featureName: 'Furia Greater', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Invulnerabilidad', level: 2, description: 'Reduces todo el daño físico en 1 punto, aumentando cada 4 niveles.' },
      { name: 'Resistencia Extrema', level: 3, description: 'Reduces el daño de fuego y frío en la mitad.' },
    ],
  },
  {
    id: 'brutal-pugilist',
    classId: 'barbarian',
    name: 'Brutal Pugilist',
    description: 'Sustituye algunas características por maestría en combate desarmado y agarres.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
      { featureName: 'Furia Mayor', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Golpe Salvaje', level: 2, description: 'Tu daño desarmado aumenta al igual que el de un monje.' },
      { name: 'Agarre Brutal', level: 4, description: 'Ganas bonificación de +2 a maniobras de combate para agarrar.' },
    ],
  },
  {
    id: 'urban-barbarian',
    classId: 'barbarian',
    name: 'Urban Barbarian',
    description: 'Adapta la furia salvaje a un entorno urbano, cambiando algunas habilidades de clase.',
    replaces: [
      { featureName: 'Despertar de Furia', atLevel: 1, type: 'changes' },
      { featureName: 'Furia Tireless', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Furia Controlada', level: 1, description: 'Puedes elegir qué estadísticas mejoran durante la furia.' },
      { name: 'Lealtad Urbana', level: 5, description: 'Ganas habilidades de clase sociales adicionales.' },
    ],
    classSkillsAdded: ['diplomacy', 'knowledge_local', 'linguistics'],
    classSkillsRemoved: ['handle_animal', 'survival'],
  },
  {
    id: 'armored-hulk',
    classId: 'barbarian',
    name: 'Armored Hulk',
    description: 'Especialista en armadura pesada que mantiene la movilidad bárbara.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
    ],
    features: [
      { name: 'Competencia con Armadura Pesada', level: 1, description: 'Ganas competencia con armaduras pesadas sin penalización extra a movimiento.' },
      { name: 'Mole Blindada', level: 2, description: 'Reduces la penalización de armadura a la velocidad en 5 pies.' },
    ],
  },

  // ─── BARD ─────────────────────────────────────────────────────────────────
  {
    id: 'arcane-duelist',
    classId: 'bard',
    name: 'Arcane Duelist',
    description: 'Combina esgrima mágica con actuación. Reemplaza algunas inspiraciones por habilidades de combate.',
    replaces: [
      { featureName: 'Conocimiento Bardo', atLevel: 1, type: 'replaces' },
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Danza de Espada', level: 1, description: 'Puedes usar Actuación (esgrima) para inspire courage.' },
      { name: 'Arco Arcano', level: 1, description: 'Tratas una espada elegida como arma de duelista arcano.' },
    ],
  },
  {
    id: 'court-bard',
    classId: 'bard',
    name: 'Court Bard',
    description: 'Especializado en intriga y política de la corte. Cambia la inspiración por manipulación social.',
    replaces: [
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Sátira', level: 1, description: 'Tu actuación aplica penalización a los enemigos en lugar de bonificación a aliados.' },
      { name: 'Gracia de Corte', level: 3, description: 'Ganas bonificación a Diplomacia y Engaño igual a la mitad de tu nivel.' },
    ],
    classSkillsAdded: ['knowledge_nobility'],
  },
  {
    id: 'street-performer',
    classId: 'bard',
    name: 'Street Performer',
    description: 'Artista callejero que actúa para multitudes y usa el caos urbano a su favor.',
    replaces: [
      { featureName: 'Inspiración Maestro', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Actuación Masiva', level: 5, description: 'Puedes mantener bardic performance sin acción si la multitud ya está involucrada.' },
      { name: 'Carterista', level: 1, description: 'Ganas Sleight of Hand como habilidad de clase y la mitad del nivel como bonificación.' },
    ],
  },

  // ─── CLERIC ───────────────────────────────────────────────────────────────
  {
    id: 'herald-caller',
    classId: 'cleric',
    name: 'Herald Caller',
    description: 'Especialista en convocar aliados divinos en lugar de canalizar energía.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'replaces' },
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Convocar al Servidor', level: 1, description: 'Obtienes Convocar Monstruos como poder de dominio divino.' },
      { name: 'Aliado Divino', level: 3, description: 'Las criaturas que convocas ganan bonificadores extra por cada 3 niveles.' },
    ],
  },
  {
    id: 'theologian',
    classId: 'cleric',
    name: 'Theologian',
    description: 'Clérigo especializado en un único dominio que lo lleva a la maestría absoluta.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Dominio Enfocado', level: 1, description: 'Solo tienes un dominio pero sus poderes se duplican en efecto.' },
      { name: 'Magia de Dominio Intensificada', level: 8, description: 'Los conjuros de tu dominio se lanzan como si fueras 4 niveles más alto.' },
    ],
  },
  {
    id: 'ecclesitheurge',
    classId: 'cleric',
    name: 'Ecclesitheurge',
    description: 'Clérigo puro de la fe que evita la lucha y maximiza el poder divino.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Dominio Ampliado', level: 1, description: 'Puedes elegir un tercer dominio pero solo usas poderes del primero.' },
      { name: 'Vínculo con el Templo', level: 4, description: 'Mientras estés en terreno sagrado tu nivel de clérigo cuenta +4 para poderes de dominio.' },
    ],
  },

  // ─── DRUID ────────────────────────────────────────────────────────────────
  {
    id: 'blight-druid',
    classId: 'druid',
    name: 'Blight Druid',
    description: 'Druida de la putrefacción y la decadencia. Cambia compañero animal por plaga.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Señor de la Plaga', level: 1, description: 'Obtienes poder sobre criaturas de tipo vermin y plantas corrompidas.' },
      { name: 'Aura de Podredumbre', level: 3, description: 'Las criaturas adyacentes sufren penalización a las salvaciones de Fortaleza.' },
    ],
  },
  {
    id: 'cave-druid',
    classId: 'druid',
    name: 'Cave Druid',
    description: 'Druida de las cavernas y los subterráneos. Adapta la magia de naturaleza al inframundo.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'changes' },
      { featureName: ' forma Salvaje', atLevel: 4, type: 'changes' },
    ],
    features: [
      { name: 'Visión de Caverna', level: 1, description: 'Ganas visión en la oscuridad hasta 30 pies.' },
      { name: 'Adaptación Subterránea', level: 2, description: 'Ignoras la penalización de moverse en terreno difícil subterráneo.' },
    ],
  },
  {
    id: 'storm-druid',
    classId: 'druid',
    name: 'Storm Druid',
    description: 'Druida especializado en tormentas y fenómenos atmosféricos.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'optional' },
    ],
    features: [
      { name: 'Tormenta Menor', level: 1, description: 'Puedes crear efectos meteorológicos menores a voluntad.' },
      { name: 'Llamada de la Tormenta', level: 6, description: 'Convocas una tormenta menor que dura horas igual a tu nivel.' },
    ],
  },

  // ─── FIGHTER ──────────────────────────────────────────────────────────────
  {
    id: 'archer',
    classId: 'fighter',
    name: 'Archer',
    description: 'Guerrero especializado en arco y armas de proyectil.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Especialista en Arco', level: 2, description: 'Puedes disparar en área de amenaza sin provocar ataques de oportunidad.' },
      { name: 'Puntería Precisa', level: 3, description: 'Ignoras la bonificación de cobertura del objetivo.' },
    ],
  },
  {
    id: 'two-weapon-warrior',
    classId: 'fighter',
    name: 'Two-Weapon Warrior',
    description: 'Maestro del combate con dos armas que minimiza las penalizaciones.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Guardia con Dos Armas', level: 3, description: 'Cuando luchas con dos armas ganas +1 a CA.' },
      { name: 'Ataque con Dos Armas Mejorado', level: 5, description: 'Reduces la penalización por luchar con dos armas en 1.' },
    ],
  },
  {
    id: 'weapon-master',
    classId: 'fighter',
    name: 'Weapon Master',
    description: 'Guerrero que se concentra en dominar un arma específica a la perfección.',
    replaces: [
      { featureName: 'Destreza', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Arma Elegida', level: 1, description: 'Eliges un arma; todos tus talentos de guerrero deben relacionarse con ella.' },
      { name: 'Maestría de Arma', level: 3, description: 'Ganas Enfoque en Arma y Especialización en Arma con tu arma elegida gratis.' },
    ],
  },
  {
    id: 'lore-warden',
    classId: 'fighter',
    name: 'Lore Warden',
    description: 'Guerrero académico que combina conocimiento estratégico con habilidades de combate.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Conocimiento Combativo', level: 2, description: 'Añades la mitad de tu nivel a checks de Conocimiento relacionados con monstruos.' },
      { name: 'Maniobra Táctica', level: 3, description: 'Ganas +2 a maniobras de combate cuando usas un movimiento para estudiar al oponente.' },
    ],
    classSkillsAdded: ['knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion'],
  },

  // ─── MONK ─────────────────────────────────────────────────────────────────
  {
    id: 'master-of-many-styles',
    classId: 'monk',
    name: 'Master of Many Styles',
    description: 'Monje que domina múltiples estilos de combate desarmado.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Fusión de Estilos', level: 1, description: 'Puedes tener dos estilos de combate activos simultáneamente.' },
      { name: 'Perfección de Estilo', level: 4, description: 'Puedes entrar en tres estilos de combate a la vez.' },
    ],
  },
  {
    id: 'zen-archer',
    classId: 'monk',
    name: 'Zen Archer',
    description: 'Monje que canaliza disciplina interna a través del arco.',
    replaces: [
      { featureName: 'Golpe sin Arma', atLevel: 1, type: 'changes' },
      { featureName: 'Armadura Natural', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Arco Perfecto', level: 1, description: 'Tratas el arco como arma de monje y ganas Arma Enfocada con él.' },
      { name: 'Flecha Ki', level: 3, description: 'Puedes gastar puntos ki para añadir daño a tus flechas.' },
    ],
  },
  {
    id: 'tetori',
    classId: 'monk',
    name: 'Tetori',
    description: 'Especialista en lucha y agarres, adaptando la disciplina monástica a la inmovilización.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Presa del Campeón', level: 1, description: 'Ganas Agarre Mejorado como bonificación y no pierdes el modificador de Destreza mientras luchas.' },
      { name: 'Cerrojo Experto', level: 4, description: 'Cuando inmovilizas a un oponente puedes hacer una tirada de daño sin arma.' },
    ],
  },

  // ─── PALADIN ──────────────────────────────────────────────────────────────
  {
    id: 'divine-defender',
    classId: 'paladin',
    name: 'Divine Defender',
    description: 'Paladín protector que refuerza a sus aliados en lugar de atacar.',
    replaces: [
      { featureName: 'Montura Divina', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Defensa Compartida', level: 4, description: 'Gastas usos de Manos Puestas para dar bonificaciones de CA a aliados adyacentes.' },
      { name: 'Santuario Divino', level: 8, description: 'Creas un aura de protección de 10 pies que otorga bonificación de sagrado a saves.' },
    ],
  },
  {
    id: 'hospitaler',
    classId: 'paladin',
    name: 'Hospitaler',
    description: 'Paladín dedicado a la curación y el apoyo de sus aliados.',
    replaces: [
      { featureName: 'Aura de Bien', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Curación Potenciada', level: 4, description: 'Tus usos de Manos Puestas curan el doble cuando se usan en tus aliados.' },
      { name: 'Cirujano de Combate', level: 6, description: 'Puedes usar Manos Puestas como acción rápida para estabilizar a un aliado.' },
    ],
  },
  {
    id: 'sacred-servant',
    classId: 'paladin',
    name: 'Sacred Servant',
    description: 'Paladín que añade poder de dominio clerical a sus capacidades divinas.',
    replaces: [
      { featureName: 'Montura Divina', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Dominio Sagrado', level: 4, description: 'Obtienes los poderes de concesión de un dominio divino de tu deidad.' },
      { name: 'Poder Divino Ampliado', level: 8, description: 'Usas el nivel completo de paladín para determinar los efectos del dominio.' },
    ],
  },

  // ─── RANGER ───────────────────────────────────────────────────────────────
  {
    id: 'beastmaster',
    classId: 'ranger',
    name: 'Beast Master',
    description: 'Explorador que cultiva múltiples compañeros animales.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Lazo Múltiple', level: 1, description: 'Puedes tener hasta tres compañeros animales, aunque son más débiles individualmente.' },
      { name: 'Vínculo de Manada', level: 4, description: 'Tus compañeros actúan coordinados, ganando bonificadores cuando están adyacentes.' },
    ],
  },
  {
    id: 'guide',
    classId: 'ranger',
    name: 'Guide',
    description: 'Explorador experto en navegar terreno y guiar grupos.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
      { featureName: 'Terreno Favorito', atLevel: 3, type: 'changes' },
    ],
    features: [
      { name: 'Guía Experto', level: 1, description: 'Ganas Supervivencia y Conocimiento Geográfico como habilidades enfocadas.' },
      { name: 'Terreno Adaptado', level: 3, description: 'Tus bonificadores de terreno favorito se aplican a un radio mayor e incluyen a aliados.' },
    ],
  },
  {
    id: 'skirmisher',
    classId: 'ranger',
    name: 'Skirmisher',
    description: 'Explorador que usa trucos de combate en lugar de magia.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Trucos de Cazador', level: 4, description: 'Aprendes trucos de combate que se activan al moverte en combate.' },
      { name: 'Movimiento Táctico', level: 6, description: 'Puedes moverte sin provocar ataques de oportunidad una vez por ronda.' },
    ],
  },
  {
    id: 'ranger-archer',
    classId: 'ranger',
    name: 'Archer (Ranger)',
    description: 'Explorador especializado en combate a distancia con arco.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Lluvia de Flechas', level: 4, description: 'Puedes realizar disparos adicionales con penalización reducida.' },
      { name: 'Disparar y Correr', level: 6, description: 'Puedes disparar y moverte sin penalización en el mismo turno.' },
    ],
  },

  // ─── ROGUE ────────────────────────────────────────────────────────────────
  {
    id: 'scout',
    classId: 'rogue',
    name: 'Scout',
    description: 'Pícaro explorador que activa su ataque furtivo al moverse.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Movimiento Furtivo', level: 4, description: 'Puedes aplicar ataque furtivo cuando te mueves 10 pies antes del ataque.' },
      { name: 'Carga Furtiva', level: 8, description: 'Puedes aplicar ataque furtivo al cargar.' },
    ],
  },
  {
    id: 'swashbuckler-rogue',
    classId: 'rogue',
    name: 'Swashbuckler',
    description: 'Pícaro que usa ingenio y agilidad acrobática en lugar de ocultación.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Espadachín', level: 1, description: 'Ganas competencia con espadas ligeras y el talento Finesse sin requisitos.' },
      { name: 'Gracia de Duelo', level: 3, description: 'Añades tu modificador de Carisma a los checks de Intimidar contra oponentes que hayas herido.' },
    ],
  },
  {
    id: 'thug',
    classId: 'rogue',
    name: 'Thug',
    description: 'Pícaro violento que usa el miedo como arma principal.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Intimidación Brutal', level: 1, description: 'Puedes Intimidar como acción de movimiento en lugar de estándar.' },
      { name: 'Golpe Aterrador', level: 2, description: 'Con ataque furtivo puedes asustar al objetivo en lugar de dañarlo.' },
    ],
  },
  {
    id: 'acrobat',
    classId: 'rogue',
    name: 'Acrobat',
    description: 'Pícaro que usa la acrobacia extrema para moverse y atacar.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Movimiento Ágil', level: 1, description: 'Puedes ignorar terreno difícil con movimiento acrobático.' },
      { name: 'Escalar Ágil', level: 2, description: 'Tu velocidad de escalar es igual a tu velocidad base de tierra.' },
    ],
  },

  // ─── SORCERER ─────────────────────────────────────────────────────────────
  {
    id: 'tattooed-sorcerer',
    classId: 'sorcerer',
    name: 'Tattooed Sorcerer',
    description: 'Hechicero que almacena poderes mágicos en tatuajes corporales.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Tatuaje Familiar', level: 1, description: 'Tu familiar vive en uno de tus tatuajes y puede resurgir de él.' },
      { name: 'Tatuaje Mágico', level: 3, description: 'Puedes activar efectos de conjuro almacenados en tus tatuajes.' },
    ],
  },
  {
    id: 'crossblooded',
    classId: 'sorcerer',
    name: 'Crossblooded',
    description: 'Hechicero con dos linajes de sangre que potencian ciertos hechizos.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Doble Linaje', level: 1, description: 'Eliges dos linajes de sangre; obtienes los hechizos conocidos de ambos.' },
      { name: 'Hechizos Potenciados', level: 1, description: 'Los hechizos de ambos linajes se lanzan a nivel +1.' },
    ],
  },
  {
    id: 'seeker',
    classId: 'sorcerer',
    name: 'Seeker',
    description: 'Hechicero explorador de ruinas y conocimiento arcano perdido.',
    replaces: [
      { featureName: 'Hechizos', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Conocimiento Arcano', level: 1, description: 'Ganas Conocimiento Arcano y Descifrar Escritura como habilidades de clase.' },
      { name: 'Trampa Detectora', level: 2, description: 'Puedes detectar trampas mágicas como un ladrón de nivel igual al tuyo.' },
    ],
    classSkillsAdded: ['knowledge_arcana', 'linguistics', 'perception'],
  },

  // ─── WIZARD ───────────────────────────────────────────────────────────────
  // ─── WIZARD ───────────────────────────────────────────────────────────────
  // Escuelas de especialización (arcane schools) — cambian poderes de escuela
  {
    id: 'wizard-abjurer',
    classId: 'wizard',
    name: 'Especialista Abjurador',
    description: 'Mago especializado en conjuros de Abjuración. Obtiene poderes de resistencia y protección mágica. Escuelas prohibidas recomendadas: Evocación, Ilusión.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Resistencia Protectora', level: 1, description: 'Obtienes un bonus de resistencia a las salvaciones igual a 1/3 de tu nivel (mín. 1).' },
      { name: 'Campo de Energía', level: 1, description: 'Como acción estándar, 3 + mod. INT veces al día, creas una barrera de 1d6+1/2 nivel de PV temporales.' },
      { name: 'Supresión de Conjuro', level: 6, description: 'Puedes suprimir un conjuro o efecto mágico activo como dispel magic, 1/día por cada 6 niveles.' },
    ],
  },
  {
    id: 'wizard-conjurer',
    classId: 'wizard',
    name: 'Especialista Conjurador',
    description: 'Mago especializado en conjuros de Conjuración. Convoca aliados con mayor potencia. Escuelas prohibidas recomendadas: Evocación, Ilusión.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Teletransporte a Corta Distancia', level: 1, description: 'Como acción libre 3 + mod. INT veces al día, te teletransportas hasta 5 pies × 1/2 nivel (mín. 5 pies).' },
      { name: 'Convocación Potenciada', level: 8, description: 'Las criaturas que convocas con conjuros de invocación ganan beneficios adicionales.' },
    ],
  },
  {
    id: 'wizard-diviner',
    classId: 'wizard',
    name: 'Especialista Adivino',
    description: 'Mago especializado en adivinación y predicción del futuro. Escuelas prohibidas recomendadas: Ilusión, Nigromancia.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Augure', level: 1, description: 'Una vez al día por cada 4 niveles de mago, lanzas un conjuro de adivinación a nivel de conjurador +2.' },
      { name: 'Visión del Futuro', level: 1, description: 'Tiras dos dados de iniciativa al inicio del combate y eliges cuál usar. 3 + mod. INT veces al día.' },
      { name: 'Ojo del Adivino', level: 8, description: 'Puedes usar clairvoyance/clairaudience a voluntad sobre lugares que hayas visitado antes.' },
    ],
  },
  {
    id: 'wizard-enchanter',
    classId: 'wizard',
    name: 'Especialista Encantador',
    description: 'Mago especializado en conjuros de Encantamiento. Manipula mentes y emociones. Escuelas prohibidas recomendadas: Evocación, Nigromancia.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Mirada Hipnótica', level: 1, description: 'Como acción estándar, un enemigo en 30 pies queda atontado 1 ronda (Will niega). 3 + mod. INT veces al día.' },
      { name: 'Sugestión Arcana', level: 8, description: 'Cuando falla la TS de un encantamiento tuyo, el objetivo queda desorientado 1 ronda en cambio.' },
    ],
  },
  {
    id: 'wizard-evoker',
    classId: 'wizard',
    name: 'Especialista Evocador',
    description: 'Mago especializado en conjuros de Evocación. Daño mágico potenciado. Escuelas prohibidas recomendadas: Encantamiento, Conjuración.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Chispa Intensa', level: 1, description: '3 + mod. INT veces al día, tiras un rayo de energía de 1d6 + 1/2 nivel de daño contra un objetivo en 30 pies.' },
      { name: 'Evocación Potenciada', level: 8, description: 'Añades mod. INT de daño adicional a cualquier conjuro de evocación que cause daño (una vez por conjuro).' },
    ],
  },
  {
    id: 'wizard-illusionist',
    classId: 'wizard',
    name: 'Especialista Ilusionista',
    description: 'Mago especializado en conjuros de Ilusión. Manipula la percepción y crea engaños. Escuelas prohibidas recomendadas: Nigromancia, Conjuración.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Doble Cegador', level: 1, description: '3 + mod. INT veces al día, creas un doble ilusorio al lado de un enemigo que lo deja cegado 1 ronda (Will niega).' },
      { name: 'Velo Persistente', level: 8, description: 'Las ilusiones que creas duran el doble y su CD de salvación aumenta en 1.' },
    ],
  },
  {
    id: 'wizard-necromancer',
    classId: 'wizard',
    name: 'Especialista Nigromante',
    description: 'Mago especializado en conjuros de Nigromancia. Domina la muerte y los no-muertos. Escuelas prohibidas recomendadas: Encantamiento, Ilusión.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Toque Putrefacto', level: 1, description: '3 + mod. INT veces al día, toque que causa 1d6 + 1/2 nivel de daño a criaturas vivas o sana igual a no-muertos.' },
      { name: 'Animación Rápida', level: 8, description: 'Puedes crear no-muertos con animate dead sin material component y uno más por día.' },
    ],
  },
  {
    id: 'wizard-transmuter',
    classId: 'wizard',
    name: 'Especialista Transmutador',
    description: 'Mago especializado en conjuros de Transmutación. Altera la realidad física. Escuelas prohibidas recomendadas: Abjuración, Conjuración.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Magia de Transformación', level: 1, description: 'Elige una característica física; 3 + mod. INT veces al día ganas +2 a esa estadística durante 1 ronda/nivel.' },
      { name: 'Cambio de Forma Físico', level: 8, description: 'Cuando lanzas un conjuro de transmutación de forma, añades +2 a FUE o DES durante la duración.' },
    ],
  },

  // Escuelas elementales (Ultimate Magic)
  {
    id: 'wizard-air-elementalist',
    classId: 'wizard',
    name: 'Elementalista del Aire',
    description: 'Mago especializado en magia del elemento Aire. Puede incluir agua como escuela secundaria.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Ráfaga de Viento', level: 1, description: '3 + mod. INT veces al día, puedes empujar una criatura en 30 pies (Fort o la mueves 5 pies por nivel).' },
      { name: 'Celeridad del Viento', level: 6, description: 'Aumentas tu velocidad de movimiento en 10 pies. A nivel 10, puedes volar con velocidad de vuelo media.' },
    ],
  },
  {
    id: 'wizard-earth-elementalist',
    classId: 'wizard',
    name: 'Elementalista de la Tierra',
    description: 'Mago especializado en magia del elemento Tierra. Puede incluir ácido como escuela secundaria.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Golpe de Piedra', level: 1, description: '3 + mod. INT veces al día, golpe que causa 1d6 + 1/2 nivel de daño contundente y puede aturdir 1 ronda.' },
      { name: 'Piel de Piedra', level: 6, description: 'Obtienes RD 1/— que aumenta en 1 por cada 4 niveles de mago.' },
    ],
  },
  {
    id: 'wizard-fire-elementalist',
    classId: 'wizard',
    name: 'Elementalista del Fuego',
    description: 'Mago especializado en magia del elemento Fuego. Puede incluir rayo como escuela secundaria.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Rayo de Fuego', level: 1, description: '3 + mod. INT veces al día, rayo de 1d6 + 1/2 nivel de daño de fuego en 30 pies. Puede causar fuego persistente.' },
      { name: 'Elemental del Fuego', level: 6, description: 'Ganas inmunidad al fuego y tu daño con conjuros de fuego ignora la resistencia al fuego de 5 o menos.' },
    ],
  },
  {
    id: 'wizard-water-elementalist',
    classId: 'wizard',
    name: 'Elementalista del Agua',
    description: 'Mago especializado en magia del elemento Agua. Puede incluir hielo como escuela secundaria.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Chorro de Agua', level: 1, description: '3 + mod. INT veces al día, chorro de agua que causa 1d6 + 1/2 nivel y puede derribar al objetivo (Fort niega).' },
      { name: 'Forma Acuosa', level: 6, description: 'Puedes breathe water, nadas con velocidad 30 pies, y ganas RD 5/slashing cuando estás bajo el agua.' },
    ],
  },

  // Arquetipos de arquetipo puro (Ultimate Magic / APG)
  {
    id: 'arcane-bomber',
    classId: 'wizard',
    name: 'Arcane Bomber',
    description: 'Mago que canaliza su magia en bombas de energía arcana lanzables, a expensas de poderes de escuela.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
      { featureName: 'Escritura de Conjuros', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Bomba Arcana', level: 1, description: 'Crea y lanza bombas de energía arcana como alquimista de nivel igual al tuyo. Daño 1d6 + mod. INT por 1/2 nivel.' },
      { name: 'Explosión Potenciada', level: 8, description: 'Puedes elegir el tipo de energía de la bomba (fuego, frío, electricidad o ácido) al crearla.' },
    ],
  },
  {
    id: 'scrollmaster',
    classId: 'wizard',
    name: 'Scrollmaster',
    description: 'Mago especializado en el uso ofensivo y defensivo de pergaminos mágicos como arma y escudo.',
    replaces: [
      { featureName: 'Vínculo Arcano', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Escudo de Pergamino', level: 1, description: 'Usas un pergamino como escudo mágico que añade su nivel de hechizo a tu CA como bonificación de escudo.' },
      { name: 'Leer Rápido', level: 1, description: 'Activas pergaminos como acción de movimiento en lugar de estándar.' },
      { name: 'Pergamino Blindado', level: 4, description: 'Cuando te impacta un conjuro o ataque mágico, puedes gastar un pergamino para reducir el daño a la mitad.' },
    ],
  },
  {
    id: 'shadow-caller',
    classId: 'wizard',
    name: 'Shadow Caller',
    description: 'Mago que invoca criaturas del Plano de las Sombras en lugar de criaturas normales.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Invocación de Sombras', level: 1, description: 'Cuando invocas criaturas, puedes elegir traerlas del Plano de las Sombras. Son más fuertes pero tienen vulnerabilidad a la luz.' },
      { name: 'Fusión con la Sombra', level: 1, description: '3 + mod. INT veces al día, te vuelves translúcido durante 1 ronda, ganando ocultamiento (20% de fallo).' },
      { name: 'Toque de Oscuridad', level: 6, description: 'Tu toque apaga fuentes de luz no mágicas y puede causar ceguera temporal (Fort niega, 1 ronda/nivel).' },
    ],
  },
  {
    id: 'spellslinger',
    classId: 'wizard',
    name: 'Spellslinger',
    description: 'Mago que combina el uso de armas de fuego con la magia arcana, canalizando conjuros a través del cañón.',
    replaces: [
      { featureName: 'Vínculo Arcano', atLevel: 1, type: 'replaces' },
      { featureName: 'Escritura de Conjuros', atLevel: 1, type: 'changes' },
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Pistola Arcana', level: 1, description: 'Obtienes competencia con armas de fuego y una pistola de inicio. Puedes canalizar conjuros de toque a través de ella para dispararlos a distancia.' },
      { name: 'Hechizo Bala', level: 1, description: 'Los conjuros lanzados a través de la pistola arcana añaden el daño del arma al efecto del conjuro.' },
      { name: 'Recarga Mágica', level: 4, description: 'Puedes recargar tu pistola arcana como acción libre 3 + mod. INT veces al día sin usar munición física.' },
    ],
  },
  {
    id: 'exploiter-wizard',
    classId: 'wizard',
    name: 'Exploiter Wizard',
    description: 'Mago que intercambia la especialización de escuela y el vínculo arcano por explotaciones arcanas del Arcanista. (Advanced Class Guide)',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
      { featureName: 'Vínculo Arcano', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Reserva Arcana', level: 1, description: 'Tienes puntos de reserva arcana = 3 + mod. INT. Se recuperan al preparar conjuros.' },
      { name: 'Explotación Arcana', level: 1, description: 'Aprendes explotaciones arcanas del Arcanista. Inicias con una y obtienes otra a nivel 3 y cada 2 niveles después.' },
    ],
  },
  {
    id: 'spell-sage',
    classId: 'wizard',
    name: 'Spell Sage',
    description: 'Erudito arcano que puede identificar y replicar hechizos de cualquier lista de conjuros.',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Conocimiento Universal', level: 1, description: 'No tienes escuelas prohibidas. Puedes preparar cualquier hechizo de cualquier lista de clase arcana que conozcas.' },
      { name: 'Sabiduría Arcana', level: 2, description: '1/día por cada 6 niveles, lanzas un hechizo como si tu nivel de conjurador fuera 2 más alto.' },
      { name: 'Consejo de los Libros', level: 6, description: 'Añades la mitad de tu nivel a checks de Conocimiento sobre magia y puedes "recordar" conjuros ya lanzados como si tuvieras el talento Lore Master.' },
    ],
  },
  {
    id: 'pact-wizard',
    classId: 'wizard',
    name: 'Pact Wizard',
    description: 'Mago que ha sellado un pacto con un espíritu u outsider a cambio de poder arcano adicional. (Horror Adventures)',
    replaces: [
      { featureName: 'Vínculo Arcano', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Pacto Arcano', level: 1, description: 'Forjas un pacto con un tipo de criatura extraplanar. Obtienes resistencias y poderes relacionados con ese tipo.' },
      { name: 'Llamada del Pacto', level: 1, description: '1/día puedes invocar a tu patrono pactado como una invocación de monstruos de nivel equivalente a la mitad de tu nivel de mago.' },
      { name: 'Favores del Patrono', level: 4, description: 'Tu patrono te concede uno de sus poderes innatos que puedes usar 1/día.' },
    ],
  },
  {
    id: 'thassilonian-specialist',
    classId: 'wizard',
    name: 'Thassilonian Specialist',
    description: 'Mago de las antiguas tradiciones Thassilonianas: domina una única escuela con maestría absoluta pero tiene dos escuelas prohibidas. (Rise of the Runelords)',
    replaces: [
      { featureName: 'Escuela de Especialización', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Especialización Extrema', level: 1, description: 'Ganas un espacio de conjuro extra de tu escuela especializada por cada nivel de conjuro que puedas lanzar (en lugar del habitual espacio de la escuela).' },
      { name: 'Dominio de Pecado', level: 1, description: 'Tu especialización está asociada a uno de los siete pecados capitales Thassilonianos; ganas poderes temáticos únicos relacionados con él.' },
    ],
  },
  {
    id: 'siege-mage',
    classId: 'wizard',
    name: 'Siege Mage',
    description: 'Mago entrenado en magia militar a gran escala: mejora motores de asedio y lanza conjuros de área masiva. (Ultimate Combat)',
    replaces: [
      { featureName: 'Escritura de Conjuros', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Operario de Asedio', level: 1, description: 'Puedes controlar un motor de asedio como acción estándar y añadir mod. INT a su ataque o daño.' },
      { name: 'Conjuro de Artillería', level: 5, description: 'Puedes lanzar conjuros de evocación de área a través de un motor de asedio; el área del conjuro se centra en el punto de impacto y se duplica.' },
      { name: 'Escudo Arcano Defensivo', level: 10, description: 'Puedes crear una cúpula de fuerza mágica que protege un área de 30 pies de diámetro de ataques de asedio durante 1 hora/día.' },
    ],
  },

  // ─── BARBARIAN (adicionales) ──────────────────────────────────────────────
  {
    id: 'superstitious-barbarian',
    classId: 'barbarian',
    name: 'Superstitious',
    description: 'Bárbaro con desconfianza innata hacia la magia. Gana resistencia a conjuros durante la furia.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Mente de Acero', level: 2, description: 'Durante la furia, añades tu bonificador de moral a todas las salvaciones contra conjuros y efectos sobrenaturales.' },
      { name: 'Resistencia Mágica', level: 5, description: 'Ganas resistencia a conjuros = 10 + nivel mientras estás en furia.' },
    ],
  },
  {
    id: 'titan-mauler',
    classId: 'barbarian',
    name: 'Titan Mauler',
    description: 'Bárbaro especializado en empuñar armas enormes diseñadas para criaturas de mayor tamaño.',
    replaces: [
      { featureName: 'Furia Mayor', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Arma Enorme', level: 2, description: 'Puedes empuñar armas de una categoría de tamaño mayor con una penalización de solo −2 al ataque.' },
      { name: 'Golpe Aplastante', level: 4, description: 'Con armas de gran tamaño, el daño de crítico se multiplica por uno adicional.' },
    ],
  },
  {
    id: 'wild-rager',
    classId: 'barbarian',
    name: 'Wild Rager',
    description: 'Bárbaro cuya furia es tan incontrolable que puede atacar a aliados, pero gana potencia extrema.',
    replaces: [
      { featureName: 'Furia Tireless', atLevel: 5, type: 'changes' },
    ],
    features: [
      { name: 'Furia Incontrolable', level: 1, description: 'Durante la furia, si matas a un enemigo, debes superar una salvación de Voluntad o atacar al aliado más cercano.' },
      { name: 'Potencia Salvaje', level: 1, description: 'Mientras estás en furia, añades el doble de tu bonificador de moral al daño cuerpo a cuerpo.' },
    ],
  },
  {
    id: 'mooncursed-barbarian',
    classId: 'barbarian',
    name: 'Mooncursed',
    description: 'Bárbaro maldito que adopta rasgos animales durante la furia dependiendo de la fase lunar.',
    replaces: [
      { featureName: 'Furia Greater', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Maldición Lunar', level: 3, description: 'Al entrar en furia, adoptas rasgos físicos de un animal (garras, colmillos, visión nocturna) según la fase de la luna.' },
      { name: 'Transformación Salvaje', level: 6, description: 'A partir del nivel 6, la transformación lunar durante la furia se vuelve más pronunciada: ganas ataques naturales adicionales.' },
    ],
  },
  {
    id: 'elemental-kin',
    classId: 'barbarian',
    name: 'Elemental Kin',
    description: 'Bárbaro con sangre elemental en sus venas que canaliza ese poder durante la furia.',
    replaces: [
      { featureName: 'Furia Improved', atLevel: 2, type: 'replaces' },
    ],
    features: [
      { name: 'Alma Elemental', level: 1, description: 'Elige un elemento (fuego, frío, electricidad o ácido). Ganas resistencia 5 a ese elemento.' },
      { name: 'Furia Elemental', level: 2, description: 'Durante la furia, tus ataques cuerpo a cuerpo causan 1d6 de daño elemental adicional del tipo elegido.' },
    ],
  },

  // ─── BARD (adicionales) ───────────────────────────────────────────────────
  {
    id: 'archaeologist',
    classId: 'bard',
    name: 'Archaeologist',
    description: 'Explorador de ruinas y reliquias que usa la suerte en lugar de la música. No necesita bardic performance.',
    replaces: [
      { featureName: 'Inspiración de Canción', atLevel: 1, type: 'replaces' },
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'replaces' },
      { featureName: 'Inspiración Maestro', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Suerte del Arqueólogo', level: 2, description: 'Ganas un bonificador de suerte de +1 a ataque, salvaciones, habilidades y daño igual a 1 + 1/4 de nivel, durante rounds = nivel + mod. CAR.' },
      { name: 'Sentido de Trampa', level: 1, description: 'Añades la mitad de tu nivel como bonificación a Percepción para detectar trampas.' },
      { name: 'Evasión', level: 4, description: 'Ganas Evasión como el ladrón.' },
    ],
    classSkillsAdded: ['disable_device', 'knowledge_dungeoneering'],
  },
  {
    id: 'detective-bard',
    classId: 'bard',
    name: 'Detective',
    description: 'Bardo especializado en resolución de misterios e interrogación, usando la música para revelar mentiras.',
    replaces: [
      { featureName: 'Inspiración Valiente', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Ojo Investigador', level: 1, description: 'Añades mod. INT (además de CAR) a las tiradas de Sentir Motivaciones y Diplomacia para recopilar información.' },
      { name: 'Serenata de la Verdad', level: 2, description: 'Mantienes una bardic performance que fuerza a los que la escuchan a superar Vol o no pueden mentir durante su duración.' },
    ],
    classSkillsAdded: ['knowledge_local', 'linguistics'],
  },
  {
    id: 'magician-bard',
    classId: 'bard',
    name: 'Magician',
    description: 'Bardo que se especializa en ilusiones y trucos de manos, combinando actuación con magia real.',
    replaces: [
      { featureName: 'Conocimiento Bardo', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Prestidigitación Arcana', level: 1, description: 'Usas Actuación (prestidigitación) en lugar de Engaño para tus tiradas de ilusión. Añades nivel a las DCs de ilusiones.' },
      { name: 'Truco de Distracción', level: 3, description: 'Como acción estándar, creas una distracción que otorga bonificación flanking a un aliado hasta el inicio de tu siguiente turno.' },
    ],
  },
  {
    id: 'savage-skald',
    classId: 'bard',
    name: 'Savage Skald',
    description: 'Bardo guerrero que usa cantos de guerra tribales para impulsar a sus aliados al combate.',
    replaces: [
      { featureName: 'Inspiración de Canción', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Canto de Guerra', level: 1, description: 'Tu inspire courage también permite a los aliados hacer un ataque adicional a menor BAB durante 1 ronda cuando matan a un enemigo.' },
      { name: 'Furia Inspirada', level: 3, description: 'Los aliados afectados por tu inspire courage pueden entrar en un estado de berserker menor (+2 FUE, −1 CA) durante la duración.' },
    ],
  },
  {
    id: 'thundercaller',
    classId: 'bard',
    name: 'Thundercaller',
    description: 'Bardo cuya voz es un arma literal: canaliza truenos y relámpagos a través de su canto.',
    replaces: [
      { featureName: 'Inspiración Maestro', atLevel: 5, type: 'replaces' },
    ],
    features: [
      { name: 'Grito del Trueno', level: 1, description: '1/día por cada 4 niveles, sueltas un grito en cono de 30 pies que causa 1d6/2 niveles de daño sónico y aturde 1 ronda (Fort ½ y niega aturdimiento).' },
      { name: 'Voz de la Tormenta', level: 5, description: 'Tu bardic performance de inspire courage añade daño eléctrico igual a la bonificación que ya otorga.' },
    ],
  },

  // ─── CLERIC (adicionales) ─────────────────────────────────────────────────
  {
    id: 'cloistered-cleric',
    classId: 'cleric',
    name: 'Cloistered Cleric',
    description: 'Clérigo erudito de biblioteca que sacrifica combate por mayor versatilidad mágica y conocimiento.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Conocimiento Profundo', level: 1, description: 'Añades la mitad de tu nivel a todos los checks de Conocimiento y los tratas como entrenados.' },
      { name: 'Dominio Adicional', level: 1, description: 'Eliges tres dominios en lugar de dos, aunque solo puedes preparar conjuros de dos de ellos cada día.' },
      { name: 'Lore Divino', level: 6, description: 'Puedes identificar conjuros y efectos mágicos como si usaras identify automáticamente.' },
    ],
    classSkillsAdded: ['knowledge_arcana', 'knowledge_dungeoneering', 'knowledge_nature', 'knowledge_planes'],
  },
  {
    id: 'crusader-cleric',
    classId: 'cleric',
    name: 'Crusader',
    description: 'Clérigo guerrero que lidera a sus tropas desde el frente, sacrificando preparación de conjuros por potencia marcial.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Inspiración de Batalla', level: 1, description: 'Como bardic performance, inspiras a tus aliados otorgando bonificador de moral +1 al ataque cuando los ves luchar.' },
      { name: 'Maestría Marcial', level: 1, description: 'Ganas Golpe Poderoso o Combate con Dos Armas como talento adicional de combate, aunque no cumplas los requisitos.' },
    ],
  },
  {
    id: 'divine-strategist',
    classId: 'cleric',
    name: 'Divine Strategist',
    description: 'Clérigo táctico que coordina el campo de batalla con precisión divina.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Bendición Táctica', level: 1, description: 'Como acción estándar, otorgas a tus aliados en 30 pies la capacidad de moverse su velocidad adicional 1 vez antes de su próxima acción.' },
      { name: 'Maniobra Sagrada', level: 4, description: 'Puedes gastar usos de Canalizar Energía para que todos tus aliados en 30 pies hagan ataques de oportunidad contra un enemigo que designes.' },
    ],
  },
  {
    id: 'merciful-healer',
    classId: 'cleric',
    name: 'Merciful Healer',
    description: 'Clérigo dedicado exclusivamente a la sanación, con poderes de curación muy potenciados.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Sanación Compasiva', level: 1, description: 'Cuando canal positive energy para curar, añades mod. SAB adicional a los PV curados.' },
      { name: 'Toque Misericordioso', level: 2, description: 'Con Manos Puestas de paladin (equivalente), eliminas condiciones negativas además de curar PV.' },
      { name: 'Curación Masiva', level: 6, description: 'Tus conjuros de curación curan el máximo posible cuando los lanzas sobre criaturas que están a 0 PV o menos.' },
    ],
  },
  {
    id: 'separatist-cleric',
    classId: 'cleric',
    name: 'Separatist',
    description: 'Clérigo que sigue sus propias convicciones en lugar de las de su deidad, eligiendo un dominio fuera de los permitidos.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Dominio Prohibido', level: 1, description: 'Puedes elegir un dominio que tu deidad normalmente no ofrece. Los conjuros de ese dominio cuestan un espacio adicional.' },
      { name: 'Fe Independiente', level: 3, description: 'Eres menos vulnerable a efectos que perjudican a seguidores de una deidad específica.' },
    ],
  },
  {
    id: 'evangelist-cleric',
    classId: 'cleric',
    name: 'Evangelist',
    description: 'Clérigo predicador que convierte y lidera masas, combinando poderes de bardo con los del clérigo.',
    replaces: [
      { featureName: 'Canalizar Energía', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Sermón Divino', level: 1, description: 'Como bardic performance de bardo de nivel igual al tuyo, usas Actuación para inspire courage/competence.' },
      { name: 'Palabra de Dios', level: 5, description: 'Tu sermón puede afectar a no-creyentes como hold person (Vol niega) mientras mantienes la performance.' },
    ],
  },

  // ─── DRUID (adicionales) ──────────────────────────────────────────────────
  {
    id: 'urban-druid',
    classId: 'druid',
    name: 'Urban Druid',
    description: 'Druida de la jungla de piedra que protege ecosistemas urbanos y la naturaleza que sobrevive en las ciudades.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'changes' },
      { featureName: ' forma Salvaje', atLevel: 4, type: 'changes' },
    ],
    features: [
      { name: 'Empatía Urbana', level: 1, description: 'Añades mod. CAR a checks de Diplomacia e Intimidar. Tus conjuros de naturaleza también afectan a criaturas urbanas.' },
      { name: 'Forma Urbana', level: 4, description: 'Puedes transformarte en un humanoide común además de en animales, manteniendo tus poderes de druida.' },
    ],
    classSkillsAdded: ['diplomacy', 'knowledge_local'],
    classSkillsRemoved: ['knowledge_nature', 'survival'],
  },
  {
    id: 'world-walker-druid',
    classId: 'druid',
    name: 'World Walker',
    description: 'Druida nómada que protege múltiples terrenos y viaja constantemente, adaptándose a cualquier entorno.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'optional' },
    ],
    features: [
      { name: 'Terrenos Múltiples', level: 1, description: 'Obtienes Terreno Favorito del explorador (como el talento de clase del ranger) a nivel 1 y cada 4 niveles después.' },
      { name: 'Adaptación Rápida', level: 3, description: 'Cambias tu terreno favorito activo como acción gratuita una vez al día.' },
    ],
  },
  {
    id: 'aquatic-druid',
    classId: 'druid',
    name: 'Aquatic Druid',
    description: 'Druida guardián de océanos, ríos y costas, con poderes especiales bajo el agua.',
    replaces: [
      { featureName: ' forma Salvaje', atLevel: 4, type: 'changes' },
    ],
    features: [
      { name: 'Respiración Acuática', level: 1, description: 'Puedes respirar bajo el agua indefinidamente y nadas con velocidad 30 pies.' },
      { name: 'Forma Acuática', level: 4, description: 'Puedes transformarte en criaturas acuáticas (peces, pulpos, tiburones) además de animales terrestres.' },
      { name: 'Llamada del Mar', level: 6, description: '1/día convocas una tormenta de agua dulce o marina de 60 pies de radio que dificulta la visión y el movimiento.' },
    ],
  },
  {
    id: 'arctic-druid',
    classId: 'druid',
    name: 'Arctic Druid',
    description: 'Druida de tundras y glaciares que domina el frío extremo y la supervivencia en entornos helados.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Resistencia al Frío', level: 1, description: 'Ganas inmunidad a los efectos de clima frío y resistencia al frío 5, que aumenta a 10 a nivel 5 e inmunidad a nivel 10.' },
      { name: 'Forma Ártica', level: 4, description: 'Puedes transformarte en animales del ártico (osos polares, lobos árticos, focas) ganando sus immunidades al frío.' },
    ],
  },
  {
    id: 'jungle-druid',
    classId: 'druid',
    name: 'Jungle Druid',
    description: 'Druida de selvas tropicales y junglas densas, experto en venenos y criaturas exóticas.',
    replaces: [
      { featureName: 'Naturaleza Absoluta', atLevel: 5, type: 'changes' },
    ],
    features: [
      { name: 'Inmunidad a Veneno', level: 5, description: 'Ganas inmunidad a venenos no-mágicos. Los venenos que aplicas tienen CD +2.' },
      { name: 'Maestro de la Jungla', level: 1, description: 'Moverse a través de vegetación natural difícil no te cuesta movimiento adicional y no dejas rastros.' },
    ],
    classSkillsAdded: ['knowledge_nature', 'stealth'],
  },
  {
    id: 'verdant-gnome-druid',
    classId: 'druid',
    name: 'Verdant Gnome',
    description: 'Druida gnomo con vínculo especial con las plantas. Puede hablar con plantas y animarlas.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Empatía con Plantas', level: 1, description: 'Puedes comunicarte con plantas como si usaras speak with plants constantemente. Las plantas amigables te ayudan activamente.' },
      { name: 'Animación Vegetal', level: 4, description: '1/día animas una planta de tamaño Mediano o menor como si usara liveoak. A nivel 8 puedes animar plantas Grandes.' },
    ],
  },

  // ─── FIGHTER (adicionales) ────────────────────────────────────────────────
  {
    id: 'mobile-fighter',
    classId: 'fighter',
    name: 'Mobile Fighter',
    description: 'Guerrero que usa la movilidad y el movimiento dinámico como arma táctica principal.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Paso Ágil', level: 3, description: 'Puedes moverte hasta tu velocidad completa como acción de movimiento incluso después de un ataque estándar.' },
      { name: 'Carga Mejorada', level: 5, description: 'No provacas ataques de oportunidad al cargar y puedes girar hasta 90° durante la carga.' },
    ],
  },
  {
    id: 'phalanx-soldier',
    classId: 'fighter',
    name: 'Phalanx Soldier',
    description: 'Guerrero especializado en combate en formación cerrada con escudo y lanza.',
    replaces: [
      { featureName: 'Destreza', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Formación de Falange', level: 1, description: 'Cuando luchas junto a un aliado con escudo, ambos ganáis +2 a CA y podéis usar armas de alcance en espacio adyacente.' },
      { name: 'Muro de Escudos', level: 3, description: 'Si tú y un aliado lleváis escudos y estáis adyacentes, la bonificación de escudo de ambos aumenta en 2.' },
    ],
  },
  {
    id: 'gladiator-fighter',
    classId: 'fighter',
    name: 'Gladiator',
    description: 'Guerrero entrenado en arenas y espectáculos de combate que usa la intimidación como arma.',
    replaces: [
      { featureName: 'Destreza', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Intimidación de Arena', level: 2, description: 'Al derrotar a un oponente, puedes intimidar a todos los enemigos en 30 pies como acción libre.' },
      { name: 'Actuación de Combate', level: 1, description: 'Tratas Actuación como habilidad de clase y puedes añadir mod. CAR a las maniobras de combate para aturdir.' },
    ],
    classSkillsAdded: ['perform'],
  },
  {
    id: 'dragoon-fighter',
    classId: 'fighter',
    name: 'Dragoon',
    description: 'Guerrero especializado en combate montado y el uso de lanzas desde la silla.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'replaces' },
    ],
    features: [
      { name: 'Lanza de Caballería', level: 1, description: 'Con lanza montada, el multiplicador de daño de cargar aumenta a ×4 y no sufres la penalización de −4 al ataque al no ser caballero.' },
      { name: 'Acometida Aérea', level: 5, description: 'Puedes hacer una carga desde montura voladora con penalización de solo −1 al ataque y daño doble.' },
    ],
    classSkillsAdded: ['ride'],
  },
  {
    id: 'tower-shield-specialist',
    classId: 'fighter',
    name: 'Tower Shield Specialist',
    description: 'Guerrero que convierte el escudo de torre en una fortaleza ambulante.',
    replaces: [
      { featureName: 'Armadura Pesada', atLevel: 3, type: 'changes' },
    ],
    features: [
      { name: 'Defensa de Torre', level: 1, description: 'Reduces la penalización de ataque por usar escudo de torre en 2 (a −4 en lugar de −2 adicional).' },
      { name: 'Escudo Inexpugnable', level: 3, description: 'Puedes usar el escudo de torre para obtener cobertura total como acción de movimiento en lugar de estándar.' },
    ],
  },
  {
    id: 'unbreakable-fighter',
    classId: 'fighter',
    name: 'Unbreakable',
    description: 'Guerrero cuya resistencia física es legendaria: absorbe golpes que matarían a otros.',
    replaces: [
      { featureName: 'Destreza', atLevel: 2, type: 'replaces' },
    ],
    features: [
      { name: 'Aguante de Hierro', level: 2, description: 'Ganas Aguante y Dormir en Armadura como talentos sin requisitos. Cada nivel impar reduces el daño no-letal en 1.' },
      { name: 'Resistencia al Dolor', level: 4, description: 'Cuando llegas a 0 PV, haces una tirada de Fortaleza (CD 15). Si la superas, sigues combatiendo con el estado fatigado en lugar de caer.' },
    ],
  },

  // ─── MONK (adicionales) ───────────────────────────────────────────────────
  {
    id: 'flowing-monk',
    classId: 'monk',
    name: 'Flowing Monk',
    description: 'Monje que usa el flujo del combate enemigo contra ellos mismos, redirigiendo ataques y ataques.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Redirección', level: 1, description: 'Cuando un enemigo falla un ataque cuerpo a cuerpo contra ti, puedes gastar 1 punto ki para que el ataque se redirija contra otro objetivo adyacente.' },
      { name: 'Flujo Perfecto', level: 3, description: 'Una vez por ronda, cuando esquivas un ataque, puedes hacer un ataque de oportunidad contra el atacante como acción libre.' },
    ],
  },
  {
    id: 'hungry-ghost-monk',
    classId: 'monk',
    name: 'Hungry Ghost Monk',
    description: 'Monje que drena la fuerza vital de sus enemigos para potenciar su propia ki.',
    replaces: [
      { featureName: 'Armadura Natural', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Drenaje de Ki', level: 1, description: 'Cuando golpeas con un ataque desarmado, recuperas 1 punto ki si el objetivo falla una salvación de Fortaleza.' },
      { name: 'Terrifying Strike', level: 4, description: 'Al gastar 1 punto ki, un golpe causa que el objetivo quede asustado durante 1d4 rondas (Vol niega).' },
    ],
  },
  {
    id: 'weapon-adept-monk',
    classId: 'monk',
    name: 'Weapon Adept',
    description: 'Monje que integra el uso de armas tradicionales monásticas en su disciplina de ki.',
    replaces: [
      { featureName: 'Golpe sin Arma', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Arma Perfecta', level: 1, description: 'Elige un arma de monje. Ganas Enfoque en Arma sin requisitos y la tratas como golpe desarmado para tus poderes de monje.' },
      { name: 'Ki del Arma', level: 3, description: 'Puedes gastar puntos ki para añadir propiedades mágicas (impactante, exacta, etc.) a tu arma perfecta durante 1 minuto.' },
    ],
  },
  {
    id: 'sohei',
    classId: 'monk',
    name: 'Sohei',
    description: 'Guerrero-monje montado que combina disciplina marcial con el combate a caballo.',
    replaces: [
      { featureName: 'Armadura Natural', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Monta Ki', level: 1, description: 'Puedes usar tus poderes de ki mientras estás montado y el bonificador de AC no armada se aplica contra ataques mientras montas.' },
      { name: 'Carga Ki', level: 3, description: 'Cuando cargas montado y gastas 1 punto ki, el multiplicador de daño de carga aumenta en 1 y no provocas ataques de oportunidad.' },
    ],
    classSkillsAdded: ['ride'],
  },
  {
    id: 'ki-mystic',
    classId: 'monk',
    name: 'Ki Mystic',
    description: 'Monje que desarrolla poderes psíquicos y de adivinación a través de la meditación profunda.',
    replaces: [
      { featureName: 'Golpe Aturdidor', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Visión Ki', level: 1, description: 'Gastas 1 punto ki para ver a través de ilusiones, detectar la alineación de criaturas en 30 pies o ver en oscuridad mágica durante 1 minuto.' },
      { name: 'Meditación Profunda', level: 5, description: 'Si meditas 1 hora, puedes lanzar augury o, a nivel 10, divination como poder sobrenatural.' },
    ],
  },

  // ─── PALADIN (adicionales) ────────────────────────────────────────────────
  {
    id: 'holy-tactician',
    classId: 'paladin',
    name: 'Holy Tactician',
    description: 'Paladín que lidera a sus aliados con maestría táctica en lugar de auras y bendiciones personales.',
    replaces: [
      { featureName: 'Detectar Maldad', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Trabajo en Equipo Divino', level: 1, description: 'Concedes talentos de trabajo en equipo a tus aliados en 30 pies que duren 3 + mod. CAR rondas, 1/día por cada 5 niveles.' },
      { name: 'Estratega Sagrado', level: 4, description: 'Cuando usas Trabajo en Equipo Divino, también añades un bonificador de competencia de +2 a las tiradas de ataque de los aliados afectados.' },
    ],
  },
  {
    id: 'shining-knight',
    classId: 'paladin',
    name: 'Shining Knight',
    description: 'Paladín con énfasis en el combate montado y la caballería sagrada.',
    replaces: [
      { featureName: 'Aura de Bien', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Montura Sagrada Mejorada', level: 1, description: 'Tu Montura Divina es más poderosa: sus PV adicionales, bonificadores y poderes especiales mejoran como si tuvieras 4 niveles más.' },
      { name: 'Carga Celestial', level: 3, description: 'Tu montura y tú podéis cargar como si fuerais una sola criatura. La CA no se reduce durante la carga.' },
    ],
  },
  {
    id: 'undead-scourge',
    classId: 'paladin',
    name: 'Undead Scourge',
    description: 'Paladín especializado en la destrucción de no-muertos, con poderes especiales contra ellos.',
    replaces: [
      { featureName: 'Manos Puestas', atLevel: 2, type: 'changes' },
    ],
    features: [
      { name: 'Golpe Destructor', level: 2, description: 'Tus ataques contra no-muertos causan daño máximo automáticamente y los afectas como si llevaras una espada del bien.' },
      { name: 'Aura de Purificación', level: 4, description: 'Los no-muertos en 10 pies sufren −2 a todas las tiradas y los efectos que controlan no-muertos en el aura fallan automáticamente.' },
    ],
  },
  {
    id: 'warrior-of-holy-light',
    classId: 'paladin',
    name: 'Warrior of the Holy Light',
    description: 'Paladín que no sigue a ninguna deidad específica sino a la causa del bien absoluto, con poderes de luz.',
    replaces: [
      { featureName: 'Dominio', atLevel: 1, type: 'replaces' },
      { featureName: 'Detectar Maldad', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Poder de la Luz', level: 1, description: 'Emites luz brillante en 20 pies y luz tenue en 40 pies. Los no-muertos y seres malvados en la luz brillante reciben −2 a todas las tiradas.' },
      { name: 'Golpe de Luz Sagrada', level: 4, description: 'Gastas 2 usos de Manos Puestas para causar daño de luz sagrada = 1d6/4 niveles en explosión de 10 pies (Ref ½).' },
    ],
  },

  // ─── RANGER (adicionales) ─────────────────────────────────────────────────
  {
    id: 'falconer',
    classId: 'ranger',
    name: 'Falconer',
    description: 'Explorador que usa aves de presa como compañeros de caza, coordinando ataques con ellas.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'changes' },
    ],
    features: [
      { name: 'Halcón Compañero', level: 1, description: 'Obtienes un ave de presa como compañero a nivel 1 (en lugar de nivel 4). El halcón puede señalar objetivos que flanquean contigo.' },
      { name: 'Picado Coordinado', level: 4, description: 'Cuando tu halcón ataca un objetivo, tus ataques de proyectil contra ese objetivo ganan +2 al ataque y daño hasta el inicio de tu siguiente turno.' },
    ],
  },
  {
    id: 'infiltrator-ranger',
    classId: 'ranger',
    name: 'Infiltrator',
    description: 'Explorador espía que adopta las costumbres de sus enemigos favoritos para infiltrarse entre ellos.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Adaptación al Enemigo', level: 1, description: 'Por cada tipo de Enemigo Favorito, aprendes un rasgo cultural o físico de esa especie que te permite pasar por uno de ellos con Disfraz.' },
      { name: 'Infiltración Perfecta', level: 5, description: 'Mientras te haces pasar por una criatura de tu tipo de Enemigo Favorito, ganas una de sus habilidades raciales a elección.' },
    ],
  },
  {
    id: 'trapper-ranger',
    classId: 'ranger',
    name: 'Trapper',
    description: 'Explorador especializado en trampas mecánicas y mágicas, creando zonas de peligro en el campo de batalla.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'replaces' },
    ],
    features: [
      { name: 'Colocar Trampa', level: 2, description: 'Fabricas y colocas trampas mecánicas como un ladrón de nivel igual al tuyo. Añades mod. SAB en lugar de INT a las DCs.' },
      { name: 'Trampa Mágica', level: 4, description: 'Puedes crear trampas con efectos de conjuro de ranger (duración concentrada). El conjuro se activa cuando una criatura detona la trampa.' },
    ],
    classSkillsAdded: ['disable_device'],
  },
  {
    id: 'warden-ranger',
    classId: 'ranger',
    name: 'Warden',
    description: 'Explorador guardián de un territorio específico con poderes especiales dentro de él.',
    replaces: [
      { featureName: 'Enemigo Favorito', atLevel: 1, type: 'changes' },
      { featureName: 'Terreno Favorito', atLevel: 3, type: 'changes' },
    ],
    features: [
      { name: 'Señor del Territorio', level: 3, description: 'En tu Terreno Favorito principal, eres consciente de todas las criaturas en 1 milla y no puedes sorprenderte.' },
      { name: 'Vínculo con la Tierra', level: 5, description: 'Puedes lanzar conjuros de terreno (hallucinatory terrain, move earth) como poderes sobrenaturales 1/día en tu territorio.' },
    ],
  },
  {
    id: 'wild-hunter',
    classId: 'ranger',
    name: 'Wild Hunter',
    description: 'Explorador que abandona la magia por capacidades físicas mejoradas, pareciéndose más a un bárbaro.',
    replaces: [
      { featureName: 'Compañero Animal', atLevel: 4, type: 'optional' },
    ],
    features: [
      { name: 'Furia de Caza', level: 4, description: 'Puedes entrar en un estado de furia menor (+2 FUE, +2 CON, −2 CA) durante 3 + mod. CON rondas, como bárbaro pero sin poderes de furia.' },
      { name: 'Instinto Primario', level: 6, description: 'Ganas scent (olfato) permanente y +4 a Percepción basada en olfato. No puedes sorprenderte mientras estés consciente.' },
    ],
  },

  // ─── ROGUE (adicionales) ──────────────────────────────────────────────────
  {
    id: 'knife-master',
    classId: 'rogue',
    name: 'Knife Master',
    description: 'Pícaro especializado en cuchillos y dagas que maximiza el daño con armas de filo pequeñas.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Maestría del Cuchillo', level: 1, description: 'Con dagas y cuchillos tu ataque furtivo usa d8 en lugar de d6. Con otras armas ligeras usas d4.' },
      { name: 'Velocidad del Cuchillo', level: 3, description: 'Puedes sacar una daga oculta como acción libre y lanzarla como parte del mismo ataque.' },
    ],
  },
  {
    id: 'pirate-rogue',
    classId: 'rogue',
    name: 'Pirate',
    description: 'Pícaro marino especializado en combate naval y abordajes, con habilidades de intimidación.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Pies de Pirata', level: 1, description: 'Nunca sufres penalización de movimiento en cubiertas inestables o mojadas. Añades nivel a tiradas de Acrobacias en barcos.' },
      { name: 'Abordaje', level: 3, description: 'Cuando balanceas con una cuerda o saltas a otra embarcación, puedes hacer un ataque de aturdimiento gratis al aterrizar.' },
    ],
    classSkillsAdded: ['swim', 'profession'],
  },
  {
    id: 'poisoner-rogue',
    classId: 'rogue',
    name: 'Poisoner',
    description: 'Pícaro especializado en venenos que puede crearlos y aplicarlos con rapidez excepcional.',
    replaces: [
      { featureName: 'Talentos de Pícaro', atLevel: 10, type: 'changes' },
    ],
    features: [
      { name: 'Aplicación Rápida', level: 2, description: 'Puedes aplicar veneno a un arma como acción de movimiento sin arriesgarte a envenenarte (inmunidad a venenos propios a nivel 4).' },
      { name: 'Síntesis de Veneno', level: 1, description: 'Fabricas venenos a la mitad del precio y con Alquimia en lugar de comprarlos. Tu nivel cuenta como grados de Craft (alchemy).' },
      { name: 'Veneno Potenciado', level: 4, description: 'La CD de los venenos que aplicas aumenta en 2 y los venenos de inicio rápido tienen una segunda tirada de salvación.' },
    ],
  },
  {
    id: 'spy-rogue',
    classId: 'rogue',
    name: 'Spy',
    description: 'Pícaro maestro del engaño e infiltración en organizaciones enemigas.',
    replaces: [
      { featureName: 'Trampa Sense', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Arte del Disfraz', level: 1, description: 'Siempre tienes un disfraz preparado en tu mente; reduce el tiempo de disfrazarse a 1d3 minutos. Añades nivel a Disfraz.' },
      { name: 'Identidad Falsa', level: 3, description: 'Mantienes hasta dos identidades falsas con documentación preparada. Cambiar entre ellas es instantáneo si llevas los objetos.' },
      { name: 'Extracción de Información', level: 5, description: 'Cuando interrogas a alguien durante 10 minutos, puedes hacer una tirada de Sentir Motivaciones con +5. Si la superas, obtienes una verdad que no quería revelar.' },
    ],
  },
  {
    id: 'charlatan-rogue',
    classId: 'rogue',
    name: 'Charlatan',
    description: 'Pícaro estafador y manipulador social que usa el engaño como arma principal.',
    replaces: [
      { featureName: 'Ataque Furtivo', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Maestro del Engaño', level: 1, description: 'Añades nivel completo a Engaño y Actuación. Cuando engañas con éxito a un objetivo, sufre −2 a su siguiente salvación contra tus efectos.' },
      { name: 'Cara de Poker', level: 3, description: 'Eres inmune a detect thoughts y lie detection. Puedes engañar a detectores mágicos de mentiras con una tirada de Engaño contra CD 25.' },
    ],
  },
  {
    id: 'phantom-thief',
    classId: 'rogue',
    name: 'Phantom Thief',
    description: 'Pícaro ladrón de alto nivel especializado en robar objetos irremplazables con elegancia y precisión.',
    replaces: [
      { featureName: 'Talentos de Pícaro', atLevel: 10, type: 'changes' },
    ],
    features: [
      { name: 'Dedos Fantasma', level: 1, description: 'Añades nivel a Juego de Manos y puedes intentar Robar como acción de movimiento sin penalización.' },
      { name: 'Robo Perfecto', level: 4, description: 'Puedes intentar robar objetos mágicos atados o malditos. Si lo consigues, el objeto no detecta el robo hasta que el dueño lo compruebe activamente.' },
    ],
  },

  // ─── SORCERER (adicionales) ───────────────────────────────────────────────
  {
    id: 'wildblooded',
    classId: 'sorcerer',
    name: 'Wildblooded',
    description: 'Hechicero con una versión mutada de su linaje de sangre que cambia algunos poderes por alternativas únicas.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Linaje Mutado', level: 1, description: 'Tu linaje tiene una mutación: un poder de linaje cambia por una versión alternativa más inusual pero igualmente potente.' },
      { name: 'Sangre Salvaje', level: 3, description: 'Una vez al día puedes "activar" tu mutación salvaje para doblar la eficacia de un poder de linaje durante 1 ronda.' },
    ],
  },
  {
    id: 'sylvan-sorcerer',
    classId: 'sorcerer',
    name: 'Sylvan Sorcerer',
    description: 'Hechicero con sangre feérica que obtiene un compañero animal en lugar de familiar.',
    replaces: [
      { featureName: 'Hechizos', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Compañero Animal Feérico', level: 1, description: 'Obtienes un compañero animal como druida de nivel = nivel de hechicero − 2. Puede ser un animal inusualmente inteligente.' },
      { name: 'Magia del Bosque', level: 3, description: 'Añades conjuros de druida de nivel 1 a tu lista de conjuros conocidos. A nivel 7 añades conjuros de nivel 2.' },
    ],
    classSkillsAdded: ['knowledge_nature', 'survival'],
  },
  {
    id: 'empyreal-sorcerer',
    classId: 'sorcerer',
    name: 'Empyreal Sorcerer',
    description: 'Hechicero con sangre celestial que usa Sabiduría en lugar de Carisma para sus conjuros.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Magia Divina Innata', level: 1, description: 'Usas SAB en lugar de CAR para la CD de salvación y conjuros por día adicionales. Tu linaje es celestial.' },
      { name: 'Resistencia Celestial', level: 3, description: 'Ganas resistencia al fuego y ácido 5, y resistencia a la electricidad y frío 5. A nivel 9 aumentan a 10.' },
    ],
  },
  {
    id: 'mongrel-mage',
    classId: 'sorcerer',
    name: 'Mongrel Mage',
    description: 'Hechicero sin linaje definido que puede acceder a poderes de múltiples linajes pero de forma menos potente.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'changes' },
    ],
    features: [
      { name: 'Sangre Mezclada', level: 1, description: 'Seleccionas dos linajes. Obtienes los poderes de nivel 1 de ambos, pero los poderes de mayor nivel vienen solo del linaje primario.' },
      { name: 'Versatilidad Arcana', level: 5, description: '1/día puedes lanzar un conjuro usando la bonificación de un linaje secundario aunque no sea tu linaje activo.' },
    ],
  },
  {
    id: 'razmiran-priest',
    classId: 'sorcerer',
    name: 'Razmiran Priest',
    description: 'Hechicero que finge ser un sacerdote divino, ocultando su magia arcana como milagros religiosos.',
    replaces: [
      { featureName: 'Linaje de Sangre', atLevel: 1, type: 'replaces' },
    ],
    features: [
      { name: 'Milagro Falso', level: 1, description: 'Lanzas conjuros arcanos como si fueran divinos. Los espectadores deben superar Percepción CD 20 para notar que no es magia divina real.' },
      { name: 'Máscara del Sacerdote', level: 3, description: 'Añades cure light wounds y bless a tu lista de conjuros conocidos como conjuros arcanos. Ganas +4 a Engaño para mantener tu disfraz religioso.' },
    ],
  },
]
