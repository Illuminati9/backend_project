const { postS3Url } = require("../utils/constants");
const Post = require('../models/post.js')
const User = require('../models/user.js');
const { uploadImageToS3_Type2, getObjectUrl, deleteObjectUrl } = require("../config/s3Server");

const fs = require('fs');
const mongoose = require('mongoose');

exports.createPost = async (req, res) => {
    try {

        console.log(req.body, req.files);

        if (req.body.jsonData === undefined || req.files.file === undefined) {
            return res.status(400).json({
                success: false,
                message: "Something went wrong with input data.",
            });
        }

        const jsonData = JSON.parse(req.body.jsonData);
        const { title, content } = jsonData;
        const userId = req.user.id;
        const images = req.files.file;

        console.log(images, title, content);

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields",
            });
        }

        if (!images) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        const post = await Post.create({
            userId: userId,
            title: title,
            content: content,
        })

        const imageArray = [];
        for (let i = 0; i < images.length; i++) {
            const filePath = `${postS3Url}/${userId}/${post._id}/${i}`;
            const fileStream = fs.createReadStream(images[i].tempFilePath);

            await uploadImageToS3_Type2({
                filePath: filePath,
                contentType: images[i].mimetype,
                body: fileStream,
            });

            const imageUrl = await getObjectUrl(filePath);
            imageArray.push(imageUrl);
        }

        post.image = imageArray;

        await post.save();


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.posts.push(post._id);

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: post,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "Post not created",
            error: e.message,
        })
    }
}

exports.editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { jsonData } = req.body;
        const { title, content } = JSON.parse(jsonData);
        const images = req.files.file;
        const userId = req.user.id;

        console.log(postId, title, content, images, userId)

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields",
            });
        }

        if (!images) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this post",
            });
        }

        post.title = title;
        post.content = content;

        for (let i = 0; i < post.image.length; i++) {
            console.log('i\n');
            const filePath = `${postS3Url}/${userId}/${post._id}/${i}`;
            await deleteObjectUrl(filePath);
        }

        console.log('Photos Deleted successfully')

        post.image = [];

        for (let i = 0; i < images.length; i++) {
            console.log('i\n');
            const filePath = `${postS3Url}/${userId}/${post._id}/${i}`;
            const fileStream = fs.createReadStream(images[i].tempFilePath);

            await uploadImageToS3_Type2({
                filePath: filePath,
                contentType: images[i].mimetype,
                body: fileStream,
            });

            const imageUrl = await getObjectUrl(filePath);
            post.image.push(imageUrl);
        }

        console.log('Photos Deleted successfully')

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post edited successfully",
            post: post,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Post not edited",
            error: e.message,
        })
    }
}

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        for (let i = 0; i < user.posts.length; i++) {
            if (user.posts[i].toString() === postId) {
                user.posts.splice(i, 1);
                break;
            }
        }

        await user.save();

        if (post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post",
            });
        }

        for (let i = 0; i < post.image.length; i++) {
            console.log('i\n');
            const filePath = `${postS3Url}/${userId}/${post._id}/${i}`;
            await deleteObjectUrl(filePath);
        }

        console.log('Photos Deleted successfully')

        await Post.deleteOne({ _id: postId });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Post not deleted",
            error: e.message,
        })
    }
}

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ createdAt: -1 });

        if (!posts) {
            return res.status(404).json({
                success: false,
                message: "Posts not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Posts found successfully",
            posts: posts,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Posts not found",
            error: e.message,
        })
    }
}

exports.getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }

        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post found successfully",
            post: post,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Post not found",
            error: e.message,
        })
    }
}

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 });

        if (posts==undefined) {
            return res.status(404).json({
                success: false,
                message: "Posts not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Posts found successfully",
            posts: posts,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Posts not found",
            error: e.message,
        })
    }
}

exports.getUserPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id or post id",
            });
        }

        const post = await Post.findOne({ userId: userId, _id: postId });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post found successfully",
            post: post,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Post not found",
            error: e.message,
        })
    }
}
