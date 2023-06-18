import connectMongo from "@/utils/connectMongo";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { v4 as uuidv4 } from "uuid";

export default async function updatePostComments(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to mongo');

        console.log('Creating document');
        const post = await Post.findById(req.body.id);
        console.log('Created document');
        
        const checkPostComments = post.comments.findIndex(com => com.commentId === req.body.data.commentId);
        if(checkPostComments === -1) {
            post.comments = [req.body.data, ...post.comments];

            const postAuthor = await User.findById(post.author);
            const notif = {
                message: "Alguien ha comentado tu publicación",
                url: `/post/${post._id}`,
                id: uuidv4()
            };
            postAuthor.notifications.unshift(notif);
            postAuthor.markModified('notifications');
            await postAuthor.save();
            await post.save();

            const updatedPost = await Post.findById(req.body.id).exec();
            const updatedPostAuthor = await User.findById(post.author);
            res.status(200).json({ updatedPost, updatedPostAuthor });
        } else {
            console.log('comment found!')
            post.comments[checkPostComments].content = req.body.data.newContent;
            post.markModified(`comments`);
            
            await post.save();
            const updatedPost = await Post.findById(req.body.id).exec();
            res.status(200).json({ updatedPost });
        }

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}