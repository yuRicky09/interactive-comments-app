<template>
  <div class="add-comment-form">
    <div>
      <textarea
        name=""
        id=""
        cols="30"
        rows="10"
        v-model.trim="content"
      ></textarea>
    </div>
    <div>
      <img :src="userImg" alt="user avatar" />
    </div>
    <div>
      <button @click="addComment(parentCommentId)">SEND</button>
    </div>
  </div>
  <BaseSpinner v-if="isLoading" />
</template>

<script>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";

export default {
  name: "AddCommentForm",
  props: {
    parentCommentId: {
      type: String,
      default: null,
    },
    replyingTo: {
      type: String,
      default: null,
    },
  },
  components: { BaseSpinner },
  setup(props) {
    const store = useStore();
    const content = ref(props.replyingTo);
    const userImg = computed(() => store.state.user.userImg);
    const isLoading = computed(() => store.state.comment.isLoading);

    async function addComment(parentId) {
      if (!content.value) return;
      const comment = {
        content: content.value,
        parentCommentId: parentId,
      };

      await store.dispatch("comment/addComment", comment);
      content.value = "";
    }

    return {
      userImg,
      content,
      addComment,
      isLoading,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/add-comment-form";
</style>
