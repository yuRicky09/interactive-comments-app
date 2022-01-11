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
      </div>

      <div class="comment__body">
        <p v-if="!isEditing" class="content">
          <span v-if="comment.replyingTo" class="replyingTo">{{
            `@${comment.replyingTo} `
          }}</span
          >{{ comment.content }}
        </p>
        <div v-if="isEditing" class="edit-area">
          <textarea
            ref="textareaEl"
            rows="5"
            v-model.trim="commentContent"
          ></textarea>
          <button class="btn" @click="updateComment">Update</button>
        </div>
      </div>

      <div class="vote">
        <button class="vote__btn" @click="addScore(comment.scores, comment.id)">
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

    <transition name="form-popup">
      <AddCommentForm
        v-if="isReplying"
        :parent-comment-id="parentCommentId"
        :comment-init-content="commentInitContent"
        btnText="REPLY"
        @close-comment-form="isReplying = false"
      />
    </transition>

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

    <ErrorHandler v-if="errorMsg" :error-msg="errorMsg" />
  </div>
</template>

<script>
import AddCommentForm from "@/components/AddCommentForm.vue";
import BaseSpinner from "@/components/UI/BaseSpinner.vue";
import { computed, ref, defineAsyncComponent } from "vue";
import { useStore } from "vuex";

import { useTimeFormat } from "@/composable/useTimeFormat";
import { useAddComment } from "@/composable/useAddComment";
import { useCalculateScore } from "@/composable/useCalculateScore";
import { useModalControl } from "@/composable/useModalControl";
import { useHandleError } from "@/composable/useHandleError";

import PlusIcon from "@/assets/images/svg/icon-plus.svg";
import MinusIcon from "@/assets/images/svg/icon-minus.svg";
import ReplyIcon from "@/assets/images/svg/icon-reply.svg";
import EditIcon from "@/assets/images/svg/icon-edit.svg";
import DeleteIcon from "@/assets/images/svg/icon-delete.svg";

const BaseModal = defineAsyncComponent(() =>
  import("@/components/UI/BaseModal.vue")
);
const ErrorHandler = defineAsyncComponent(() =>
  import("@/components/UI/ErrorHandler.vue")
);

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
    ErrorHandler,
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
    const commentInitContent = ref(null);
    const commentContent = ref(setCommentContentWhenEdit());
    const textareaEl = ref();

    const isLoading = computed(() => store.state.comment.isLoading);

    const currentUserId = computed(() => store.state.user.userId);

    const { createdAt } = useTimeFormat(props.comment.createdAt.toDate());
    const { addScore, deductScore } = useCalculateScore();
    const { showModal, closeModal, modalIsOpen } = useModalControl();
    const { errorMsg, handleError } = useHandleError();

    // find root comment's replies
    const comments = computed(() => store.state.comment.comments);
    const replies = computed(() => {
      return comments.value.filter((comment) => {
        const currentCommentId = props.comment.id;
        return comment.parentCommentId === currentCommentId;
      });
    });

    // When reply a comment,set parentCommentId for this new reply
    const parentCommentId = computed(() => {
      return props.comment.parentCommentId
        ? props.comment.parentCommentId
        : props.comment.id;
    });

    function replyComment() {
      isReplying.value = !isReplying.value;
      commentInitContent.value = `@${props.comment.userName} `;
    }

    function setCommentContentWhenEdit() {
      return props.comment.replyingTo
        ? `@${props.comment.replyingTo} ${props.comment.content}`
        : props.comment.content;
    }

    function editComment() {
      isEditing.value = !isEditing.value;
      setTimeout(() => {
        if (!textareaEl.value) return;
        textareaEl.value.focus();
      }, 200);
    }

    const { split } = useAddComment();

    async function updateComment() {
      try {
        isEditing.value = false;
        const { replyingTo, content } = split(commentContent.value);
        const comment = {
          replyingTo,
          content,
          id: props.comment.id,
        };

        store.dispatch("comment/updateComment", comment);
      } catch (err) {
        handleError(err.message);
      }
    }

    async function deleteComment() {
      try {
        await store.dispatch("comment/deleteComment", props.comment.id);
        closeModal();
      } catch (err) {
        handleError(err.message);
      }
    }

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
      commentInitContent,
      commentContent,
      updateComment,
      isLoading,
      comments,
      addScore,
      deductScore,
      showModal,
      closeModal,
      modalIsOpen,
      textareaEl,
      errorMsg,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/comment-list-item.scss";
</style>
