import type { ClassFeature, SpellsPerDayTable } from './classes'

export type ReplacementType = 'replaces' | 'changes' | 'optional'

export interface ArchetypeReplacement {
  featureName: string
  atLevel: number
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
]
