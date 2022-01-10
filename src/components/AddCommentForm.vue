<template>
  <div class="comment-form">
    <div class="comment-form__input">
      <textarea
        rows="5"
        placeholder="Add a comment"
        v-model.trim="commentContent"
      ></textarea>
    </div>
    <div class="comment-form__avatar">
      <img :src="userImg" class="avatar" alt="user avatar" />
    </div>
    <div class="comment-form__action">
      <button class="btn" @click="addComment(parentCommentId)">SEND</button>
    </div>
  </div>
  <BaseSpinner v-if="isLoading" />
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import { useAddComment } from "@/composable/useAddComment";

export default {
  name: "AddCommentForm",
  props: {
    parentCommentId: {
      type: String,
      default: null,
    },
    formInitContent: {
      type: String,
      default: null,
    },
  },
  components: { BaseSpinner },
  setup(props) {
    const store = useStore();
    const commentContent = ref(props.formInitContent);
    const userImg = computed(() => store.state.user.userImg);
    const isLoading = computed(() => store.state.comment.isLoading);

    const { split } = useAddComment();

    async function addComment(parentId) {
      if (!commentContent.value) return;

      const { replyingTo, content } = split(commentContent.value);

      const comment = {
        content,
        replyingTo,
        parentCommentId: parentId,
      };

      await store.dispatch("comment/addComment", comment);
      commentContent.value = "";
    }

    return {
      userImg,
      commentContent,
      addComment,
      isLoading,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/add-comment-form";
</style>
