import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Debes tener al menos 18 años.']
    },
    profilePicture: String,
    description: String,
    bannerPicture: String,
    location: String,
    hobby: String,
    followed: Array,
    followers: Array,
    notifications: Array,
    book: {
        type: String
    },
    videogame: {
        type: String
    }
});

const User = models.User || model('User', userSchema);

export default User;