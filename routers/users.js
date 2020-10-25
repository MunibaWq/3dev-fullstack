const userRouter = require('express').Router();
const { body, validationResult } = require('express-validator');

const { userDoc } = require('../db/mongoose');

/**
 * @api {post} /api/users Create a New User.
 * @apiName PostUser
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiSuccess {object} user Newly Created User information.
 * @apiSuccess {String} username User's username
 *
 * @apiSuccessExample {json} Success-Response:
 * 		HTTP/1.1 200 OK
 * 		{
 * 			"username": "John Doe"
 * 		}
 */
userRouter.post(
	'/',
	[
		body('username').isString().isLength({ min: 5, max: 100 }),
		body('password').isString().isLength({ min: 6, max: 100 }),
		body().custom((body) => (Object.keys(body).length < 3 ? Promise.resolve() : Promise.reject())),
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
