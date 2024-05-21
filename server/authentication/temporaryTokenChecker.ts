import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PassportStatic } from 'passport';
import redis from '../db/redis';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.KEY_TEMPORARY_TOKEN ?? '',
};

const temporaryTokenChecker = (passport: PassportStatic) => passport.use(
  'jwt-temporary',
  new JwtStrategy(options, async ({ phone }, done) => {
    try {
      const cacheData = await redis.get(phone);
      if (cacheData) {
        done(null, JSON.parse(cacheData));
      } else {
        done(null, false);
      }
    } catch (e) {
      console.log(e);
    }
  }),
);

export default temporaryTokenChecker;
