const Bookmark = require('../model/Bookmark');
const Comment = require('../model/Comment');
const Content = require('../model/Content');
const Like = require('../model/Like');
const Playlist = require('../model/Playlist');
const Tutor = require('../model/Tutor');
const User = require('../model/User');
const Controller = require('./Controller');

class PlaylistController extends Controller {

    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async index(req, res) {

        const playlist_id = req.params?.playlist_id || '';

        const playlist = await (new Playlist()).where({id : playlist_id, status : 'active'}).first();
        const videos = await (new Content()).where('playlist_id', playlist_id).get();

        const tutor_id = playlist?.tutor_id || '';
        const user_id = res.locals?.user_id || '';

        const tutor = await (new Tutor()).find(tutor_id);
        const totol_bookmarked = await (new Bookmark()).where({ playlist_id, user_id }).count()

        res.render('playlist', {
            playlist: playlist,
            videos,
            tutor: tutor,
            totol_bookmarked,
        })
    }
    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async watchVideo(req, res) {

        //get user from postgres database
        const user_id = res.locals?.user?.id || '';
        const video_id = req.params?.video_id || '';
        const video = await (new Content()).find(video_id);
        const tutor_id = video?.tutor_id || '';
        
        const tutor = await (new Tutor()).find(tutor_id);
        const likes = await (new Like()).where('content_id', video_id).get();
        const total_likes = likes.length;
        const liked = likes.find( (item ) => item.user_id == user_id)
        const all_comments = await (new Comment()).where('content_id', video_id).get();

        const comments = await Promise.all(all_comments.map(async function (comment) {
            const user = await (new User()).find(comment.user_id)
            const tutor = await (new Tutor()).find(comment.tutor_id)
            return {
                ...comment,
                user: user,
                tutor: tutor,
            }
        }))

        res.render('watch_video', {
            video: video,
            tutor: tutor,
            total_likes,
            comments,
            liked
        })
    }
    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async savePlaylist(req, res) {
        try {
            const user_id = res.locals?.user?.id || '';
            const playlist_id = req.body?.playlist_id || '';


            const bookmark = await (new Bookmark()).find(playlist_id, 'playlist_id');

            if(bookmark){

                await (new Bookmark()).where('playlist_id', playlist_id).delete();
                res.locals.messages = ['Playlist unsaved'];
                res.redirect('back');
            }else {

                await (new Bookmark()).insert({ playlist_id, user_id })
                
                res.locals.messages = ['Playlist saved'];
                res.redirect('back');
            }
        } catch (error) {
            res.locals.messages = ['Server error: ' + error.message];
            res.redirect('back');
        }
    }

    /**
     * Create view and logic for index
     * @param {import('express').Request} req 
     * @param {import('express').Response} res
     */
    static async searchCourse(req, res){
        const search = String(req.query?.search || '');
        const playlists = await (new Playlist())
        .where('title', 'LIKE', `%${search}%`)
        .where('status', 'active')
        .get();

        const courses = await Promise.all(playlists.map(async (item)=> {
            const tutor = await (new Tutor()).find(item.tutor_id);
            return {
                ...item,
                tutor
            }
        }))
        
        return res.render('search_course', {courses , search })
    }

}

module.exports = PlaylistController