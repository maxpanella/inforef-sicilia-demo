<template>
  <div class="mp-backdrop" @click.self="$emit('close')">
    <div class="mp-modal">
      <div class="mp-head">
        <strong>Manutenzione — {{ asset?.nome || asset?.id }}</strong>
        <div class="spacer"></div>
        <button class="link" @click="$emit('close')">Chiudi</button>
      </div>

      <div class="mp-body">
        <div class="grid">
          <div class="card">
            <h4>Anagrafica</h4>
            <div class="row"><div>Categoria</div><div><strong>{{ asset?.categoria || '-' }}</strong></div></div>
            <div class="row"><div>Tipo</div><div>{{ asset?.tipo || '-' }}</div></div>
            <div class="row"><div>Seriale</div><div>{{ maint?.serial || '-' }}</div></div>
            <div class="row"><div>Tag inventario</div><div>{{ maint?.inventoryTag || '-' }}</div></div>
            <div class="row"><div>IP/Rete</div><div>{{ maint?.ipAddress || '-' }}</div></div>
            <div class="row"><div>Ubicazione</div><div>{{ asset?.stanza || '-' }}</div></div>
          </div>

          <div class="card">
            <h4>Stato e rischio</h4>
            <div class="row"><div>Stato d’uso</div><div><strong>{{ asset?.stato || '-' }}</strong></div></div>
            <div class="row"><div>Raggiungibilità</div><div>{{ reachabilityText }}</div></div>
            <div class="row"><div>Classe di rischio</div><div>{{ maint?.riskClass || 'N/A' }}</div></div>
            <div class="row"><div>Ultima verifica sicurezza</div><div>{{ maint?.lastSafetyCheck || '-' }}</div></div>
          </div>

          <div class="card">
            <h4>Manutenzioni</h4>
            <div class="row"><div>Ultima</div><div>{{ maint?.last || '-' }}</div></div>
            <div class="row"><div>Prossima</div><div>{{ maint?.next || '-' }}</div></div>
            <div class="row"><div>MTBF</div><div>{{ maint?.mtbfHours != null ? maint?.mtbfHours + ' h' : '-' }}</div></div>
            <div class="row"><div>Interventi</div><div>{{ maint?.interventionsCount ?? '-' }}</div></div>
            <div class="row"><div>Ore uso</div><div>{{ maint?.usageHours ?? '-' }}</div></div>
            <div class="row"><div>Garanzia fino a</div><div>{{ maint?.warrantyUntil || '-' }}</div></div>
            <div class="row"><div>SLA</div><div>{{ maint?.sla || '-' }}</div></div>
          </div>

          <div class="card">
            <h4>Referenti e documenti</h4>
            <div class="row"><div>Fornitore</div><div>{{ maint?.vendor || '-' }}</div></div>
            <div class="row"><div>Responsabile</div><div>{{ maint?.owner || '-' }}</div></div>
            <div class="row">
              <div>Manuale</div>
              <div>
                <a v-if="maint?.manualUrl" :href="maint.manualUrl" target="_blank" rel="noopener">Apri</a>
                <span v-else class="muted">—</span>
              </div>
            </div>
            <div class="row">
              <div>Ultimo ticket</div>
              <div>
                <a v-if="maint?.ticketUrl" :href="maint.ticketUrl" target="_blank" rel="noopener">Apri</a>
                <span v-else class="muted">—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button @click="$emit('close')">Chiudi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ asset: { type: Object, required: true } })

const maint = computed(() => props.asset?.maintenance || null)
const reachabilityText = computed(() => {
  const stanza = (props.asset?.stanza || '').toLowerCase()
  if (stanza.includes('corridoio') || stanza.includes('reception')) return 'Alta (area aperta)'
  if (stanza.includes('camera') || stanza.includes('ambulatorio')) return 'Media (accesso controllato)'
  return 'Normale'
})
</script>

<style>
.mp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
.mp-modal{width:min(820px,92vw);max-height:92vh;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:auto;display:flex;flex-direction:column}
.mp-head{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #eee}
.mp-head .spacer{flex:1}
.link{background:none;border:none;color:#2563eb;cursor:pointer}
.mp-body{padding:12px;display:flex;flex-direction:column;gap:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.card{border:1px solid #eef2f7;border-radius:8px;padding:10px;background:#fafafa}
.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
.row:last-child{border-bottom:none}
.actions{display:flex;justify-content:flex-end;gap:8px}
.muted{color:#64748b}
</style>