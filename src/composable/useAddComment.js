export function useAddComment() {
  function split(commentContent) {
    let replyingTo;
    let content;

    if (commentContent.startsWith("@")) {
      const firstBlankIndex = commentContent.indexOf(" ");
      const hasContent = commentContent.slice(firstBlankIndex).trim();
      // -1 mean the value is not found.
      if (firstBlankIndex !== -1 && hasContent) {
        // remove '@', only slice name
        replyingTo = commentContent.slice(1, firstBlankIndex);
        content = hasContent;
      } else {
        replyingTo = commentContent.slice(1);
        content = null;
      }
    } else if (!commentContent.startsWith("@")) {
      content = commentContent;
      replyingTo = null;
    }

    return {
      replyingTo,
      content,
    };
  }

  return {
    split,
  };
}
