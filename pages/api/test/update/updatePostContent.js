import connectMongo from "@/utils/connectMongo";
import Post from "@/models/postModel";

export default async function updatePostContent(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to mongo');

        console.log('Fetching document');
        const post = await Post.findById(req.body.id);
        post.content = req.body.content;
        await post.save();
        console.log('Fetched document');

        const updatedPost = await Post.findById(req.body.id);
        res.status(200).json({updatedPost});

    } catch (error) {
        console.log(error);
        res.json({error});
    }
}