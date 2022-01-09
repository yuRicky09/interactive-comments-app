import moment from "moment";
import { ref } from "vue";

export function useTimeFormat(time) {
  const createdAt = ref();

  createdAt.value = moment(time, "YYYYMMDD").fromNow();

  return {
    createdAt,
  };
}
