export const PROCEDURES = {
  iui: {
    name: 'IUI (Intrauterine Insemination)',
    icon: '🔬',
    subTypes: [
      { id: 'iui-self', name: 'Self (Husband)', price: 3500, description: 'Using husband\'s sperm sample' },
      { id: 'iui-donor', name: 'Donor Sperm', price: 5500, description: 'Using donor sperm sample' }
    ]
  },
  cvs: {
    name: 'CVS (Chorionic Villus Sampling)',
    icon: '🧬',
    price: 12000,
    description: 'Prenatal test for genetic disorders'
  },
  prp: {
    name: 'PRP (Platelet-Rich Plasma)',
    icon: '💉',
    price: 8000,
    description: 'Therapy for ovarian rejuvenation'
  },
  lbc: {
    name: 'LBC (Liquid Based Cytology)',
    icon: '🔍',
    price: 2500,
    description: 'Advanced pap smear test'
  },
  lbcHpv: {
    name: 'LBC + HPV DNA',
    icon: '🧪',
    price: 4500,
    description: 'Combined cervical cancer screening'
  },
  amniocentesis: {
    name: 'Amniocentesis',
    icon: '💊',
    price: 15000,
    description: 'Prenatal diagnostic test'
  },
  iuiH: {
    name: 'IUI-H (IUI with Husband)',
    icon: '👨‍👩‍👧',
    price: 3500,
    description: 'IUI procedure using husband\'s sperm'
  },
  iuiD: {
    name: 'IUI-D (IUI with Donor)',
    icon: '🤝',
    price: 5500,
    description: 'IUI procedure using donor sperm'
  }
};