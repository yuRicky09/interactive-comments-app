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
          // 監聽realtime data的snapshot是一發現有change(如寫入動作等)就會觸發。
          // 但如果當有使用firebase的serverTimestamp寫入時間時，此方法會要靠後端計算才寫入值(可能幾0.幾毫秒)，
          // 所以此時觸發的snapshot的寫入時間值有可能為null(因還未寫入完成)造成後續取用時間時使用toDate()報錯，
          // 所以多加一個判斷hasPendingWrites 當還有尚未寫入完成的資料時就return，當後端完整寫入完成時又會觸發snapshot這時再做....
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
        console.log(err);
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
        console.log(err);
      } finally {
        commit("changeLoadingState", false);
      }
    },
    async deleteComment(_, commentId) {
      try {
        const docRef = doc(db, "comments", commentId);
        await deleteDoc(docRef);
      } catch (err) {
        console.log(err);
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
        console.log(err);
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
        console.log(err);
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
