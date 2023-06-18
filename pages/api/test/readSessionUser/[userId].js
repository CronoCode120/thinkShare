import connectMongo from "@/utils/connectMongo";
import User from "@/models/userModel";

export default async function readSessionUser(req, res) {
    try {
        await connectMongo();
        const sessionUser = await User.findById(req.query.userId);
        res.json(sessionUser);
    } catch (error) {
        console.log(error);
        res.json({error});
    }
}