<template>
  <div class="comment-form">
    <div class="comment-form__input">
      <textarea
        rows="5"
        placeholder="Add a comment"
        v-model.trim="commentContent"
        ref="textareaEl"
      ></textarea>
    </div>
    <div class="comment-form__avatar">
      <img :src="userImg" class="avatar" alt="user avatar" />
    </div>
    <div class="comment-form__action">
      <button class="btn" @click="addComment(parentCommentId)">
        {{ btnText }}
      </button>
    </div>
    <BaseSpinner v-if="isLoading" />
    <ErrorHandler v-if="errorMsg" :error-msg="errorMsg" />
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, ref, defineAsyncComponent, onMounted } from "vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import { useAddComment } from "@/composable/useAddComment";
import { useHandleError } from "@/composable/useHandleError";

const ErrorHandler = defineAsyncComponent(() =>
  import("@/components/UI/ErrorHandler.vue")
);

export default {
  name: "AddCommentForm",
  emits: ["close-comment-form"],
  props: {
    parentCommentId: {
      type: String,
      default: null,
    },
    commentInitContent: {
      type: String,
      default: null,
    },
    btnText: {
      type: String,
      required: true,
    },
    needAutofocus: {
      type: Boolean,
      default: true,
    },
  },
  components: { BaseSpinner, ErrorHandler },
  setup(props, { emit }) {
    const store = useStore();
    const commentContent = ref(props.commentInitContent);
    const textareaEl = ref();

    const userImg = computed(() => store.state.user.userImg);
    const isLoading = computed(() => store.state.comment.isLoading);

    // Set focus on textarea
    onMounted(() => {
      if (props.needAutofocus) {
        textareaEl.value.focus();
      }
    });

    const { errorMsg, handleError } = useHandleError();
    const { split } = useAddComment();

    async function addComment(parentId) {
      try {
        if (!commentContent.value) return;

        const { replyingTo, content } = split(commentContent.value);

        const comment = {
          content,
          replyingTo,
          parentCommentId: parentId,
        };

        await store.dispatch("comment/addComment", comment);
        commentContent.value = "";
        emit("close-comment-form");
      } catch (err) {
        handleError(err.message);
      }
    }

    return {
      userImg,
      commentContent,
      addComment,
      isLoading,
      errorMsg,
      textareaEl,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/add-comment-form";
</style>
