<template>
  <div class="demo-root">
    <aside class="sidebar">
      <div class="brand">Inforef RTLS Demo</div>

      <div class="controls">
        <label>Struttura</label>
        <select v-model="selectedSiteId">
          <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.ragioneSociale }}</option>
        </select>

        <div class="btn-row">
          <button @click="showOverview" :disabled="overviewMode">Vista generale</button>
          <button @click="showSiteView" :disabled="!overviewMode">Vista sito</button>
        </div>
        <div class="btn-row">
          <button v-if="overviewMode" @click="fitAllSites">Inquadra tutte</button>
          <button v-else @click="fitAll">Centra mappa</button>
        </div>

        <div class="btn-row">
          <button @click="startDemo" :disabled="demoRunning || overviewMode">Start demo</button>
          <button @click="stopDemo" :disabled="!demoRunning">Stop</button>
        </div>
        <div class="btn-row">
          <button @click="simulateOnce" :disabled="overviewMode">Simula sample</button>
        </div>

        <!-- Pulsante test apertura manutenzione -->
        <div class="btn-row">
          <button @click="openMaintenanceTest">Test manutenzione (ECG)</button>
        </div>
      </div>

      <maintenance-list />

      <div class="events">
        <h4>Eventi</h4>
        <ul>
          <li v-for="(e,i) in events" :key="i"><small>{{ e.t }}</small> — {{ e.msg }}</li>
        </ul>
      </div>
    </aside>

    <main class="main">
      <div class="map-wrapper" ref="mapWrapEl">
        <div id="map"></div>
      </div>

      <!-- OVERVIEW: mappa + lista strutture con indicatori -->
      <div v-if="overviewMode" class="overview">
        <h3>Strutture</h3>
        <div class="sites-list">
          <div class="site-card" v-for="card in overviewCards" :key="card.id">
            <div class="site-head">
              <div class="site-name">{{ card.name }}</div>
              <button class="link" @click="selectSite(card.id)">Vai al sito</button>
            </div>

            <div class="site-metrics">
              <div class="metric">
                <div class="label">Risorse presenti</div>
                <div class="value">
                  <span class="badge blue">Sanitari: {{ card.counts.sanitari }}</span>
                  <span class="badge amber">Visitatori: {{ card.counts.visitatori }}</span>
                  <span class="badge green">Pazienti: {{ card.counts.pazienti }}</span>
                </div>
              </div>

              <div class="metric">
                <div class="label">Reparti</div>
                <div class="value">{{ card.reparti }}</div>
              </div>

              <div class="metric">
                <div class="label">Livello di rischio</div>
                <div class="value risk-grid">
                  <span :class="['score', card.risk.levelClass]">{{ card.risk.levelText }} ({{ card.risk.score }})</span>
                  <div class="risk-sub">
                    <div>Fattori: <strong>{{ card.risk.factors }}</strong></div>
                    <div>Criticità: <strong>{{ card.risk.incidents }}</strong></div>
                    <div>DPI: <strong>{{ Math.round(card.risk.dpiCompliance*100) }}%</strong></div>
                    <div>Visite: <strong>{{ Math.round(card.risk.visitsCompliance*100) }}%</strong></div>
                  </div>
                </div>
              </div>

              <div class="metric">
                <div class="label">Competenze</div>
                <div class="value">
                  <span class="badge green">Acquisite: {{ card.skills.acquired }}</span>
                  <span class="badge amber">Da fare: {{ card.skills.todo }}</span>
                  <span class="badge red">In scadenza: {{ card.skills.expiring }}</span>
                </div>
              </div>
            </div>

            <div v-if="card.id==='sorrisi'" class="extra-actions">
              <small>Demo piantina reparto (SORRISI):</small>
              <button class="link" @click="openFloorPlan('sorrisi','Degenza',1)">Apri piantina Degenza</button>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA SITO: reparti con lista asset e apertura piantina -->
      <div v-else class="dept-panel">
        <div class="dept-header">
          <h3>Reparti — {{ selectedSiteLabel }}</h3>
          <div class="spacer"></div>
          <button class="link" @click="expandAll">Espandi tutto</button>
          <button class="link" @click="collapseAll">Comprimi tutto</button>
        </div>

        <div class="accordion">
          <div class="section" v-for="sec in groupedByDept" :key="sec.key">
            <div class="section-head" @click="toggleSection(sec.key)">
              <div class="title">
                <span class="chev" :class="{open: isOpen(sec.key)}">▸</span>
                <strong>{{ sec.key }}</strong>
              </div>
              <div class="badge">{{ sec.items.length }}</div>
              <div class="actions" @click.stop>
                <button
                  v-if="selectedSite?.id==='sorrisi'"
                  class="link"
                  @click="openFloorPlan(selectedSite.id, sec.key, 1)"
                >
                  Piantina
                </button>
              </div>
            </div>
            <div class="section-body" v-show="isOpen(sec.key)">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Stanza</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in sec.items" :key="a.id">
                    <td>
                      {{ a.nome }}
                      <small v-if="isPatient(a) && a.admissionDate" class="muted">
                        — degenza: {{ daysOfStay(a) }} gg
                      </small>
                    </td>
                    <td>{{ a.categoria || a.tipo }}</td>
                    <td>{{ a.stanza || '-' }}</td>
                    <td>{{ a.stato || '-' }}</td>
                    <td class="td-actions">
                      <button @click="openCamera(a.cameraUrl)" :disabled="!a.cameraUrl">Camera</button>
                      <button v-if="isHealthcare(a)" @click="openQualify(a)">Qualifica</button>
                      <button v-if="isMaintainable(a)" @click="openMaintenanceFor(a)">Manutenzione</button>
                      <button v-if="isPatient(a) && a.ehrUrl" @click="openPatientRecord(a)">Fascicolo</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="groupedByDept.length===0" class="empty">Nessun asset per questa struttura</div>
        </div>
      </div>

      <camera-modal v-if="cameraModal.show" :url="cameraModal.url" @close="cameraModal.show=false" />
      <qualification-panel
        v-if="qualPanel.show"
        :person="qualPanel.person"
        :skills="qualPanel.skills"
        @close="qualPanel.show=false"
      />
      <maintenance-panel
        v-if="maintPanel.show"
        :asset="maintPanel.asset"
        @close="maintPanel.show=false"
      />
      <floor-plan
        v-if="floorPlan.show"
        :site-id="floorPlan.siteId"
        :dept="floorPlan.dept"
        :floor="floorPlan.floor"
        :assets="floorPlan.assets"
        @ward-entry="handleWardEntry"
        @alert="handleAlert"
        @close="floorPlan.show=false"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import Style from 'ol/style/Style'
import CircleStyle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Text from 'ol/style/Text'
import { fromLonLat } from 'ol/proj'

import CameraModal from './CameraModal.vue'
import MaintenanceList from './MaintenanceList.vue'
import QualificationPanel from './QualificationPanel.vue'
import MaintenancePanel from './MaintenancePanel.vue'
import FloorPlan from './FloorPlan.vue'
import createLocalsenseAdapter from '../services/localsenseAdapter.js'

import { sites } from '../data/sites.js'
import { assetList } from '../data/assets.js'
import { skillsByPerson } from '../data/skills.js'

const demoRunning = ref(false)
const events = ref([])

// Mappa e layer
let map = null
let assetSrc = null, assetLayer = null
let siteSrc = null, siteLayer = null

const featureMap = new globalThis.Map()

const mapWrapEl = ref(null)
let ro = null

// Stato vista
const overviewMode = ref(true)
const selectedSiteId = ref(sites[0]?.id || null)

// Centro/rotazione iniziali
let defaultCenter = sites[0]?.lon && sites[0]?.lat ? fromLonLat([Number(sites[0].lon), Number(sites[0].lat)]) : fromLonLat([14.8484, 40.6369])
let rotationDeg = Number(sites[0]?.rotationDeg || 0)

// Coords puliti
const sitesWithCoords = computed(() =>
  sites.map(s => ({ ...s, lon: Number(s.lon), lat: Number(s.lat) }))
       .filter(s => Number.isFinite(s.lon) && Number.isFinite(s.lat))
)

const selectedSite = computed(() => sites.find(s => s.id === selectedSiteId.value) || null)
const selectedSiteLabel = computed(() => selectedSite.value ? selectedSite.value.ragioneSociale : '—')

const filteredAssets = computed(() =>
  assetList.value.filter(a => !selectedSiteId.value || a.siteId === selectedSiteId.value)
)

// Helpers reparto
function getDeptKey(a){
  if (a.reparto) return a.reparto
  const tipo = (a.tipo||'').toLowerCase()
  const cat  = (a.categoria||'').toLowerCase()
  const stanza = (a.stanza||'').toLowerCase()

  // Letto sempre in Degenza
  if (tipo.includes('letto')) return 'Degenza'

  if (cat === 'personale') {
    if (stanza.includes('reception')) return 'Reception'
    return 'Infermeria'
  }
  if (cat === 'dispositivo-medico') {
    if (stanza.includes('ambulatorio') || tipo.includes('ecg')) return 'Infermeria'
    if (stanza.includes('osservazione') || stanza.includes('camera') || tipo.includes('monitor')) return 'Degenza'
    return 'Infermeria'
  }
  if (cat === 'sensor' || tipo.includes('sensore')) {
    if (tipo.includes('letto') || stanza.includes('camera')) return 'Degenza'
    if (tipo.includes('porta') || stanza.includes('uscita')) return 'Esterni'
    if (tipo.includes('caduta') || stanza.includes('corridoio')) return 'Corridoi'
    if (stanza.includes('bagno')) return 'Bagni assistiti'
    return 'Sicurezza'
  }
  if (cat === 'ausilio' || tipo.includes('carrello') || tipo.includes('wheelchair')) {
    if (stanza.includes('magazzino')) return 'Magazzino ausili'
    if (stanza.includes('infermeria')) return 'Infermeria'
    return 'Magazzino ausili'
  }
  if (cat === 'sicurezza' || tipo.includes('estintore') || tipo.includes('allarme') || tipo.includes('camera')) {
    if (tipo.includes('camera')) return 'Corridoi'
    return 'Sicurezza'
  }
  if (cat === 'infrastruttura' || tipo.includes('porta') || tipo.includes('ascensore') || tipo.includes('generatore') || tipo.includes('ups') || cat==='arredo') {
    if (tipo.includes('generatore') || tipo.includes('ups') || stanza.includes('tecnico')) return 'Locale tecnico'
    if (tipo.includes('porta') || tipo.includes('ascensore') || stanza.includes('corridoio')) return 'Corridoi'
    if (tipo.includes('letto')) return 'Degenza'
    return 'Infrastruttura'
  }
  if (cat === 'consumabili' || tipo.includes('kit')) {
    if (stanza.includes('reception')) return 'Reception'
    return 'Infermeria'
  }
  if (cat === 'paziente' || tipo.includes('paziente')) return 'Degenza'
  if (cat === 'visitatori' || tipo.includes('visitatore')) return 'Reception'
  if (stanza.includes('fisioterapia') || stanza.includes('riabilitazione')) return 'Riabilitazione'
  if (a.piano != null) return `Piano ${a.piano}`
  return 'Altro'
}

const deptPriority = [
  'Infermeria','Degenza','Riabilitazione','Fisioterapia','Corridoi','Bagni assistiti',
  'Magazzino ausili','Reception','Locale tecnico','Esterni','Sicurezza','Infrastruttura'
]

const groupedByDept = computed(() => {
  const buckets = Object.create(null)
  for (const a of filteredAssets.value) {
    const key = getDeptKey(a)
    ;(buckets[key] ||= []).push(a)
  }
  const arr = Object.keys(buckets).map(k => ({ key: k, items: buckets[k] }))
  arr.sort((x, y) => {
    const ix = deptPriority.indexOf(x.key); const iy = deptPriority.indexOf(y.key)
    if (ix !== -1 && iy !== -1) return ix - iy
    if (ix !== -1) return -1
    if (iy !== -1) return 1
    if (x.key === 'Altro') return 1
    if (y.key === 'Altro') return -1
    return x.key.localeCompare(y.key, 'it')
  })
  return arr
})

const openSections = ref(new Set())
function isOpen(key){ return openSections.value.has(key) }
function toggleSection(key){
  const s = new Set(openSections.value)
  if (s.has(key)) s.delete(key); else s.add(key)
  openSections.value = s
}
function expandAll(){ openSections.value = new Set(groupedByDept.value.map(s => s.key)) }
function collapseAll(){ openSections.value = new Set() }

// Trasformazione coordinate
function transformDxf(x, y) {
  const x_m = (Number(x) || 0) / 1000, y_m = (Number(y) || 0) / 1000
  const theta = rotationDeg * Math.PI / 180
  const x_rot = x_m * Math.cos(theta) - y_m * Math.sin(theta)
  const y_rot = x_m * Math.sin(theta) + y_m * Math.cos(theta)
  return [ defaultCenter[0] + x_rot, defaultCenter[1] - y_rot ]
}

function addEvent(msg) {
  events.value.unshift({ t: new Date().toLocaleTimeString(), msg })
  if (events.value.length > 300) events.value.pop()
}

// Stili
function makeStyle(a) {
  const color =
    a.categoria === 'personale' ? '#2563eb' :
    a.categoria === 'dispositivo-medico' ? '#16a34a' :
    a.categoria === 'sensor' ? '#f59e0b' :
    a.categoria === 'infrastruttura' ? '#6b7280' :
    a.categoria === 'sicurezza' ? '#dc2626' :
    a.categoria === 'paziente' ? '#0891b2' :
    a.categoria === 'visitatori' ? '#8b5cf6' :
    '#334155'
  return new Style({
    image: new CircleStyle({ radius: 8, fill: new Fill({ color }), stroke: new Stroke({ color:'#fff', width:2 }) }),
    text: new Text({ text: a.nome, offsetY: -18, fill: new Fill({ color:'#0f274f' }), font:'600 12px Inter, Arial' })
  })
}

function makeSiteStyle(s) {
  const halo = new Style({
    image: new CircleStyle({
      radius: 16,
      fill: new Fill({ color: 'rgba(14,165,233,0.18)' }),
      stroke: new Stroke({ color: '#06b6d4', width: 3 })
    })
  })
  halo.setZIndex(20)

  const core = new Style({
    image: new CircleStyle({
      radius: 9,
      fill: new Fill({ color: '#0284c7' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    }),
    text: new Text({
      text: s.ragioneSociale,
      offsetY: -22,
      fill: new Fill({ color: '#0c4a6e' }),
      font: '700 13px Inter, Arial'
    })
  })
  core.setZIndex(21)
  return [halo, core]
}

// Refresh layer
function clearAssetsLayer() {
  featureMap.forEach((f) => assetSrc.removeFeature(f))
  featureMap.clear()
}
function refreshAssets() {
  if (!assetSrc || overviewMode.value) return
  const visibleIds = new Set()
  for (const a of filteredAssets.value) {
    const id = a.id
    const coords = transformDxf(a.x || 0, a.y || 0)
    let f = featureMap.get(id)
    if (!f) {
      f = new Feature({ geometry: new Point(coords) })
      f.setId(id)
      f.setStyle(makeStyle(a))
      assetSrc.addFeature(f)
      featureMap.set(id, f)
    } else {
      animateFeatureTo(f, coords, 350)
      f.setStyle(makeStyle(a))
    }
    visibleIds.add(id)
  }
  featureMap.forEach((f, id) => {
    if (!visibleIds.has(id)) {
      assetSrc.removeFeature(f)
      featureMap.delete(id)
    }
  })
}
function refreshSites() {
  if (!siteSrc) return
  siteSrc.clear()
  for (const s of sitesWithCoords.value) {
    const coord = fromLonLat([s.lon, s.lat])
    const f = new Feature({ geometry: new Point(coord) })
    f.setId(`site-${s.id}`)
    f.setStyle(makeSiteStyle(s))
    siteSrc.addFeature(f)
  }
}

// Animazione
function animateFeatureTo(feat, target, duration = 300) {
  if (!feat) return
  const geom = feat.getGeometry()
  const [sx, sy] = geom.getCoordinates()
  const [tx, ty] = target
  const dx = tx - sx, dy = ty - sy
  const t0 = performance.now()
  function step(now) {
    const p = Math.min(1, (now - t0) / duration)
    geom.setCoordinates([ sx + dx * p, sy + dy * p ])
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Mappa init
function initMap() {
  map = new OlMap({
    target: 'map',
    layers: [ new TileLayer({ source: new OSM() }) ],
    view: new View({ center: defaultCenter, zoom: 16 })
  })

  siteSrc = new VectorSource({ features: [] })
  siteLayer = new VectorLayer({ source: siteSrc })
  map.addLayer(siteLayer)

  assetSrc = new VectorSource({ features: [] })
  assetLayer = new VectorLayer({ source: assetSrc })
  map.addLayer(assetLayer)

  map.on('singleclick', (evt) => {
    if (!overviewMode.value) return
    map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      const fid = feature?.getId?.()
      if (fid && String(fid).startsWith('site-')) {
        const siteId = String(fid).slice(5)
        selectSite(siteId)
        return true
      }
    })
  })

  ro = new ResizeObserver(() => { if (map) map.updateSize() })
  if (mapWrapEl.value) ro.observe(mapWrapEl.value)

  refreshSites()
  refreshAssets()
}

// Cambio sito
function applySite(siteId) {
  const s = sites.find(x => x.id === siteId)
  if (!s) return
  rotationDeg = Number(s.rotationDeg || 0)
  const lon = Number(s.lon), lat = Number(s.lat)
  if (Number.isFinite(lon) && Number.isFinite(lat)) {
    defaultCenter = fromLonLat([lon, lat])
    if (map) map.getView().animate({ center: defaultCenter, duration: 350, zoom: 18 })
  }
}
function showOverview() {
  overviewMode.value = true
  rotationDeg = 0
  clearAssetsLayer()
  refreshSites()
  nextTick(() => fitAllSites())
}
function showSiteView() {
  overviewMode.value = false
  if (!selectedSiteId.value && sites[0]) selectedSiteId.value = sites[0].id
  applySite(selectedSiteId.value)
  refreshAssets()
  nextTick(() => fitAll())
}
function fitAll() {
  if (!map || !assetSrc || overviewMode.value) return
  try {
    const extent = assetSrc.getExtent()
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [40,40,40,40], duration: 300, maxZoom: 20 })
    }
  } catch {}
}
function fitAllSites() {
  if (!map || !siteSrc) return
  try {
    const extent = siteSrc.getExtent()
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [60,60,60,60], duration: 350, maxZoom: 10 })
    }
  } catch {}
}

// Adapter demo
const adapter = createLocalsenseAdapter()
function startDemo() {
  if (demoRunning.value || overviewMode.value) return
  demoRunning.value = true
  adapter.on?.('sample', applySample)
  adapter.start?.({ interval: 400 })
  addEvent('Demo started')
}
function stopDemo() {
  if (!demoRunning.value) return
  adapter.off?.('sample', applySample)
  adapter.stop?.()
  demoRunning.value = false
  addEvent('Demo stopped')
}
function simulateOnce() {
  if (overviewMode.value) return
  const a = filteredAssets.value[0] || assetList.value[0]
  if (!a) return
  const sample = { id: a.tag, x: (a.x || 0) + 400, y: (a.y || 0) + 200, ts: Date.now() }
  applySample(sample)
}
function applySample(sample) {
  if (overviewMode.value) return
  const tagId = String(sample.id)
  const a = assetList.value.find(x => String(x.tag) === tagId) || assetList.value.find(x => String(x.id) === tagId)
  if (a) {
    a.x = sample.x; a.y = sample.y; a._ts = sample.ts
    addEvent(`Sample ${tagId} -> ${a.nome}`)
    refreshAssets()
  } else {
    addEvent(`Unmapped tag ${tagId}`)
  }
}

// Azioni riga / modali
const cameraModal = ref({ show: false, url: '' })
function openCamera(url){
  if (!url) return
  cameraModal.value = { show: true, url }
}

const qualPanel = ref({ show: false, person: null, skills: null })
function isHealthcare(a){
  const cat = (a.categoria||'').toLowerCase()
  const tipo = (a.tipo||'').toLowerCase()
  return cat === 'personale' && ['medico','assistente','dirigente'].includes(tipo)
}
function getSkillsFor(a){
  return skillsByPerson[a.id] || { ecmPoints:0, acquired:[], horizontal:{languages:[],it:[]}, equipment:[], todo:[], expiring:[] }
}
function openQualify(asset){
  if (!isHealthcare(asset)) {
    console.log('[QUALIFICA] Ignorato: non personale sanitario', asset?.id)
    return
  }
  console.log('[QUALIFICA] Apro per', asset?.id)
  addEvent(`Qualifica: ${asset?.nome}`)
  qualPanel.value = { show: true, person: asset, skills: getSkillsFor(asset) }
}

const maintPanel = ref({ show: false, asset: null })
function isMaintainable(a){
  const cat = (a.categoria||'').toLowerCase()
  const tipo = (a.tipo||'').toLowerCase()
  if (['personale','visitatori','paziente'].includes(cat)) return false
  if (a.maintenance) return true
  const techCats = new Set(['dispositivo-medico','infrastruttura','sicurezza','sensor','ausilio','strumentazione','consumabili','arredo'])
  if (techCats.has(cat)) return true
  const techTypes = ['monitor','ecg','defibrillatore','generatore','ascensore','ups','estintore','allarme','letto']
  if (techTypes.some(k => tipo.includes(k))) return true
  return false
}
function openMaintenanceFor(asset){
  if (!isMaintainable(asset)) {
    console.log('[MANUTENZIONE] Ignorato: non manutenibile', asset?.id, asset?.categoria, asset?.tipo)
    addEvent(`Manutenzione non disponibile per ${asset?.nome}`)
    return
  }
  console.log('[MANUTENZIONE] Apro per', asset?.id)
  addEvent(`Manutenzione: ${asset?.nome}`)
  maintPanel.value = { show: true, asset }
}
// Test rapido apertura manutenzione ECG
function openMaintenanceTest(){
  const ecg = assetList.value.find(a => a.id==='sorrisi-ecg-01')
  if (!ecg) {
    console.warn('[TEST] ECG non trovato')
    addEvent('TEST: ECG non trovato')
    return
  }
  console.log('[TEST] Apro manutenzione per', ecg.id)
  addEvent(`TEST: manutenzione per ${ecg.nome}`)
  openMaintenanceFor(ecg)
}

function isPatient(a){
  const cat = (a.categoria||'').toLowerCase(), tipo=(a.tipo||'').toLowerCase()
  return cat==='paziente' || tipo==='paziente'
}
function daysOfStay(a){
  if (!a?.admissionDate) return '-'
  const d0 = new Date(a.admissionDate), now = new Date()
  return Math.max(0, Math.ceil((now - d0)/ (1000*60*60*24)))
}
function openPatientRecord(a){
  if (a?.ehrUrl) {
    window.open(a.ehrUrl, '_blank', 'noopener')
    addEvent(`Aperto fascicolo paziente: ${a.nome}`)
  }
}

// Selezione sito e piantina
function selectSite(siteId) {
  selectedSiteId.value = siteId
  showSiteView()
}
watch(selectedSiteId, async (newId) => {
  if (!newId) return
  if (overviewMode.value) {
    showSiteView()
  } else {
    applySite(newId)
    await nextTick()
    fitAll()
  }
})

const floorPlan = ref({ show: false, siteId: '', dept: '', floor: 1, assets: [] })
function openFloorPlan(siteId, dept, floorNum){
  // Passa tutte le risorse del sito al piano, così scenario e lista hanno gli stessi dati
  const allAssetsOnFloor = assetList.value.filter(a =>
    a.siteId === siteId && (a.piano ?? 1) === floorNum
  )
  floorPlan.value = { show: true, siteId, dept, floor: floorNum, assets: allAssetsOnFloor }
}

// Aggiorna lista risorse quando paziente e visitatore entrano insieme in reparto
function handleWardEntry(evt){
  if (!evt?.actors?.length) return
  for (const act of evt.actors) {
    const a = assetList.value.find(x => x.id === act.id)
    if (!a) continue
    if (act.reparto) a.reparto = act.reparto
    if (act.stanza) a.stanza = act.stanza
    addEvent(`Ingresso reparto: ${a.nome} → ${act.reparto}${act.stanza ? ' / '+act.stanza : ''}`)
  }
}

// Alert geofence -> apri camera (linkage) + evento
function handleAlert(evt){
  if (!evt) return
  if (evt.type === 'geofence') {
    const cam = assetList.value.find(a =>
      a.siteId === floorPlan.value.siteId &&
      (a.tipo||'').toLowerCase()==='camera' &&
      a.cameraUrl
    )
    if (cam?.cameraUrl) {
      addEvent('Allarme geofence: attivato camera linkage')
      openCamera(cam.cameraUrl)
    } else {
      addEvent('Allarme geofence: nessuna camera disponibile')
    }
  }
}

// ====== OVERVIEW: rischio + competenze ======
const tipoSanitari = new Set(['medico','assistente','dirigente'])
function computeRiskFor(siteId) {
  const a = assetList.value.filter(x => x.siteId === siteId)
  const sicurezza = a.filter(x => (x.categoria||'').toLowerCase()==='sicurezza')
  const equipment = a.filter(x => ['dispositivo-medico','infrastruttura'].includes((x.categoria||'').toLowerCase()))
  const badStates = ['guasto','manutenzione','scaduto','critico','fermo','non conforme']
  const issues = a.filter(x => badStates.some(b => String(x.stato||'').toLowerCase().includes(b))).length
  const factors = sicurezza.length + equipment.length

  const personnels = a.filter(p => (p.categoria||'').toLowerCase()==='personale')
  let totalPeople = personnels.length, dpiCompliant=0, visitsCompliant=0
  for (const p of personnels) {
    const sk = skillsByPerson[p.id] || {}
    const acq = sk.acquired||[]
    const todo = sk.todo||[]
    const hasDpi = acq.some(s => /dpi|antincendio|sicurezza/i.test(s.name||'')) && !todo.some(s=>/dpi|antincendio|sicurezza/i.test(s.name||''))
    const hasVisit = !todo.some(s=>/visita/i.test(s.name||''))
    dpiCompliant += hasDpi ? 1 : 0
    visitsCompliant += hasVisit ? 1 : 0
  }
  const dpiCompliance = totalPeople ? dpiCompliant/totalPeople : 1
  const visitsCompliance = totalPeople ? visitsCompliant/totalPeople : 1

  const issuePenalty = Math.min(100, issues*12)
  const nonCompliance = (1 - (0.6*dpiCompliance + 0.4*visitsCompliance)) * 100
  const baseRisk = Math.round(0.7*issuePenalty + 0.3*nonCompliance)
  const score = Math.min(100, Math.max(0, baseRisk))
  const levelText = score >= 75 ? 'ALTO' : score >= 45 ? 'MEDIO' : 'BASSO'
  const levelClass = score >= 75 ? 'bad' : score >= 45 ? 'warn' : 'ok'
  return { score, levelText, levelClass, factors, incidents: issues, dpiCompliance, visitsCompliance }
}
function computeSkillsFor(siteId){
  const personnels = assetList.value.filter(a => a.siteId===siteId && (a.categoria||'').toLowerCase()==='personale')
  let acquired=0, todo=0, expiring=0
  for (const p of personnels) {
    const sk = skillsByPerson[p.id]
    if (!sk) continue
    acquired += (sk.acquired?.length||0)
    todo     += (sk.todo?.length||0)
    const now = new Date()
    const soon = new Date(now.getTime() + 30*24*60*60*1000)
    const exp = (sk.expiring||[]).length
    const dueSoon = (sk.todo||[]).filter(s => s.due && new Date(s.due) <= soon).length
    expiring += exp + dueSoon
  }
  return { acquired, todo, expiring }
}
const overviewCards = computed(() => {
  return sites.map(s => {
    const siteAssets = assetList.value.filter(a => a.siteId === s.id)
    const sanitari = siteAssets.filter(a => (a.categoria||'').toLowerCase()==='personale' && tipoSanitari.has((a.tipo||'').toLowerCase())).length
    const visitatori = siteAssets.filter(a => (a.categoria||'').toLowerCase()==='visitatori' || (a.tipo||'').toLowerCase()==='visitatore').length
    const pazienti = siteAssets.filter(a => (a.categoria||'').toLowerCase()==='paziente' || (a.tipo||'').toLowerCase()==='paziente').length
    const reparti = new Set(siteAssets.map(getDeptKey)).size
    const risk = computeRiskFor(s.id)
    const skills = computeSkillsFor(s.id)
    return {
      id: s.id,
      name: s.ragioneSociale,
      counts: { sanitari, visitatori, pazienti },
      reparti,
      risk,
      skills
    }
  })
})

onMounted(() => {
  initMap()
  showOverview()
})
onUnmounted(() => {
  if (ro) ro.disconnect()
  stopDemo()
})
</script>

<style>
.demo-root{display:flex;height:100vh;font-family:Inter, "Helvetica Neue", Arial, sans-serif;background:#f5f7fa}
.sidebar{width:340px;background:linear-gradient(180deg,#1f2b38,#283644);color:#fff;padding:16px;box-sizing:border-box;display:flex;flex-direction:column}
.brand{font-weight:700;font-size:18px;margin-bottom:12px}
.controls label{font-size:12px;color:#cbd5e1;margin-top:8px;display:block}
.controls select{width:100%;padding:8px;border-radius:6px;border:none;margin-top:4px}
.btn-row{display:flex;gap:8px;margin-top:10px}
.btn-row button{flex:1;padding:8px;border-radius:6px;border:none;cursor:pointer;background:#2b90ff;color:white}
.btn-row button:disabled{opacity:0.6;cursor:not-allowed}
.events{margin-top:16px;background:rgba(255,255,255,0.06);padding:8px;border-radius:6px;flex:1;overflow:auto}
.events h4{margin:0 0 8px 0;font-size:13px}
.events ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.events li{font-size:12px;color:#e5e7eb}

.main{flex:1 1 auto;min-width:0;padding:16px;display:flex;flex-direction:column;gap:16px}
.map-wrapper{height:420px;max-height:420px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fff}
#map{width:100%;height:100%;min-height:0}

.overview{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px}
.sites-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px}
.site-card{border:1px solid #e5e7eb;border-radius:8px;padding:10px;background:#fafafa}
.site-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.site-name{font-weight:600}
.site-metrics{display:flex;flex-direction:column;gap:8px}
.metric .label{font-size:12px;color:#334155}
.metric .value{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.badge{display:inline-block;border-radius:999px;padding:2px 8px;font-size:12px;border:1px solid #e5e7eb;background:#fff;color:#111827}
.badge.blue{background:#dbeafe;border-color:#bfdbfe;color:#1e40af}
.badge.green{background:#dcfce7;border-color:#bbf7d0;color:#166534}
.badge.red{background:#fee2e2;border-color:#fecaca;color:#991b1b}
.badge.amber{background:#fef3c7;border-color:#fde68a;color:#92400e}
.score{font-weight:700;padding:2px 8px;border-radius:6px}
.score.ok{background:#dcfce7;color:#166534}
.score.warn{background:#fef3c7;color:#92400e}
.score.bad{background:#fee2e2;color:#991b1b}
.muted{color:#64748b}
.risk-grid{flex-direction:column;align-items:flex-start}
.risk-sub{display:grid;grid-template-columns:repeat(4,auto);gap:10px;font-size:12px;color:#334155;margin-top:4px}
.extra-actions{margin-top:8px}

.dept-panel{background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
.dept-header{display:flex;align-items:center;padding:12px;border-bottom:1px solid #eef2f7}
.dept-header h3{margin:0}
.dept-header .spacer{flex:1}
.dept-header .link{background:none;border:none;color:#2563eb;cursor:pointer;padding:6px 10px}

.accordion{display:flex;flex-direction:column}
.section{border-top:1px solid #f1f5f9}
.section-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer;background:#fafafa;gap:8px}
.section-head .title{display:flex;align-items:center;gap:6px}
.section-head .chev{transition:transform .2s}
.section-head .chev.open{transform:rotate(90deg)}
.section-head .badge{background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;border-radius:10px;padding:2px 8px;font-size:12px}
.section-head .actions{margin-left:auto}
.section-body{padding:10px 12px}
.section-body table{width:100%;border-collapse:collapse}
.section-body thead th{background:#f9fafb;text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151}
.section-body tbody td{padding:8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827}
.section-body tbody tr:hover{background:#f9fafb}
.td-actions button{margin-right:6px}

button{padding:6px 8px;border-radius:6px;border:1px solid #d1d5db;background:#fff;cursor:pointer}
button:disabled{opacity:0.5;cursor:not-allowed}
.link{background:none;border:none;color:#2563eb;cursor:pointer;padding:2px 6px}
</style>