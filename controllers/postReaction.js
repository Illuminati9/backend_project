const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(like => like.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: "Post liked successfully"
        });
    } catch (error) {
        console.error("Error in likePost:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.createComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { content } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const comment = new Comment({
            userId,
            postId,
            content
        });

        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        res.status(201).json({
            success: true,
            message: "Comment posted successfully",
            post
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.likeComment = async (req, res) => {
    try {
        const userId = req.user._id;

        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (comment.likes.includes(userId)) {
            comment.likes = comment.likes.filter(like => like.toString() !== userId.toString());
        } else {
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: "Comment liked successfully",
            comment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user._id;

        const { commentId,postId } = req.params;

        const comment = await Comment
            .findById(commentId)
            .populate('userId', 'email');
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (comment.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if(post.comments.includes(commentId)){
            post.comments = post.comments.filter(comment => comment.toString() !== commentId.toString());
        }else{
            return res.status(404).json({
                success: false,
                message: "Comment not found in post"
            });
        }

        post.comments = post.comments.filter(comment => comment.toString() !== commentId.toString());
        await post.save();
        
        await Comment.deleteOne({ _id: commentId });

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

