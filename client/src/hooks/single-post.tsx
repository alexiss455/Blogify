import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../API/Api-call";
// interface hook
import { PostObj } from "../interface/hook/PostObj";
import { Comment } from "../interface/hook/CommentObj";

const singlePost = () => {
  const postId = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<Comment[]>([]);
  const [post, setPost] = useState<PostObj>({
    _id: '',
    userId: '',
    displayName: '',
    title: '',
    content: '',
    date: '',
    profilePicture: '',
    numComments: 0 
  });

  const fetchSinglePost = async () => {
    try {
      const response = await ApiCall(
        "get",
        `http://localhost:4000/route/single-post/${postId.postId}`
      );
      console.log(response);
      setPost(response.data.post[0]);
      setComment(response.data.comments);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSinglePost();
  }, []);

  return { post, comment, loading };
};

export default singlePost;
