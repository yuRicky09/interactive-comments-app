<template>
  <main class="comment-list">
    <ErrorHandler v-if="errorMsg" :error-msg="errorMsg" />
    <template v-if="!errorMsg && rootComments.length > 0">
      <CommentListItem
        v-for="comment in rootComments"
        :key="comment.id"
        :comment="comment"
      />
    </template>
    <AddCommentForm btnText="SEND" :needAutofocus="false" />
    <BaseSpinner v-if="isLoading" />
  </main>
</template>

<script>
import CommentListItem from "@/components/CommentListItem.vue";
import AddCommentForm from "@/components/AddCommentForm.vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import { useStore } from "vuex";
import { useHandleError } from "@/composable/useHandleError";
import { ref, computed, defineAsyncComponent } from "vue";

const ErrorHandler = defineAsyncComponent(() =>
  import("@/components/UI/ErrorHandler.vue")
);

export default {
  name: "CommentList",
  components: { CommentListItem, BaseSpinner, AddCommentForm, ErrorHandler },
  setup() {
    const store = useStore();
    const isLoading = ref(false);

    const { errorMsg, handleError } = useHandleError();

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
        handleError(err.message);
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
