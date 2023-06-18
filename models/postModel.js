import { Schema, model, models } from "mongoose";

const postSchema = new Schema({
    author : {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comments: Array,
    date: {
        dateInMs: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    },
    likes: Array
});

const Post = models.Post || model('Post', postSchema);

export default Post;