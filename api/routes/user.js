// packages imported
const express = require('express');
const router = express.Router();
//own imports
const checkAuth = require('../middleware/check-auth');

const AuthController = require('../controllers/auth');

router.get('/test', checkAuth, (req, res, next) => {
    console.log('test');
    res.json({
        header: req.headers
    })
})

router.post('/signup', AuthController.register);

router.post('/login', AuthController.login)

router.delete('/:userId', (req, res, next) => {
    User.remove({
            _id: req.params.userId
        }).exec()
        .then(() => {
            return res.status(200).json({
                message: 'User has been deleted'
            })
        })
        .catch(err => {
            console.log(err);
        })
})

router.post('/google_auth', AuthController.googleAuth);

module.exports = router;