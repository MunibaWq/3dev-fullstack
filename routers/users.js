/** Express router providing user related routes
 * @module routers/users
 * @requires express
 */

/**
 * express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace userRouter
 */
const userRouter = express.Router();
const { body, validationResult } = require('express-validator');

const { userDoc } = require('../db/mongoose');

/**
 * Route for Creating a new User.
 * @name post/api/users
 * @function
 * @memberof module:routers/users~usersRouter
 * @inner
 * @param {string} path - Express path
 * @param {object} validation - Express Validator Options
 * @param {callback} middelware - Express middleware
 */
userRouter.post(
	'/',
	[
		body('username').isString().isLength({ min: 5 }),
		body('password').isString().isLength({ min: 6 }),
		body().custom((body) => (Object.keys(body).length < 4 ? Promise.resolve() : Promise.reject())),
	],
	async (req, res) => {
		try {
			console.log('POST');
			console.log(req.body);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			//validate every property from start to finish
			//here we skipped password hashing and strength
			//here we skipped username validation (is string length min max)
			if (req.body.password !== req.body.password2) {
				return res.sendStatus(401);
			}
			const newUser = new userDoc(req.body);
			const userRes = await newUser.save();
			if (!userRes) {
				throw new Error('failed to make user');
			}

			userRes.password = undefined;

			return res.json(userRes);
		} catch (e) {
			console.error(e);
			return res.sendStatus(400);
		}
	}
);

module.exports = userRouter;
