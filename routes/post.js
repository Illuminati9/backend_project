const express = require('express')
const router = express.Router()

const {createPost,editPost, deletePost,getPost,getPosts,getUserPost,getUserPosts} = require('../controllers/post.js')
const {likePost, createComment, deleteComment} = require('../controllers/postReaction.js')
const {auth,isUser} = require('../middlewares/middleware')

router.post('/createPost',auth,createPost);
router.put('/editPost/:postId',auth,editPost);
router.delete('/deletePost/:postId',auth,deletePost);
router.get('/getUserPost/:postId',auth,getUserPost);
router.get('/getUserPosts',auth,getUserPosts);


router.get('/getPost/:postId',auth,getPost);
router.get('/getPosts',auth,getPosts);


//! likes
router.post('/likePost/:postId',auth,likePost);

//! comments
router.post('/createComment/:postId',auth,createComment);
router.delete('/post/:postId/deleteComment/:commentId',auth,deleteComment);


module.exports=router;