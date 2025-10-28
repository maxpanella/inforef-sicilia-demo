import { ref } from 'vue'

export const assetList = ref([
  // ========= SORRISI (Rodia) =========
  { siteId:'sorrisi', reparto:'Infermeria', id:'sorrisi-inf-rossi',  nome:'Dr. Rossi',            tag:'3001', tipo:'medico', categoria:'personale', piano:1, stanza:'Ambulatorio 1', x:5200, y:3200, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Infermeria', id:'sorrisi-inf-bianchi', nome:'Dr.ssa Bianchi',       tag:'3002', tipo:'medico', categoria:'personale', piano:1, stanza:'Ambulatorio 2', x:4800, y:2800, stato:'in-servizio' },

  // Letti Camera 101 (2 letti)
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-101a',  nome:'Letto 101 A',          tag:'L101A',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 101', x:7150, y:7050, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-101b',  nome:'Letto 101 B',          tag:'L101B',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 101', x:7350, y:7050, stato:'in-servizio' },

  // Letti Camera 102 (4 letti) — demo stanza a 4 letti
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-102a',  nome:'Letto 102 A',          tag:'L102A',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 102', x:7250, y:7050, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-102b',  nome:'Letto 102 B',          tag:'L102B',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 102', x:7350, y:7050, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-102c',  nome:'Letto 102 C',          tag:'L102C',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 102', x:7450, y:7050, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-letto-102d',  nome:'Letto 102 D',          tag:'L102D',tipo:'letto',  categoria:'arredo',           piano:1, stanza:'Camera 102', x:7550, y:7050, stato:'in-servizio' },

  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-mon-01',      nome:'Monitor Paziente',     tag:'2004', tipo:'monitor', categoria:'dispositivo-medico', piano:1, stanza:'Camera 101', x:5300, y:3000, stato:'operativo',
    maintenance: { serial:'MON-2004-XYZ', inventoryTag:'INV-00021', vendor:'Philips', owner:'Ing. Verdi', warrantyUntil:'2026-10-01', mtbfHours: 18000, interventionsCount: 2, lastSafetyCheck:'2025-08-10', riskClass:'Basso', ipAddress:'10.0.1.21', last:'2025-05-05', next:'2026-05-05', sla:'72h', usageHours: 128, manualUrl:'https://example.local/manuals/monitor.pdf' } },

  // Sensore letto collegato al letto 101 A (attachedTo)
  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-sensletto-01',nome:'Sensore Letto 101',    tag:'6001', tipo:'sensore-letto', categoria:'sensor', piano:1, stanza:'Camera 101', x:7000, y:7000, stato:'attivo',
    attachedTo:'sorrisi-letto-101a',
    maintenance: { serial:'SLET-101-01', inventoryTag:'INV-00045', vendor:'BlueIOT', owner:'U.O. Biomedica', warrantyUntil:'2027-01-15', mtbfHours: 36000, interventionsCount: 0, lastSafetyCheck:'2025-09-01', riskClass:'Basso', ipAddress:'10.0.1.45', last:'2025-06-20', next:'2026-06-20', sla:'N/A', usageHours: 420 } },

  { siteId:'sorrisi', reparto:'Infermeria', id:'sorrisi-ecg-01',      nome:'ECG Portatile',        tag:'2002', tipo:'ecg', categoria:'dispositivo-medico', piano:1, stanza:'Ambulatorio ECG', x:8200, y:2100, stato:'operativo',
    maintenance: { serial:'ECG-2002-AAA', inventoryTag:'INV-00011', vendor:'GE Healthcare', owner:'Ing. Verdi', warrantyUntil:'2026-12-31', mtbfHours: 12000, interventionsCount: 1, lastSafetyCheck:'2025-07-15', riskClass:'Medio', ipAddress:'10.0.1.11', last:'2025-06-10', next:'2026-06-10', sla:'48h', usageHours: 312, manualUrl:'https://example.local/manuals/ecg.pdf' } },

  { siteId:'sorrisi', reparto:'Infermeria', id:'sorrisi-car-01',      nome:'Carrello Medicazioni', tag:'7001', tipo:'carrello', categoria:'ausilio', piano:1, stanza:'Infermeria', x:4200, y:6000, stato:'in-servizio' },

  { siteId:'sorrisi', reparto:'Degenza',    id:'sorrisi-wc-01',       nome:'Sedia a Rotelle',      tag:'7002', tipo:'wheelchair', categoria:'ausilio', piano:1, stanza:'Degenza', x:800, y:7600, stato:'disponibile' },

  // Paziente e visitatore (scenario: partenza in Reception)
  { siteId:'sorrisi', reparto:'Reception',  id:'sorrisi-paz-101',     nome:'Paziente 101',         tag:'90101',tipo:'paziente', categoria:'paziente',   piano:1, stanza:'Reception',    x:1200, y:1200, stato:'in-struttura', admissionDate:'2025-10-20', ehrUrl:'https://www.sistemats.it/portale/#/fse' },
  { siteId:'sorrisi', reparto:'Reception',  id:'sorrisi-vis-01',      nome:'Visitatore A',         tag:'99001',tipo:'visitatore', categoria:'visitatori', piano:1, stanza:'Reception',    x:1250, y:1200, stato:'in-struttura' },

  { siteId:'sorrisi', reparto:'Corridoi',   id:'sorrisi-fall-01',     nome:'Sensore Caduta A',     tag:'6101', tipo:'sensore-caduta', categoria:'sensor',     piano:1, stanza:'Corridoio A', x:3200, y:4200, stato:'attivo' },
  { siteId:'sorrisi', reparto:'Corridoi',   id:'sorrisi-cam-01',      nome:'Camera Corridoio',     tag:'1101', tipo:'camera', categoria:'sicurezza',         piano:1, stanza:'Corridoio A', x:2500, y:4000, cameraUrl:'https://example.local/sor-cam1', stato:'operativa' },
  { siteId:'sorrisi', reparto:'Corridoi',   id:'sorrisi-asc-01',      nome:'Ascensore Nord',       tag:'5002', tipo:'ascensore', categoria:'infrastruttura', piano:0, stanza:'Atrio',      x:1100, y:9000, stato:'operativo',
    maintenance: { serial:'ELV-5002', inventoryTag:'INV-00090', vendor:'OTIS', owner:'Facility Manager', warrantyUntil:'2029-06-01', mtbfHours: 50000, interventionsCount: 3, lastSafetyCheck:'2025-05-30', riskClass:'Medio', ipAddress:'-', last:'2025-03-10', next:'2025-12-10', sla:'24h', usageHours: 1800, ticketUrl:'https://example.local/ticket/ELV-5002' } },

  { siteId:'sorrisi', reparto:'Bagni assistiti', id:'sorrisi-bagno-emer-01', nome:'Pulsante Emergenza Bagno', tag:'6201', tipo:'sensore-bagno', categoria:'sensor', piano:1, stanza:'Bagno 1', x:3400, y:3600, stato:'attivo' },

  { siteId:'sorrisi', reparto:'Riabilitazione', id:'sorrisi-fisio-letto', nome:'Lettino Fisioterapia', tag:'8201', tipo:'riabilitazione', categoria:'strumentazione', piano:0, stanza:'Fisioterapia', x:8600, y:3800, stato:'pronto' },

  { siteId:'sorrisi', reparto:'Magazzino ausili', id:'sorrisi-mag-wheel', nome:'Carrozzine di scorta', tag:'7701', tipo:'magazzino-ausili', categoria:'ausilio', piano:0, stanza:'Magazzino Ausili', x:900, y:7500, stato:'stock-ok' },

  { siteId:'sorrisi', reparto:'Reception',  id:'sorrisi-ass-01',      nome:'Assistente Reception', tag:'3004', tipo:'assistente', categoria:'personale', piano:0, stanza:'Reception', x:1200, y:1100, stato:'in-servizio' },
  { siteId:'sorrisi', reparto:'Reception',  id:'sorrisi-kit-01',      nome:'Kit Pronto Soccorso',  tag:'9001', tipo:'kit', categoria:'consumabili', piano:0, stanza:'Reception', x:1400, y:1200, stato:'stock-ok' },

  { siteId:'sorrisi', reparto:'Locale tecnico', id:'sorrisi-gen-01',  nome:'Generatore',           tag:'5003', tipo:'generatore', categoria:'infrastruttura', piano:-1, stanza:'Locale Tecnico', x:300, y:500, stato:'standby',
    maintenance: { serial:'GEN-5003-AB', inventoryTag:'INV-00100', vendor:'Pramac', owner:'Facility Manager', warrantyUntil:'2028-10-01', mtbfHours: 30000, interventionsCount: 4, lastSafetyCheck:'2025-07-12', riskClass:'Alto', ipAddress:'10.0.9.10', last:'2025-04-01', next:'2026-04-01', sla:'24h', usageHours: 980, manualUrl:'https://example.local/manuals/generatore.pdf', ticketUrl:'https://example.local/ticket/GEN-123' } },
  { siteId:'sorrisi', reparto:'Sicurezza',  id:'sorrisi-est-01',      nome:'Estintore P1',         tag:'1001', tipo:'estintore', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:700, y:4100, stato:'operativo',
    maintenance: { serial:'EXT-1001', inventoryTag:'INV-00005', vendor:'VigilFire', owner:'RSPP', warrantyUntil:'2027-01-01', mtbfHours: 20000, interventionsCount: 1, lastSafetyCheck:'2025-06-01', riskClass:'Medio', ipAddress:'-', last:'2025-01-15', next:'2026-01-15', sla:'N/A' } },
  { siteId:'sorrisi', reparto:'Sicurezza',  id:'sorrisi-ali-01',      nome:'Allarme Incendio A',   tag:'1002', tipo:'allarme', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:900, y:4300, stato:'operativo' },

  // ========= VILLA PACIS =========
  { siteId:'villa-pacis', reparto:'Infermeria', id:'vpc-med-01', nome:'Dr. Marino', tag:'13001', tipo:'medico', categoria:'personale', piano:1, stanza:'Ambulatorio 1', x:5200, y:3200, stato:'in-servizio' },
  { siteId:'villa-pacis', reparto:'Infermeria', id:'vpc-ecg-01', nome:'ECG Portatile', tag:'12002', tipo:'ecg', categoria:'dispositivo-medico', piano:1, stanza:'Amb. ECG', x:8100, y:2100, stato:'operativo',
    maintenance: { serial:'ECG-12002-01', inventoryTag:'INV-02011', vendor:'GE Healthcare', owner:'Dip. Biomedica', warrantyUntil:'2027-02-01', mtbfHours: 12000, interventionsCount: 0, lastSafetyCheck:'2025-07-10', riskClass:'Basso', ipAddress:'10.0.2.11', last:'2025-05-18', next:'2026-05-18', sla:'48h', usageHours: 210 } },
  { siteId:'villa-pacis', reparto:'Degenza',    id:'vpc-mon-01', nome:'Monitor Paziente', tag:'12004', tipo:'monitor', categoria:'dispositivo-medico', piano:1, stanza:'Camera 201', x:4900, y:2900, stato:'operativo' },
  { siteId:'villa-pacis', reparto:'Degenza',    id:'vpc-sensletto-01', nome:'Sensore Letto 201', tag:'16010', tipo:'sensore-letto', categoria:'sensor', piano:1, stanza:'Camera 201', x:6900, y:6900, stato:'attivo' },
  { siteId:'villa-pacis', reparto:'Corridoi',   id:'vpc-fall-01', nome:'Sensore Caduta', tag:'16001', tipo:'sensore-caduta', categoria:'sensor', piano:1, stanza:'Corridoio A', x:3000, y:4100, stato:'attivo' },
  { siteId:'villa-pacis', reparto:'Corridoi',   id:'vpc-cam-01', nome:'Camera Corridoio', tag:'11101', tipo:'camera', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:2400, y:3900, cameraUrl:'https://example.local/vpc-cam1', stato:'operativa' },
  { siteId:'villa-pacis', reparto:'Reception',  id:'vpc-ass-01', nome:'Assistente Front Desk', tag:'13004', tipo:'assistente', categoria:'personale', piano:0, stanza:'Reception', x:1100, y:1000, stato:'in-servizio' },
  { siteId:'villa-pacis', reparto:'Magazzino ausili', id:'vpc-mag-01', nome:'Deambulatori', tag:'17010', tipo:'magazzino-ausili', categoria:'ausilio', piano:0, stanza:'Magazzino Ausili', x:950, y:7400, stato:'stock-ok' },
  { siteId:'villa-pacis', reparto:'Sicurezza',  id:'vpc-est-01', nome:'Estintore P1', tag:'11001', tipo:'estintore', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:800, y:4200, stato:'operativo' },
  { siteId:'villa-pacis', reparto:'Locale tecnico', id:'vpc-ups-01', nome:'UPS', tag:'15003', tipo:'ups', categoria:'infrastruttura', piano:-1, stanza:'Centrale', x:600, y:700, stato:'operativo' },

  // ========= AQUASALUS =========
  { siteId:'aquasalus', reparto:'Infermeria', id:'aqs-med-01', nome:'Dr. Neri', tag:'23001', tipo:'medico', categoria:'personale', piano:1, stanza:'Ambulatorio 1', x:5200, y:3200, stato:'in-servizio' },
  { siteId:'aquasalus', reparto:'Infermeria', id:'aqs-oss-01', nome:'Concentratore Ossigeno', tag:'22003', tipo:'ossigeno', categoria:'dispositivo-medico', piano:1, stanza:'Osservazione', x:6100, y:5100, stato:'operativo' },
  { siteId:'aquasalus', reparto:'Degenza',    id:'aqs-mon-01', nome:'Monitor Paziente', tag:'22004', tipo:'monitor', categoria:'dispositivo-medico', piano:1, stanza:'Camera 101', x:5300, y:3000, stato:'operativo' },
  { siteId:'aquasalus', reparto:'Degenza',    id:'aqs-sensletto-01', nome:'Sensore Letto 101', tag:'26010', tipo:'sensore-letto', categoria:'sensor', piano:1, stanza:'Camera 101', x:7000, y:7000, stato:'attivo' },
  { siteId:'aquasalus', reparto:'Corridoi',   id:'aqs-fall-01', nome:'Sensore Caduta', tag:'26001', tipo:'sensore-caduta', categoria:'sensor', piano:1, stanza:'Corridoio A', x:3200, y:4200, stato:'attivo' },
  { siteId:'aquasalus', reparto:'Corridoi',   id:'aqs-cam-01', nome:'Camera Corridoio', tag:'21101', tipo:'camera', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:2500, y:4000, cameraUrl:'https://example.local/aqs-cam1', stato:'operativa' },
  { siteId:'aquasalus', reparto:'Magazzino ausili', id:'aqs-mag-01', nome:'Carrozzine di scorta', tag:'27001', tipo:'magazzino-ausili', categoria:'ausilio', piano:0, stanza:'Magazzino Ausili', x:900, y:7500, stato:'stock-ok' },
  { siteId:'aquasalus', reparto:'Reception',  id:'aqs-ass-01', nome:'Assistente', tag:'23004', tipo:'assistente', categoria:'personale', piano:0, stanza:'Reception', x:1200, y:1100, stato:'in-servizio' },
  { siteId:'aquasalus', reparto:'Sicurezza',  id:'aqs-est-01', nome:'Estintore P1', tag:'21001', tipo:'estintore', categoria:'sicurezza', piano:1, stanza:'Corridoio A', x:700, y:4100, stato:'operativo' },
  { siteId:'aquasalus', reparto:'Locale tecnico', id:'aqs-gen-01', nome:'Generatore', tag:'25003', tipo:'generatore', categoria:'infrastruttura', piano:-1, stanza:'Locale Tecnico', x:300, y:500, stato:'standby' }
])