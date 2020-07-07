import express, { Request, Response } from "express";
import { body, validationResult, Result, ValidationError } from "express-validator";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { JsonObject } from "type-fest";
import { User } from "../entity";
import { generateUserToken } from "./token";


/**
 * 不需要凭证就能访问的路由
 */
const publicRouter = express.Router();


publicRouter.post("/signin", [
  body("username").notEmpty(),
  body("password").notEmpty()
], async (req: Request, res: Response<Result<ValidationError> | string | JsonObject>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(errors);
  }

  const db = getManager();
  const { username, password } = req.body;

  try {
    const user = await db.findOneOrFail(User, { username: username, password: password });
    const token = generateUserToken(user);
    res.status(HTTP_STATUS.OK).send({ token });
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.UNAUTHORIZED).send("账号不存在");
  }
});


publicRouter.post("/registerName", async (req, res) => {
  const db = getManager();
  const { username } = req.body;

  const user = await db.findOne(User, { username: username });
  if (user) {
    res.status(HTTP_STATUS.OK).send(false);
  } else {
    res.status(HTTP_STATUS.OK).send(true);
  }
});


publicRouter.post("/register", async (req, res) => {
  const db = getManager();
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(HTTP_STATUS.CONFLICT).send("两次输入的密码不一致");
    return;
  }

  const user = await db.save(new User(username, password));
  res.status(HTTP_STATUS.OK).send({ token: generateUserToken(user) });
});


export {
  publicRouter
};
