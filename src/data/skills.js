// Competenze per personale sanitario
// ecmPoints: punteggio ECM complessivo
export const skillsByPerson = {
  // SORRISI
  'sorrisi-inf-rossi': {
    ecmPoints: 85,
    acquired: [
      { name: 'BLS-D', date: '2025-03-01' },
      { name: 'ECM 2024', date: '2024-12-10' },
      { name: 'DPI base', date: '2024-06-01' }
    ],
    horizontal: {
      languages: ['Inglese B2'],
      it: ['Office', 'Cartella clinica elettronica']
    },
    equipment: ['Defibrillatore', 'ECG', 'Monitor multiparametrico'],
    todo: [
      { name: 'Aggiornamento ECM 2025', due: '2025-12-31' },
      { name: 'Visita periodica', due: '2025-11-30' }
    ],
    expiring: [
      { name: 'Antincendio rischio Basso', due: '2025-11-15' }
    ]
  },
  'sorrisi-inf-bianchi': {
    ecmPoints: 72,
    acquired: [
      { name: 'Primo Soccorso Aziendale', date: '2025-02-11' }
    ],
    horizontal: {
      languages: ['Inglese B1'],
      it: ['Office']
    },
    equipment: ['ECG'],
    todo: [ { name: 'DPI avanzato', due: '2026-01-31' } ],
    expiring: []
  },
  'sorrisi-ass-01': {
    ecmPoints: 20,
    acquired: [
      { name: 'Primo Soccorso', date: '2025-04-11' },
      { name: 'DPI base', date: '2024-05-10' }
    ],
    horizontal: { languages: ['Inglese A2'], it: ['Office'] },
    equipment: ['Carrello medicazioni'],
    todo: [ { name: 'Agg. Privacy paziente', due: '2025-12-01' } ],
    expiring: []
  },

  // Altri siti (esempi minimi)
  'vpc-med-01': { ecmPoints: 40, acquired:[], horizontal:{languages:[],it:[]}, equipment:[], todo:[{name:'Visita periodica', due:'2026-01-31'}], expiring:[] },
  'aqs-med-01': { ecmPoints: 50, acquired:[{name:'DPI base', date:'2024-07-01'}], horizontal:{languages:['Inglese B1'],it:['Office']}, equipment:['ECG'], todo:[], expiring:[] },
  'vaz-med-01': { ecmPoints: 65, acquired:[], horizontal:{languages:['Inglese B2'],it:['Office']}, equipment:['Defibrillatore'], todo:[{name:'DPI avanzato', due:'2025-12-31'}], expiring:[] }
}