export const FEATS_ES: Record<string, {
  name: string
  prerequisite?: string
  benefit: string
  normal?: string
  special?: string
}> = {
  "aberrant-tumor": {
    name: "Tumor Aberrante",
    prerequisite: "Linaje aberrante.",
    benefit: "Obtienes un familiar tumor, como el descubrimiento de químico tumor familiar (Pathfinder RPG Ultimate Magic 17), con un nivel de químico efectivo igual al nivel de la clase que otorga tu linaje aberrante para determinar las habilidades del tumor familiar. Si múltiples clases te otorgan el linaje aberrante, esos niveles de clase se apilan para determinar tu nivel de químico efectivo."
  },
  "aberration-bane-caster": {
    name: "Lanzador de Maldición Aberrante",
    prerequisite: "Nivel de lanzador 4°, gillman, característica de clase enemigo favorecido (aberraciones).",
    benefit: "Añade la mitad de tu bonificación de enemigo favorecido contra aberraciones a la CD de tiradas de ahorro de los lanzamiento de hechizos contra aberraciones y a las pruebas de nivel de lanzador para superar la resistencia a hechizos de aberraciones."
  },
  "abeyance": {
    name: "Abeyance",
    prerequisite: "Int 13, Criterio 5 rangos en Oficio de Mago, Usar Dispositivo Mágico 1 rango.",
    benefit: "Como acción estándar, puedes drenar la habilidad mágica innata de una criatura a la que has infligido daño con un arma de metal desde el principio de tu último turno. Esa criatura debe tener éxito en una tirada de ahorro de Voluntad o ser incapaz de acceder a cualquier habilidad sobrenatural que pueda usar más de una vez al día, hasta que sea sanada de todo el daño por puntos de golpe, o hasta un máximo de 1 minuto.",
    special: "Si un chamán o bruja usa este hex de sangre, el objetivo es incapaz de usar cualquiera de sus habilidades sobrenaturales durante la duración del hex."
  },
  "ability-focus": {
    name: "Enfoque de Habilidad",
    prerequisite: "Ataque especial.",
    benefit: "Elige uno de los ataques especiales de la criatura. Añade +2 a la CD para todas las tiradas de ahorro contra el ataque especial en el que la criatura se enfoca.",
    special: "Una criatura puede tomar esta dote múltiples veces. Sus efectos no se apilan. Cada vez que la criatura toma la dote, se aplica a un ataque especial diferente."
  },
  "ability-mastery": {
    name: "Dominio de Habilidad",
    prerequisite: "Usar Dispositivo Mágico 3 rangos, bonificación de tirada de ahorro de Fortaleza +4.",
    benefit: "Una vez al día, puedes enfocar tus pensamientos durante 10 minutos en una armadura mágica o un objeto maravilloso que tenga un hechizo de transmutación de 2° nivel o superior listado en sus requisitos de construcción y que ocupe un espacio en tu cuerpo. Al final de la meditación, ganas una bonificación de mejora de +2 a una característica de tu elección. Este beneficio dura 24 horas. Debes usar el objeto para ganar este beneficio; si el objeto se remueve antes de que termine el beneficio de esta dote, el beneficio se pierde inmediatamente y no puede recuperarse hasta que hayan pasado 24 horas desde la última activación de la dote. Solo puedes ganar un beneficio de esta dote a la vez."
  },
  "aboleth-deceiver": {
    name: "Engañador Aboleth",
    benefit: "Una vez al día, si fallas una tirada de ahorro de Voluntad contra un hechizo o efecto de compulsión, puedes relanzar esa tirada de ahorro pero debes tomar el segundo resultado, aunque sea peor. Si el hechizo o efecto de compulsión proviene de un aboleth, no aplicas tu penalización racial de -2 en tales tiradas de ahorro, y la rerrol no cuenta contra tu uso diario de esta dote."
  },
  "absorb-spirit": {
    name: "Absorber Espíritu",
    prerequisite: "Con 13, debe haber muerto al menos una vez o haber sido poseído por una criatura no muerta.",
    benefit: "Cuando un no muerto incorpóreo con la habilidad especial de rejuvenecimiento o un haunt es reducido a 0 o menos puntos de golpe dentro de los 30 pies de ti, puedes intentar absorber su espíritu a tu cuerpo como acción inmediata.",
    special: "Si estás usando el sistema de cordura y fallas tu prueba de Constitución mientras albergas el espíritu, recibes daño de cordura igual a 1/2 el ND del espíritu (mínimo 1) en lugar de 1d4 puntos de daño de Sabiduría."
  },
  "abundant-revelations": {
    name: "Revelaciones Abundantes",
    prerequisite: "Característica de clase Misterio.",
    benefit: "Elige una de tus revelaciones que tenga un número de usos por día. Ganas 1 uso adicional por día de esa revelación.",
    special: "Puedes tomar esta dote múltiples veces. Sus efectos no se apilan. Cada vez que tomas la dote, se aplica a una nueva revelación."
  },
  "acadamae-graduate": {
    name: "Graduado de Acadamae",
    prerequisite: "Mago especialista 1°; no puede tener conjuración como escuela prohibida.",
    benefit: "Cuando lanzas un hechizo arcano preparado de la escuela de conjuración (convocación) que toma más que una acción estándar para lanzar, reduce el tiempo de lanzamiento en una ronda (a un tiempo de lanzamiento mínimo de una acción estándar). Lanzar un hechizo de esta manera es agotador y requiere una tirada de ahorro de Fortaleza (CD 15 + nivel del hechizo) para resistir convertirse en fatigado."
  },
  "accomplished-sneak-attacker": {
    name: "Atacante Sigiloso Accomplido",
    prerequisite: "Característica de clase ataque furtivo.",
    benefit: "Tu daño de ataque furtivo aumenta en 1d6. Tu número de dados de ataque furtivo no puede exceder la mitad de tu nivel de personaje (redondeando hacia arriba)."
  },
  "accursed": {
    name: "Maldito",
    prerequisite: "Debes cargar con una maldición que solo puede ser levantada por una quest o esfuerzo similar, o tener el trasfondo Nacimiento Maldito.",
    benefit: "Ganas resistencia a hechizos igual a 5 + tu nivel de personaje, ya que la magia interfiere con toda la magia."
  },
  "accursed-critical": {
    name: "Crítico Maldito",
    benefit: "Cuando confirmas un golpe crítico con un hechizo o habilidad sobrenatural, puedes lanzar bestow curse o major curse sobre ese objetivo como acción inmediata."
  },
  "accursed-hex": {
    name: "Hex Maldito",
    prerequisite: "Característica de clase Hex.",
    benefit: "Cuando targeting una criatura con un hex que no puede objetivo la misma criatura más de una vez al día, y esa criatura tiene éxito en su tirada de ahorro contra el efecto del hex, puedes objetivo la criatura con el mismo hex por segunda vez antes del final de tu siguiente turno.",
    normal: "Solo puedes objective una criatura con estos hexes una vez al día."
  },
  "ace-disarm": {
    name: "As del Desarme",
    prerequisite: "Dex 13",
    benefit: "No recibes la penalización de -2 al intentar pruebas de maniobra de combate de desarme con un arma a distancia usando Desarme a Distancia, y puedes intentar una prueba de maniobra de combate de robo en lugar de una maniobra de desarme cuando usas Desarme a Distancia. Además, cuando desarmas con éxito o robas un artículo de un oponente, ese artículo se deposita en el cuadrado de ese oponente."
  },
  "ace-trip": {
    name: "As del Triunfo",
    prerequisite: "Dex 13",
    benefit: "No recibes la penalización de -2 al intentar tropiezos con un arma a distancia usando Triunfo a Distancia, y puedes intentar pruebas de manœbra de combate de tropiezo a distancia especiales contra criaturas voladoras."
  },
  "acrobatic": {
    name: "Acrobático",
    benefit: "Obtienes un bono de +2 en todas las pruebas de Acrobacia y Vuelo. Si tienes 10 o más rangos en una de estas habilidades, el bono aumenta a +4 para esa habilidad."
  },
  "acrobatic-spellcaster": {
    name: "Lanzador Acrobático",
    benefit: "Cuando tienes éxito en una prueba de Acrobacia para moverte a través de un cuadrado amenazado sin provocar ataques de oportunidad o para moverte a través del espacio de una criatura, las criaturas privadas de ataques de oportunidad por tu prueba de Acrobacia tampoco pueden hacer ataques de oportunidad contra ti cuando lanzas hechizos por el resto de tu turno.",
    normal: "Lanzar un hechizo dentro del alcance de un enemigo provoca ataques de oportunidad incluso después de tener éxito en una prueba de Acrobacia para moverte a través de un cuadrado amenazado."
  },
  "acrobatic-steps": {
    name: "Pasos Acrobáticos",
    prerequisite: "Dex 15",
    benefit: "Cuando te mueves, puedes moverte a través de hasta 15 pies de terreno difícil cada ronda como si fuera terreno normal. Los efectos de esta dote se apilan con los proporcionados por Movimientos Ágiles."
  },
  "acupuncture-specialist": {
    name: "Especialista en Acupuntura",
    prerequisite: "Sanar 5 rangos.",
    benefit: "Puedes incorporar el arte de la acupuntura a tus procedimientos de curación, permitiéndote usar medios físicos para limpiar dolencias espirituales."
  },
  "acute-shot": {
    name: "Disparo Agudo",
    benefit: "Cuando ganas un bono mágico a una tirada de ataque con un arma a distancia, puedes deducir cualquier penalización por rango de tu tirada de daño, en lugar de tu tirada de ataque."
  },
  "adaptive-fortune": {
    name: "Fortuna Adaptable",
    benefit: "Aumenta el número de veces por día que puedes usar el rasgo racial suerte adaptable por 1. Además, cuando usas suerte adaptable, aumenta el bono de suerte para cada tipo de uso en 2."
  },
  "adder-strike": {
    name: "Golpe de Cobra",
    prerequisite: "Característica de clase uso de veneno, Craft (alchemy) 1 rango",
    benefit: "Como acción rápida, puedes aplicar una dosis de veneno de contacto o herida a dos partes del cuerpo que usas para ataques sin armas.",
    normal: "Aplicar veneno a un arma o una sola pieza de munición es una acción estándar."
  },
  "additional-affiliations": {
    name: "Afiliaciones Adicionales",
    benefit: "Aumenta tu total de espacios de afiliación por 2.",
    normal: "Tienes un número de espacios de afiliación igual a tu modificador de Carisma + 1 (mínimo 1).",
    special: "Puedes tomar esta dote múltiples veces; cada vez que lo haces, tu número de espacios de afiliación aumenta en 2."
  },
  "additional-traits": {
    name: "Rasgos Adicionales",
    benefit: "Ganas dos rasgos de personaje de tu elección. Estos rasgos deben ser elegidos de diferentes listas, y no pueden ser elegidos de listas de las que ya has seleccionado un rasgo de personaje."
  },
  "adept-champion": {
    name: "Campeón Experto",
    prerequisite: "Característica de clase marcar el mal, bono de ataque base +5.",
    benefit: "Mientras usas tu característica de clase marcar el mal, como acción rápida al inicio de tu turno, puedes renunciar a la bonificación a las tiradas de daño y en su lugar ganar la mitad de esa bonificación como bonificación a las pruebas de manœbra de combate contra el objetivo de tu marcar."
  },
  "adept-channel": {
    name: "Canal Experto",
    prerequisite: "Habilidad para lanzar hechizos divinos, habilidad de familiar, nivel de lanzador 4°, Cha 13.",
    benefit: "Ganas la característica de clase canalizar energía, como un clérigo, usable 2 veces por día."
  },
  "advance-warning": {
    name: "Aviso Anticipado",
    prerequisite: "Cha 15.",
    benefit: "Todos los aliados dentro de los 15 pies de ti solo están desprevenidos durante la primera ronda de combate hasta tu primer turno."
  },
  "advanced-armor-training": {
    name: "Entrenamiento de Armadura Avanzado",
    prerequisite: "Característica de clase entrenamiento de armadura, nivel de guerrero 3°.",
    benefit: "Selecciona una opción de entrenamiento de armadura avanzada.",
    special: "Esta dote puede tomarse más de una vez, pero como mucho una vez cada 3 niveles de guerrero."
  },
  "advanced-defensive-combat-training": {
    name: "Entrenamiento de Combate Defensivo Avanzado",
    benefit: "Ganas un bono de +4 a tu CMD."
  },
  "advanced-gathlain-magic": {
    name: "Magia Gathlain Avanzada",
    prerequisite: "Cha 13, nivel de personaje 3°, gathlain.",
    benefit: "Ganas los siguientes hechizos como habilidades sobrenaturales, cada uno usable 1/día: wood meld (como meld with stone, pero solo con madera), wood shape."
  },
  "advanced-ranger-trap": {
    name: "Trampa de Ranger Avanzada",
    prerequisite: "Característica de clase Trampa, nivel de ranger 5°.",
    benefit: "Añade +1 a la Dificultad de Clase en todas las pruebas de Percepción y Desactivar Mecanismo para encontrar o desactivar las trampas que haces con tu característica de clase Trampa."
  },
  "advanced-weapon-training": {
    name: "Entrenamiento de Arma Avanzado",
    prerequisite: "Nivel de guerrero 5°, característica de clase entrenamiento de arma.",
    benefit: "Selecciona una opción de entrenamiento de arma avanzada, aplicándola a un grupo de armas de guerrero que ya has seleccionado con la característica de clase entrenamiento de arma.",
    special: "Esta dote puede tomarse más de una vez, pero como mucho una vez cada 5 niveles de guerrero."
  },
  "aerial-roll": {
    name: "Voltereta Aérea",
    prerequisite: "Vuelo 10 rangos.",
    benefit: "Puedes realizar una voltereta defensiva mientras estás en el aire. Como acción inmediata, puedes intentar una prueba de Vuelo cuando eres atacado mientras vuelas."
  },
  "agent-of-fear": {
    name: "Agente del Miedo",
    benefit: "Cuando targeting una criatura con tu apariencia terrorífica o apariencia impactante, no se vuelve immune a los efectos de esas características por 24 horas, pero gana un bono de +2 a las tiradas de ahorro contra esas características por 24 horas.",
    normal: "Una criatura objetivo de apariencia terrorífica o apariencia impactante se vuelve immune al efecto de la característica por 24 horas."
  },
  "agent-of-purity": {
    name: "Agente de Pureza",
    prerequisite: "Un amigo o aliado debe haber sido significativamente corrompido por una plaga natural o sobrenatural específica.",
    benefit: "Elige un tipo de terreno afiliado a la plaga relevante. Ganas un bono de +1 a las pruebas de Conocimiento (geografía) y Conocimiento (naturaleza) respecto al terreno infectado.",
    special: "Una vez por día, puedes lanzar cualquiera de los siguientes hechizos como habilidad sobrenatural: consecrate, neutralize poison, remove curse, o remove disease."
  },
  "agile-maiden": {
    name: "Doncella Ágil",
    prerequisite: "Str 13; Dex 13; Resistencia o característica de clase entrenamiento de armadura; competencia con armadura pesada.",
    benefit: "Para el propósito de características de clase, tratas la Placa Dama Gris como armadura media o armadura pesada, lo que sea más beneficial para una habilidad dada."
  },
  "agile-maneuvers": {
    name: "Maniobras Ágiles",
    benefit: "Añades tu bono de Destreza a tu bono de ataque base y bono de tamaño al determinar tu Bonificación de Maniobra de Combate en lugar de tu bono de Fuerza.",
    normal: "Añades tu bono de Fuerza a tu bono de ataque base y bono de tamaño al determinar tu Bonificación de Maniobra de Combate."
  },
  "agile-tongue": {
    name: "Lengua Ágil",
    prerequisite: "Grippli.",
    benefit: "Tienes una lengua prensil con un alcance de 10 pies. Puedes recoger objetos que pesen no más de 5 libras, hacer pruebas de Manos Ligeras, realizar las maniobras de combate de robo o desarme, o hacer ataques de toque cuerpo a cuerpo con tu lengua."
  },
  "agonizing-obedience": {
    name: "Obediencia Agonizante",
    prerequisite: "3 rangos en Sanar.",
    benefit: "Cuando tomas esta dote, selecciona una agonía. Puedes tomar esta dote múltiples veces, cada vez seleccionando una agonía diferente, pero solo puedes realizar una obediencia para una sola agonía en un período de 24 horas."
  },
  "airy-step": {
    name: "Paso Etéreo",
    prerequisite: "Sylph.",
    benefit: "Ganas un bono de +2 a las tiradas de ahorro contra efectos con los descriptores de aire o electricidad y efectos que infligen daño de electricidad. Puedes ignorar los primeros 30 pies de cualquier caída al determinar el daño de caída."
  },
  "al-zabriti-trained-horse": {
    name: "Caballo Entrenado Al-Zabriti",
    prerequisite: "Caballo.",
    benefit: "Este caballo automáticamente conoce los trucos incluidos en el truco de combate de montar (atacar, venir, defender, abajo, guardar y talón), y estos truco no cuentan contra el número máximo normal de truques que el caballo puede aprender."
  },
  "alchemical-strike": {
    name: "Golpe Alquímico",
    benefit: "Puedes lanzar un solo objeto alquímico como una acción de ataque completo, aumentando la efectividad del agente alquímico lanzado.",
    special: "Un alquimista puede tomar esta dote en lugar de un descubrimiento de alquimista."
  },
  "aldori-artistry": {
    name: "Artesanía Aldori",
    benefit: "Elige una de las siguientes maniobras de combate: desarme, reposition, steal, sunder o tropiezo. Ganas un bono de +2 al realizar la maniobra seleccionada mientras empuñas una espada de duelo Aldori.",
    special: "Puedes seleccionar esta dote múltiples veces, eligiendo una maniobra de combate diferente cada vez."
  },
  "aldori-dueling-disciple": {
    name: "Discípulo de Duelo Aldori",
    benefit: "Ganas un bono de moral de +2 a las pruebas de Intimidar para desmoralizar oponentes, y la CD de cualquier intento de desmoralizarte aumenta en 2. Cuando estás participando en un duelo, estos bonos aumentan a +4."
  },
  "aldori-dueling-mastery": {
    name: "Dominio de Duelo Aldori",
    benefit: "Ganas un bono de +2 a las pruebas de iniciativa siempre que comiences el combate con una espada de duelo Aldori en tu mano. Siempre que empuñas solo una sola espada de duelo Aldori en una mano, ganas un bono de escudo de +2 a tu CA."
  },
  "aldori-style-aegis": {
    name: "Egida de Estilo Aldori",
    benefit: "Mientras usas Estilo Aldori, al inicio de tu turno, puedes designar un objetivo enfocado como acción rápida. Esta designación dura hasta el inicio de tu siguiente turno, y recibes una penalización de -2 a tu CA contra los ataques de todas las demás criaturas."
  },
  "aldori-style-conquest": {
    name: "Conquista de Estilo Aldori",
    benefit: "Cuando intentas parry un ataque usando Egida de Estilo Aldori, no recibes ninguna penalización en la tirada de ataque incurrida por usar Experiencia en Combate o combatiendo defensivamente."
  },
  "aldori-style": {
    name: "Estilo Aldori",
    benefit: "Mientras usas Estilo Aldori y empuñas solo una sola espada de duelo Aldori en una mano, cuando fightes defensivamente o usas Experiencia en Combate, ganas un bono de +2 a las tiradas de daño con armas."
  },
  "alertness": {
    name: "Vigilancia",
    benefit: "Obtienes un bono de +2 a las pruebas de Percepción y Sentir Motivaciones. Si tienes 10 o más rangos en una de estas habilidades, el bono aumenta a +4 para esa habilidad."
  },
  "alien-mindpaths": {
    name: "Senderos Mentales Alienígenas",
    prerequisite: "Android, kasatha, lashunta o Triaxian.",
    benefit: "Siempre que estés adyacente a al menos un aliado androide, kasatha, lashunta o Triaxian que también tenga esta dote, ganas un bono de circunstancia de +4 a las tiradas de ahorro contra efectos que afectan la mente y efectos de adivinación (escudriñar), a menos que el efecto provenga de un androide, kasatha, lashunta o Triaxian."
  },
  "align-equipment": {
    name: "Alinear Equipo",
    benefit: "Además de las bendiciones proporcionadas por Bendecir Equipo, puedes imbuir armas, escudos y armaduras con las habilidades especiales listadas en la siguiente tabla. Si una habilidad especial va seguida de un conjunto de alineación entre paréntesis, debes ser capaz de canalizar energía capaz de sanar o perjudicar outsiders de ese subtipo de alineación con Canalizar Alineación. Por ejemplo, un clérigo debe tener Canalizar Alineación (bien) para bendecir un arma con la habilidad especial sagrada, Canalizar Alineación (ley) para bendecir un escudo con la habilidad especial vigilante, y así sucesivamente. Las bendiciones de equipo alineado de otra manera siguen todas las mismas reglas que las bendiciones de equipo otorgadas por Bendecir Equipo."
  },
  "aligned-crafting": {
    name: "Fabricación Alineada",
    prerequisite: "Fabricar Armas y Armaduras Mágicas o Fabricar Objeto Maravilloso.",
    benefit: "Cuando fabricas un arma mágica, armadura mágica, un escudo mágico o un objeto maravilloso, puedes infundirlo con un poco de tus convicciones. Las criaturas que están a más de un paso de alineación de ti se sickened mientras usan o wear este objeto. Un objeto que ha sido infundido con tu alineación nunca puede tener una habilidad especial opuesta añadida después (por ejemplo, una espada larga infusionada con tu alineación legal buena no puede obtener después la habilidad especial de arma anárquica). Infundir el objeto con tu alineación de esta manera aumenta el costo total de construcción del objeto en 10%."
  },
  "alignment-channel": {
    name: "Canalizar Alineación",
    prerequisite: "Habilidad para canalizar energía.",
    benefit: "En lugar de su efecto normal, puedes elegir hacer que tu capacidad de canalizar energía sanar o perjudicar outsiders del subtipo de alineación elegido. Debes hacer esta elección cada vez que canalices energía. Si eliges sanar o perjudicar criaturas del subtipo de alineación elegido, tu canalizar energía no tiene efecto sobre otras criaturas. La cantidad de daño sanado o infligido y la CD para reducir el daño a la mitad permanece sin cambios.",
    special: "Puedes tomar esta dote múltiples veces. Sus efectos no se apilan. Cada vez que tomes la dote, se aplica a un nuevo subtipo de alineación. Cada vez que canalices energía, debes elegir qué tipo afectar."
  },
  "all-gnolls-must-die": {
    name: "Todos los Gnolls Deben Morir",
    prerequisite: "Asestar el golpe fatal a 20 gnolls, hienas, hienas diras, hombre-hiena, licántropos de hiena o secuaces de Lamashtu.",
    benefit: "Mientras lleves algún tipo de trofeo cosechado de un gnoll (un collar de orejas, un conjunto de dientes, un arma mágica tomada de un jefe, etc.), ganas un bono de moral de +2 a todas las tiradas de ahorro de Voluntad. También ganas un bono de competencia de +2 a las tiradas de ataque y daño con armas contra gnolls, hienas, hienas diras, hombre-hiena, licántropos de hiena y secuaces de Lamashtu."
  },
  "all-consuming-swing": {
    name: "Balanceo Consumidor*",
    prerequisite: "FUE 13",
    benefit: "Siempre que uses Desgarrar o Desgarrar Grande, puedes aplicar el daño adicional que ganarías de Golpe Vital, Golpe Vital Mejorado o Golpe Vital Mayor al objetivo inicial de tu ataque. Cuando lo haces, la tensión en tu cuerpo te causa tomar una cantidad de daño igual al daño extra infligido por tu dote de Golpe Vital. Este autoinfligido daño no se reduce por reducción de daño."
  },
  "allied-spellcaster": {
    name: "Lanzador Aliado",
    prerequisite: "Nivel de lanzador 1°.",
    benefit: "Siempre que estés adyacente a un aliado que también tenga esta dote, recibes un bono de competencia de +2 a las pruebas de nivel realizadas para superar la resistencia a hechizos. Si tu aliado tiene el mismo hechizo preparado (o conocido con un espacio disponible si son lanzadores espontáneos), este bono aumenta a +4 y recibes un bono de +1 al nivel de lanzador para todas las variables dependientes del nivel, como duración, alcance y efecto."
  },
  "ally-caller": {
    name: "Llamador de Aliados",
    prerequisite: "Tritón",
    benefit: "Obtienes dos usos adicionales de invitación de aliado de la naturaleza II por día.",
    special: "Puedes tomar esta dote múltiples veces. Cada vez que la seleccionas, obtienes dos usos adicionales de invitación de aliado de la naturaleza II."
  },
  "ally-shield": {
    name: "Escudo de Aliado",
    benefit: "Siempre que seas el objetivo de un ataque cuerpo a cuerpo o a distancia y estés adyacente a un aliado que también tenga esta dote, puedes iniciar esta dote para hábilmente tirar al aliado hacia el peligro o esquivar detrás del aliado como acción inmediata. Obtienes cobertura contra ese ataque (y solo ese ataque). Si el ataque te falla pero te habría impactado sin el bono de cobertura a tu Clase de Armadura, el aliado se convierte en el objetivo del ataque y el atacante debe hacer una nueva tirada de ataque (con todos los mismos modificadores) contra la Clase de Armadura del aliado."
  },
  "alter-binary-mindscape": {
    name: "Alterar Paisaje Mental Binario",
    prerequisite: "INT 13, habilidad para lanzar",
    benefit: "Cuando lanzas instigar duelo psíquico y creas un paisaje mental binario (ver página 235), la arena que creas pone a tu enemigo en desventaja. Tu oponente debe gastar 1 punto de manifestación más de lo normal al crear cualquier manifestación defensiva."
  },
  "altitude-affinity": {
    name: "Afinidad con la Altitud",
    benefit: "Estás automáticamente aclimatado en altas altitudes. Además, ganas un bono de competencia de +2 a todas las pruebas de Supervivencia realizadas a altitudes de 5,000 pies o más."
  },
  "amateur-gunslinger": {
    name: "Cazador Amateur*",
    prerequisite: "No tienes niveles en una clase que tenga la característica de clase templanza.",
    benefit: "Obtienes una pequeña cantidad de templanza y la habilidad para realizar una única acción de 1er nivel de la característica de clase deeds del cazador. Al comenzar el día, ganas 1 punto de templanza, aunque a lo largo del día puedes ganar puntos de templanza hasta un máximo de tu modificador de Sabiduría (mínimo 1). Puedes recuperar templanza usando las reglas de la característica de clase templanza del cazador. Puedes gastar esta templanza para realizar la acción de 1er nivel que elegiste al tomar esta dote, y cualquier otra acción que hayas obtenido a través de dones o objetos mágicos.",
    special: "Si ganas niveles en una clase que otorga la característica de clase templanza, puedes intercambiar inmediatamente esta dote por la dote Templanza Extra."
  },
  "amateur-investigator": {
    name: "Investigador Amateur",
    prerequisite: "INT 13, 1 rango en al menos una habilidad de Conocimiento, sin niveles en una clase que tenga la característica de clase inspiración.",
    benefit: "Como un investigador, tienes la habilidad para aumentar tus pruebas de habilidad de Conocimiento, Lingüística y Oficio Mágico. Obtienes un grupo de inspiración igual a tu modificador de Inteligencia. Puedes gastar un uso de inspiración como acción gratuita para añadir 1d6 al resultado de una prueba de Conocimiento, Lingüística u Oficio Mágico, siempre que estés entrenado en esa habilidad (incluso si obtienes 10 o 20 en esa prueba). Haces esta elección después de que se haga la tirada y antes de que se revelen los resultados. Solo puedes usar inspiración una vez por prueba de habilidad. Tu grupo de inspiración se renueva cada día, típicamente después de una noche de sueño reparador.",
    special: "Si ganas niveles en una clase que tiene la característica de clase inspiración, puedes intercambiar inmediatamente esta dote por la dote Inspiración Extra."
  },
  "amateur-swashbuckler": {
    name: "Espadachín Amateur*",
    prerequisite: "Sin niveles en una clase que tenga la característica de clase garbo.",
    benefit: "Obtienes una pequeña cantidad de garbo y la habilidad para realizar una única acción de 1er nivel de la característica de clase deeds del espadachín. Elige una acción de 1er nivel de la característica de clase deeds del espadachín (no puedes seleccionar contraataque oportunista y respuesta). Una vez elegida, esta acción no puede cambiarse. Al comenzar cada día, ganas 1 punto de garbo. A lo largo del día, puedes ganar un número de puntos de garbo hasta un máximo de tu modificador de Carisma (mínimo 1). Puedes recuperar puntos de garbo como la característica de clase garbo del espadachín. Puedes gastar estos puntos de garbo para realizar la acción de 1er nivel que elegiste al tomar esta dote, así como cualquier otra acción que hayas obtenido a través de dones o objetos mágicos.",
    special: "Si ganas niveles en una clase que tiene la característica de clase garbo, puedes intercambiar inmediatamente esta dote por la dote Garbo Extra."
  },
  "ambuscading-spell": {
    name: "Hechizo de Emboscada",
    benefit: "Durante una ronda de sorpresa, tus oponentes que aún no han actuado reciben una penalización de -2 a las tiradas de ahorro contra los hechizos que lanzas. Las criaturas que ya han actuado reciben una penalización de -1 durante la ronda de sorpresa."
  },
  "ambush-awareness": {
    name: "Conciencia de Emboscada",
    benefit: "Si no puedes actuar en la ronda de sorpresa porque fallaste una prueba de Percepción, aún puedes actuar en tu cuenta de iniciativa en la ronda de sorpresa, pero solo para tomar la acción de defensa total.",
    normal: "Si no puedes actuar en la ronda de sorpresa porque fallaste una prueba de Percepción, no puedes tomar ninguna acción durante la ronda de sorpresa."
  },
  "ambush-sense": {
    name: "Sentido de Emboscada*",
    prerequisite: "INT 13, característica de clase sentido de trampas.",
    benefit: "Obtienes un bono en las pruebas de Percepción realizadas para determinar la conciencia para la ronda de sorpresa de combate, y un bono de esquiva a la CA en cualquier ronda de sorpresa en la que puedas actuar. Estos bonos son iguales al bono que ganas de sentido de trampas."
  },
  "ambush-squad": {
    name: "Escuadrón de Emboscada*",
    prerequisite: "Bono de ataque base +1, kobold.",
    benefit: "Cuando estás adyacente a un aliado que también tiene esta dote al comienzo de una ronda de sorpresa, y tanto tú como ese aliado pueden actuar durante esa ronda de sorpresa, puedes tomar tanto una acción estándar como una acción de movimiento durante esa ronda de sorpresa.",
    normal: "Solo puedes tomar una acción estándar o una acción de movimiento durante una ronda de sorpresa."
  },
  "ammo-drop": {
    name: "Caída de Munición*",
    prerequisite: "Manos Ligeras 1 rango, competente con honda.",
    benefit: "Puedes cargar una honda o un extremo de una honda doble con una mano como acción rápida o acción de movimiento. Esto no provoca ataque de oportunidad."
  },
  "amplified-hex": {
    name: "Hex Amplificado",
    prerequisite: "Característica de clase Hex.",
    benefit: "Puedes aumentar el poder de un hex gastando un espacio de hechizo o hechizo preparado de al menos 1er nivel. Cada vez adicional que usas esta habilidad en el mismo día, requiere un hechizo preparado o espacio de hechizo 1 nivel más alto (un hechizo de 2° nivel la segunda vez, un hechizo de 3er nivel la tercera vez, y así sucesivamente). Cuando amplificas un hex, puedes elegir uno: aumentar su CD de tirada de ahorro en 1, aumentar su alcance en 30 pies (si ya tiene al menos 30 pies de alcance), o aumentar su duración en 1 ronda (si ya tiene una duración de al menos 1 ronda)."
  },
  "amplified-radiance": {
    name: "Radiancia Amplificada",
    prerequisite: "Aasimar",
    benefit: "Siempre que estés dentro de los 15 pies de un aliado aasimar que tenga tanto la habilidad racial de hechizo luz del día como esta dote, ganas un aura de radiancia. Tanto tú como tu aliado deben tener al menos un uso de su habilidad racial de hechizo luz del día disponible para obtener este beneficio. Este aura funciona como el hechizo luz del día, excepto que es una emanación de 10 pies de radio centrada en ti sin áreas adicionales de iluminación más débil. Las criaturas dentro de este aura que reciben penalizaciones en luz brillante duplican esas penalizaciones. Los efectos de auras de radiancia superpuestas no se apilan. Puedes activar o suprimir este aura como acción rápida."
  },
  "amplified-rage": {
    name: "Rabia Amplificada",
    prerequisite: "Medio-orco u orco, característica de clase Rabia.",
    benefit: "Siempre que estés enfurecido y adyacente a un aliado furioso que también tenga esta dote o flanqueando al mismo oponente que un aliado furioso con esta dote, tus bonos de moral a Fuerza y Constitución aumentan en +4. Esta dote no se apila consigo misma (solo obtienes este bono de un aliado cualificado, sin importar cuántos estén adyacentes a ti)."
  },
  "anatomical-savant": {
    name: "Savante Anatómico*",
    benefit: "Elige un arma con la que tengas la dote Enfoque de Arma. Cuando golpeas a un oponente que tiene la posibilidad de negar golpes críticos o ataques furtivos, como la habilidad especial de armadura fortificación, reduce esa posibilidad en 25%. Trata a las criaturas que normalmente son inmunes a golpes críticos y ataques furtivos como si tuvieran una posibilidad del 75% de negar el golpe crítico o ataque furtivo, tomando solo el daño normal del ataque.",
    special: "Puedes tomar esta dote múltiples veces. Cada vez que tomes la dote, se aplica a un arma diferente."
  },
  "ancestral-enmity": {
    name: "Enemistad Ancestral*",
    prerequisite: "Subtipo gigante.",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque cuerpo a cuerpo contra enanos y gnomos.",
    special: "Puedes seleccionar esta dote dos veces. Sus efectos se apilan."
  },
  "ancestral-scorn": {
    name: "Desprecio Ancestral",
    prerequisite: "Intimidar 5 rangos, tiefling.",
    benefit: "Siempre que desmoralices con éxito a un outsider del subtipo maligno con una prueba de Intimidar, se vuelve mareado por 1 ronda además de verse afectado por los efectos normales de ser desmoralizado. Si superas la CD por 5 o más, la criatura es nauseada por 1 ronda en su lugar.",
    normal: "Desmoralizar a un enemigo con una prueba de Intimidar exitosa causa que se vuelva estremecido por 1 ronda, +1 ronda por cada 5 puntos por los que superes la CD."
  },
  "ancestral-weapon-mastery": {
    name: "Maestría de Arma Ancestral*",
    prerequisite: "Bono de ataque base +1, familiaridad racial con armas.",
    benefit: "Eres competente con todas las armas raciales de tu raza (las armas mencionadas en el rasgo racial de familiaridad con armas de tu raza). Si ya eres competente con cualquiera de esas armas, en su lugar ganas Enfoque de Arma para una de esas armas como dote de bonificación. Además, si ganas Enfoque de Arma como dote de bonificación con una de tus armas raciales como resultado de esta dote, puedes cambiar a qué arma racial se aplica tu dote de Enfoque de Arma de bonificación dedicando 10 minutos de práctica con el nueva arma. Los beneficios de esta dote de Enfoque de Arma de bonificación duran hasta que elijas practicar y aplicarla a una arma racial diferente."
  },
  "ancient-draconic": {
    name: "Dracónico Antiguo",
    prerequisite: "Nivel de lanzador arcano 5°, habla Dracónico.",
    benefit: "Obtienes un bono de +1 a las pruebas de nivel de lanzador para superar resistencia a hechizos al lanzar hechizos arcanos que tienen un componente verbal. Si hablas Dracónico al lanzar un hechizo arcano dependiente del lenguaje, todas las criaturas inteligentes con un lenguaje pueden entender tus palabras."
  },
  "ancient-tradition": {
    name: "Tradición Antigua",
    prerequisite: "Conocimiento (historia) 3 rangos, debe tener una conexión con una cultura perdida.",
    benefit: "Cada cultura perdida tiene su propio ritual diario, pero ninguno de ellos toma más de 1 hora por día para realizar. Una vez que hayas realizado el ritual diario, ganas el beneficio de una habilidad especial o resistencia según se indica en la entrada de Ritual Diario para la cultura en cuestión. Las culturas específicas y sus rituales se enumeran a continuación. Si tienes al menos 12 Dados de Golpe, también ganas el primer favor otorgado por tu cultura perdida al emprender su ritual diario. Si tienes al menos 16 Dados de Golpe, también ganas el segundo favor de la cultura perdida. Si tienes 20 Dados de Golpe o más, también ganas el tercer favor de la cultura perdida. Cada favor es una habilidad similar a hechizo que puedes lanzar una vez al día. Tu nivel de lanzador para estos favores es igual a tus Dados de Golpe, y la CD de tirada de ahorro se basa en tu modificador de Inteligencia, Sabiduría o Carisma (el más alto)."
  },
  "andoren-falconry": {
    name: "Cetrería de Andoran",
    prerequisite: "CAR 13",
    benefit: "Mejoras tu afinidad con aves de presa, como águilas, halcones, gavilanes y búhos. Obtienes un bono de +2 a las pruebas de Manejo de Animales realizadas para entrenar o controlar aves de presa. Además, si tienes un ave de presa como compañero de animal, tu compañero de animal gana uno de los siguientes bonos elegido en el momento en que se obtiene este compañero de animal: un bono de esquiva de +1 a la CA, un bono de moral de +1 a todas las tiradas de ataque, o un bono de moral de +2 a todas las tiradas de ahorro de Voluntad."
  },
  "angel-wings": {
    name: "Alas de Ángel",
    benefit: "Obtienes un par de alas emplumadas y brillantes que otorgan una velocidad de vuelo de 30 pies (manejabilidad promedio) si usas armadura ligera o sin carga, o 20 pies (manejabilidad pobre) con una carga media o pesada o armadura media o pesada. Vuelo es una habilidad de clase para ti."
  },
  "angelbane-strike": {
    name: "Golpe Maldito Ángel",
    benefit: "Cuando usas Golpe de Canalización contra una criatura viva con alineación buena, tratas todos los 1s en los dados de daño de canalización como 2s. Si tu objetivo es tanto un outsider bueno como un lanzador divino que sirve a una deidad buena, eres considerado 2 niveles más alto al determinar cuántos dados de daño de canalización ganas al usar Golpe de Canalización."
  },
  "angelic-blood": {
    name: "Sangre Angélica",
    prerequisite: "CON 13, aasimar.",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro contra efectos con el descriptor maligno y a las pruebas de Constitución para estabilizar cuando eres reducido a puntos de golpe negativos (pero no muerto). Además, cada vez que recibes daño de sangrado o drenaje de sangre, cada criatura no muerta o criatura con el subtipo maligno que esté actualmente adyacente a ti también toma 1 punto de daño."
  },
  "animal-ally": {
    name: "Aliado Animal",
    benefit: "Obtienes un compañero animal como si fueras un druida de tu nivel de personaje –3 de la siguiente lista: tejón, ave, camello, gato (pequeño), rata dira, perro, caballo, poni, serpiente (víbora) o lobo. Si más adelante obtienes un compañero animal a través de otra fuente (como el dominio Animal, vínculo divino, vínculo de cazador o clase de naturaleza), el nivel de druida efectivo otorgado por esta dote se acumula con el otorgado por otras fuentes."
  },
  "animal-call": {
    name: "Llamada Animal",
    prerequisite: "Engaño 1 rango, Conocimiento (naturaleza) 1 rango.",
    benefit: "Elige uno de los terrenos favoritos del ranger. Puedes usar tu habilidad de Engaño para imitar las llamadas de animales nativos de ese terreno. Criaturas con rangos en Conocimiento (naturaleza) pueden usar esa habilidad en lugar de Sentir Motivaciones para detectar tu imitación y darte cuenta de que el sonido es falso.",
    special: "Puedes tomar esta dote múltiples veces. Cada vez que lo haces, selecciona un terreno favorito adicional al que se aplica esta dote."
  },
  "animal-disguise": {
    name: "Disfraces Animal",
    prerequisite: "Disfraza 6 rangos, Conocimiento (naturaleza) 6 rangos.",
    benefit: "Puedes usar Disfraza para disfrazarte como un animal de tu categoría de tamaño. Debes tener un pelaje apropiado y cualquier otra parte de animal necesaria para completar el disfraz. También obtienes un bono de +2 a las pruebas de Disfraza cuando te disfrazas como animal. Criaturas con rangos en Conocimiento (naturaleza) pueden usar esa habilidad en lugar de Sentir Motivaciones para detectar este tipo de disfraz."
  },
  "animal-ferocity": {
    name: "Ferocidad Animal*",
    prerequisite: "Bono de ataque base +3, habilidad racial ferocidad.",
    benefit: "Cuando tus puntos de golpe se reducen por debajo de 0, puedes hacer ataques, pero recibes una penalización de -5 a cada tirada de ataque."
  },
  "animal-soul": {
    name: "Alma Animal",
    prerequisite: "Característica de clase compañero de animal o montura.",
    benefit: "Puedes elegir no permitir que hechizos y efectos te afecten si no serían capaces de afectar tanto tu tipo de criatura original como el tipo de criatura animal."
  },
  "ankle-biter": {
    name: "Mordedor de Tobillo*",
    prerequisite: "Goblin, Escapismo 1 rango.",
    benefit: "Si eres el objetivo de una maniobra de combate, puedes, como acción inmediata, intentar morder a tu oponente además de cualquier ataque de oportunidad u otras consecuencias que tu oponente pueda incurrir por atacarte. Este ataque natural de mordida adicional no provoca un ataque de oportunidad en sí mismo y causa daño base apropiado para una criatura de tu tamaño actual (generalmente 1d4 para criaturas Pequeñas). Si estás agarrotado o inmovilizado, puedes continuar haciendo este ataque de mordida adicional cada ronda como acción rápida en tu turno. Obtienes un bono a cualquier intento de romper el agarre igual al daño que causaste con tu mordida esa ronda.",
    special: "No puedes hacer este ataque de mordida cuando eres el agresor, incluyendo si logras revertir un agarre o hacer cualquier otro ataque de oportunidad."
  },
  "antagonize": {
    name: "Antagonizar",
    benefit: "Puedes hacer pruebas de Diplomacia e Intimidar para hacer que las criaturas respondan con hostilidad. No importa qué habilidad uses, antagonizar a una criatura toma una acción estándar que no provoca ataques de oportunidad, y tiene una CD igual a 10 + los Dados de Golpe del objetivo + el modificador de Sabiduría del objetivo. No puedes hacer esta prueba contra una criatura que no te entiende o tiene un puntuación de Inteligencia de 3 o menor. Antes de hacer estas pruebas, puedes hacer una prueba de Sentir Motivaciones (CD 20) como acción rápida para obtener un bono de perspicacia a estas pruebas de Diplomacia o Intimidar igual a tu modificador de Carisma hasta el final de tu próximo turno. Los beneficios que ganas por esta prueba dependen de la habilidad que uses. Esto es un efecto que afecta la mente. Diplomacia: Desconcertas a tu enemigo. Durante el próximo minuto, el objetivo recibe una penalización de -2 a todas las tiradas de ataque feitas contra criaturas que no seas tú y tiene un 10% de probabilidad de fallo de hechizos en todos los hechizos que no te tengan como objetivo o que te tengan dentro de su área de efecto. Intimidar: La criatura entra en rage. En su próximo turno, el objetivo debe intentar hacer un ataque cuerpo a cuerpo contra ti, hacer un ataque a distancia contra ti, lanzarte un hechizo o incluirte en el área de un hechizo. El efecto termina si se evita que la criatura te ataque o intentar hacerlo le haría daño. Si no puede atacarte en su turno, puedes hacer la prueba de nuevo como acción inmediata para extender el efecto por 1 ronda (pero no puedes extenderlo después de eso). El efecto termina tan pronto como la criatura te ataca. Una vez que has usado esta habilidad contra una criatura, no puedes objetivola de nuevo durante 1 día."
  },
  "anticipate-dodge": {
    name: "Anticipar Esquiva*",
    benefit: "Sabes automáticamente si una criatura que puedes ver tiene un bono de esquiva a su CA. Obtienes hasta un bono de +2 a las tiradas de ataque contra un objetivo que tiene un bono de esquiva. Este bono no puede exceder el bono de esquiva de la criatura que atacas."
  },
  "aphotic-explorer": {
    name: "Explorador Afótico",
    benefit: "Mientras estés en oscuridad o luz tenue, puedes tomar una acción rápida para obtener resistencia al frío 5 durante 1 ronda. Si tienes 11 o más Dados de Golpe, obtienes resistencia al frío 10 en su lugar."
  },
  "apocalyptic-spell": {
    name: "Hechizo Apocalíptico",
    benefit: "Puedes alterar un hechizo con un área de efecto y una duración de instantánea para convertirlo en un hechizo apocalíptico. Cuando lanzas el hechizo, el área afectada por el efecto instantáneo del hechizo se ve arruinada y devastada en apariencia. Todas las superficies en el área se tratan como terreno difícil, y las pruebas de Trepar, Volar y Nadar intentadas en el área reciben una penalización igual al nivel del hechizo original. El terreno difícil y las penalizaciones de habilidad duran un número de rondas igual al nivel del hechizo original. Un hechizo apocalíptico obtiene el descriptor maligno. Un hechizo apocalíptico usa un espacio de hechizo 1 nivel más alto que el nivel normal del hechizo. Los hechizos con el descriptor bueno no pueden ser hechizos apocalípticos."
  },
  "apotheosis": {
    name: "Apoteosis",
    prerequisite: "Debes haber tenido contacto directo con una deidad o ser similar a un dios, o haber sido resucitado de entre los muertos por voluntad personal de una deidad o ser similar a un dios.",
    benefit: "Obtienes un bono de +2 a las pruebas de Constitución para estabilizar mientras mueres. En cualquier momento en que tú o un aliado que adore al dios que te contactó lancen augurio o un efecto similar, tu probabilidad de recibir una respuesta significativa aumenta en 5% (hasta un máximo de 95%)."
  },
  "aquadynamic-focus": {
    name: "Enfoque Acuadinámico*",
    benefit: "No recibes penalizaciones adicionales a las tiradas de ataque y daño por luchar bajo el agua con armas cuerpo a cuerpo contundente y cortantes para las que hayas tomado la dote Enfoque de Arma.",
    normal: "Al usar armas cuerpo a cuerpo contundente y cortantes bajo el agua, recibes una penalización de -2 a las tiradas de ataque y causas la mitad del daño."
  },
  "aquadynamic-shot": {
    name: "Disparo Acuadinámico*",
    benefit: "Tus ataques de proyectil reciben una penalización de -1 por cada 5 pies de agua entre tú y el objetivo. Aún no puedes usar armas arrojadizas efectivamente bajo el agua excepto en circunstancias especiales.",
    normal: "Los ataques de proyectil bajo el agua reciben una penalización de -2 por cada 5 pies de agua entre el disparar y el objetivo."
  },
  "aquatic-adaption": {
    name: "Adaptación Acuática",
    prerequisite: "Contener el aliento.",
    benefit: "Puedes respirar agua tan bien como aire."
  },
  "aquatic-advantage": {
    name: "Ventaja Acuática",
    benefit: "Una criatura que carece de velocidad de nado provoca un ataque de oportunidad de ti cuando te ataca bajo el agua. No obtienes un ataque de oportunidad si el atacante está bajo los efectos de libertad de movimiento."
  },
  "aquatic-ancestry": {
    name: "Ascendencia Acuática",
    prerequisite: "Undine.",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia realizadas bajo el agua. Además, puedes usar tu modificador de Carisma en lugar de tu modificador de Constitución para determinar cuánto tiempo puedes contener el aliento."
  },
  "arachnid-companion": {
    name: "Compañero Arácnido",
    benefit: "Obtienes un compañero animal araña como si fueras un druida de tu nivel de personaje –3. Este compañero animal es un araña gigante con un tamaño basado en tu nivel (ver abajo). Si más adelante obtienes un compañero animal a través de otra fuente, el nivel de druida efectivo otorgado por esta dote se acumula con otras fuentes."
  },
  "arcane-aptitude": {
    name: "Aptitud Arcana",
    benefit: "Obtienes un bono de +2 a las pruebas de Oficio Mago y Spellcraft. Si tienes 10 o más rangos en una de estas habilidades, el bono aumenta a +4 para esa habilidad."
  },
  "arcane-armor-mastery": {
    name: "Maestría de Armadura Arcana",
    prerequisite: "Con 15, Competencia con armaduras, lanzar hechizos arcanos.",
    benefit: "Reduce la probabilidad de fallo de hechizos de armadura para armaduras que usas en un 10%."
  },
  "arcane-armor-training": {
    name: "Entrenamiento de Armadura Arcana",
    prerequisite: "Competencia con armadura, lanzar hechizos arcanos.",
    benefit: "No sufres penalización de probabilidad de fallo de hechizos por usar armadura ligera."
  },
  "arcane-battle-mastery": {
    name: "Maestría de Batalla Arcana",
    prerequisite: "Nivel de lanzador arcano 3°.",
    benefit: "Cuando lanzas un hechizo que tiene un componente de toque de combate, puedes hacer un ataque de toque cuerpo a cuerpo como parte del lanzamiento del hechizo. El hechizo se lanza contra la CA del objetivo en lugar de contra CA sin armadura, pero puedes añadir tu bono de ataque base a la tirada."
  },
  "arcane-defender": {
    name: "Defensor Arcano",
    prerequisite: "Característica de clase aura, nivel de lanzador 3°.",
    benefit: "Obtienes una defensa natural de +2, o tu defensa natural existente aumenta en +2."
  },
  "arcane-denial": {
    name: "Negación Arcana",
    prerequisite: "Inteligencia 13.",
    benefit: "Obtienes un intento de interrumpir hechizo por día. Usas tu bono de ataque de toque para realizar el ataque de interrupción. Este beneficio se renueva cada día al despertar."
  },
  "arcane-draftsmanship": {
    name: "Elaboración Arcana",
    prerequisite: "UML 1 rango.",
    benefit: "Puedes elaborar pergaminos de cualquier hechizo arcano que conoces. Crear un pergamino toma 1 hora por nivel de hechizo y requiere materiales valorados en 25 po por nivel de hechizo."
  },
  "arcane-expert": {
    name: "Experto Arcano",
    benefit: "Obtienes un bono de +2 a las pruebas de Spellcraft. Si tienes 10 o más rangos, el bono aumenta a +4."
  },
  "arcane-flare": {
    name: "Destello Arcano",
    prerequisite: "Capacidad para lanzar al menos un hechizo arcano.",
    benefit: "Como reacción, cuando una criatura a menos de 30 pies lanza un hechizo arcano, puedes hacer que esa criatura sea el objetivo de un efecto menor. El lanzador debe tener éxito en una tirada de ahorro de Voluntad (CD 10 + tu modificador de Carisma) o quedar estremecido durante 1 ronda."
  },
  "arcane-focus": {
    name: "Enfoque Arcano",
    benefit: "Obtienes un bono de +2 a las pruebas de Spellcraft. Si tienes 10 o más rangos, el bono aumenta a +4."
  },
  "arcane-heritage": {
    name: "Herencia Arcana",
    prerequisite: "Al menos un hechizo arcano de nivel 0 en tu libro de hechizos.",
    benefit: "Elige una escuela de magia. Obtienes +2 a las pruebas de nivel de lanzador para superar la resistencia a hechizos de criaturas de esa escuela y +2 a las tiradas de ataque de toque a distancia con hechizos de esa escuela."
  },
  "arcane-master": {
    name: "Maestro Arcano",
    prerequisite: "Nivel de lanzador arcano 10°, escuela de magia seleccionada con Herencia Arcana.",
    benefit: "Elige un hechizo de la escuela seleccionada con Herencia Arcana que puedas lanzar. Puedes lanzar ese hechizo una vez al día como habilidad similar a hechizo de nivel igual a la mitad de tu nivel de lanzador (redondeando hacia arriba)."
  },
  "arcane-mastery": {
    name: "Dominio Arcano",
    prerequisite: "Nivel de lanzador 7°.",
    benefit: "Selecciona una escuela de magia de tu libro de hechizos. Puedes preparar un hechizo adicional de esa escuela cada día."
  },
  "arcane-penetrator": {
    name: "Penetrador Arcano",
    prerequisite: "Nivel de lanzador arcano 5°.",
    benefit: "Obtienes un bono de +2 a las pruebas de nivel de lanzador para superar la resistencia a hechizos."
  },
  "arcane-schooling": {
    name: "Escuela Arcana",
    benefit: "Obtienes un bono de +2 a las pruebas de Conocimiento (arcano) y Spellcraft. Si tienes 10 o más rangos en una de estas habilidades, el bono aumenta a +4 para esa habilidad."
  },
  "arcane-sentry": {
    name: "Centinela Arcano",
    prerequisite: "Sab 13.",
    benefit: "Obtienes resistencia a hechizos 5 contra efectos de escuela de adivinación."
  },
  "arcane-strike": {
    name: "Golpe Arcano",
    benefit: "Como acción rápida, puedes invertir un uso de poder místico para dar a tu próximo ataque cuerpo a cuerpo en el mismo turno un bono de +1d6 a la tirada de daño. Este bono de daño no se multiplica en un golpe crítico, pero se añade al daño total del crítico."
  },
  "arcane-talent": {
    name: "Talento Arcano",
    benefit: "Selecciona un hechizo arcano de nivel 0 de tu lista de hechizos. Ese hechizo se convierte en un hechizo favorito. Puedes lanzar ese hechizo favorito un número de veces ilimitado."
  },
  "arcane-throw": {
    name: "Arrojar Arcano",
    benefit: "Puedes convertir cualquier objeto que sostengas en un proyectil y dispararlo como un ataque de toque a distancia con un alcance de 30 pies. El objeto causa 1d6 puntos de daño por cada 10 pies de alcance que tendría si fuera arrojado (generalmente 1d6 para objetos pequeños). No puedes usar esta capacidad con objetos que no podrían ser arrojados (como armaduras o escudos grandes)."
  },
  "archaeologist-luck": {
    name: "Suerte del Arqueólogo",
    benefit: "Obtienes un talento de arqueólogo de la lista de talentos de inquisidor. Debes satisfacer los requisitos del talento como si fuera un talento de inquisidor."
  },
  "armor-expertise": {
    name: "Experiencia con Armaduras",
    benefit: "Reduce la penalización de armadura a las pruebas de sigilo en 3."
  },
  "armor-master": {
    name: "Maestro de Armaduras",
    prerequisite: "Competencia con armadura, entrenamiento con armadura.",
    benefit: "Obtienes un talento de entrenamiento de armadura avanzado de la lista de talentos de entrenamiento de armadura avanzada de guerrero."
  },
  "armor-proficiency": {
    name: "Competencia con Armaduras",
    benefit: "Obtienes competencia con armaduras ligeras, medianas y pesadas."
  },
  "armor-training": {
    name: "Entrenamiento de Armadura",
    prerequisite: "Nivel de guerrero 1°.",
    benefit: "Selecciona un talento de entrenamiento de armadura de la lista de talentos de entrenamiento de armadura de guerrero."
  },
  "artful-panic": {
    name: "Pánico Artístico",
    benefit: "Cuando usas un talento de pandilla o una habilidad de clase que causa que un enemigo se vuelva estremecido o mareado, el efecto dura 1 ronda adicional."
  },
  "aspect-of-the-beast": {
    name: "Aspecto de la Bestia",
    prerequisite: "Característica de clase de forma de野",
    benefit: "Selecciona una forma alternativa de tu característica de clase de forma. Puedes adoptar esa forma alternativa un número de veces al día igual a 1 + tu modificador de Sabiduría."
  },
  "assault-launcher": {
    name: "Lanzador de Asalto",
    prerequisite: "Nivel de lanzador 5°, capacidad de lanzar hechizos con el descriptor de fuerza.",
    benefit: "Cuando lanzas un hechizo con el descriptor de fuerza, puedes Designar un punto dentro del alcance del hechizo como el nuevo punto de origen para el efecto del hechizo. El área del efecto del hechizo se origina desde ese punto en su lugar."
  },
  "assimilate": {
    name: "Asimilar",
    prerequisite: "Con 13, habilidad para lanzar hechizos de adivinación.",
    benefit: "Cuando una criatura que puedas ver falla una tirada de ahorro contra uno de tus hechizos de adivinación, puedes obtener información adicional sobre esa criatura. El tipo de información depende de qué tan bien falló la criatura la tirada de ahorro. Falla por 5 o menos: obtienes una categoría de información (a tu elección) de la lista de abajo. Falla por 6-10: obtienes dos categorías de información. Falla por 11-15: obtienes tres categorías. Falla por 16 o más: obtienes todas las categorías de información. Categorías de información: nombre de la criatura, alineación, ND, DV, puntos de golpe actuales, resistencias, inmunidades, debilidades, habilidades especiales, hechizos activos, o equipo."
  },
  "astral-reorientation": {
    name: "Reorientación Astral",
    benefit: "Una vez por día, como acción inmediata, puedes elegir cambiar tu alineación por un paso en cualquier dirección. Este cambio dura 24 horas."
  },
  "athletic": {
    name: "Atlético",
    benefit: "Obtienes un bono de +2 a todas las pruebas de Acrobacia y Natación. Si tienes 10 o más rangos en una de estas habilidades, el bono aumenta a +4 para esa habilidad."
  },
  "augment-explosive": {
    name: "Amplificar Explosivo",
    benefit: "Cuando usas el talento descobridor Explosivo, el radio de explosión aumenta en 5 pies y el daño máximo aumenta en 2d6."
  },
  "aura-of-the-unremarkable": {
    name: "Aurea de lo Insípido",
    prerequisite: "Carisma 13.",
    benefit: "Tienes un aura que hace que sea más difícil notar tu presencia. Los seres no alineados no pueden usar Sentir Motivaciones o percepción pasiva para notar tu presencia a menos que quieras que lo hagan."
  },
  "auto-animation": {
    name: "Auto-Animación",
    prerequisite: "Nivel de lanzador 7°, característica de clase animador de objetos.",
    benefit: "Cuando lanzas animate objects, puedes elegir un número de objetos adicionales igual a tu modificador de Sabiduría."
  },
  "averting-gaze": {
    name: "Mirada Evitadora",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro contra efectos de mirada."
  },
  "aquatic-combatant": {
    name: "Combatiente Acuático*",
    prerequisite: "Natación 1 rango.",
    benefit: "Obtienes un bono de +2 a las pruebas de Natación y no sufres las penalizaciones habituales a las tiradas de ataque cuerpo a cuerpo realizadas bajo el agua. Tus ataques cuerpo a cuerpo cortantes y ataques sin armas contundente causan daño completo bajo el agua.",
    normal: "Cuando estás bajo el agua, la mayoría de tus ataques cuerpo a cuerpo reciben una penalización de -2 y causan solo la mitad del daño."
  },
  "aquatic-spell": {
    name: "Hechizo Acuático",
    benefit: "Un hechizo acuático funciona normalmente bajo el agua y no requiere prueba de nivel de lanzador para lanzar, incluso si tiene el descriptor de fuego. Además, el hechizo puede lanzarse desde la superficie hacia el agua y seguir siendo efectivo. Un hechizo acuático usa un espacio de hechizo 1 nivel más alto que el nivel real del hechizo."
  },
  "aquatic-squires": {
    name: "Escuderos Acuáticos",
    prerequisite: "Tritón",
    benefit: "La duración de tu habilidad similar a hechizo invitación de aliado de la naturaleza II es 1 minuto por nivel.",
    normal: "Invocación de aliado de la naturaleza II tiene una duración de 1 ronda por nivel."
  }
}