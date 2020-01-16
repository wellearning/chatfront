<template>
  <div>
    <div class="welcome">
      <img src="../../../assets/images/welcome.png">
      <p>welcome, {{JSON.parse(this.$store.getters.getAccount).Name}}</p>
      <p>You can record and view memos here.</p>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped>

</style>
