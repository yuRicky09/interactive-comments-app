import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

export const comment = {
  namespaced: true,
  state() {
    return {
      comments: [],
      unsubscribeId: null,
      isLoading: false,
    };
  },
  getters: {
    getRootComments(state) {
      return state.comments.filter((comment) => !comment.parentCommentId);
    },
  },
  actions: {
    async getAllComments({ commit }) {
      try {
        const collectionRef = collection(db, "comments");
        const q = query(collectionRef, orderBy("createdAt"));

        const snapshot = await getDocs(q);

        const comments = [];
        snapshot.docs.forEach((doc) => {
          comments.push({ ...doc.data(), id: doc.id });
        });

        commit("setAllComments", comments);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    handleCommentsChange({ commit }) {
      const collectionRef = collection(db, "comments");
      const q = query(collectionRef, orderBy("createdAt"));

      const unsubscribeId = onSnapshot(
        q,
        { includeMetadataChanges: true },
        (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const comments = [];
          snapshot.docs.forEach((doc) => {
            comments.push({ ...doc.data(), id: doc.id });
          });

          commit("setAllComments", comments);
        }
      );

      commit("setUnsubscribeId", unsubscribeId);
    },
    async addComment(
      { commit, rootState },
      { content, parentCommentId, replyingTo }
    ) {
      try {
        commit("changeLoadingState", true);

        const comment = {
          content,
          parentCommentId,
          userId: rootState.user.userId,
          userImg: rootState.user.userImg,
          userName: rootState.user.userName,
          scores: [],
          replyingTo,
          createdAt: serverTimestamp(),
        };

        const collectionRef = collection(db, "comments");

        await addDoc(collectionRef, comment);
      } catch (err) {
        throw new Error(err.message);
      } finally {
        commit("changeLoadingState", false);
      }
    },
    async updateComment({ commit }, { replyingTo, content, id }) {
      try {
        commit("changeLoadingState", true);

        const docRef = doc(db, "comments", id);
        await updateDoc(docRef, {
          replyingTo,
          content,
        });
      } catch (err) {
        throw new Error(err.message);
      } finally {
        commit("changeLoadingState", false);
      }
    },
    async deleteComment(_, commentId) {
      try {
        const docRef = doc(db, "comments", commentId);
        await deleteDoc(docRef);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    async addScore({ rootState }, commentId) {
      try {
        const userId = rootState.user.userId;
        const docRef = doc(db, "comments", commentId);

        await updateDoc(docRef, {
          scores: arrayUnion(userId),
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    async deductScore({ rootState }, commentId) {
      try {
        const userId = rootState.user.userId;
        const docRef = doc(db, "comments", commentId);

        await updateDoc(docRef, {
          scores: arrayRemove(userId),
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  mutations: {
    setAllComments(state, comments) {
      state.comments = comments;
    },
    setUnsubscribeId(state, unsubscribeId) {
      state.unsubscribeId = unsubscribeId;
    },
    changeLoadingState(state, isLoading) {
      state.isLoading = isLoading;
    },
  },
};
