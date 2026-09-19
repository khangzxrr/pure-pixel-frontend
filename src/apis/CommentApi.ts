import http from "../configs/Http"; // Assuming `http` is the configured Axios instance
import type { ResponseOf } from "./types";

// Fetch all comments for a photo
const getComments = async (photoId: string) => {
  const response = await http.get<
    ResponseOf<"PhotoCommentController_getComments">
  >(`/comment/photo/${photoId}`);
  return response.data;
};

// Add a new comment to a photo
const addComment = async (photoId: string, content: string) => {
  const response = await http.post<
    ResponseOf<"PhotoCommentController_createComment">
  >(`/comment/photo/${photoId}`, { content });
  return response.data;
};

// Get replies of a specific comment
const getCommentReplies = async (photoId: string, commentId: string) => {
  const response = await http.get<
    ResponseOf<"PhotoCommentController_getCommentReply">
  >(`/comment/photo/${photoId}/comment/${commentId}`);
  return response.data;
};

// Update an existing comment by comment ID
const updateComment = async (
  photoId: string,
  commentId: string,
  content: string,
) => {
  const response = await http.patch<
    ResponseOf<"PhotoCommentController_updateComment">
  >(`/comment/photo/${photoId}/comment/${commentId}`, { content });
  return response.data;
};

// Delete a comment by comment ID
const deleteComment = async (photoId: string, commentId: string) => {
  const response = await http.delete<
    ResponseOf<"PhotoCommentController_deleteComment">
  >(`/comment/photo/${photoId}/comment/${commentId}`);
  return response.data;
};

// Add a reply to an existing comment
const replyToComment = async (
  photoId: string,
  commentId: string,
  content: string,
) => {
  const response = await http.post<
    ResponseOf<"PhotoCommentController_createReply">
  >(`/comment/photo/${photoId}/comment/${commentId}/reply`, { content });
  return response.data;
};

// Exporting as a single object
const CommentApi = {
  getComments, // Fetch all comments for a photo
  addComment, // Add a new comment to a photo
  getCommentReplies, // Fetch replies of a specific comment
  updateComment, // Update an existing comment
  deleteComment, // Delete a comment
  replyToComment, // Add a reply to a comment
};

export default CommentApi;
