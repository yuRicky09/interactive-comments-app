import { ref } from "vue";

export function useHandleError() {
  const errorMsg = ref(null);

  function handleError(error) {
    errorMsg.value = error;

    setTimeout(() => (errorMsg.value = null), 2500);
  }

  return {
    errorMsg,
    handleError,
  };
}
