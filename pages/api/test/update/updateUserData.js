import connectMongo from "@/utils/connectMongo";
import User from "@/models/userModel";
import { v4 as uuidv4 } from "uuid";

export default async function updateUserData(req, res) {
    try {
        console.log('Connecting to Mongo');
        await connectMongo();
        console.log('Connected to Mongo');

        console.log('Fetching document');
        const user = await User.findById(req.body.userId);
        console.log(req.body);

        if(req.body.username) {
            user.username = req.body.username;
        }
        if(req.body.password) {
            user.password = req.body.password;
        }
        if(req.body.imageUrl) {
            if(req.body.type === 'pfp') {
                user.profilePicture = req.body.imageUrl;
            } else if(req.body.type === 'banner') {
                user.bannerPicture = req.body.imageUrl;
            }
        }
        if(req.body.description) {
            user.description = req.body.description;
        }
        if(req.body.details) {
            user.location = req.body.details.locationValue;
            user.hobby = req.body.details.hobbyValue;
            user.book = req.body.details.bookValue;
            user.videogame = req.body.details.videogameValue;
            console.log(req.body.details)
            console.log(user.hobby)
        }

        if(req.body.newEmail) {
            user.email = req.body.newEmail;
        }

        if(req.body.followedUser) {
            const followedUser = await User.findById(req.body.followedUser);
            if(req.body.action === 'follow') {
                user.followed.push(req.body.followedUser);
                followedUser.followers.push(req.body.userId);

                const notif = {
                    message: `${user.username} ha empezado a seguirte`,
                    url: `/profile/${user._id}`,
                    id: uuidv4()
                };
                followedUser.notifications.unshift(notif);
                followedUser.markModified('notifications');
                await followedUser.save();

            } else {
                const index1 = user.followed.indexOf(req.body.followedUser);
                user.followed.splice(index1, 1);

                const index2 = followedUser.followers.indexOf(req.body.userId);
                followedUser.followers.splice(index2, 1);
            }
            user.markModified('followed');
            followedUser.markModified('followers');
            await followedUser.save();
        }

        await user.save();
        console.log('Fetched document');

        const updatedUser = await User.findById(req.body.userId);
        console.log(updatedUser);
        res.status(200).json({updatedUser});

    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}