<template>
  <div class="modal">
    <button @click="$emit('close')">Chiudi</button>
    <iframe v-if="url" :src="url" style="width:100%;height:60vh;border:0"></iframe>
  </div>
</template>
<script setup>
defineProps({ url: { type: String, default: '' } })
</script>