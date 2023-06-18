export default async function likePost(postId, userId, action) {
    try {
        const res = await fetch('/api/test/update/updatePostLikes', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId: postId,
                userId: userId,
                action: action
            })
        });
        const data = await res.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }
}