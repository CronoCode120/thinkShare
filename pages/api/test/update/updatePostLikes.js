import connectMongo from "@/utils/connectMongo";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { v4 as uuidv4 } from "uuid";

export default async function updatePostLikes(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to Mongo');
        console.log('Fetching post');
        const post = await Post.findById(req.body.postId);
        console.log('Fetched post');

        console.log(req.body.userId);

        if(req.body.action === 'like') {
            post.likes.push(req.body.userId);

            const postAuthor = await User.findById(post.author);
            const notif = {
                message: "A alguien le ha gustado tu publicación",
                url: `/post/${post._id}`,
                id: uuidv4()
            };
            postAuthor.notifications.unshift(notif);
            postAuthor.markModified('notifications');
            await postAuthor.save();
        } else {
            const index = post.likes.indexOf(req.body.userId);
            post.likes.splice(index, 1);
        }
        
        post.markModified('likes');
        await post.save();

        const updatedPost = await Post.findById(req.body.postId);
        const postAuthor = await User.findById(post.author);
        console.log(updatedPost);
        res.status(200).json( {updatedPost, postAuthor} );

    } catch (error) {
        console.log(error);
        res.status(400).json({error});
    }
    


}