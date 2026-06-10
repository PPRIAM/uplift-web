export interface DefaultSpeaker {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface DefaultSession {
  id: string;
  type: string;
  name: string;
  description: string;
  speaker: DefaultSpeaker;
}

// Fallback Sessions (original UPLIFT 2.0 sessions)
export const defaultSessions: DefaultSession[] = [
  {
    id: 'session-1',
    type: 'Conférence',
    name: 'Conférence principale',
    description: 'Entre chaos sociopolitique, désillusion collective, et fatigue mentale : comment la jeunesse haïtienne peut-elle encore se projeter, espérer et agir dans une société qui fragilise ses repères et son avenir ?',
    speaker: {
      id: 'sp-1',
      name: 'Stéphanie Sophie LOUIS',
      role: "Présidente du gouvernement Jeunesse d'Haïti",
      image: '/images/speakers/stephanie.jpg'
    }
  },
  {
    id: 'session-2',
    type: 'Atelier',
    name: 'Désorientés',
    description: 'Quand la jeunesse avance sans repères dans une société en rupture.',
    speaker: {
      id: 'sp-2',
      name: 'Joacina ORIVAL',
      role: 'Étudiante finissante en sociologie',
      image: '/images/speakers/joacina.jpg'
    }
  },
  {
    id: 'session-3',
    type: 'Atelier',
    name: "De l'indifférence à l'engagement",
    description: 'Réveiller la conscience citoyenne des jeunes.',
    speaker: {
      id: 'sp-3',
      name: 'Wilnise JACQUES',
      role: 'Avocate & Maîtresse de cérémonie',
      image: '/images/speakers/wilnise.jpg'
    }
  }
];

// Fallback Speakers (original UPLIFT 2.0 speakers)
export const defaultSpeakers: DefaultSpeaker[] = [
  {
    id: 'sp-1',
    name: 'Stéphanie Sophie LOUIS',
    role: "Présidente du gouvernement Jeunesse d'Haïti",
    image: '/images/speakers/stephanie.jpg'
  },
  {
    id: 'sp-2',
    name: 'Joacina ORIVAL',
    role: 'Étudiante finissante en sociologie',
    image: '/images/speakers/joacina.jpg'
  },
  {
    id: 'sp-3',
    name: 'Wilnise JACQUES',
    role: 'Avocate & Maîtresse de cérémonie',
    image: '/images/speakers/wilnise.jpg'
  }
];
