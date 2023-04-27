import React, { useState, useEffect } from 'react'
import UserAvatar from '../../reusableComponent/userAvatar';
import useAuthentication from '../../../hooks/isAuthenticated';
import ApiCall from '../../../API/Api-call';
import { useParams } from "react-router-dom";

 const CreateComment = () => {
  const postId = useParams();
  const { authenticated, data } = useAuthentication();
  const [comment, setComment] = useState<string>('');
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>)  => {
    event.preventDefault();
    try {
      const response = ApiCall('post', 'http://localhost:4000/comment',{
        comment,
        postId
      })
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  
  return (
    <div className="flex gap-6 flex-row">
      <div className='rounded-full bg-slate-600 h-8 w-8 flex items-center justify-center'>
        {authenticated ? ( <UserAvatar
            profilePicture={data?.profilePicture}
            displayName={data?.displayName}
          />): ("D") }
       
      </div>
   
    <form onSubmit={handleSubmit} className="w-full">
      <textarea
        className="w-full border p-2 resize-y"
        id="email-input"
        placeholder="Comment"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button className="bg-slate-600 px-6 py-2 text-white rounded-lg">
        Submit
      </button>
    </form>
  </div>
  )
}
export default CreateComment;