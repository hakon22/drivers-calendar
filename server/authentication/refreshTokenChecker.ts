import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStatic } from 'passport';
import Users from '../db/tables/Users.js';
import { generateAccessToken, generateRefreshToken } from './tokensGen.js';

const optionsRefresh = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.KEY_REFRESH_TOKEN ?? '',
};

const refreshTokenChecker = (passport: PassportStatic) => passport.use(
  'jwt-refresh',
  new JwtStrategy(optionsRefresh, async ({ id, phone }, done) => {
    try {
      const user = await Users.findOne({ where: { id } });
      if (user) {
        const token = generateAccessToken(id, phone);
        const refreshToken = generateRefreshToken(id, phone);
        done(null, { ...user, token, refreshToken });
      } else {
        done(null, false);
      }
    } catch (e) {
      console.log(e);
    }
  }),
);

export default refreshTokenChecker;
