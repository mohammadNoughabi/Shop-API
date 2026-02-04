import express from 'express';

import userController from './user.controller.ts';

const userRouter = express.Router();

userRouter.get('/profile/:id', userController.getProfile);
userRouter.post('/delete-account/:id', userController.deleteAccount);

export default userRouter;
