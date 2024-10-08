/* eslint-disable import/no-cycle */
import express from 'express';
import passport from 'passport';
import Auth from './authentication/Auth.js';
import Car from './car/Car.js';
import Crew from './crew/Crew.js';
import Notification from './notification/Notification.js';
import checkRoleAccess from './authentication/checkRoleAccess.js';
import Telegram from './telegram/Telegram.js';
import accessTelegramMiddleware from './authentication/accessTelegramMiddleware.js';

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
router.post(`${apiPath}/auth/acceptInvitation`, jwtToken, Auth.acceptInvitation);
router.post(`${apiPath}/auth/changeUserProfile`, jwtToken, Auth.changeUserProfile);
router.get(`${apiPath}/auth/fetchUpdates`, jwtToken, Auth.fetchUpdates);
router.get(`${apiPath}/auth/readUpdates/:id`, jwtToken, Auth.readUpdates);
router.get(`${apiPath}/auth/unlinkTelegram`, jwtToken, Auth.unlinkTelegram);

// car
router.get(`${apiPath}/car/fetchBrands`, Car.fetchBrands);
router.get(`${apiPath}/car/fetchCarList`, jwtToken, Car.fetchCarList);
router.get(`${apiPath}/car/getModels/:brand`, Car.getModels);
router.post(`${apiPath}/car/createCar`, jwtToken, Car.createCar);
router.patch(`${apiPath}/car/updateCar/:id`, jwtToken, Car.updateCar);
router.post(`${apiPath}/car/addCar`, jwtToken, Car.addCar);
router.delete(`${apiPath}/car/removeCar/:id`, jwtToken, Car.removeCar);

// sms
router.post(`${apiPath}/auth/confirmPhone`, Auth.confirmPhone);

// crew
router.get(`${apiPath}/crew/fetchCrew`, jwtToken, Crew.fetchCrew);
router.post(`${apiPath}/crew/makeSchedule`, jwtToken, Crew.makeSchedule);
router.post(`${apiPath}/crew/inviteReplacement`, jwtToken, Crew.inviteReplacement);
router.post(`${apiPath}/crew/activeCarsUpdate`, jwtToken, Crew.activeCarsUpdate);
router.post(`${apiPath}/crew/swapShift`, jwtToken, Crew.swapShift);
router.post(`${apiPath}/crew/takeSickLeaveOrVacation`, jwtToken, Crew.takeSickLeaveOrVacation);
router.post(`${apiPath}/crew/cancelSickLeaveOrVacation`, jwtToken, Crew.cancelSickLeaveOrVacation);
router.post(`${apiPath}/crew/sendMessageToChat`, jwtToken, Crew.sendMessageToChat);
router.get(`${apiPath}/crew/readChatMessages`, jwtToken, Crew.readChatMessages);
router.get(`${apiPath}/crew/fetchChatMessages`, jwtToken, Crew.fetchChatMessages);
router.post(`${apiPath}/crew/endWorkShift`, jwtToken, Crew.endWorkShift);
router.patch(`${apiPath}/crew/changeIsRoundFuel`, jwtToken, Crew.changeIsRoundFuel);
router.patch(`${apiPath}/crew/changeFuelSeason`, jwtToken, Crew.changeFuelSeason);
router.patch(`${apiPath}/crew/changeIsWorkingWeekend`, jwtToken, Crew.changeIsWorkingWeekend);
router.get(`${apiPath}/crew/kickReplacement/:id?`, jwtToken, Crew.kickReplacement);
router.get(`${apiPath}/crew/fetchCrewList`, jwtToken, checkRoleAccess, Crew.fetchCrewList);
router.get(`${apiPath}/crew/fetchCrewByRef/:uuid`, Crew.fetchCrewByRef);

// notification
router.get(`${apiPath}/notification/fetchNotifications`, jwtToken, Notification.fetchNotifications);
router.get(`${apiPath}/notification/readUpdate/:id`, jwtToken, Notification.readUpdate);
router.get(`${apiPath}/notification/acceptNotification/:id`, jwtToken, Notification.acceptNotification);
router.delete(`${apiPath}/notification/remove/:id`, jwtToken, Notification.remove);

// telegram
router.post(`${apiPath}/telegram`, accessTelegramMiddleware, Telegram.webhooks);

export default router;
