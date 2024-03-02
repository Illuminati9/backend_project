const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 500,
    },
    image: [{
        type: String,
    }],
    likes: {
        type: Number,
        default: 0
    },
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            content: {
                type: String,
                required: true,
                trim: true,
                minlength: 2,
                maxlength: 500,
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Post', postSchema)