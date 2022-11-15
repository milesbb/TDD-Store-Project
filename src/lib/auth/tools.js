import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import UsersModel from "../../users/model.js";

export const createTokens = async (user) => {
  const accessToken = await createAccessToken({
    _id: user._id,
    role: user.role,
  });
  const refreshToken = await createRefreshToken({ _id: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (accessToken) =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    })
  );

const createRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_SECRET,
      { expiresIn: "1w" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

const verifyRefreshToken = (accessToken) =>
  new Promise((res, rej) =>
    jwt.verify(
      accessToken,
      process.env.REFRESH_SECRET,
      (err, originalPayload) => {
        if (err) rej(err);
        else res(originalPayload);
      }
    )
  );

export const verifyRefreshAndCreateNewTokens = async (currentRefreshToken) => {
  try {
    const refreshTokenPayload = await verifyRefreshToken(currentRefreshToken);

    const user = await UsersModel.findById(refreshTokenPayload._id);
    if (!user)
      throw new createHttpError(
        404,
        `User with id ${refreshTokenPayload._id} not found!`
      );
    if (user.refreshToken && user.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(user);
      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    throw new createHttpError(401, "Refresh token not valid!");
  }
};
