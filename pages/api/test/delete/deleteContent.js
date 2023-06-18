import connectMongo from "@/utils/connectMongo";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { v2 as cloudinary } from 'cloudinary';

export default async function deleteComment(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to mongo');
        console.log('Fetching document');
        if(req.body.type === 'publicación') {
            await Post.findByIdAndDelete(req.body.contentId);
            const posts = await Post.find();
            res.status(200).json({posts});
        } else if(req.body.type === 'comentario') {
            const post = await Post.findById(req.body.contentId.postId);
            const commentIndex = post.comments.findIndex(com => com.commentId === req.body.contentId.commentId);
            post.comments.splice(commentIndex, 1);
            post.markModified('comments');
            await post.save();
            const updatedPost = await Post.find();
            res.status(200).json({updatedPost});
        } else if(req.body.type === 'foto de perfil') {
            const user = await User.findById(req.body.contentId);
            user.profilePicture = '';
            await user.save();
            const updatedUser = await User.findById(req.body.contentId);
            res.status(200).json({updatedUser});
        } else if(req.body.type === 'fondo de perfil') {
            const user = await User.findById(req.body.contentId);
            user.bannerPicture = '';
            await user.save();
            const updatedUser = await User.findById(req.body.contentId);
            res.status(200).json({updatedUser});
        } else if(req.body.type === 'cuenta') {
            await User.findByIdAndDelete(req.body.contentId);
            await cloudinary.api.delete_resources_by_prefix(`/${contentId}`);
            await cloudinary.api.delete_folder(`${contentId}`);
        }
        console.log('Fetched document');
    } catch (error) {
        console.log(error);
        res.json({error});
    }
}