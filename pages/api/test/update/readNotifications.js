import connectMongo from "@/utils/connectMongo";
import User from "@/models/userModel";

export default async function updateUserData(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to Mongo');

        console.log('Fetching document');
        const user = await User.findById(req.body.userId);
        console.log('Fetched document');

        const index = user.notifications.findIndex(notif => notif.id === req.body.notifId);
        const notifArray = [...user.notifications];
        notifArray.splice(index, 1);
        user.notifications = [...notifArray];
        user.markModified('notifications');
        await user.save();

        const updatedUser = await User.findById(req.body.userId);
        console.log(updatedUser);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}