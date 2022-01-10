import { useStore } from "vuex";
import { computed } from "vue";

export function useCalculateScore() {
  const store = useStore();
  const currentUserId = computed(() => store.state.user.userId);

  function addScore(scores, commentId) {
    if (scores.includes(currentUserId.value)) return;

    store.dispatch("comment/addScore", commentId);
  }

  function deductScore(scores, commentId) {
    if (!scores.includes(currentUserId.value)) return;

    store.dispatch("comment/deductScore", commentId);
  }

  return {
    addScore,
    deductScore,
  };
}
