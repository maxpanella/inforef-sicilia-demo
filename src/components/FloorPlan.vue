<template>
  <div class="fp-backdrop" @click.self="$emit('close')">
    <div class="fp-modal">
      <div class="fp-head">
        <strong>Piantina — {{ siteId.toUpperCase() }} — {{ dept }} — Piano {{ floor }}</strong>
        <div class="spacer"></div>
        <div class="scenario-pill" :class="{on: scenarioOn}">
          <span class="dot"></span> Scenario {{ scenarioOn ? 'ON' : 'OFF' }}
        </div>
        <button class="link" @click="toggleScenario">{{ scenarioOn ? 'Stop scenario' : 'Start scenario' }}</button>
        <button class="link" @click="$emit('close')">Chiudi</button>
      </div>

      <div class="fp-body">
        <svg viewBox="0 0 1100 700" class="fp-svg">
          <!-- Corridoio -->
          <rect x="0" y="300" width="1100" height="100" fill="#f3f4f6" stroke="#d1d5db"/>
          <!-- Camera 101 -->
          <rect :x="ROOMS['Camera 101'].x" :y="ROOMS['Camera 101'].y" :width="ROOMS['Camera 101'].w" :height="ROOMS['Camera 101'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Camera 101'].x + 10" :y="ROOMS['Camera 101'].y + 30" class="lbl">Camera 101</text>
          <!-- Camera 102 -->
          <rect :x="ROOMS['Camera 102'].x" :y="ROOMS['Camera 102'].y" :width="ROOMS['Camera 102'].w" :height="ROOMS['Camera 102'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Camera 102'].x + 10" :y="ROOMS['Camera 102'].y + 30" class="lbl">Camera 102</text>
          <!-- Ambulatorio -->
          <rect :x="ROOMS['Ambulatorio'].x" :y="ROOMS['Ambulatorio'].y" :width="ROOMS['Ambulatorio'].w" :height="ROOMS['Ambulatorio'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Ambulatorio'].x + 10" :y="ROOMS['Ambulatorio'].y + 30" class="lbl">Ambulatorio</text>
          <!-- Reception -->
          <rect :x="ROOMS['Reception'].x" :y="ROOMS['Reception'].y" :width="ROOMS['Reception'].w" :height="ROOMS['Reception'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Reception'].x + 10" :y="ROOMS['Reception'].y + 30" class="lbl">Reception</text>
          <!-- Riabilitazione -->
          <rect :x="ROOMS['Riabilitazione'].x" :y="ROOMS['Riabilitazione'].y" :width="ROOMS['Riabilitazione'].w" :height="ROOMS['Riabilitazione'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Riabilitazione'].x + 10" :y="ROOMS['Riabilitazione'].y + 30" class="lbl">Riabilitazione</text>
          <!-- Locale tecnico -->
          <rect :x="ROOMS['Locale tecnico'].x" :y="ROOMS['Locale tecnico'].y" :width="ROOMS['Locale tecnico'].w" :height="ROOMS['Locale tecnico'].h" fill="#fff" stroke="#d1d5db"/>
          <text :x="ROOMS['Locale tecnico'].x + 10" :y="ROOMS['Locale tecnico'].y + 30" class="lbl">Locale tecnico</text>

          <!-- Geofence (zona sicura) -->
          <polygon
            :points="geofencePointsString"
            fill="rgba(239,68,68,0.10)"
            stroke="#ef4444"
            stroke-dasharray="6,6"
            stroke-width="2"
          />
          <text :x="geofenceLabel.x" :y="geofenceLabel.y" class="mini" fill="#ef4444">Zona sicura (geofence)</text>

          <!-- Letti dinamici -->
          <template v-for="b in bedDraws" :key="b.id">
            <rect
              :x="b.x - b.w/2" :y="b.y - b.h/2"
              :width="b.w" :height="b.h" rx="6"
              fill="#e0f2fe" stroke="#93c5fd"
            />
            <text :x="b.x - b.w/2 + 10" :y="b.y + 5" class="mini">{{ b.nome }}</text>
          </template>

          <!-- Dispositivi fissi (inclusi sensori-letto ancorati) -->
          <g v-for="d in devices" :key="d.id">
            <rect :x="devicePos(d).x-10" :y="devicePos(d).y-10" width="20" height="20" rx="3" :fill="devicePos(d).color" stroke="#111827"/>
            <text :x="devicePos(d).x + 16" :y="devicePos(d).y + 4" class="mini">{{ d.nome }}</text>
          </g>

          <!-- Overlay dinamico: tutte le risorse del piano -->
          <g v-for="p in plotted" :key="p.key">
            <circle v-if="p.kind==='moving-medico'" :cx="p.pos.x" :cy="p.pos.y" r="12" fill="#22c55e" stroke="#16a34a"/>
            <circle v-else-if="p.kind==='paziente'" :cx="p.pos.x" :cy="p.pos.y" r="14" fill="#06b6d4" stroke="#0ea5e9"/>
            <circle v-else-if="p.kind==='assistente'" :cx="p.pos.x" :cy="p.pos.y" r="12" fill="#2563eb" stroke="#1d4ed8"/>
            <circle v-else-if="p.kind==='visitatore'" :cx="p.pos.x" :cy="p.pos.y" r="12" fill="#8b5cf6" stroke="#7c3aed"/>
            <text :x="p.pos.x + 16" :y="p.pos.y + 4" class="mini">{{ p.label }}</text>
          </g>
        </svg>

        <!-- Banner di camera linkage (feedback visivo) -->
        <div v-if="linkageActive" class="linkage-banner">
          <div class="row">
            <div class="spinner"></div>
            <div>
              <div class="title">Video geofence in riproduzione...</div>
              <div class="sub">Apertura stream della stanza in corso</div>
            </div>
            <button class="link small" @click="linkageActive=false">Nascondi</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  siteId: { type: String, required: true },
  dept: { type: String, required: true },
  floor: { type: Number, default: 1 },
  assets: { type: Array, default: () => [] }
})
const emit = defineEmits(['alert','ward-entry','close'])

/* Tempo e animazione (relativo allo Start) */
const tSec = ref(0)
const scenarioOn = ref(false)
const scenarioStartSec = ref(0)
const geofenceTriggered = ref(false)
const linkageActive = ref(false)

// Entrata insieme in reparto
const wardPatientEntered = ref(false)
const wardVisitorEntered = ref(false)
const wardEntryDispatched = ref(false)

let raf = null
function tick(){
  tSec.value = performance.now() / 1000
  raf = requestAnimationFrame(tick)
}
onMounted(()=> { raf = requestAnimationFrame(tick) })
onUnmounted(()=> { if (raf) cancelAnimationFrame(raf) })

function toggleScenario(){
  if (!scenarioOn.value) {
    scenarioOn.value = true
    scenarioStartSec.value = tSec.value
    geofenceTriggered.value = false
    linkageActive.value = false
    wardPatientEntered.value = false
    wardVisitorEntered.value = false
    wardEntryDispatched.value = false
    lastVisitorPos.value = { x: positions.reception.x, y: positions.reception.y }
  } else {
    scenarioOn.value = false
    linkageActive.value = false
  }
}

/* Layout stanze (coordinate in SVG) */
const ROOMS = {
  'Camera 101':     { x: 60,  y: 60,  w: 420, h: 220 },
  'Camera 102':     { x: 520, y: 60,  w: 260, h: 220 },
  'Ambulatorio':    { x: 800, y: 60,  w: 240, h: 220 },
  'Reception':      { x: 60,  y: 420, w: 260, h: 200 },
  'Riabilitazione': { x: 360, y: 420, w: 300, h: 200 },
  'Locale tecnico': { x: 680, y: 420, w: 360, h: 200 }
}
const ROOM101 = ROOMS['Camera 101']

/* Geofence */
const geofence = [
  { x: 920, y: 320 },
  { x: 1080, y: 320 },
  { x: 1080, y: 380 },
  { x: 920, y: 380 }
]
const geofencePointsString = computed(() => geofence.map(p => `${p.x},${p.y}`).join(' '))
const geofenceLabel = { x: 925, y: 315 }

/* Helpers animazione e geometria */
function lerp(a,b,x){ return a + (b-a)*x }
function pathLerp(path, tNorm){
  const n = path.length
  if (n < 2) return path[0] || {x:0,y:0}
  const totalSeg = n - 1
  const segFloat = tNorm * totalSeg
  const seg = Math.min(totalSeg - 1, Math.floor(segFloat))
  const local = segFloat - seg
  const A = path[seg], B = path[seg+1]
  return { x: lerp(A.x, B.x, local), y: lerp(A.y, B.y, local) }
}
function easeInOutSine(x){ return -(Math.cos(Math.PI * x) - 1) / 2 }
function pointInPolygon(pt, poly){
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
                      (pt.x < (xj - xi) * (pt.y - yi) / ((yj - yi) || 1e-9) + xi)
    if (intersect) c = !c
  }
  return c
}

/* Dataset derivato: letti e dispositivi */
const beds = computed(() => props.assets.filter(a => (a.tipo||'').toLowerCase().includes('letto')))
const devices = computed(() => props.assets.filter(a => ['dispositivo-medico','sicurezza','infrastruttura','sensor','ausilio','strumentazione'].includes((a.categoria||'').toLowerCase())))
const bedsByRoom = computed(() => {
  const m = {}
  for (const b of beds.value) {
    const room = b.stanza || 'Camera 101'
    ;(m[room] ||= []).push(b)
  }
  return m
})
function getBedDims(box, cols){
  const gap = 18
  const bedW = Math.max(80, Math.min(160, Math.floor((box.w - (cols+1)*gap)/cols)))
  const bedH = Math.max(40, Math.min(60, Math.floor((box.h - 3*gap)/2)))
  return { bedW, bedH, gap }
}
function getBedCenters(box, count){
  if (!count) return []
  let rows, cols
  if (count <= 2) { rows = 1; cols = count }
  else if (count <= 4) { rows = 2; cols = 2 }
  else { cols = Math.ceil(Math.sqrt(count)); rows = Math.ceil(count / cols) }
  const { bedW, bedH, gap } = getBedDims(box, cols)
  const totalW = cols * bedW + (cols + 1) * gap
  const totalH = rows * bedH + (rows + 1) * gap
  const xStart = box.x + (box.w - totalW)/2 + gap + bedW/2
  const yStart = box.y + (box.h - totalH)/2 + gap + bedH/2
  const centers = []
  for (let r=0; r<rows; r++){
    for (let c=0; c<cols; c++){
      const i = r*cols + c
      if (i >= count) break
      centers.push({
        x: Math.round(xStart + c * (bedW + gap)),
        y: Math.round(yStart + r * (bedH + gap)),
        bedW, bedH
      })
    }
  }
  return centers
}
const bedDraws = computed(()=>{
  const out = []
  for (const roomName of Object.keys(bedsByRoom.value)) {
    const list = bedsByRoom.value[roomName]
    const box = ROOMS[roomName]
    if (!box) continue
    const centers = getBedCenters(box, list.length)
    for (let i=0;i<list.length;i++){
      const b = list[i]
      const c = centers[i] || centers[centers.length-1]
      out.push({ id: b.id, nome: b.nome, x: c.x, y: c.y, w: c.bedW, h: c.bedH, room: roomName })
    }
  }
  return out
})
const bedPosById = computed(()=>{
  const m = {}
  for (const b of bedDraws.value) m[b.id] = b
  return m
})
const bedCentersByRoom = computed(()=>{
  const m = {}
  for (const roomName of Object.keys(bedsByRoom.value)) {
    const box = ROOMS[roomName]
    if (!box) continue
    const count = bedsByRoom.value[roomName].length
    m[roomName] = getBedCenters(box, count).map(c => ({ x:c.x, y:c.y }))
  }
  return m
})

/* Posizioni chiave */
const positions = {
  reception: { x: ROOMS['Reception'].x + ROOMS['Reception'].w/2, y: ROOMS['Reception'].y + ROOMS['Reception'].h/2 },
  corridor: [
    { x: 120, y: 350 },
    { x: 540, y: 350 },
    { x: 980, y: 350 }
  ],
  ambulatorio: { x: ROOMS['Ambulatorio'].x + ROOMS['Ambulatorio'].w/2, y: ROOMS['Ambulatorio'].y + ROOMS['Ambulatorio'].h/2 },
  door101: { x: ROOM101.x + ROOM101.w - 20, y: ROOM101.y + ROOM101.h - 30 }
}

/* Posizione dispositivi (sensore-letto ancorato) */
function devicePos(d){
  const tipo = (d.tipo||'').toLowerCase()
  let pos = { x: 900, y: 220 }, color = '#16a34a'

  if (tipo.includes('sensore-letto') || tipo.includes('sensore letto')) {
    const attachedId = d.attachedTo
    const bed = attachedId ? bedPosById.value[attachedId] : null
    if (bed) {
      return { x: bed.x + bed.w/2 - 10, y: bed.y - bed.h/2 - 10, color: '#f59e0b' }
    }
    const roomBeds = bedDraws.value.filter(b => (d.stanza && b.room === d.stanza))
    if (roomBeds.length) {
      const rb = roomBeds[0]
      return { x: rb.x + rb.w/2 - 10, y: rb.y - rb.h/2 - 10, color: '#f59e0b' }
    }
    return { x: positions.door101.x, y: positions.door101.y, color: '#f59e0b' }
  }

  if (tipo.includes('defibrillatore')) { pos = { x: ROOM101.x + ROOM101.w - 20, y: ROOM101.y + 140 }; color = '#ef4444' }
  else if (tipo.includes('ecg')) { pos = { x: ROOM101.x + 190, y: ROOM101.y + 150 }; color = '#8b5cf6' }
  else if (tipo.includes('monitor')) { pos = { x: ROOM101.x + 260, y: ROOM101.y + 100 }; color = '#22c55e' }
  else if (tipo.includes('estintore')) { pos = { x: 85, y: 310 }; color = '#dc2626' }
  else if (tipo.includes('ascensore')) { pos = { x: 1060, y: 350 }; color = '#6b7280' }
  else if (tipo.includes('sensore')) { pos = { x: positions.door101.x, y: positions.door101.y }; color = '#f59e0b' }

  return { ...pos, color }
}

/* Scenario: paziente + visitatore (tempo relativo allo start) */
const patientAsset = computed(() => props.assets.find(a => (a.categoria||'').toLowerCase()==='paziente'))
const visitorAsset = computed(() => props.assets.find(a => (a.categoria||'').toLowerCase()==='visitatori' || (a.tipo||'').toLowerCase()==='visitatore'))

function elapsedSec(){
  return Math.max(0, tSec.value - scenarioStartSec.value)
}

// Paziente: Reception -> Corridoio -> Letto (Camera 101)
function patientPosScenario(){
  const bedCenters101 = bedCentersByRoom.value['Camera 101'] || []
  const target = bedCenters101[0] || { x: positions.door101.x - 40, y: positions.door101.y - 20 }
  const path = [ positions.reception, { x: 540, y: 350 }, target ]
  const speed = 0.22 // più lento di prima
  const phase = Math.min(1, elapsedSec() * speed)
  return pathLerp(path, easeInOutSine(phase))
}

// Visitore: camminata lenta naturale, micro-soste, poi verso geofence
const lastVisitorPos = ref({ x: 0, y: 0 })
function visitorPosScenario(){
  const e = elapsedSec()
  const loop = positions.corridor

  // Random-like micro-soste ogni ~6-9s per ~0.8s
  const cycle = 7.2
  const pauseDur = 0.8
  const inPause = (e % cycle) < pauseDur

  if (e < 12) {
    const spd = 0.03 // molto lento
    const phase = (e * spd) % 1
    const bf = phase < 0.5 ? phase*2 : (1-phase)*2
    const base = pathLerp(loop, easeInOutSine(bf))
    const wobbleY = Math.sin(e * 0.9) * 1.2 // respiro
    const pos = { x: base.x, y: base.y + wobbleY }
    if (inPause) {
      // resta dove si trova durante la pausa
      if (!lastVisitorPos.value.x && !lastVisitorPos.value.y) lastVisitorPos.value = pos
      return lastVisitorPos.value
    }
    lastVisitorPos.value = pos
    return pos
  } else {
    const start = loop[1]
    const target = { x: 940, y: 340 } // ingresso geofence
    const p = Math.min(1, (e - 12) / 8.0) // 8s di avvicinamento
    const q = easeInOutSine(p)
    const pos = { x: lerp(start.x, target.x, q), y: lerp(start.y, target.y, q) }
    lastVisitorPos.value = pos
    return pos
  }
}

/* Entrata insieme in reparto: quando superano la soglia del corridoio (y <= 380) */
function checkWardEntry(pos, who){
  const entered = pos.y <= 380 // sopra la reception, dentro corridoio/reparto
  if (who === 'patient' && entered) wardPatientEntered.value = true
  if (who === 'visitor' && entered) wardVisitorEntered.value = true
  if (!wardEntryDispatched.value && wardPatientEntered.value && wardVisitorEntered.value) {
    wardEntryDispatched.value = true
    const actors = []
    if (patientAsset.value) actors.push({ id: patientAsset.value.id, reparto:'Degenza', stanza:'Camera 101' })
    if (visitorAsset.value) actors.push({ id: visitorAsset.value.id, reparto:'Corridoi', stanza:'Corridoio A' })
    if (actors.length) emit('ward-entry', { actors })
  }
}

/* Plot base delle risorse (tutte quelle del piano) */
const plottedBase = computed(()=>{
  const arr = []
  const medici   = props.assets.filter(a => (a.categoria||'').toLowerCase()==='personale' && (a.tipo||'').toLowerCase()==='medico')
  const assist   = props.assets.filter(a => (a.categoria||'').toLowerCase()==='personale' && (a.tipo||'').toLowerCase()==='assistente')
  const visitors = props.assets.filter(a => (a.categoria||'').toLowerCase()==='visitatori' || (a.tipo||'').toLowerCase()==='visitatore')
  const patients = props.assets.filter(a => (a.categoria||'').toLowerCase()==='paziente')

  // Medici: corridoio avanti/indietro
  medici.forEach((m,idx)=>{
    const spd = 0.12
    const phase = (tSec.value * spd + idx * 0.25) % 1
    const backforth = phase < 0.5 ? phase*2 : (1-phase)*2
    const pos = pathLerp(positions.corridor, easeInOutSine(backforth))
    arr.push({ key: m.id, kind:'moving-medico', pos, label: m.nome })
  })

  // Assistenti vicino Camera 101
  const bedCenters101 = bedCentersByRoom.value['Camera 101'] || []
  const near101_0 = bedCenters101[0] ? { x: bedCenters101[0].x + 40, y: bedCenters101[0].y + 30 } : positions.door101
  const near101_1 = bedCenters101[1] ? { x: bedCenters101[1].x + 40, y: bedCenters101[1].y + 30 } : { x: positions.reception.x+40, y: positions.reception.y-40 }
  if (assist[0]) arr.push({ key: assist[0].id, kind:'assistente', pos: near101_0, label: assist[0].nome })
  if (assist[1]) arr.push({ key: assist[1].id, kind:'assistente', pos: near101_1, label: assist[1].nome })

  // Visitatori (base): in reception
  visitors.forEach((v,idx)=> {
    const pos = { x: positions.reception.x + idx*26, y: positions.reception.y }
    arr.push({ key: v.id, kind:'visitatore', pos, label: v.nome })
  })

  // Pazienti (base): vicino letto Camera 101 o porta
  if (patients[0]) {
    const p0 = bedCenters101[0] || positions.door101
    arr.push({ key: patients[0].id, kind:'paziente', pos: p0, label: patients[0].nome })
  }
  if (patients[1]) {
    const p1 = bedCenters101[1] || { x: positions.door101.x-40, y: positions.door101.y }
    arr.push({ key: patients[1].id, kind:'paziente', pos: p1, label: patients[1].nome })
  }

  return arr
})

/* Applica scenario */
const plotted = computed(()=>{
  const base = plottedBase.value.slice()
  if (scenarioOn.value) {
    const p = patientAsset.value
    const v = visitorAsset.value
    if (p) {
      const i = base.findIndex(x => x.key===p.id)
      const pos = patientPosScenario()
      if (i>=0) base[i] = { key: p.id, kind: 'paziente', pos, label: p.nome }
      else base.push({ key: p.id, kind:'paziente', pos, label: p.nome })
      checkWardEntry(pos, 'patient')
    }
    if (v) {
      const i = base.findIndex(x => x.key===v.id)
      const pos = visitorPosScenario()
      if (i>=0) base[i] = { key: v.id, kind: 'visitatore', pos, label: v.nome }
      else base.push({ key: v.id, kind:'visitatore', pos, label: v.nome })
      // Trigger geofence una sola volta
      if (!geofenceTriggered.value && pointInPolygon(pos, geofence)) {
        geofenceTriggered.value = true
        linkageActive.value = true      // feedback visivo locale
        emit('alert', { type:'geofence', siteId: props.siteId })  // il parent apre la camera
      }
      checkWardEntry(pos, 'visitor')
    }
  }
  return base
})

// Reset scenario al cambio reparto
watch(() => props.dept, () => {
  geofenceTriggered.value = false
  linkageActive.value = false
  wardPatientEntered.value = false
  wardVisitorEntered.value = false
  wardEntryDispatched.value = false
})
</script>

<style>
.fp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:999}
.fp-modal{width:min(1100px,92vw);height:min(760px,92vh);background:#fff;border-radius:10px;display:flex;flex-direction:column;overflow:hidden;border:1px solid #e5e7eb}
.fp-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #e5e7eb}
.fp-head .spacer{flex:1}
.link{background:none;border:none;color:#2563eb;cursor:pointer}
.fp-body{position:relative;flex:1;background:#fcfcfd;display:flex;align-items:center;justify-content:center}
.fp-svg{width:100%;height:100%}
.lbl{font:600 14px/1.2 Inter, Arial; fill:#111827}
.mini{font:500 12px/1 Inter, Arial; fill:#374151}

.scenario-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb;background:#fafafa;color:#374151;font-size:12px;margin-right:8px}
.scenario-pill.on{background:#dcfce7;border-color:#bbf7d0;color:#166534}
.scenario-pill .dot{width:8px;height:8px;border-radius:999px;background:#9ca3af}
.scenario-pill.on .dot{background:#16a34a}

/* Banner linkage */
.linkage-banner{position:absolute;right:16px;bottom:16px;background:#0b1220;color:#e5e7eb;border:1px solid #1f2937;border-radius:10px;padding:10px 12px;box-shadow:0 6px 18px rgba(0,0,0,.25);min-width:280px}
.linkage-banner .row{display:flex;align-items:center;gap:10px}
.linkage-banner .title{font-weight:700}
.linkage-banner .sub{font-size:12px;color:#94a3b8}
.spinner{width:16px;height:16px;border:2px solid #94a3b8;border-top-color:#22c55e;border-radius:50%;animation:spin 1s linear infinite}
.small{font-size:12px;padding:2px 6px}
@keyframes spin { to { transform: rotate(360deg) } }
</style>