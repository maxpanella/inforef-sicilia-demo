<template>
  <div class="qp-backdrop" @click.self="$emit('close')">
    <div class="qp-modal">
      <div class="qp-head">
        <strong>Qualifica — {{ person?.nome || person?.id }}</strong>
        <div class="spacer"></div>
        <button class="link" @click="$emit('close')">Chiudi</button>
      </div>

      <div class="qp-body">
        <div class="cards">
          <div class="card">
            <h4>ECM</h4>
            <div class="kpi">{{ skills?.ecmPoints ?? 0 }} pt</div>
            <small class="muted">Punteggio formativo ECM</small>
          </div>

          <div class="card">
            <h4>Competenze acquisite</h4>
            <ul>
              <li v-for="(s,i) in skills?.acquired || []" :key="i">
                {{ s.name }} <small v-if="s.date" class="muted">({{ s.date }})</small>
              </li>
              <li v-if="!skills?.acquired?.length" class="muted">Nessuna</li>
            </ul>
          </div>

          <div class="card">
            <h4>Competenze orizzontali</h4>
            <div class="two-cols">
              <div>
                <strong>Lingue</strong>
                <ul>
                  <li v-for="(l,i) in skills?.horizontal?.languages || []" :key="'l'+i">{{ l }}</li>
                  <li v-if="!skills?.horizontal?.languages?.length" class="muted">–</li>
                </ul>
              </div>
              <div>
                <strong>Informatica</strong>
                <ul>
                  <li v-for="(it,i) in skills?.horizontal?.it || []" :key="'it'+i">{{ it }}</li>
                  <li v-if="!skills?.horizontal?.it?.length" class="muted">–</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card">
            <h4>Competenze specifiche</h4>
            <ul>
              <li v-for="(e,i) in skills?.equipment || []" :key="'e'+i">{{ e }}</li>
              <li v-if="!skills?.equipment?.length" class="muted">–</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h4>Piano formativo</h4>
          <ul>
            <li v-for="(t,i) in skills?.todo || []" :key="'t'+i">
              {{ t.name }} <small v-if="t.due" class="muted">(entro {{ t.due }})</small>
            </li>
            <li v-if="!skills?.todo?.length" class="muted">Nessuna attività pianificata</li>
          </ul>
        </div>

        <div class="card">
          <h4>In scadenza</h4>
          <ul>
            <li v-for="(x,i) in skills?.expiring || []" :key="'x'+i">
              {{ x.name }} <small v-if="x.due" class="muted">(entro {{ x.due }})</small>
            </li>
            <li v-if="!skills?.expiring?.length" class="muted">Nessuna scadenza</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  person: { type: Object, required: true },
  skills: { type: Object, required: true }
})
</script>

<style>
.qp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
.qp-modal{width:min(900px,92vw);max-height:92vh;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:auto;display:flex;flex-direction:column}
.qp-head{display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #eee}
.qp-head .spacer{flex:1}
.link{background:none;border:none;color:#2563eb;cursor:pointer}
.qp-body{padding:12px;display:flex;flex-direction:column;gap:12px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.card{border:1px solid #eef2f7;border-radius:8px;padding:10px;background:#fafafa}
.kpi{font-size:24px;font-weight:700}
.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.muted{color:#64748b}
</style>