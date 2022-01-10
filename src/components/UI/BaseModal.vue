<template>
  <teleport to="body">
    <div v-if="modalIsOpen" class="overlay" @click="$emit('close-modal')"></div>

    <transition name="modal-popup">
      <div v-if="modalIsOpen" class="modal">
        <div class="modal__header">
          <h2>{{ title }}</h2>
        </div>
        <div class="modal__body">
          <slot name="content"></slot>
        </div>
        <div class="modal__footer">
          <slot name="action"></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { onBeforeUnmount } from "vue";

export default {
  name: "BaseModal",
  emits: ["close-modal"],
  props: {
    title: {
      type: String,
      required: true,
    },
    modalIsOpen: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, { emit }) {
    function closeModalByEsc(e) {
      if (e.key !== "Escape") return;
      emit("close-modal");
    }

    window.addEventListener("keydown", closeModalByEsc);

    onBeforeUnmount(() =>
      window.removeEventListener("keydown", closeModalByEsc)
    );
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/base-modal";
</style>
