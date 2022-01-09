<template>
  <div class="comment-item">
    <div class="comment">
      <div class="comment__header">
        <div class="info">
          <img :src="comment.userImg" alt="user avatar" class="info__avatar" />
          <span class="info__user-name">{{ comment.userName }}</span>
          <span v-if="currentUserId == comment.userId" class="info__badge"
            >you</span
          >
          <span class="info__time">{{ createdAt }}</span>
        </div>
        <!-- desktop actions -->
        <!-- <div></div> -->
      </div>
      <div class="comment__body">
        <p class="content">{{ comment.content }}</p>
      </div>
      <div class="comment__footer">
        <div class="vote">
          <PlusIcon />
          <span class="scores">{{ comment.scores.length }}</span>
          <MinusIcon />
        </div>
        <div class="actions">
          <button
            v-if="currentUserId !== comment.userId"
            class="btn--ghost reply"
            @click="replyComment"
          >
            <ReplyIcon />
            <span>Reply</span>
          </button>
          <button
            v-if="currentUserId == comment.userId"
            class="btn--ghost delete"
          >
            <DeleteIcon />
            <span>Delete</span>
          </button>
          <button
            v-if="currentUserId == comment.userId"
            class="btn--ghost edit"
          >
            <EditIcon />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
    <AddCommentForm
      v-if="isReplying"
      :parent-comment-id="parentCommentId"
      :replying-to="replyingTo"
    />
    <div class="replies" v-if="replies.length > 0">
      <CommentListItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
      />
    </div>
  </div>
</template>

<script>
import AddCommentForm from "@/components/AddCommentForm.vue";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useTimeFormat } from "@/composable/useTimeFormat";
import PlusIcon from "@/assets/images/svg/plus.svg";
import MinusIcon from "@/assets/images/svg/minus.svg";
import ReplyIcon from "@/assets/images/svg/reply.svg";
import EditIcon from "@/assets/images/svg/edit.svg";
import DeleteIcon from "@/assets/images/svg/delete.svg";

export default {
  name: "CommentListItem",
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  components: {
    AddCommentForm,
    PlusIcon,
    MinusIcon,
    ReplyIcon,
    EditIcon,
    DeleteIcon,
  },
  setup(props) {
    const store = useStore();
    const isReplying = ref(false);
    const comments = computed(() => store.state.comment.comments);
    const currentUserId = computed(() => store.state.user.userId);
    const replyingTo = ref(null);

    const { createdAt } = useTimeFormat(props.comment.createdAt.toDate());

    // find root comment's replies
    const replies = computed(() => {
      return comments.value.filter((comment) => {
        const currentCommentId = props.comment.id;
        return currentCommentId === comment.parentCommentId;
      });
    });

    // 要回覆的comment沒有parentCommentId則代表此comment為root comment，回覆此comment的留言的parentId都指向此root comment，反之回覆的comment已有parentId的話，則留言的parentId也指向同一個parentId
    const parentCommentId = computed(() => {
      return props.comment.parentCommentId
        ? props.comment.parentCommentId
        : props.comment.id;
    });

    function replyComment() {
      toggleCommentForm();
      replyingTo.value = `@${props.comment.userName}`;
    }

    function toggleCommentForm() {
      isReplying.value = !isReplying.value;
    }

    return {
      replies,
      parentCommentId,
      isReplying,
      createdAt,
      currentUserId,
      replyComment,
      replyingTo,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/comment-list-item.scss";
</style>
