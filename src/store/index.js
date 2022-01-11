import { createStore } from "vuex";
import { comment } from "@/store/modules/comment";
import { user } from "@/store/modules/user";

export default createStore({
  modules: {
    comment,
    user,
  },
});
