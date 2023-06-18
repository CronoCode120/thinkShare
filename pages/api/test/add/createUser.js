import connectMongo from "@/utils/connectMongo";
import User from "@/models/userModel";

export default async function createUser(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to mongo');

        console.log('Creating document');
        const user = await User.create(req.body);
        console.log('Created document');

        res.status(200).json({ user });

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}