<template>
  <div class="comment-item">
    <div class="comment">
      <div class="comment__header">
        <div class="info">
          <img :src="comment.userImg" alt="user avatar" class="avatar" />
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
        <p v-if="!isEditing" class="content">
          <span v-if="comment.replyingTo" class="replyingTo">{{
            `@${comment.replyingTo} `
          }}</span
          >{{ comment.content }}
        </p>
        <div v-if="isEditing" class="edit-area">
          <textarea rows="5" v-model.trim="commentContent"></textarea>
          <button class="btn" @click="updateComment">Update</button>
        </div>
      </div>
      <div class="comment__footer">
        <div class="vote">
          <button
            class="vote__btn"
            @click="addScore(comment.scores, comment.id)"
          >
            <PlusIcon class="vote__icon" />
          </button>
          <span class="vote__scores">{{ comment.scores.length }}</span>
          <button
            class="vote__btn"
            @click="deductScore(comment.scores, comment.id)"
          >
            <MinusIcon class="vote__icon" />
          </button>
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
            @click="showModal"
          >
            <DeleteIcon />
            <span>Delete</span>
          </button>
          <button
            v-if="currentUserId == comment.userId"
            class="btn--ghost edit"
            @click="editComment"
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
      :form-init-content="formInitContent"
    />
    <div class="replies" v-if="replies.length > 0">
      <CommentListItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
      />
    </div>

    <BaseSpinner v-if="isLoading" />

    <base-modal
      @close-modal="closeModal"
      title="Delete comment"
      :modalIsOpen="modalIsOpen"
    >
      <template #content>
        <p>
          Are you sure you want to delete this comment? This will remove the
          comment and can't be undone.
        </p>
      </template>
      <template #action>
        <button class="btn--cancel" @click="closeModal">NO, CANCEL</button>
        <button class="btn--delete" @click="deleteComment">YES, DELETE</button>
      </template>
    </base-modal>
  </div>
</template>

<script>
import AddCommentForm from "@/components/AddCommentForm.vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import BaseModal from "@/components/UI/BaseModal.vue";
import { computed, ref } from "vue";
import { useStore } from "vuex";

import { useTimeFormat } from "@/composable/useTimeFormat";
import { useAddComment } from "@/composable/useAddComment";
import { useCalculateScore } from "@/composable/useCalculateScore";
import { useModalControl } from "@/composable/useModalControl";

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
    BaseSpinner,
    BaseModal,
    PlusIcon,
    MinusIcon,
    ReplyIcon,
    EditIcon,
    DeleteIcon,
  },
  setup(props) {
    const store = useStore();
    const isReplying = ref(false);
    const isEditing = ref(false);
    const formInitContent = ref(null);

    const isLoading = computed(() => store.state.comment.isLoading);

    const currentUserId = computed(() => store.state.user.userId);

    const { createdAt } = useTimeFormat(props.comment.createdAt.toDate());

    // find root comment's replies
    const comments = computed(() => store.state.comment.comments);
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
      formInitContent.value = `@${props.comment.userName} `;
    }

    function toggleCommentForm() {
      isReplying.value = !isReplying.value;
    }

    const commentContent = ref(null);
    commentContent.value = props.comment.replyingTo
      ? `@${props.comment.replyingTo} ${props.comment.content}`
      : props.comment.content;

    const { split } = useAddComment();

    function editComment() {
      isEditing.value = !isEditing.value;
    }

    function updateComment() {
      const { replyingTo, content } = split(commentContent.value);
      const comment = {
        replyingTo,
        content,
        id: props.comment.id,
      };
      store.dispatch("comment/updateComment", comment);
      isEditing.value = false;
    }

    async function deleteComment() {
      await store.dispatch("comment/deleteComment", props.comment.id);
      closeModal();
    }

    const { addScore, deductScore } = useCalculateScore();

    const { showModal, closeModal, modalIsOpen } = useModalControl();

    return {
      replies,
      parentCommentId,
      isReplying,
      isEditing,
      createdAt,
      currentUserId,
      replyComment,
      editComment,
      deleteComment,
      formInitContent,
      commentContent,
      updateComment,
      isLoading,
      comments,
      addScore,
      deductScore,
      showModal,
      closeModal,
      modalIsOpen,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/comment-list-item.scss";
</style>
