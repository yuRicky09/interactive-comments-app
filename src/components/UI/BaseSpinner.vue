<template>
  <div class="overlay">
    <Spinner />
  </div>
</template>

<script>
import Spinner from "@/assets/images/svg/spinner.svg";

export default {
  name: "BaseSpinner",
  components: { Spinner },
};
</script>
