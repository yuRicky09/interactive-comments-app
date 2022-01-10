import { ref } from "vue";

export function useModalControl() {
  const modalIsOpen = ref(false);
  const bodyEl = document.querySelector("body");

  function showModal() {
    modalIsOpen.value = true;

    preventScrolling(window, bodyEl);
  }

  function closeModal() {
    modalIsOpen.value = false;
    bodyEl.style.paddingRight = `0px`;
    bodyEl.classList.remove("preventScrolling");
  }

  function preventScrolling(window, bodyEl) {
    if (window.innerWidth > bodyEl.clientWidth) {
      const scrollbarWidth = window.innerWidth - bodyEl.clientWidth;
      bodyEl.style.paddingRight = `${scrollbarWidth}px`;
      bodyEl.classList.add("preventScrolling");
    }
  }

  return {
    modalIsOpen,
    showModal,
    closeModal,
    preventScrolling,
    bodyEl,
  };
}
