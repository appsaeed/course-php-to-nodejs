const Comment = require('../model/Comment');
const Content = require('../model/Content');
const Like = require('../model/Like');
const Tutor = require('../model/Tutor');
const User = require('../model/User');
const Playlist = require('../model/Playlist');
const Controller = require('./Controller');

class TutorController extends Controller {

    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async profile(req, res) {

        const tutor_id = req.params?.tutor_id || '';
        const tutor = await (new Tutor()).find(tutor_id)
        
        const get_playlist = await (new Playlist()).where('tutor_id', tutor_id).get();
        const playlists = await Promise.all(get_playlist.map(async (list) => {
            const tutor = await (new Tutor()).find(list.tutor_id);
            return { ...list, tutor }
        }))

        const total_video = await (new Content()).where('tutor_id', tutor_id).count();
        const total_like = await (new Like()).where('tutor_id', tutor_id).count();
        const total_comment = await (new Comment()).where('tutor_id', tutor_id).count();

        res.render('tutor_profile', { 
            tutor, 
            playlists , 
            total_video, 
            total_like, 
            total_comment 
        })
    }
    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async search(req, res) {
        const search = String(req.query?.search || '');
        // const tutor_id = req.params?.tutor_id || '';
        const get_tutors = await (new Tutor()).where('name', 'LIKE', `%${search}%`)
        .get();


        const tutors = await Promise.all(get_tutors.map(async (tutor)=> {
            const total_playlists = await (new Playlist()).where('tutor_id', tutor.id).count();
            const total_likes = await (new Like()).where('tutor_id', tutor.id).count();
            const total_comments = await (new Comment()).where('tutor_id', tutor.id).count();
            const total_videos = await (new Content()).where('tutor_id', tutor.id).count();

            return {
                ...tutor,
                total_playlists,
                total_comments,
                total_videos,
                total_likes
            }
        }))

        return res.render('search_tutor', {  tutors, search })
    }
    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async watchVideo(req, res) {
        const user_id = res.locals?.user?.id || '';
        const video_id = req.params?.video_id || '';
        const video = await (new Content()).find(video_id);
        const tutor_id = video?.tutor_id || '';

        const tutor = await (new Tutor()).find(tutor_id);
        const total_like = await (new Like()).where('user_id', user_id).count();
        const all_comments = await (new Comment()).where('content_id', video_id).get();

        const commentsPomise = all_comments.map(async function (comment) {
            const user = await (new User()).find(comment.user_id)
            const tutor = await (new Tutor()).find(comment.tutor_id)
            return {
                ...comment,
                user: user,
                tutor: tutor,
            }
        })

        const comments = await Promise.all(commentsPomise)

        res.render('watch_video', {
            video: video,
            tutor: tutor,
            total_like: total_like,
            comments: comments
        })
    }

}

module.exports = TutorController