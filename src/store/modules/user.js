import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const user = {
  namespaced: true,
  state() {
    return {
      userId: null,
      userName: null,
      userImg: null,
    };
  },
  getters: {},
  actions: {
    async getCurrentUser({ commit }, userId) {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        const user = {
          ...docSnap.data(),
          userId,
        };

        commit("setCurrentUser", user);
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  mutations: {
    setCurrentUser(state, { userId, userName, userImg }) {
      state.userId = userId;
      state.userName = userName;
      state.userImg = userImg;
    },
  },
};
