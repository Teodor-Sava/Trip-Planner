const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('../../config/config');

exports.register = (req, res, next) => {
    // search for other occurences of the user
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length > 0) {
                return res.status(422).json({
                    message: 'User email already exists'
                });
            } else {
                // create user object if none was found
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        })

                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    'message': 'User created'
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                return res.status(500)
                                    .json({
                                        error: err
                                    })
                            })
                    }
                })
            }
        })
        .catch(err => {
            console.log(err);
        });

}

exports.login = (req, res, next) => {
    User.findOne({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401)
                    .json({
                        message: 'Auth failed'
                    });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(result => {
                    if (result) {
                        // user is logged in and generate token
                        const token = jwt.sign({
                            userId: user._id,
                            email: user.email,
                        }, config.app.keys.jwt_sign, {
                            expiresIn: '1h'
                        });
                        return res.status(200).json({
                            message: 'Auth success',
                            token: token
                        })
                    } else {
                        return res.status(401).json({
                            message: 'Auth failed'
                        })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        error: err
                    })
                })
        })
        .catch(err => {
            console.log(err);
        })
}