import express from 'express';
import passport from 'passport';
import Auth from './authentication/Auth.js';
import Car from './car/Car.js';
import Crew from './crew/Crew.js';
import Notification from './notification/Notification.js';

const router = express.Router();

const apiPath = process.env.NEXT_PUBLIC_API_PATH ?? '/api';

const jwtToken = passport.authenticate('jwt', { session: false });

// auth
router.post(`${apiPath}/auth/signup`, Auth.signup);
router.post(`${apiPath}/auth/login`, Auth.login);
router.post(`${apiPath}/auth/recoveryPassword`, Auth.recoveryPassword);
router.post(`${apiPath}/auth/logout`, Auth.logout);
router.get(`${apiPath}/auth/updateTokens`, passport.authenticate('jwt-refresh', { session: false }), Auth.updateTokens);
router.post(`${apiPath}/auth/inviteSignup`, passport.authenticate('jwt-temporary', { session: false }), Auth.inviteSignup);

// car
router.get(`${apiPath}/car/fetchBrands`, Car.fetchBrands);
router.get(`${apiPath}/car/getModels/:brand`, Car.getModels);

// sms
router.post(`${apiPath}/auth/confirmPhone`, Auth.confirmPhone);

// crew
router.get(`${apiPath}/crew/fetchCrew`, jwtToken, Crew.fetchCrew);
router.post(`${apiPath}/crew/makeSchedule`, jwtToken, Crew.makeSchedule);
router.post(`${apiPath}/crew/inviteReplacement`, jwtToken, Crew.inviteReplacement);

// notification
router.get(`${apiPath}/notification/fetchNotifications`, jwtToken, Notification.fetchNotifications);
router.get(`${apiPath}/notification/readUpdate/:id`, jwtToken, Notification.readUpdate);
router.delete(`${apiPath}/notification/remove/:id`, jwtToken, Notification.remove);

export default router;
