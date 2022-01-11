<template>
  <div class="error-msg">{{ errorMsg }}</div>
</template>

<script>
export default {
  name: "ErrorHandler",
  props: {
    errorMsg: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/error-handler";
</style>
