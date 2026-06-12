const asId = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
};

export function getPostOwnerId(post) {
  return asId(
    post?.userId ??
      post?.user_id ??
      post?.guideId ??
      post?.guide_id ??
      post?.memberId ??
      post?.member_id ??
      post?.authorId ??
      post?.author_id ??
      post?.writerId ??
      post?.writer_id ??
      post?.user?.id ??
      post?.member?.id ??
      post?.guide?.userId ??
      post?.guide?.user_id ??
      post?.guide?.id
  );
}

export function isOwnPost(post, currentUserId = localStorage.getItem("userId")) {
  const ownerId = getPostOwnerId(post);
  const viewerId = asId(currentUserId);
  return Boolean(ownerId && viewerId && ownerId === viewerId);
}
