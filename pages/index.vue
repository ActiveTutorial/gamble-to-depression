<template>
  <div id="app">
    <SlotMachineSimulator />
  </div>
</template>

<script>
import SlotMachineSimulator from "../components/SlotMachineSimulator.vue";

export default {
  name: "IndexPage",
  components: {
    SlotMachineSimulator,
  },
};
</script>

<style>
/* ...existing global styles... */
</style>
