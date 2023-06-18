import connectMongo from "@/utils/connectMongo";
import Post from "@/models/postModel";

export default async function createPost(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to mongo');

        console.log('Creating document');
        const post = await Post.create(req.body);
        console.log('Created document');

        res.status(200).json({ post });

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}