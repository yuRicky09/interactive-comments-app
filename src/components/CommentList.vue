<template>
  <main class="comment-list">
    <div v-if="errorMsg">{{ errorMsg }}</div>
    <template v-if="!errorMsg && rootComments.length > 0">
      <CommentListItem
        v-for="comment in rootComments"
        :key="comment.id"
        :comment="comment"
      />
    </template>
    <AddCommentForm />
    <BaseSpinner v-if="isLoading" />
  </main>
</template>

<script>
import CommentListItem from "@/components/CommentListItem.vue";
import AddCommentForm from "@/components/AddCommentForm.vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import { useStore } from "vuex";
import { ref, computed } from "vue";

export default {
  name: "CommentList",
  components: { CommentListItem, BaseSpinner, AddCommentForm },
  setup() {
    const store = useStore();
    const isLoading = ref(false);
    const errorMsg = ref(null);

    const rootComments = computed(
      () => store.getters["comment/getRootComments"]
    );
    // init
    (async () => {
      isLoading.value = true;
      try {
        // In firestore current user Id is "1111"(hard code)
        await Promise.all([
          store.dispatch("comment/getAllComments"),
          store.dispatch("user/getCurrentUser", "1111"),
          store.dispatch("comment/handleCommentsChange"),
        ]);
      } catch (err) {
        errorMsg.value = err.message;
      } finally {
        isLoading.value = false;
      }
    })();

    return {
      isLoading,
      errorMsg,
      rootComments,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/comment-list.scss";
</style>
