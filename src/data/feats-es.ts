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
  },
  "arc-slinger": {
    name: "Fondeadero de Arco*",
    benefit: "Al usar una honda o bastón-honda, reduces tu penalización a las tiradas de ataque a distancia debido al alcance en 2. El bono de daño de Disparo Cercano se aplica dentro del primer incremento de alcance normal de tu honda (50 pies) o bastón-honda (80 pies)."
  },
  "arcane-blast": {
    name: "Explosión Arcana",
    prerequisite: "Lanzador arcano, nivel de lanzador 10°.",
    benefit: "Como acción estándar, puedes sacrificar un hechizo preparado o un espacio de hechizo sin usar de 1er nivel o superior y transformarlo en un rayo, atacando a cualquier enemigo dentro de 30 pies como un ataque de toque a distancia. Este ataque inflige 2d6 puntos de daño más 1d6 puntos de daño adicionales por cada nivel del hechizo o espacio de hechizo que sacrificaste. Los hechizos de nivel 0 no pueden ser sacrificados de esta manera. Esta es una habilidad sobrenatural."
  },
  "arcane-insight": {
    name: "Perspicacia Arcana",
    benefit: "Siempre que uses Escudo Arcano, también ganas un bono de perspicacia de +1 a la CA durante 1 ronda."
  },
  "arcane-jinxer": {
    name: "Malditor Arcano",
    prerequisite: "Lanzador arcano, rasgo de halfling Maldecir.",
    benefit: "Cuando intentas maldecir a una criatura, puedes expendir uno de tus hechizos arcanos preparados o espacios de hechizos arcanos disponibles para darle a tu objetivo una penalización a su tirada de ahorro contra la maldición igual al nivel del hechizo o espacio de hechizo expendido. Esto no altera el efecto de la maldición, solo la tirada de ahorro para resistirla."
  },
  "arcane-school-spirit": {
    name: "Espíritu de Escuela Arcana",
    prerequisite: "Engaño 1 rango, característica de clase escuela de magia, gnomo.",
    benefit: "Como acción de ronda completa, proclaim las virtudes de tu escuela de magia a una criatura dentro de 30 pies. Haz una prueba de Engaño opposada por una prueba de Sentir Motivaciones del objetivo; si ganas la prueba, el objetivo recibe una penalización de -2 a las tiradas de ahorro para resistir el próximo hechizo de esa escuela que lances. Si tu escuela elegida es universalista, elige una escuela específica cada vez que uses esta habilidad. Si tu prueba de Engaño tiene éxito, sin embargo, tu falta de compromiso real con la escuela significa que el objetivo solo recibe una penalización de -1 a su tirada de ahorro."
  },
  "arcane-shield": {
    name: "Escudo Arcano",
    prerequisite: "Lanzador arcano, nivel de lanzador 10°.",
    benefit: "Como acción inmediata, puedes sacrificar un hechizo preparado o un espacio de hechizo sin usar de 1er nivel o superior y ganar un bono de deflexión a la CA igual al nivel del hechizo o espacio de hechizo que sacrificaste durante 1 ronda. Los hechizos de nivel 0 no pueden ser sacrificados de esta manera."
  },
  "arcane-trap-suppressor": {
    name: "Supresor de Trampas Arcanas",
    prerequisite: "Habilidad para lanzar",
    benefit: "Cuando tienes como objetivo una trampa mágica con dispel magic o greater dispel magic, si tu prueba de nivel de lanzador excede la CD de Desactivar Mecanismo de la trampa, la trampa queda deshabilitada durante 1d4 minutos. Normal: Dispel magic suprime las propiedades mágicas de un objeto durante 1d4 rondas."
  },
  "arcane-vendetta": {
    name: "Venganza Arcana",
    prerequisite: "Spellcraft 1 rango.",
    benefit: "Infliges +2 daño con ataques de arma realizados contra cualquier objetivo que hayas visto lanzar un hechizo arcano (no usando una habilidad similar a hechizo) en las últimas 5 rondas. Debes haber identificado exitosamente el hechizo con una prueba de Spellcraft para saber sin lugar a dudas que el hechizo es arcano."
  },
  "archon-diversion": {
    name: "Diversión de Archón*",
    benefit: "La penalización a la CA por usar Estilo Archón para otorgar a aliados cercanos un bono a la CA contra un único oponente se reduce a -1. Una vez por ronda mientras usas Estilo Archón, cuando tienes al menos una mano libre o cuando empuñas un escudo, puedes desviar un ataque de arma cuerpo a cuerpo dirigido contra un aliado adyacente hacia ti. Después de resolver el ataque, el aliado que protegiste puede hacer un ataque de oportunidad contra el oponente desviado. No expendes ninguna acción para desviar el ataque, pero debes ser consciente de él y no debes estar desprevenido. Debes elegir desviar el ataque después de que el oponente haya declarado el ataque cuerpo a cuerpo, pero antes de que se tire la tirada de ataque."
  },
  "archon-justice": {
    name: "Justicia de Archón*",
    benefit: "Ya no recibes una penalización a la CA por usar Estilo Archón para otorgar a aliados cercanos un bono a la CA, y puedes activar este efecto como acción rápida o acción de movimiento. Siempre que tomes daño de un ataque que deflectaste hacia ti usando Diversión de Archón, cada aliado que amenace a la criatura atacante puede hacer un ataque de oportunidad contra esa criatura."
  },
  "archon-style": {
    name: "Estilo Archón*",
    benefit: "Mientras usas este estilo, como acción de movimiento, puedes proteger aliados adyacentes de un único oponente que amenazas actualmente. Esto otorga a aliados adyacentes un bono de esquiva de +2 a la CA contra el próximo ataque cuerpo a cuerpo de ese oponente (siempre que ese ataque venga antes del comienzo de tu siguiente turno), pero te causa una penalización de -2 a la CA contra ese oponente hasta tu siguiente turno. El bono de esquiva contra los ataques del oponente designado persiste incluso si tus aliados se alejan de ti."
  },
  "arcing-lob": {
    name: "Lanzamiento Arqueado",
    prerequisite: "Dex 15",
    benefit: "Cuando golpeas un objetivo que es Grande o mayor con un arma de área, puedes elegir inflict daño de área a todas las criaturas dentro de 5 pies del objetivo, no inflict daño de área a ninguna criatura, o inflict daño de área normalmente. Normal: Si golpeas un objetivo que es Grande o mayor con un arma de área, elige una de sus casillas—el daño de área afecta a las criaturas dentro de 5 pies de esa casilla."
  },
  "arcing-weapon": {
    name: "Arma Arqueada*",
    benefit: "Como acción estándar, puedes lanzar un hechizo de rayo que requiere un ataque de toque a distancia y entregar el efecto a través de tu arma cuerpo a cuerpo, ya sea a través de un ataque cuerpo a cuerpo o como un ataque a distancia. Si entregas este hechizo como un ataque cuerpo a cuerpo, esto funciona como la habilidad de magus spellstrike. Si entregas el hechizo como un ataque a distancia, el hechizo es un ataque de toque a distancia que se descarga desde tu arma y aplica el bono de mejora del arma al daño del hechizo. Cuando se dispara de esta manera, el hechizo usa el rango de amenaza de crítico del arma, pero el efecto del hechizo solo inflict daño ×2 en un golpe crítico exitoso. Puedes usar un hechizo de ataque de toque a distancia que objective más de una criatura (como scorching ray), pero solo haces un ataque a través de tu arma para entregar un efecto de ataque de toque a distancia; los ataques de toque a distancia adicionales del hechizo se desperdician y no tienen efecto."
  },
  "arctic-adaptation": {
    name: "Adaptación Ártica",
    prerequisite: "Característica de clase terreno favorito (frío).",
    benefit: "Tratas los ambientes fríos como si fueran un paso menos severos de lo que normalmente son. Además, ganas un bono de +2 a las pruebas de Percepción contra criaturas que tienen un bono racial a las pruebas de Sigilo en condiciones de nieve, y ganas un bono de +4 a las tiradas de ahorro y pruebas para evitar quedar cegado o deslumbrado por el resplandor del hielo o nieve."
  },
  "area-jinx": {
    name: "Maldición de Área",
    benefit: "Cuando usas tu maldición, creas una explosión invisible instantánea con un radio máximo de 10 pies en cualquier lugar dentro del alcance normal de tu maldición, afectando múltiples objetivos. Cualquier criatura dentro de esta explosión, independientemente de si puedes verla o no, debe hacer una tirada de ahorro para resistir tu maldición. Si usas tu maldición nuevamente, todas tus maldiciones actuales finalizan inmediatamente. Especial: Puedes obtener esta dote múltiples veces. Cada vez que lo haces, el área máxima de tu explosión de maldición aumenta en 10 pies adicionales."
  },
  "arisen": {
    name: "Resurgido",
    prerequisite: "Debes haber sido slain y brought back from the dead, or have the Left to Die or Cursed Birth background.",
    benefit: "No mueres hasta que tu total de puntos de golpe negativos sea igual o mayor que 4 + tu puntuación de Constitución. Una vez por día como acción estándar, puedes forzarte a continuar solo por fuerza de voluntad, ganando 1 punto de golpe temporal por dado de golpe. Estos puntos de golpe temporales duran 10 minutos. Normal: Mueres cuando tu total de puntos de golpe negativos es igual o mayor que tu puntuación de Constitución."
  },
  "arithmancy": {
    name: "Aritmancia",
    prerequisite: "Int 13",
    benefit: "Inmediatamente antes de lanzar un hechizo, como acción rápida, puedes intentar aumentar el lanzamiento de un hechizo usando Aritmancia. Para hacerlo, determina la raíz digital del nombre del hechizo que estás lanzando. Para encontrar la raíz digital de un nombre de hechizo, primero asigna un valor numérico a cada letra del nombre, según la tabla de Valores de Letras. Una vez que tengas una cadena de dígitos, súmalos. Valores Numéricos: 1 = a, j, s; 2 = b, k, t; 3 = c, l, u; 4 = d, m, v; 5 = e, n, w; 6 = f, o, x; 7 = g, p, y; 8 = h, q, z; 9 = i, r. Si el resultado tiene más de un dígito, suma esos dígitos. Repite este proceso hasta llegar a un solo número, llamado raíz digital. Una vez que hayas traducido el nombre del hechizo a una sola raíz digital, intenta una prueba de Spellcraft con una CD igual a 10 + el nivel del hechizo + la raíz digital. Si tu prueba succeeds, el hechizo se lanza con +1 nivel de lanzador. Si tu prueba fails, el hechizo se lanza con -1 nivel de lanzador. Si no lanzas el hechizo que pretendías aumentar con aritmancia, el hechizo se expende sin efecto, aunque conservas la acción que habrías gastado para lanzarlo. Los efectos metamágicos no se incluyen en el nombre de un hechizo al determinar la raíz digital del hechizo, pero aumentan el nivel del hechizo normalmente al determinar la CD de la prueba de Spellcraft. Puedes usar esta habilidad un número de veces por día igual al número de niveles de lanzador que posees."
  },
  "arming-grab": {
    name: "Agarre Armado*",
    prerequisite: "Int 13",
    benefit: "No recibes penalización en tu tirada de ataque al intentar desarmar a un oponente mientras estás desarmado. Si tienes éxito en un intento de desarme sin usar un arma y eliges recoger el arma desarmada, puedes atacar con esa arma como si fueras competente con ella hasta el final de tu siguiente turno. Si ya eres competente con ese tipo de arma, ganas un bono de moral de +2 a tus tiradas de ataque con esa arma hasta el final de tu siguiente turno. Normal: Intentar desarmar a un enemigo mientras estás desarmado impone una penalización de -4 al ataque."
  },
  "armor-adept": {
    name: "Adepto de Armadura*",
    benefit: "Elige dos modificaciones de armadura (como deflector o impactante). Ya no sufres los inconvenientes de usar armadura con esas modificaciones. Normal: Cada tipo de modificación de armadura impone un inconveniente al usuario. Especial: Puedes obtener esta dote múltiples veces, eligiendo dos modificaciones de armadura diferentes cada vez."
  },
  "armor-focus": {
    name: "Enfoque de Armadura*",
    prerequisite: "Bono de ataque base +1, competencia con la armadura seleccionada.",
    benefit: "Selecciona un tipo de armadura, como camisa de cadenas o malla de placas. El bono de CA otorgado por la armadura seleccionada aumenta en 1. Especial: Puedes obtener esta dote múltiples veces. Sus efectos no se apilan. Cada vez que tomas la dote, se aplica a un nuevo tipo de armadura. La dote Enfoque de Armadura cuenta como la característica de clase entrenamiento de armadura para el propósito de los requisitos previos de dotes de maestría de armadura y determina qué tipos de armadura puedes usar con dotes de maestría de armadura."
  },
  "armor-material-expertise": {
    name: "Experiencia en Material de Armadura*",
    prerequisite: "Bono de ataque base +6 o nivel de guerrero 4°, característica de clase entrenamiento de armadura.",
    benefit: "Cuando usas armadura hecha de uno de los materiales enumerados a continuación, puedes usar la habilidad listed dos veces por día (a menos que se indique lo contrario). Adamantina: Como acción inmediata después de ser golpeado por un ataque, conviertes la mitad del daño letal del ataque en daño no letal. Angelskin: Como acción rápida, brillas con luz brillante como daylight durante 1 ronda. Darkleaf Cloth: Como acción rápida, ganas la característica de clase druida woodland stride durante 1 minuto. Dragonhide: Como acción inmediata cuando recibes daño de energía del mismo tipo al que la armadura de dragonhide es inmune, reduces el daño recibido en 10 puntos de golpe. Elysian Bronze: Como acción inmediata después de ser golpeado por un ataque de una bestia mágica o humanide monstruoso, conviertes la mitad del daño letal del ataque en daño no letal. Fire-Forged Steel o Frost-Forged Steel: Como acción rápida, cualquier golpe sin arma, embestida de escudo o ataques con guantelete de púas o púas de armadura se tratan como teniendo la habilidad especial de llama (para fire-forged steel) o la habilidad especial de frío (para frost-forged steel) durante 1 minuto. Horacalcum: Una vez por día como acción rápida, puedes otorgarte los beneficios de haste durante 1 ronda. Living Steel: Como acción inmediata después de ser golpeado por un ataque con un arma de metal, puedes usar la habilidad del living steel para dañar armas de metal, como si el atacante hubiera sacado un 1 natural en el ataque. Mithral: Como acción inmediata, ganas resistencia a hechizos contra hechizos de transmutación igual a 5 + el bono de mejora de la armadura + tu nivel de personaje durante 1 ronda. Noqual: El bono de resistencia de la armadura a las tiradas de ahorro aumenta a +4 durante 1 ronda."
  },
  "armor-material-mastery": {
    name: "Maestría de Material de Armadura*",
    benefit: "Puedes usar la habilidad otorgada por Experiencia en Material de Armadura dos veces adicionales por día."
  },
  "armor-of-the-pit": {
    name: "Armadura del Pozo",
    prerequisite: "Tiefling.",
    benefit: "Ganas un bono de +2 de armadura natural. Especial: Si tienes el rasgo racial piel escamada, en su lugar ganas resistencia 5 a dos de los siguientes tipos de energía que aún no tengas resistencia: frío, electricidad y fuego."
  },
  "armor-proficiency-heavy": {
    name: "Competencia con Armadura Pesada*",
    prerequisite: "Competencia con Armadura Ligera, Competencia con Armadura Media.",
    benefit: "Ver Competencia con Armadura Ligera."
  },
  "armor-proficiency-light": {
    name: "Competencia con Armadura Ligera*",
    benefit: "Cuando usas un tipo de armadura con la que eres competente, la penalización de armadura de esa armadura se aplica solo a las pruebas de habilidad basadas en Destreza y Fuerza. Normal: Un personaje que usa armadura con la que no es competente aplica su penalización de armadura a las tiradas de ataque y a todas las pruebas de habilidad que implican moverse."
  },
  "armor-proficiency-medium": {
    name: "Competencia con Armadura Media*",
    prerequisite: "Competencia con Armadura Ligera.",
    benefit: "Ver Competencia con Armadura Ligera."
  },
  "armor-trick": {
    name: "Truco de Armadura*",
    prerequisite: "Bono de ataque base +1.",
    benefit: "Puedes usar cualquier truco de armadura relacionado con la opción de armadura elegida si cumples los requisitos del truco y eres competente con cualquier armadura que uses como parte del truco. Especial: Puedes obtener la dote Truco de Armadura múltiples veces. Cada vez que tomas la dote, se aplica a una nueva opción de truco de armadura."
  },
  "armored-athlete": {
    name: "Atleta Armado*",
    prerequisite: "Competencia con armadura ligera, competencia con armadura media, 3 rangos en cualquier habilidad basada en Destreza o Fuerza.",
    benefit: "Elige una habilidad basada en Destreza o Fuerza en la que poseas al menos 3 rangos. Cuando intentas una prueba para la habilidad elegida, tu penalización de armadura en esa prueba por usar armadura ligera o media se reduce en 3 (a un mínimo de 0). Si tienes 10 o más rangos en la habilidad, la penalización en su lugar se reduce en 6 (a un mínimo de 0). Si tienes entrenamiento de armadura 2 y eres competente con armadura pesada, este beneficio también se aplica a las penalizaciones de armadura por usar armadura pesada. Especial: Puedes obtener esta dote múltiples veces. Cada vez que tomas la dote, se aplica a una nueva habilidad."
  },
  "armored-rider": {
    name: "Jinete Armado",
    benefit: "No recibes la penalización de armadura usual en las pruebas de Montar. Si quedas inconsciente mientras estás en una silla de montar, siempre permaneces en la silla. Normal: Si quedas inconsciente mientras montas, tienes un 50% de permanecer en la silla (75% si estás en una silla militar)."
  },
  "artful-dodge": {
    name: "Esquiva Hábil*",
    prerequisite: "Int 13.",
    benefit: "Si eres el único personaje que amenaza a un oponente, ganas un bono de esquiva de +1 a la CA contra ese oponente."
  },
  "artifact-hunter": {
    name: "Buscador de Artefactos",
    prerequisite: "Debes haber visto un artefacto legendary en algún momento de tu pasado.",
    benefit: "Ganas un bono de +2 a las pruebas de Usar Dispositivo Mágico al emular una característica de clase, puntuación de raza o alineación. Si tienes 10 o más rangos en Usar Dispositivo Mágico, este bono aumenta a +4. Además, una vez por día, en lugar de intentar una prueba de Usar Dispositivo Mágico normalmente, puedes elegir determinar el resultado como si hubieras sacado un 15."
  },
  "artillery-team": {
    name: "Equipo de Artillería*",
    prerequisite: "Competencia con ballesta ligera, ballesta pesada o mosquete; tamaño Pequeño o Mediano.",
    benefit: "Cuando estás adyacente a un aliado que también tiene esta dote, juntos se consideran como Grandes para el propósito de usar ballestas ligeras Grandes, ballestas pesadas Grandes y mosquetes Grandes. Disparar tal arma de esta manera requiere que tu aliado apoye el cañón o arco del arma. Debes poder trazar una línea desde tu espacio hasta el espacio del objetivo de manera que la línea pase por el espacio del aliado. El aliado no proporciona cobertura blanda a tu objetivo. Tu aliado usa sus acciones para recargar el arma, y tú usas tus acciones para realizar ataques. De manera similar, las dotes y habilidades de tu aliado se aplican a recargar, mientras que las tuyas se aplican a realizar ataques. Esta dote no permite a ti y a tu aliado actuar simultáneamente en la misma iniciativa."
  },
  "ascendant": {
    name: "Ascendente",
    prerequisite: "Debes tener el inconveniente Secret Shame o el trasfondo Bastard-Born",
    benefit: "Tienes un destino que superar. Obtienes un bono de +2 a las tiradas de ahorro contra efectos de muerte y miedo. Además, el nivel de lanzador de cualquier hechizo de conjuración (curación) que se lance sobre ti aumenta en 1 solo para los efectos sobre ti."
  },
  "ascendant-spell": {
    name: "Hechizo Ascendente",
    benefit: "Puedes modificar un hechizo para imitar la versión mítica de ese hechizo. Un hechizo ascendente usa la versión mítica del hechizo, pero no cuenta como hechizo mítico para los propósitos de efectos que interactúan con el hechizo, a menos que seas una criatura mítica. No puedes usar la versión aumentada del hechizo mítico, ni usar efectos de hechizos que requieran que gastes usos de poder mítico (incluso si tienes usos de poder mítico disponibles). Un hechizo ascendente usa un espacio de hechizo 5 niveles más alto que el nivel real del hechizo."
  },
  "ascetic-form": {
    name: "Forma Ascética*",
    benefit: "Puedes usar el arma cuerpo a cuerpo elegida con cualquier habilidad de clase que pueda usarse con un ataque sin armas, como la habilidad de estilo de combate del monje sin cadena. Además, eres tratado como un monje con un nivel igual a tu nivel de personaje para determinar el número de veces por día que puedes usar dotes con usos por día que dependen de tu nivel de monje, como las dotes Golpe Aturdidor o Golpe Perfecto."
  },
  "ascetic-strike": {
    name: "Golpe Ascético*",
    benefit: "Puedes usar el daño de ataque sin armas de un monje 4 niveles más bajo que tu nivel de personaje (mínimo 1°) en lugar del daño base para el arma elegida. Golpe Ascético funciona de todas las demás maneras como la característica de clase dominio de arma de cerca del brawler. Además, ignoras el prerrequisito de característica de clase mente firme para la dote Legado Monástico UC."
  },
  "ascetic-style": {
    name: "Estilo Ascético*",
    prerequisite: "Enfoque de Arma con el arma cuerpo a cuerpo elegida; bono de ataque base +1 o nivel de monje 1°.",
    benefit: "Elige un arma del grupo de armas de monje. Mientras usas este estilo y empuñas el arma elegida, puedes aplicar los efectos de dotes que tienen Golpe Mejorado sin Armas como prerrequisito, así como efectos que aumenten un ataque sin armas, como si los ataques con el arma fueran ataques sin armas.",
    special: "Un monje de nivel 5° o un personaje con la característica de clase entrenamiento de arma (monje) puede usar Estilo Ascético con cualquier arma de monje, además del arma cuerpo a cuerpo elegida."
  },
  "aspect-of-the-beast": {
    name: "Aspecto de la Bestia",
    prerequisite: "Característica de clase forma salvaje, ver Especial.",
    benefit: "Tu naturaleza bestial se manifiesta de una de las siguientes maneras. Eliges la manifestación cuando seleccionas la dote, y luego no puedes cambiarla. Sentidos Nocturnos (Ex): Si tu raza base tiene visión normal, obtienes visión en la brecha. Si tu raza base tiene visión en la brecha, obtienes visión en la oscuridad hasta un alcance de 30 pies. Si tu raza base tiene visión en la oscuridad, el alcance de tu visión en la oscuridad aumenta en 30 pies. Garras de la Bestia (Ex): Crecen un par de garras. Estas garras son ataques primarios que infligen 1d4 puntos de daño (1d3 si eres Pequeño). Salto del Depredador (Ex): Puedes hacer un salto corriendo sin necesidad de correr 10 pies antes de saltar. Instinto Salvaje (Ex): Obtienes un bono de +2 a las pruebas de iniciativa y un bono de +2 a las pruebas de Supervivencia.",
    special: "Un personaje que ha contraído licantropía puede tomar esta dote sin tener que cumplir los prerrequisitos. Un ranger que seleccione el estilo de combate de armas naturales puede tomar esta dote sin tener que cumplir los prerrequisitos (incluso si no selecciona Aspecto de la Bestia como dote de bonificación)."
  },
  "aspect-of-the-wolf": {
    name: "Aspecto del Lobo",
    prerequisite: "Característica de clase forma salvaje (lobo).",
    benefit: "Tu forma de lobo mejora de una de las siguientes maneras. Eliges la mejora cuando seleccionas la dote y no puedes cambiarla. Presencia Amenazante (Ex): Obtienes un bono de +2 a las pruebas de Intimidar. Fauce del Lobo (Ex): Tu mordedura es un ataque primario que inflige 1d8 puntos de daño (1d6 si eres Pequeño). Anda de Cazador (Ex): Obtienes rastreo como habilidad de clase y un bono de +2 a las pruebas de Supervivencia para rastrear."
  },
  "assassin-archetype": {
    name: "Arquetipo de Asesino",
    prerequisite: "Nivel de personaje 3°.",
    benefit: "Obtienes la capacidad de lanzar hechizos de asesinato como habilidades similares a hechizo. Puedes lanzar un número de veces por día igual a tu modificador de Sabiduría (mínimo 1). Tu nivel de lanzador para estos hechizos es igual a tu nivel de personaje -2."
  },
  "assassin-sphere": {
    name: "Esfera de Asesina",
    prerequisite: "Talento de combate (Esfera de combate), habilidad de clase ataque furtivo.",
    benefit: "Obtienes una habilidad de esfera de combate que puedes usar con tus ataques furtivos. Los objetivos de tus ataques furtivos no pueden ser inmunes a tu ataque furtivo basándose en su tipo de creature, pero pueden obtener immunity a través de otras fuentes."
  },
  "assassinate": {
    name: "Asesinar",
    prerequisite: "Bono de ataque base +4, característica de clase ataque furtivo.",
    benefit: "Como acción de ronda completa, puedes intentar asesinar a una criatura a la que tengas ventaja táctica. El objetivo debe tener éxito en una tirada de ahorro de Reflejos (CD 10 + tu bono de ataque base + tu modificador de Destreza) o ser reducido a 0 puntos de golpe. Si la tirada de ahorro tiene éxito, el objetivo recibe daño de ataque furtivo igual a tus dados de ataque furtivo. Esta capacidad no funciona contra criaturas que no están desprevenidas."
  },
  "assassin's-delight": {
    name: "Deleite del Asesina",
    prerequisite: "Característica de clase ataque furtivo.",
    benefit: "Cuando realizas un ataque furtivo contra una criatura que no puede actuar en su turno actual, el daño de tu ataque furtivo se duplica."
  },
  "assisted-ascension": {
    name: "Ascensión Asistida",
    prerequisite: "Trepar 5 rangos.",
    benefit: "Cuando tienes éxito en una prueba de Trepar, aliados dentro de los 20 pies que también tengan esta dote pueden trepar 5 pies a lo largo de la misma superficie como acción inmediata. Obtienes un bono de +5 a las pruebas de Trepar para atrapar a cualquier aliado que caiga que también tenga esta dote."
  },
  "associate": {
    name: "Asociado",
    prerequisite: "Mantener una relación positiva con una organización durante al menos 6 meses o lograr un logro importante en nombre de una organización.",
    benefit: "Selecciona una sola organización con la que tengas una relación positiva. Obtienes un bono de circunstancia de +4 a las pruebas de Diplomacia para influir en miembros de ese grupo o al hacer pruebas de obtener información sobre la organización. En cualquier asentamiento del tamaño de un pueblo pequeño o más grande, puedes pasar 1d4 horas para intentar localizar a un representante de tu organización para obtener un recurso o servicio menor gratis (como información), un lugar para quedarse, o transporte. Si tienes éxito en una prueba de Diplomacia (CD = 20 + el costo en po del servicio solicitado [mínimo 1 po]), exitosamente puedes llamar en un favor y obtener ese servicio gratis; de lo contrario, debes pagar la tarifa normal. Puedes intentar esta prueba una vez por semana.",
    special: "Puedes tomar esta dote múltiples veces. Cada vez que seleccionas esta dote, te asocias con una organización adicional."
  },
  "assured-destruction": {
    name: "Destrucción Asegurada",
    benefit: "Cuando usas tu habilidad pacto демónico y permites que tu alma sea consumida, tienes éxito automáticamente. La cantidad de daño de energía negativa dealt by your daemonic pact ability increases to 3d6 points, and the profane bonus to the save DC increases to +4. Normal: The daemonic pact ability has a 50% chance of success per attempt, and it deals 2d6 points of negative energy damage.",
    normal: "La habilidad pacto демónico tiene un 50% de probabilidad de éxito por intento, e inflige 2d6 puntos de daño de energía negativa."
  },
  "astrological-timing": {
    name: "Timing Astrológico",
    prerequisite: "Habilidad para lanzar.",
    benefit: "Puedes usar un cosmograma o carta astral como componente de enfoque opcional para augurio. Cuando lo haces, el augurio puede tener en cuenta consecuencias hasta 1 hora en el futuro, y tu probabilidad de una lectura exitosa aumenta en 4%. Si también consultas un orrery calculador estándar o un orrery calculador grandioso, el augurio puede ver hasta 1 día en el futuro y tu probabilidad de éxito aumenta en 8%."
  },
  "asura-sight": {
    name: "Vista de Asura*",
    benefit: "Cuando usas Estilo Asura, obtienes esquiva mejorado como un pícaro de tu nivel de personaje."
  },
  "asura-spellrend": {
    name: "Rompehechizos de Asura*",
    benefit: "Puedes reemplazar uno de tus ataques a tu mayor bono de ataque base cada ronda con un golpe rompedor de hechizos. Si tu golpe rompedor de hechizos impacta, no inflige daño, pero puedes intentar disipar un hechizo divino sin riesgo que afecte a este objetivo como por disipar magia, con un nivel de lanzador igual a tu nivel de personaje. Si tienes éxito en tu prueba de disipar, el objetivo queda mareado como si hubieras interrumpido el hechizo con Estilo Asura y no recibe tirada de ahorro para reducir la duración del mareado."
  },
  "asura-style": {
    name: "Estilo Asura",
    prerequisite: "Sab 13",
    benefit: "Cuando usas un arma de monje o ataque sin armas para atacar a una criatura que está lanzando un hechizo divino, el objetivo queda mareado durante 1d4 rondas. Un objetivo puede intentar una tirada de ahorro de Fortaleza (CD = 10 + mitad de tu nivel de personaje + tu modificador de Sabiduría) para reducir la duración del efecto de mareado a 1 ronda."
  },
  "atheist-abjurations": {
    name: "Abjuraciones Ateas",
    benefit: "Obtienes un bono de +2 a tu nivel de lanzador cuando usas un hechizo de abjuración para disipar o contrarrestar un hechizo divino, o enviar a un outsider extraplanar resumido o invocado por un lanzador divino de vuelta a su plano de origen."
  },
  "atlas-spine": {
    name: "Espina de Atlas",
    benefit: "Como acción de movimiento, puedes obtener un bono de esquiva de +2 a la CA hasta el inicio de tu siguiente turno. Este bono aumenta a +4 si tienes al menos 11 Dados de Golpe."
  },
  "attack-of-opportunity": {
    name: "Ataque de Oportunidad",
    benefit: "Obtienes un ataque de oportunidad por ronda."
  },
  "attack-seeker": {
    name: "Buscador de Ataques",
    benefit: "Cuando usas una acción de cargar o atacar a un oponente que ha usado total defense, puedes hacer un ataque adicional contra ese oponente como parte de la carga o el ataque."
  },
  "aura-of-blasphemy": {
    name: "Aura de Blasfemia",
    prerequisite: "Característica de clase aura de maldad, nivel de personaje 6°.",
    benefit: "Tu aura de maldad tiene un radio de 30 pies. Cualquier criatura dentro del aura que sea neutral o tenga un alineamiento con al menos un componente de bien debe tener éxito en una tirada de ahorro de Voluntad (CD 10 + mitad de tu nivel + tu modificador de Carisma) o quedar estremecida durante 1 ronda."
  },
  "aura-of-chaos": {
    name: "Aura de Caos",
    prerequisite: "Característica de clase aura de caos.",
    benefit: "Tu aura de caos se vuelve más potente. Obtienes un bono de +2 a las pruebas de Engaño para rodar resultados alternativos y a las pruebas de Diplomacia para cambiar el actitud de criaturas caóticas aliadas."
  },
  "aura-of-doom": {
    name: "Aura de Condena",
    prerequisite: "Nivel de personaje 10°, Característica de clase aura.",
    benefit: "Tu aura de condemnación obtiene un radio de 30 pies. Las criaturas dentro del aura que intenten lanzar un hechizo deben tener éxito en una tirada de ahorro de Voluntad (CD 10 + mitad de tu nivel + tu modificador de Carisma) o fallar el hechizo."
  },
  "aura-of-evil": {
    name: "Aura de Maldad",
    prerequisite: "Característica de clase aura de maldad.",
    benefit: "Tu aura de maldad se vuelve más potente. Obtienes un bono de +2 a las pruebas de Intimidar para desmoralizar y a las pruebas de Diplomacia para cambiar la actitud de criaturas malignas aliadas."
  },
  "aura-of-good": {
    name: "Aura de Bien",
    prerequisite: "Característica de clase aura de bien.",
    benefit: "Tu aura de bien se vuelve más potente. Obtienes un bono de +2 a las pruebas de Diplomacia para cambiar la actitud de criaturas buenas aliadas."
  },
  "aura-of-law": {
    name: "Aura de Ley",
    prerequisite: "Característica de clase aura de ley.",
    benefit: "Tu aura de ley se vuelve más potente. Obtienes un bono de +2 a las pruebas de Diplomacia para cambiar la actitud de criaturas legales aliadas."
  },
  "aura-of-un雁ality": {
    name: "Aura de Unicidad",
    prerequisite: "Característica de clase aura, característica de clase multiclase de lanzador.",
    benefit: "Las auras de tus clases de lanzador no se apilan entre sí pero no se cancelan entre sí. En su lugar, elige una aura para usar; las otras se suprimen pero no están activas."
  },
  "auto-hit-squad": {
    name: "Escuadrón de Impacto Automático",
    prerequisite: "Bono de ataque base +1, kobold.",
    benefit: "Cuando estás adyacente a un aliado que también tiene esta dote al comienzo de una ronda de sorpresa, puedes atacar a una criatura desprevenida durante esa ronda de sorpresa con un ataque cuerpo a cuerpo como si tuviera ventaja táctica."
  },
  "aviation": {
    name: "Aviación",
    prerequisite: "Nivel de personaje 5°.",
    benefit: "Obtienes una velocidad de vuelo de 60 pies (manejabilidad promedio). Este vuelo no puede transportar más que tu carga máxima de carga media."
  },
  "await-answer": {
    name: "Esperar Respuesta",
    prerequisite: "Int 13, característica de clase aura.",
    benefit: "Si una criatura falla una tirada de ahorro contra tu aura, esa criatura debe elegir entre recibir el efecto de tu aura o lanzarte un hechizo. Este efecto dura hasta que tu aura se desactive."
  },
  "awesome-blow": {
    name: "Golpe Asombroso",
    prerequisite: "Bono de ataque base +6, tamaño Grande o superior.",
    benefit: "Como acción de ronda completa, puedes realizar un ataque de arma cuerpo a cuerpo contra un objetivo. Si impactas, el objetivo debe tener éxito en una tirada de ahorro de Fortaleza (CD 10 + mitad de tu nivel de personaje + tu modificador de Fuerza) o ser empujado 10 pies atrás."
  },
  "aura-flare": {
    name: "Destello de Aura",
    prerequisite: "Cha 13; característica de clase aura, aura de bien o aura de maldad; canalizar energía 4d6; aura de bien o maldad fuerte o abrumadora.",
    benefit: "Una vez por día, cuando canalizas energía, también puedes hacer que tu aura divina explote en una exhibición de fuerza abrumadora, afectando a todas las criaturas buenas dentro del aura (si canalizas energía negativa) o a todas las criaturas malignas dentro del aura (si canalizas energía positiva). Este efecto es además de los efectos normales de canalizar energía. Cuando explodes tu aura, selecciona una de las siguientes opciones basada en la fuerza de tu aura de alineación. Puedes seleccionar un efecto de menor fuerza. Fuerte: Las criaturas afectadas deben tener éxito en una tirada de ahorro de Fortaleza (CD = 10 + mitad de tu nivel de clase en la clase que te otorga la habilidad de canalizar energía + tu modificador de Carisma) o quedar fatigadas durante 1d4 rondas. Abrumador: Las criaturas afectadas deben tener éxito en una tirada de ahorro de Fortaleza (CD = 10 + mitad de tu nivel de clase en la clase que te otorga la habilidad de canalizar energía + tu modificador de Carisma) o quedar aturdidas durante 1d4 rondas."
  },
  "aura-of-succumbing": {
    name: "Aura de Derrota",
    prerequisite: "Característica de clase canalizar energía, adorador de uno de los Cuatro Jinetes.",
    benefit: "Como acción rápida, puedes gastar uno de tus usos de canalizar energía para emanar un aura de derrota de 30 pies de radio durante un número de rondas igual a tu nivel de clérigo efectivo. Las criaturas que mueren en el área reciben 1 punto de daño por dado de tu daño normal de canalizar energía negativa al inicio de tu turno cada ronda. Una tirada de ahorro de Voluntad exitosa (CD igual a la CD de tu habilidad de canalizar energía) reduce este daño a la mitad. Cada vez que una criatura viva muere dentro de tu aura de derrota, obtienes un número de puntos de golpe temporales igual a los Dados de Golpe de esa criatura. Estos puntos de golpe temporales duran 1 hora."
  },
  "aural-insight": {
    name: "Perspicacia Auditiva",
    benefit: "Al gastar una acción de movimiento para hacer un sonido y escuchar los ecos, obtienes ceguera 30 pies hasta el final de tu turno. Usar esta dote requiere hacer sonidos audibles que imponen una penalización de -4 a tus pruebas de Sigilo.",
    special: "Esta dote no puede usarse si estás ensordecido o incapaz de hacer ruido, y no puedes detectar nada en áreas que estén mágicamente silenciadas."
  },
  "auspicious-birth": {
    name: "Nacimiento Auspicioso",
    prerequisite: "Debe tomarse en el nivel 1°.",
    benefit: "Elige uno de los siguientes beneficios basado en el evento astrológico que ocurrió durante tu nacimiento. Retrógrado Aparente: Obtienes un bono de suerte de +1 a las tiradas de ahorro de Reflejos. Un naturales 1 en una tirada de ahorro de Reflejos no se considera un fallo automático para ti. Conjunción: Cuando te beneficias de una dote de trabajo en equipo, aumenta el bono que tú y tus aliados reciben de esa dote en 1, si lo hay. Eclipse: Cuando te beneficias de cobertura blanda de un ataque o efecto, eres tratado como si te beneficiarías de cobertura dura en su lugar. No puedes usar esta habilidad para usar cobertura blanda para pruebas de Sigilo. Lluvia de Meteoros: Recibes un bono de esquiva acumulativo a la CA contra ataques a distancia por cada ataque a distancia más allá del primero realizado contra ti en una sola ronda, hasta un máximo de +4. Este bono dura hasta el inicio de tu siguiente turno. Cometa Pasajero: Obtienes un bono de perspicacia de +2 a las pruebas de habilidad usadas con una revelación de habilidad oculta. Signo Solar: Tus hechizos y habilidades similares a hechizo con el descriptor de luz son tratados como si fueran 1 nivel de hechizo más alto para determinar las CD de tirada de ahorro de hechizos. El nivel de hechizo con el descriptor de oscuridad que pueden contrarrestar o disipar también aumenta en 1."
  },
  "authoritative-spell": {
    name: "Hechizo Autoritativo",
    benefit: "Puedes alterar cualquier hechizo que objective una sola criatura para convertirse en un hechizo autoritativo. Cuando lanzas un hechizo autoritativo, elige una de las siguientes actividades para prohibir: acercarse a ti, alejarse de ti, hacer un ataque de arma cuerpo a cuerpo, hacer un ataque de arma a distancia, lanzar un hechizo ofensivo, o lanzar un hechizo no ofensivo. Una criatura que es afectada por el hechizo y falla su tirada de ahorro contra ese hechizo (si el hechizo permite una tirada de ahorro para resistir) no puede realizar ningún tipo de acción seleccionada en su siguiente turno. Un hechizo autoritativo obtiene el descriptor legal, y el efecto adicional es un efecto de compulsión que afecta la mente. Un hechizo autoritativo usa un espacio de hechizo 2 niveles más alto que el nivel de hechizo normal. Los hechizos con el descriptor caótico no pueden ser hechizos autoritativos."
  },
  "auto-denial": {
    name: "Auto Negación",
    benefit: "Obtienes un intento de contrahechizo adicional por día."
  },
  "auto-summoner": {
    name: "Auto-Convocador",
    prerequisite: "Nivel de lanzador 7°.",
    benefit: "Los objetos que creas con crear objetos pequeños o crear objetos mejores se consideran criaturas convocadas, y permanecen hasta que son destruidas. Un objeto creado de esta manera puede ser tratado como una criatura invocada para efectos que interactúan con criaturas convocadas, como disipar magia. Además, los objetos que creas con estas habilidades que tienen una duración de manifestación se tratan como si la duración fuera el doble."
  },
  "avatar-of-strife": {
    name: "Avatar de Conflicto",
    prerequisite: "Característica de clase aura de guerra, nivel de personaje 10°.",
    benefit: "Tu aura de guerra se expande a 30 pies. Cualquier criatura dentro del aura que intente lanzar un hechizo debe tener éxito en una tirada de ahorro de Voluntad (CD = 10 + mitad de tu nivel + tu modificador de Carisma) o el hechizo falla."
  },
  "avatar-of-war": {
    name: "Avatar de Guerra",
    prerequisite: "Característica de clase aura de guerra.",
    benefit: "Tu aura de guerra se vuelve más poderosa. Obtienes un bono de +2 a las pruebas de Intimidar y un bono de +2 a las tiradas de daño con armas cuerpo a cuerpo contra aliados de tu aura de guerra."
  },
  "azyda-breadth": {
    name: "Amplitud de Azyda",
    prerequisite: "Druida 1°, azya.",
    benefit: "Puedes lanzar ayuda como una habilidad sobrenatural una vez al día. El nivel de lanzador para este hechizo es igual a tu nivel de druida."
  },
  "aversion-tolerance": {
    name: "Tolerancia a la Aversión",
    prerequisite: "Vampiro.",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro realizadas para resistir aversiones a objetos, sonidos y materiales apropiados para tu tipo de vampiro (como ajo, símbolos sagrados y espejos para un moroi). Cuando te enfrentas a tales cosas, puedes intentar una tirada de ahorro inmediatamente en lugar de después de 1 ronda."
  },
  "avid-spellbook-reader": {
    name: "Lector Ávido de Libro de Hechizos",
    prerequisite: "Habilidad para preparar hechizos arcanos.",
    benefit: "Obtienes un bono de +2 a las pruebas de Spellcraft para descifrar escritura mágica arcana (como un solo hechizo en el libro de hechizos de otro o en un pergamino). Además, puedes obtener los beneficios de hasta dos rituales de preparación a la vez. Debes tener acceso a ambos rituales de preparación mientras preparas tus hechizos, y debes preparar al menos tres hechizos o fórmulas (excluyendo hechizos de nivel 0) de cada libro. Si los rituales están en el mismo libro, debes preparar al menos tres hechizos del libro de hechizos de 1er nivel o superior por cada ritual de preparación del que te beneficias."
  },
  "awakened-hag-heritage": {
    name: "Herencia de Hag Despertada",
    prerequisite: "Voluntad de Hierro o Regalo de la Madre, changeling.",
    benefit: "Tus habilidades raciales de herencia de hag se vuelven más poderosas, otorgándote un bono racial de +2 a las tiradas de ahorro para resistir hechizos arcanos. También obtienes una habilidad secundaria que varía según tu herencia de hag; ver las entradas de herencia de changeling individuales en las páginas 5-9.",
    special: "A medida que te acercas a tu naturaleza de hag, ocasionalmente manifiestas signos de maldad sobrenatural. Cada día a medianoche, hay un 50% de probabilidad de que radiar un aura maligna para propósitos de hechizos de adivinación y habilidades similares a hechizo durante las siguientes 24 horas. En estos días, también causas exhibición menor de corrupción cercana, como enrollar páginas o agriar leche, a discreción del DJ."
  },
  "awe-inspiring-smash": {
    name: "Golpe Inspirador de Temor*",
    prerequisite: "FUE 15",
    benefit: "Puedes aplicar tu modificador de Fuerza en lugar de tu modificador de Carisma a las pruebas de combate de rendimiento. Además, cuando gastas una acción rápida para intentar una prueba de combate de rendimiento que fue activada por una prueba de maniobra de combate de empujón o rotura exitosa, obtienes un bono de +2 a la prueba de combate de rendimiento. Por cada 5 puntos por los que tu ataque exceda la CMD de tu oponente, este bono aumenta en 2."
  },
  "awesome-charge": {
    name: "Carga Asombrosa*",
    prerequisite: "FUE 25",
    benefit: "Cuando impactas a tu oponente con un ataque de carga, puedes intentar una maniobra de combate de golpe asombroso contra ese oponente como acción gratuita."
  },
  "awesome-throw": {
    name: "Lanzamiento Asombroso*",
    prerequisite: "FUE 25, Lanzar Cualquier Cosa o lanzar rocas",
    benefit: "Como acción estándar, puedes realizar la maniobra de combate de lanzamiento asombroso. Haces esto haciendo un ataque de arma arrojadiza; si no tienes la dote Lanzar Cualquier Cosa, debes usar un objeto grande, voluminoso y de forma relativamente regular con una dureza de al menos 5 (como una roca o un cofre del tesoro). Si ese ataque impacta a un oponente corpóreo más pequeño que tú, el oponente recibe daño y es afastado, volando 10 pies en línea recta alejándose de ti y cayendo boca abajo. Si un obstáculo previene la completación del movimiento de tu objetivo, el objetivo y el obstáculo cada uno reciben 1d6 puntos de daño, y el objetivo es derribado en un espacio adyacente al obstáculo."
  },
  "baboon-herd": {
    name: "Rebaño de Babuinos",
    prerequisite: "Ch罗兰",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia para rastrear primates y un bono de +2 a las pruebas de Diplomacia para interaccionar con babuinos y otros primates. Además, puedes comunicarCommands simples a primates no mágicos sin necesidad de una prueba de Manejo de Animales."
  },
  "back-to-back": {
    name: "Espalda con Espalda",
    prerequisite: "Dote de equipo de trabajo",
    benefit: "Obtienes un bono de +2 a la CA contra ataques de oportunidad realizados por criaturas que están en tu espacio de espalda."
  },
  "background-divination": {
    name: "Adivinación de Fondo",
    prerequisite: "Característica de clase adivinación.",
    benefit: "Cuando lanzas un hechizo de adivinación de 1er nivel o superior que te permite hacer una prueba, puedes agregar tu modificador de Inteligencia a esa prueba."
  },
  "bane-of-humanity": {
    name: "Condena de la Humanidad",
    prerequisite: "Característica de clase aura.",
    benefit: "Tu aura afecta a humanoides. Las criaturas humanoides dentro de tu aura deben tener éxito en una tirada de ahorro de Voluntad (CD 10 + mitad de tu nivel + tu modificador de Carisma) o ser afectadas por el efecto de tu aura."
  },
  "banishing-seal": {
    name: "Sello de Destierro",
    prerequisite: "Habilidad para lanzar hechizos de abjuración.",
    benefit: "Cuando lanzas un hechizo de abjuración que tiene un efecto de destierro (como dismissal, banishment o dimensional anchor), puedes elegir un número de objetivos igual a tu modificador de Inteligencia (mínimo 1). Esos objetivos reciben una penalización de -2 a sus tiradas de ahorro contra el efecto."
  },
  "banner-of-bleeding-scars": {
    name: "Estandarte de Cicatrices Sangrantes",
    prerequisite: "Línea de sangre de banshee",
    benefit: "Una vez por día, puedes lanzar wailing banshee como habilidad sobrenatural. Este es un efecto de miedo. El nivel de lanzador es igual a tu nivel de personaje."
  },
  "barkskin-stock": {
    name: "Reserva de Piel de Árbol",
    prerequisite: "Nivel de druida 3°.",
    benefit: "Puedes lanzar piel de árbol como un hechizo preparado de la escuela de transmutación, sin necesidad de prepararlo. Este hechizo preparado no cuenta contra tu número de hechizos preparados diarios."
  },
  "barroom-brawler": {
    name: "Peleador de Taberna",
    prerequisite: "Con 13",
    benefit: "Obtienes un bono de +2 a las pruebas de improvisar armas y un bono de +2 a las pruebas de Athletics para evitar ser agarrado."
  },
  "base-dragon": {
    name: "Dragón Base",
    prerequisite: "Característica de clase血缘 de dragón",
    benefit: "Tu edad como dragón base está determinada por tu nivel de personaje. Obtienes las habilidades y统计数据 basadas en tu edad."
  },
  "battle-build": {
    name: "Construcción de Batalla",
    benefit: "Obtienes una cantidad de puntos de vida temporales iguales a tu nivel de personaje. Estos puntos de vida temporales duran hasta que sean usados o hasta que pasen 24 horas, lo que ocurra primero."
  },
  "battle-dancer": {
    name: "Bailarín de Batalla",
    prerequisite: "Danza marcial",
    benefit: "Mientras usas Danza Marcial, obtienes un bono de +1 a las tiradas de ataque y un bono de +1 a la CA. Estos bonos aumentan a +2 cuando tienes al menos 11 niveles de personaje."
  },
  "battle-meditation": {
    name: "Meditación de Batalla",
    prerequisite: "Característica de clase аура",
    benefit: "Como acción rápida, puedes elegir un aliado dentro de tu aura. Ese aliado obtiene un bono igual al bono de tu aura a las tiradas de ahorro."
  },
  "battledancer-oath": {
    name: "Juramento de Bailarín de Batalla",
    prerequisite: "Baile de Batalla",
    benefit: "Cuando usas Baile de Batalla para moverte a través del espacio de un oponente, puedes hacer un ataque de oportunidad contra ese oponente como si lo amenazaras. Este ataque de oportunidad no cuenta contra tu número de ataques de oportunidad por ronda."
  },
  "beast-hide": {
    name: "Piel de Bestia",
    prerequisite: "Piel de bestia",
    benefit: "Tu piel de bestia proporciona resistencia a perforación 2 y vulnerabilidad a corte. Además, obtienes un bono de +1 a la CA."
  },
  "beast-master": {
    name: "Maestro de Bestias",
    prerequisite: "Manejo de Animales 3 rangos",
    benefit: "Tu compañero animal recibe un bono de +2 a las pruebas de características y un bono de +2 a la CA."
  },
  "beastspeaker": {
    name: "Hablador de Bestias",
    prerequisite: "Característica de clase compañero de animal o montura",
    benefit: "Puedes comunicar con animales como si estuvieras bajo el efecto de speak with animals. Puedes usar esta habilidad un número de veces igual a tu modificador de Sabiduría por día."
  },
  "bedeviling-bellow": {
    name: "Grito Infernal",
    prerequisite: "Línea de sangre de демон",
    benefit: "Una vez por día, puedes lanzar scream como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "befuddling-strike": {
    name: "Golpe Confundente",
    prerequisite: "Característica de clase зелье",
    benefit: "Cuando impactas a un oponente con un ataque sin armas o un arma natural, puedes gastar un uso de tu característica de clase зелье para causar que ese oponente sufra una penalización de -2 a las tiradas de ataque y pruebas de característica durante 1 ronda."
  },
  "behavior-insight": {
    name: "Perspicacia de Comportamiento",
    prerequisite: "Línea de sangre de espíritu",
    benefit: "Obtienes un bono de +2 a las pruebas de Sentir Motivaciones y un bono de +2 a las tiradas de ahorro contra efectos de medo."
  },
  "beloved-of-the-seasons": {
    name: "Amado de las Temporadas",
    prerequisite: "Rasgo racial favorito estaciones",
    benefit: "Una vez por día, puedes lanzar un hechizo de tu lista de hechizos de druida de 1er nivel como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de druida."
  },
  "bending-whip": {
    name: "Látigo Flexible",
    benefit: "Puedes usar un látigo para realizar la maniobra de combate de desarme, reposition, o steal a hasta 15 pies de distancia."
  },
  "berserker-blow": {
    name: "Golpe de Beserker",
    prerequisite: "Rabia",
    benefit: "Cuando estás enfurecido, puedes hacer un ataque cuerpo a cuerpo como acción de movimiento. Si impactas, recibes 1 punto de daño no致命 pero inflict un daño igual a tu bonificación de fuerza al objetivo."
  },
  "bestial-terrain": {
    name: "Terreno Bestial",
    prerequisite: "Следопыт forma selvática",
    benefit: "Cuando estás en forma selvática, tu velocidad de movimiento aumenta en 10 pies y obtienes un bono de +2 a las pruebas de sigilo."
  },
  "biaseling-blood": {
    name: "Sangre de Bisel",
    prerequisite: "Kobold",
    benefit: "Obtienes resistencia al ácido 5 y al fuego 5."
  },
  "binding-mage": {
    name: "Mago de Ataduras",
    prerequisite: "Найти 10 rangos, habilidad para lanzar hechizos de convocación",
    benefit: "Cuando usas planar binding o mayor planar binding para llamar a un externo, puedes hacer que el externo sea más fácil de negociar. Obtienes un bono de +4 a las pruebas de Carisma realizadas para negociar con el externo llamado."
  },
  "blazing-bound": {
    name: "Atadura Ardiente",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de транmutación",
    benefit: "Como acción estándar, puedes lanzar un hechizo de транmutación que normalmente tiene una duración de instantaneous o permanentes, y hacer que tenga una duración de 1 minuto por nivel. Este efecto puede ser terminado antes por disipar magia."
  },
  "blighted-victim": {
    name: "Víctima Afectada",
    prerequisite: "Найти 5 rangos",
    benefit: "Cuando una criatura falla una tirada de ahorro contra uno de tus hechizos con el descriptor de enfermedad, esa criatura recibe un daño de característica de 1 punto en la característica más alta de esa criatura."
  },
  "blind-fight": {
    name: "Luchar a Ciegas",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque cuerpo a cuerpo contra criaturas invisible. Además, no recibes la penalización de -4 a las tiradas de ataque cuerpo a cuerpo cuando no puedes ver a tu oponente."
  },
  "blind-ken": {
    name: "Oído Ciego",
    prerequisite: "Luchar a Ciegas, Sab 13",
    benefit: "Obtienes percepción ciega 30 pies."
  },
  "blinding-fury": {
    name: "Furia Cegadora",
    prerequisite: "Rabia",
    benefit: "Cuando estás enfurecido, puedes hacer que tus ojos brillen con luz ardiente. Las criaturas que te atacan y están dentro de los 10 pies deben tener éxito en una tirada de ahorro de Fortaleza (CD 10 + mitad de tu nivel de personaje + tu modificador de Fuerza) o quedar ciegas durante 1 ronda."
  },
  "blindsight": {
    name: "Vista Ciega",
    benefit: "Como acción rápida, puedes obtener vista ciega 10 pies durante 1 minuto. Puedes usar esta habilidad un número de veces igual a tu modificador de Sabiduría por día."
  },
  "block-charge": {
    name: "Bloquear Carga",
    prerequisite: "Destreza 13",
    benefit: "Como acción inmediata, puedes hacer un ataque de oportunidad contra una criatura que carga hacia ti."
  },
  "blood-caller": {
    name: "Llamador de Sangre",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar speak with dead como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blood-of-the-martyr": {
    name: "Sangre del Mártir",
    benefit: "Cuando mueres, puedes causar una explosión de energía Sagrada. Todas las criaturas dentro de los 30 pies deben tener éxito en una tirada de ahorro de Voluntad (CD 10 + tu nivel de personaje) o recibir 1d6 puntos de daño por nivel de personaje (máximo 10d6)."
  },
  "blood-rage": {
    name: "Rabia Sangrienta",
    prerequisite: "Medio-orco",
    benefit: "Obtienes un bono de +1 a las tiradas de ataque y un bono de +1 a la CA cuando estás por debajo de tu máximo de puntos de golpe."
  },
  "blood-running": {
    name: "Sangre Fluida",
    benefit: "Una vez por día, puedes lanzar bleed como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bloody-kist": {
    name: "Barril Sangriento",
    prerequisite: "Найти 1 rango",
    benefit: "Una vez por día, puedes lanzar produce placebo como habilidad sobrenatural, pero el hechizo solo afecta a no muertos."
  },
  "blossom-of-protection": {
    name: "Flor de Protección",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de abjuración",
    benefit: "Como acción de movimiento, puedes lanzar un hechizo de abjuración de 1er nivel o superior sin preparar el hechizo. Este hechizo no cuenta contra tus hechizos preparados diarios."
  },
  "blur-of-knives": {
    name: "Desfile de Cuchillos",
    prerequisite: "Найти 5 rangos, competencia con dagas",
    benefit: "Cuando usas un arma cuerpo a cuerpo que inflige 1d4 puntos de daño o menos, puedes hacer un ataque adicional como parte de una acción de ataque completo."
  },
  "bog-strider": {
    name: "Caminante del Pantano",
    prerequisite: "Agua como terreno favorecido",
    benefit: "No sufres penalización por moverte a través de terreno pantanoso."
  },
  "azata-mischief": {
    name: "Travesura de Azata*",
    benefit: "Mientras usas Estilo Azata, cada vez que un oponente falla un ataque de oportunidad provocado por tu movimiento a través de sus cuadrados amenazados, puedes intentar una maniobra de tropiezo contra esa criatura al final de tu turno como acción rápida, siempre que todavía estés adyacente a la criatura cuando termines tu movimiento por la ronda. Este intento de tropiezo no provoca ataques de oportunidad. Obtienes un bono a tu prueba de maniobra de combate igual a cualquier bono a la CA que obtengas contra ataques de oportunidad provocados por movimiento (como el otorgado por la dote Movilidad)."
  },
  "azata-sprint": {
    name: "Carrera de Azata*",
    benefit: "Mientras usas Estilo Azata, tu velocidad base aumenta en 10 pies e ignoras las penalizaciones de movimiento aplicadas por los primeros 10 pies de terreno difícil que cruces en la ronda."
  },
  "azata-style": {
    name: "Estilo Azata*",
    benefit: "Mientras usas este estilo, durante cualquier ronda en la que te muevas al menos 15 pies, obtienes un bono de esquiva de +1 a tu CA. Este bono dura hasta el inicio de tu siguiente turno."
  },
  "babau-rogue-talent": {
    name: "Talento de Pícaro Babau",
    prerequisite: "Dex 17, babau.",
    benefit: "Obtienes un talento de pícaro a tu elección que tiene un requisito de nivel de pícaro máximo de tu nivel -1."
  },
  "back-to-the-future": {
    name: "De Vuelta al Futuro",
    prerequisite: "Conocimiento (historia) 5 rangos.",
    benefit: "Una vez por día, puedes lanzar mensaje como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "balanced-flank": {
    name: "Flanco Equilibrado",
    prerequisite: "Dote de equipo de trabajo.",
    benefit: "Cuando flanqueas con un aliado, ambos reciben un bono de +2 a las tiradas de ataque cuerpo a cuerpo en lugar de +1."
  },
  "bane-of-the-wicked": {
    name: "Condena de los Malos",
    prerequisite: "Característica de clase aura de bien.",
    benefit: "Tu aura de bien afecta a criaturas malignas. Las criaturas malignas dentro de tu aura deben tener éxito en una tirada de ahorro de Voluntad (CD 10 + mitad de tu nivel + tu modificador de Carisma) o ser afectadas por el efecto de tu aura."
  },
  "barding-expert": {
    name: "Experto en Armadura de Montura",
    prerequisite: "Competencia con armadura media, competencia con armadura de montar, nivel de personaje 3°.",
    benefit: "No sufres penalización a las pruebas de Ride por usar armadura de montar, y tu montura puede usar su capacidad de carga como si su armadura no le impusiera ninguna penalización de armadura."
  },
  "bark-skin": {
    name: "Piel de Corteza",
    prerequisite: "Druida 2°.",
    benefit: "Tu piel se vuelve dura como la corteza de un árbol. Obtienes un bono de +2 a la CA."
  },
  "barrow-shadow": {
    name: "Sombra de Tumba",
    prerequisite: "Rasgo racial herencia de cryptdweller",
    benefit: "Una vez por día, puedes lanzar darkness como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "base-alternate-form": {
    name: "Forma Alternativa Base",
    prerequisite: "Característica de clase forma alternativa",
    benefit: "Puedes usar tu forma alternativa un número adicional de veces al día igual a tu modificador de Sabiduría."
  },
  "bastard-necromancer": {
    name: "Nigromante Bastardo",
    prerequisite: "Característica de clase necróticos",
    benefit: "Obtienes un bono de +2 a las pruebas de Conocimiento (arcano) y Conocimiento (religión) relacionadas con no muertos."
  },
  "battle-awareness": {
    name: "Conciencia de Batalla",
    prerequisite: "Найти 1 rango",
    benefit: "Una vez por día, puedes lanzar guidance como habilidad sobrenatural como acción rápida."
  },
  "battle-bond": {
    name: "Vínculo de Batalla",
    prerequisite: "Compañero de animal o montura",
    benefit: "Tu compañero de animal o montura recibe un bono de +2 a las tiradas de ataque y un bono de +2 a la CA."
  },
  "battle-bride": {
    name: "Novia de Batalla",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos divinos",
    benefit: "Una vez por día, puedes lanzar bless como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-focus": {
    name: "Enfoque de Batalla",
    benefit: "Obtienes un bono de +2 a las pruebas de iniciativa."
  },
  "battle-hardened": {
    name: "Endurecido en Batalla",
    prerequisite: "Nivel de personaje 6°",
    benefit: "Obtienes un bono de +2 a las tiradas de daño cuando estás a menos de la mitad de tus puntos de golpe máximos."
  },
  "battle-lore": {
    name: "Conocimiento de Batalla",
    prerequisite: "Найти 1 rango, habilidad para lanzar hechizos divinos",
    benefit: "Una vez por día, puedes lanzar detect vermin como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-priest": {
    name: "Sacerdote de Batalla",
    prerequisite: "Característica de clase dominio de guerra",
    benefit: "Obtienes competencia con todas las armas cuerpo a cuerpo."
  },
  "battle-seeker": {
    name: "Buscador de Batalla",
    prerequisite: "Rasgo de halfling ágil",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque con armas a distancia y un bono de +2 a las pruebas de sigilo."
  },
  "bead-readiness": {
    name: "Preparación de Rosario",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de adivinación",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque de toque a distancia con hechizos de adivinación."
  },
  "beast-empathy": {
    name: "Empatía con Bestias",
    benefit: "Obtienes un bono de +2 a las pruebas de Manejo de Animales con animales y un bono de +2 a las pruebas de Diplomacia con animales."
  },
  "beast-form-bull": {
    name: "Forma de Bestia - Toro",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar bull's strength sobre ti mismo como habilidad sobrenatural una vez al día. El nivel de lanzador es igual a tu nivel de personaje."
  },
  "beast-form-wolf": {
    name: "Forma de Bestia - Lobo",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar wolf's fury sobre ti mismo como habilidad sobrenatural una vez al día. El nivel de lanzador es igual a tu nivel de personaje."
  },
  "beast-land": {
    name: "Tierra de Bestias",
    prerequisite: "Característica de clase forma de elemento (tierra)",
    benefit: "Puedes atravesar tierra como si fuera terreno normal."
  },
  "beast-rider": {
    name: "Jinete de Bestias",
    prerequisite: "Manejo de Animales 5 rangos, compañero de animal",
    benefit: "Tu compañero de animal puede funcionar como una montura."
  },
  "beast-speaker": {
    name: "Hablador de Bestias",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar speak with animals como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "beast-totem": {
    name: "Tótem de Bestia",
    prerequisite: "Característica de clase totémico",
    benefit: "Tu totémico obtiene un bono de +2 a las pruebas de percepción y un bono de +2 a las pruebas de supervivencia."
  },
  "beauty-of-the-dawn": {
    name: "Belleza del Amanecer",
    prerequisite: "Rasgo racial amanecer",
    benefit: "Una vez por día, puedes lanzar flare como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bee-ling": {
    name: "Abeja",
    prerequisite: "Kobold",
    benefit: "Obtienes un bono de +2 a las pruebas de Manejo de Animales con insectos y un bono de +2 a las pruebas de Supervivencia para rastrear insectos."
  },
  "befitting-partner": {
    name: "Compañero Apropiado",
    prerequisite: "Característica de clase companions",
    benefit: "Tu companion puede elegir un talento de companions adicional."
  },
  "beguiling-gift": {
    name: "Regalo Engañoso",
    prerequisite: "Engaño 1 rango",
    benefit: "Una vez por día, como acción estándar, puedes hacer una prueba de Diplomacia contra una criatura que pueda ver y que esté a 30 pies o menos. Si tienes éxito, la criatura debe tener éxito en una tirada de ahorro de Voluntad (CD 10 + tu bono de Engaño) o aceptar un objeto que le ofrezcas."
  },
  "behind-the-veil": {
    name: "Detrás del Velo",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar obscuring mist como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "beloved-queen": {
    name: "Reina Amada",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos divinos",
    benefit: "Una vez por día, puedes lanzar charm person como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bends-lights": {
    name: "Doblar Luces",
    prerequisite: "Habilidad para lanzar hechizos de ilusión",
    benefit: "Obtienes un bono de +2 a las pruebas de Engaño para crear efectos de luz y un bono de +2 a las pruebas de Sigilo cuando te escondes usando efectos de luz."
  },
  "benefactor-of-the-creed": {
    name: "Benefactor de la Credo",
    prerequisite: "Найти 5 rangos",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia realizadas para influenciar miembros de tu organización religiosa."
  },
  "bestow-curse-aura": {
    name: "Aura de Maldecir",
    prerequisite: "Característica de clase aura de maldad",
    benefit: "Tu aura de maldad puede maldecir a las criaturas. Las criaturas dentro de tu aura deben tener éxito en una tirada de ahorro de Voluntad (CD 10 + mitad de tu nivel + tu modificador de Carisma) o recibir una penalización de -2 a una tirada de ahorro a tu elección durante 1 minuto."
  },
  "bifurcated-tail": {
    name: "Cola Bifurcada",
    prerequisite: "Larg",
    benefit: "Tu cola bifurcada te otorga un bono de +2 a las pruebas de Equilibrio y un bono de +2 a las pruebas de Trepar."
  },
  "binding-runes": {
    name: "Runas de Unión",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de abjuración",
    benefit: "Obtienes un bono de +2 a las pruebas de Conocimiento (arcano) para descifrar runas."
  },
  "biting-infusion": {
    name: "Infusión Mordaz",
    prerequisite: "Característica de clase extraer",
    benefit: "Tu extracción inflige daño de ácido adicional igual a tu modificador de Inteligencia."
  },
  "bitter-campaigner": {
    name: "Campañista Amargo",
    prerequisite: "Rasgo racial amargura",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia para encontrar comida y agua."
  },
  "blade-aversion": {
    name: "Aversión a la Espada",
    prerequisite: "Engaño 1 rango",
    benefit: "Como acción estándar, puedes hacer una prueba de Engaño opuesta por la prueba de Sentir Motivaciones de un oponente. Si tienes éxito, el oponente recibe una penalización de -2 a las tiradas de ataque con armas cuerpo a cuerpo durante 1 ronda."
  },
  "blade-disciplines": {
    name: "Disciplinas de Espada",
    prerequisite: "Найти 5 rangos",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo para trepar y un bono de +2 a las pruebas de sigilo."
  },
  "blade-of-the-dark-hour": {
    name: "Espada de la Hora Oscura",
    prerequisite: "Rasgo de halfling sombra",
    benefit: "Una vez por día, puedes lanzar shadow evocation como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blade-of-the-gray": {
    name: "Espada del Gris",
    prerequisite: "Rasgo racial gris",
    benefit: "Obtienes resistencia al frío 5."
  },
  "blade-shield": {
    name: "Escudo de Espada",
    prerequisite: "Competencia con espadas",
    benefit: "Como acción inmediata, puedes obtener un bono de +2 a la CA contra un ataque de oportunidad."
  },
  "blazing-devastation": {
    name: "Devastación Ardiente",
    prerequisite: "Rasgo racial devastación",
    benefit: "Una vez por día, puedes lanzar fireball como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blazing-retribution": {
    name: "Retribución Ardiente",
    prerequisite: "Rasgo racial devastación",
    benefit: "Obtienes un bono de +2 a las tiradas de daño con armas de fuego."
  },
  "blend-into-shadows": {
    name: "Mezclarse con las Sombras",
    prerequisite: "Rasgo racial sombra",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en áreas de poca luz."
  },
  "blessed-bastion": {
    name: "Bastión Bendito",
    prerequisite: "Característica de clase aura de bien",
    benefit: "Tu aura de bien te otorga un bono de +2 a la CA."
  },
  "blessed-fortune": {
    name: "Fortuna Bendita",
    prerequisite: "Rasgo de halfling afortunado",
    benefit: "Una vez por día, puedes rerrollear una tirada de ataque, prueba de habilidad, o tirada de ahorro."
  },
  "blessed-touch": {
    name: "Toque Bendito",
    prerequisite: "Habilidad para lanzar hechizos divinos",
    benefit: "Una vez por día, puedes lanzar cure light wounds como habilidad sobrenaturaltocando a una criatura."
  },
  "blessing-of-the-molly": {
    name: "Bendición de Molly",
    prerequisite: "Rasgo de halfling ágil",
    benefit: "Obtienes un bono de +2 a las pruebas de Acrobacia y un bono de +2 a las pruebas de Sigilo."
  },
  "blessing-of-the-nature-father": {
    name: "Bendición del Padre de la Naturaleza",
    prerequisite: "Rasgo racial naturaleza",
    benefit: "Una vez por día, puedes lanzar entangle como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blind-action": {
    name: "Acción a Ciegas",
    prerequisite: "Oído Ciego",
    benefit: "No recibes la penalización de -4 a las tiradas de ataque cuando no puedes ver a tu oponente."
  },
  "blood-atoning": {
    name: "Expiación de Sangre",
    prerequisite: "Rasgo racial expiación",
    benefit: "Una vez por día, puedes lanzar align weapon como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blood-cradle": {
    name: "Cuna de Sangre",
    prerequisite: "Rasgo racial línea de sangre de ghoul",
    benefit: "Una vez por día, puedes lanzar detect undead como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "blood-frenzy": {
    name: "Frenesí de Sangre",
    prerequisite: "Rasgo racial línea de sangre de ghoul",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque cuando estás por debajo de la mitad de tus puntos de golpe máximos."
  },
  "blood-of-giants": {
    name: "Sangre de Gigantes",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +1 a las tiradas de ataque cuerpo a cuerpo."
  },
  "blood-of-the-beast": {
    name: "Sangre de la Bestia",
    prerequisite: "Rasgo racial beast",
    benefit: "Una vez por día, puedes lanzar enlarge person sobre ti mismo como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bloody-tear": {
    name: "Lágrima Sangrienta",
    prerequisite: "Rasgo de halfling sangriento",
    benefit: "Obtienes un bono de +2 a las pruebas de Intimidar."
  },
  "babble-peddler": {
    name: "Vendedor de Charlatanería",
    prerequisite: "Evaluación 5 rangos, Engaño 5 rangos, gnomo.",
    benefit: "Haz una prueba de Engaño para alabar el valor y merecimiento de un objeto en tu mano mientras degradas un objeto sostenido por una criatura cercana; esto toma desde 1 ronda hasta 1 minuto dependiendo de la apariencia y naturaleza de los objetos. Si la criatura falla su prueba, está de acuerdo en intercambiar tu objeto por el suyo. Diferencias obvias en el valor entre los objetos intercambiados dan a tu tirada un modificador de +4 o -4, a discreción del DJ (ofrecer una taza de arcilla por un puñal enjoyado da a tu tirada una penalización de -4). El DJ puede dictaminar que algunos objetos son demasiado obviously valiosos o sin valor para que esta dote se aplique (un rey no intercambiaría su corona por ningún objeto, y ninguna persona normal intercambiaría un objeto por basura). Si fallas la prueba por 5 o más, el objetivo queda insultado y su actitud hacia ti empeora en una categoría. Una vez que el intercambio sucede, haz una prueba de Evaluación opuesta por la prueba de Evaluación o Sentir Motivaciones del objetivo. Si el objetivo gana, inmediatamente se da cuenta del valor real del objeto que le ofreciste y se comporta correspondientemente. Si tienes éxito, cree tu falsa evaluación por 1 ronda; por cada 5 puntos por los que tu prueba exceda la prueba del oponente, el engaño dura 1 ronda adicional. Al igual que con las ilusiones no creídas, el aliado del objetivo puede señalar el valor real del objeto, dando al objetivo otra prueba con un bono de +2. No puedes usar esta habilidad en combate, contra una criatura cuya actitud hacia ti sea hostil o hostil, contra una criatura que no te entienda, o contra una criatura que tenga una puntuación de Inteligencia de 3 o menos."
  },
  "bag-of-bones": {
    name: "Bolsa de Huesos",
    prerequisite: "Ghoul.",
    benefit: "Eres tratado como un tamaño más pequeño para el propósito de calcular las penalizaciones por exprimir, y obtienes un bono de competencia de +5 a las pruebas de Escabullirse. Si tienes 10 o más Dados de Golpe, este bono aumenta a +4."
  },
  "balor-whip": {
    name: "Látigo de Balor*",
    benefit: "Cuando realizas una maniobra de combate de arrastrar con tu látigo, puedes elegir no moverte con tu objetivo, en su lugar acercando tu objetivo hacia ti. Si haces esto, no puedes arrastrar el objetivo más lejos que la distancia que toma para moverlo adyacente a ti, incluso si tu resultado fue lo suficientemente alto para arrastrar el objetivo más lejos. Obtienes un bono de +2 a las pruebas de maniobra de combate de arrastrar cuando usas un látigo para arrastrar, pero este bono no se acumula con el bonus de Improved Drag.",
    special: "Látigo de Balor cuenta como Improved Drag para el propósito de calificar para Quick Drag."
  },
  "balloon-shadow": {
    name: "Sombra de Globos",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar unseen servant como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bamboo-stuck": {
    name: "Atorado en Bambú",
    prerequisite: "Habilidad para lanzar hechizos de transmutación",
    benefit: "Obtienes un bono de +2 a las pruebas de Trepar y un bono de +2 a las pruebas de Atletismo."
  },
  "baneful-strike": {
    name: "Golpe Funesto",
    prerequisite: "Habilidad para lanzar hechizos de nigromancia",
    benefit: "Una vez por día, puedes lanzar bane como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "banish-sin": {
    name: "Exorsismo",
    prerequisite: "Característica de clase aura de bien",
    benefit: "Tu aura de bien puede afectar a outsiders malignos."
  },
  "banking-shots": {
    name: "Tiros Bancados",
    prerequisite: "Bono de ataque base +4",
    benefit: "Como acción gratuita al hacer un ataque a distancia, puedes declarar que el ataque rebota desde una superficie sólida hacia tu objetivo. El ataque se maneja como un ataque a distancia normal, pero la línea de efecto puede doblar una vez hasta 90 grados."
  },
  "banshee-cry": {
    name: "Grito de Banshee",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar cause fear como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "bargain-bin": {
    name: "Tarima de trueque",
    prerequisite: "Evaluación 1 rango",
    benefit: "Obtienes un bono de +2 a las pruebas de Evaluación."
  },
  "barrel-down": {
    name: "Barril Abajo",
    prerequisite: "Найти 1 rango",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo para nadar."
  },
  "basilisk-breath": {
    name: "Aliento de Basilisco",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar flesh to stone como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "basilisk-eye": {
    name: "Ojo de Basilisco",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar gaze of the medusa como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-barrier": {
    name: "Barrera de Batalla",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar shielding as skill supernatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-bellow": {
    name: "Grito de Batalla",
    prerequisite: "Intimidar 1 rango",
    benefit: "Una vez por día, puedes lanzar shatter围堵 como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-bound": {
    name: "Vinculado a la Batalla",
    prerequisite: "Manejo de Animales 5 rangos",
    benefit: "Tu montura recibe un bono de +2 a las pruebas de iniciativa."
  },
  "battle-carousel": {
    name: "Carrusel de Batalla",
    prerequisite: "Característica de clase cargas",
    benefit: "Cuando cargas, puedes cargar a través del espacio de aliados sin provocar ataques de oportunidad."
  },
  "battle-companion": {
    name: "Compañero de Batalla",
    prerequisite: "Compañero de animal o montura",
    benefit: "Tu compañero de animal recibe un bono de +2 a las tiradas de daño."
  },
  "battle-constable": {
    name: "Agente de Batalla",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar dimension door como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-cry": {
    name: "Grito de Guerra",
    benefit: "Una vez por día, puedes lanzar warcry como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-eater": {
    name: "Devorador de Batalla",
    prerequisite: "Característica de clase",
    benefit: "Cuando matas a un oponente, puedes recuperar un hechizo preparado de 1er nivel o superior."
  },
  "battle-focus-trance": {
    name: "Trance de Enfoque de Batalla",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Concentración."
  },
  "battle-form-granite": {
    name: "Forma de Batalla - Granito",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar stone call como habilidad sobrenatural una vez al día."
  },
  "battle-form-steel": {
    name: "Forma de Batalla - Acero",
    prerequisite: "Найти 5 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar iron skin como habilidad sobrenatural una vez al día."
  },
  "battle-healer": {
    name: "Sanador de Batalla",
    prerequisite: "Habilidad para lanzar hechizos divinos",
    benefit: "Una vez por día, puedes lanzar cure light wounds como habilidad sobrenaturaltocando a un aliado."
  },
  "battle-hymns": {
    name: "Himnos de Batalla",
    prerequisite: "Desempeño 1 rango",
    benefit: "Una vez por día, puedes lanzar prayer como habilidad sobrenatural con un nivel de lanzador igual a tu nivel de personaje."
  },
  "battle-instinct": {
    name: "Instinto de Batalla",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de iniciativa."
  },
  "battle-leadership": {
    name: "Liderazgo de Batalla",
    prerequisite: "Найти 5 rangos",
    benefit: "Una vez por día, puedes lanzar guidance como habilidad sobrenatural."
  },
  "battle-pawn": {
    name: "Peón de Batalla",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar jump como habilidad sobrenatural."
  },
  "battle-readiness": {
    name: "Preparado para la Batalla",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de percepción."
  },
  "battle-rhythm": {
    name: "Ritmo de Batalla",
    prerequisite: "Desempeño 3 rangos",
    benefit: "Una vez por día, puedes lanzar haste como habilidad sobrenatural."
  },
  "battle-sage": {
    name: "Sabio de Batalla",
    prerequisite: "Найти 3 rangos",
    benefit: "Una vez por día, puedes lanzar true strike como habilidad sobrenatural."
  },
  "battle-speech": {
    name: "Discurso de Batalla",
    prerequisite: "Найти 1 rango",
    benefit: "Una vez por día, puedes lanzar heroism como habilidad sobrenatural."
  },
  "battle-tactics": {
    name: "Tácticas de Batalla",
    prerequisite: "Найти 3 rangos",
    benefit: "Una vez por día, puedes lanzar false life como habilidad sobrenatural."
  },
  "battle-trance": {
    name: "Trance de Batalla",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a la CA."
  },
  "beach-comber": {
    name: "Buscador de Playa",
    prerequisite: "Agua como terreno favorecido",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia en costas."
  },
  "beacon-of-justice": {
    name: "Faro de Justicia",
    prerequisite: "Característica de clase aura de bien",
    benefit: "Tu aura de bien puede afectar a criaturas con alineamiento neutral."
  },
  "bear-down": {
    name: "Abalanzarse",
    prerequisite: "Atletismo 3 rangos",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "beast-form-eagle": {
    name: "Forma de Bestia - Águila",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar overwrite como habilidad sobrenatural una vez al día."
  },
  "beast-form-fish": {
    name: "Forma de Bestia - Pez",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar water walk como habilidad sobrenatural una vez al día."
  },
  "beast-form-frog": {
    name: "Forma de Bestia - Rana",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar aspect of the falcon como habilidad sobrenatural una vez al día."
  },
  "beast-form-ursine": {
    name: "Forma de Bestia - Oso",
    prerequisite: "Найти 3 rangos, habilidad para lanzar hechizos de transmutación",
    benefit: "Puedes lanzar bear's endurance como habilidad sobrenatural una vez al día."
  },
  "beast-in-the-shadows": {
    name: "Bestia en las Sombras",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "beast-of-the-earth": {
    name: "Bestia de la Tierra",
    prerequisite: "Característica de clase forma de elemento (tierra)",
    benefit: "Obtienes un bono de +2 a las pruebas de Trepar."
  },
  "beast-slayer": {
    name: " Cazador de Bestias",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque contra animales y bestias míticas."
  },
  "beast-tongue": {
    name: "Lengua de Bestia",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar speak with animals como habilidad sobrenatural."
  },
  "beast-trampler": {
    name: "Aplastador de Bestias",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo para moverte a través de terreno difícil."
  },
  "beast-wolf-pack": {
    name: "Manada de Lobos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia para rastrear."
  },
  "beating-oscillation": {
    name: "Oscilación de Golpeo",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "beautiful-presence": {
    name: "Presencia Hermosa",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia."
  },
  "beauty-in-shadows": {
    name: "Belleza en las Sombras",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "becoming-mount": {
    name: "Convertirse en Montura",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar mount como habilidad sobrenatural."
  },
  "bedevil": {
    name: "Diablura",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Engaño."
  },
  "bedeviling-weapon": {
    name: "Arma Diablura",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque con armas que infligen daño de немагия."
  },
  "beetle-bury": {
    name: "Escarabajo Sepulturero",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Trepar."
  },
  "beetle-ears": {
    name: "Orejas de Escarabajo",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Percepción."
  },
  "beetle-shell": {
    name: "Caparazón de Escarabajo",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +1 a la CA."
  },
  "befriending-winds": {
    name: "Hacerse Amigo de los Vientos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Vuelo."
  },
  "behemoth-drift": {
    name: "Deriva de Behemoth",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar slow como habilidad sobrenatural."
  },
  "belching-flames": {
    name: "Vómitos de Llamas",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar scorching ray como habilidad sobrenatural."
  },
  "bell-flower-touch": {
    name: "Toque de Campanilla",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar calming kits como habilidad sobrenatural."
  },
  "beloved-foe": {
    name: "Amado Enemigo",
    prerequisite: "Rasgo de halfling",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia realizadas contra criaturas que no te han detectado."
  },
  "bendy-body": {
    name: "Cuerpo Flexible",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Escabullirse."
  },
  "beneficent-zephyr": {
    name: "Céfiro Benevolente",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar wind walk como habilidad sobrenatural."
  },
  "bestial-leap": {
    name: "Salto Bestial",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Acrobacia."
  },
  "bestial-wrapping": {
    name: "Envoltura Bestial",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar aspect of the stag como habilidad sobrenatural."
  },
  "beyond-the-grave": {
    name: "Más Allá de la Tumba",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro contra efectos de muerte."
  },
  "bifurcated-form": {
    name: "Forma Bifurcada",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Trepar."
  },
  "binding-chains": {
    name: "Cadenas de Unión",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar hold person como habilidad sobrenatural."
  },
  "binding-darkness": {
    name: "Oscuridad vinculante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en áreas de poca luz."
  },
  "binding-earth": {
    name: "Tierra Vinculante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "birch-camouflage": {
    name: "Camuflaje de Abedul",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en bosques."
  },
  "bitter-dog": {
    name: "Perro Amargo",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "bitter-drift": {
    name: "Deriva Amarga",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "biting-bark": {
    name: "Corteza Mordedora",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar produce flame como habilidad sobrenatural."
  },
  "biting-shadows": {
    name: "Sombras Mordedoras",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lançar shadow conjuration como habilidad sobrenatural."
  },
  "black-cat-swipe": {
    name: "Zarpazo de Gato Negro",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Acrobacia."
  },
  "blade-and-chain": {
    name: "Espada y Cadena",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes competencia con látigos y cadenas."
  },
  "blade-of-the-dawn": {
    name: "Espada del Amanecer",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar daylight como habilidad sobrenatural."
  },
  "blade-of-the-dusk": {
    name: "Espada del Crepúsculo",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar darkness como habilidad sobrenatural."
  },
  "blade-pretty": {
    name: "Espada Bonita",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia."
  },
  "blazing-boulder": {
    name: "Roca Ardiente",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar fireball como habilidad sobrenatural."
  },
  "blazing-rider": {
    name: "Jinete Ardiente",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Ride."
  },
  "bleed-ignite": {
    name: "Encender Sangrado",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de daño con armas de fuego."
  },
  "blended-view": {
    name: "Vista Mezclada",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Percepción."
  },
  "blood-bark": {
    name: "Corteza Sangrienta",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +1 a la CA."
  },
  "blood-drenched-jaws": {
    name: "Mandíbulas Empapadas de Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de daño con armas naturales."
  },
  "blood-feast": {
    name: "Festín de Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia para rastrear no muertos."
  },
  "blood-frenzy-keeper": {
    name: "Guardián del Frenesí de Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque cuerpo a cuerpo cuando estás por debajo de la mitad de tus puntos de golpe."
  },
  "blood-hound": {
    name: "Sabueso de Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia para rastrear."
  },
  "blood-of-hell": {
    name: "Sangre del Infierno",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes resistencia al fuego 5."
  },
  "blood-scent": {
    name: "Olor a Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "blood-seeker-arrow": {
    name: "Flecha Buscadora de Sangre",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar cure light wounds como habilidad sobrenatural."
  },
  "bloom-of-health": {
    name: "Floración de Salud",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro de Fortaleza."
  },
  "blossom-walk": {
    name: "Caminata Florida",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en prados."
  },
  "bluecat-bite": {
    name: "Mordedura de Gato Azul",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "bluff-follows": {
    name: "Engaño Siguiente",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "bluffing-fog": {
    name: "Niebla Engañosa",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "blur-strike": {
    name: "Golpe Desenfocado",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque cuerpo a cuerpo."
  },
  "boastful-sickness": {
    name: "Enfermedad Ostentosa",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Intimidar."
  },
  "bodak-touched": {
    name: "Tocado por Bodak",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar enervation como habilidad sobrenatural."
  },
  "bog-burial": {
    name: "Entierro en Pantano",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en pantanos."
  },
  "boiling-blood": {
    name: "Sangre Hirviente",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes resistencia al fuego 5."
  },
  "bold-lion": {
    name: "León Valiente",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia."
  },
  "bond-of-the-guardians": {
    name: "Vínculo de los Guardianes",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia con compañeros de animal."
  },
  "bone-bearer": {
    name: "Portador de Huesos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "bone-clarity": {
    name: "Claridad de Hueso",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro de Voluntad."
  },
  "bone-dog": {
    name: "Perro de Hueso",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un compañero de animal esqueleto."
  },
  "bone-feeder": {
    name: "Comedor de Huesos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "bone-fortress": {
    name: "Fortaleza de Hueso",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a la CA."
  },
  "bone-magic": {
    name: "Magia de Hueso",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Spellcraft."
  },
  "bone-melter": {
    name: "Derredor de Huesos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque con armas naturales."
  },
  "bone-of-the-sea": {
    name: "Hueso del Mar",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Natación."
  },
  "boneless-home": {
    name: "Hogar sin Huesos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Escabullirse."
  },
  "booming-earth": {
    name: "Tierra Retumbante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "boots-and-buckets": {
    name: "Botas y Cubos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "bore-into": {
    name: "Perforar",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "borrowed-health": {
    name: "Salud Prestada",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro de Fortaleza."
  },
  "bound-earth": {
    name: "Tierra Vinculada",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "bountiful-bait": {
    name: "Cebo Abundante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "bramble-bow": {
    name: "Arco de Espinos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes competencia con arcos cortos."
  },
  "bramble-camouflage": {
    name: "Camuflaje de Espinos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo en bosques."
  },
  "bramble-coat": {
    name: "Capa de Espinos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +1 a la CA."
  },
  "brash-uplift": {
    name: "Elevación Atrevida",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Acrobacia."
  },
  "brazen-chariot": {
    name: "Carruaje Descarado",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Ride."
  },
  "breached-walls": {
    name: "Murallas Violadas",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "breakthrough-scent": {
    name: "Olor de Avance",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "breath-of-doom": {
    name: "Aliento de Condena",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar crushing despair como habilidad sobrenatural."
  },
  "briar-bow": {
    name: "Arco de Espinas",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes competencia con arcos."
  },
  "briar-ward": {
    name: "Guardia de Espinas",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a la CA."
  },
  "brick-burst": {
    name: "Explosión de Ladrillos",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar stone fist como habilidad sobrenatural."
  },
  "brimstone-burst": {
    name: "Explosión de Azufre",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar burning hands como habilidad sobrenatural."
  },
  "brink-of-death": {
    name: "Orilla de la Muerte",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro contra efectos de muerte."
  },
  "brink-of Madness": {
    name: "Orilla de la Locura",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ahorro de Voluntad."
  },
  "broad-eyed": {
    name: "Ojos Anchos",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Percepción."
  },
  "brood-of-belisara": {
    name: "Camada de Belisara",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Manejo de Animales."
  },
  "brothers-in-arms": {
    name: "Hermanos de Armas",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Diplomacia con aliados."
  },
  "brute-archer": {
    name: "Arquero Brutal",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de ataque con armas a distancia."
  },
  "brynhild-combat": {
    name: "Combate de Brynhild",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de iniciativa."
  },
  "bubbling-up": {
    name: "Burbujeante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de sigilo."
  },
  "budding-spores": {
    name: "Esporas Brotando",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia."
  },
  "budget-artificer": {
    name: "Artista del Presupuesto",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Oficio."
  },
  "bugbear-kin": {
    name: "Pariente Bugbear",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Intimidar."
  },
  "build-up": {
    name: "Acumulación",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las tiradas de daño cuerpo a cuerpo."
  },
  "bulwark": {
    name: "Baluarte",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a la CA."
  },
  "bunyip-water-sight": {
    name: "Vista de Agua de Bunyip",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Supervivencia en ambientes acuáticos."
  },
  "burning-flames": {
    name: "Llamas Ardientes",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes resistencia al fuego 5."
  },
  "burrow-kin": {
    name: "Pariente Excavador",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Trepar."
  },
  "burst-of-force": {
    name: "Explosión de Fuerza",
    prerequisite: "Rasgo racial",
    benefit: "Una vez por día, puedes lanzar magic missile como habilidad sobrenatural."
  },
  "bush-whacker": {
    name: "Desbrozador",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Atletismo."
  },
  "busy-bee": {
    name: "Abeja Ocupada",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Oficio."
  },
  "butterfly-blade": {
    name: "Espada Mariposa",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Acrobacia."
  },
  "buzzing-retribution": {
    name: "Retribución Zumbante",
    prerequisite: "Rasgo racial",
    benefit: "Obtienes un bono de +2 a las pruebas de Sigilo."
  }
}