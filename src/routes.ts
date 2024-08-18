const serverHost = `${process.env.NEXT_PUBLIC_SERVER_HOST}${process.env.NEXT_PUBLIC_PORT ?? 3001}`;
const apiPath = process.env.NEXT_PUBLIC_API_PATH ?? '/api';

interface ApiUrl {
  [key: string]: string;
}

export default {
  // pages
  homePage: '/',
  loginPage: '/login',
  signupPage: '/signup',
  welcomePage: '/welcome',
  recoveryPage: '/recovery',
  notFoundPage: '*',
  // auth
  login: [apiPath, 'auth', 'login'].join('/'),
  signup: [apiPath, 'auth', 'signup'].join('/'),
  logout: [apiPath, 'auth', 'logout'].join('/'),
  recoveryPassword: [apiPath, 'auth', 'recoveryPassword'].join('/'),
  updateTokens: [apiPath, 'auth', 'updateTokens'].join('/'),
  inviteSignup: [apiPath, 'auth', 'inviteSignup'].join('/'),
  acceptInvitation: [apiPath, 'auth', 'acceptInvitation'].join('/'),
  changeUserProfile: [apiPath, 'auth', 'changeUserProfile'].join('/'),
  fetchUpdates: [apiPath, 'auth', 'fetchUpdates'].join('/'),
  readUpdates: [apiPath, 'auth', 'readUpdates'].join('/'),
  unlinkTelegram: [apiPath, 'auth', 'unlinkTelegram'].join('/'),
  // car
  fetchBrands: [serverHost, apiPath, 'car', 'fetchBrands'].join('/'),
  fetchBrandsChange: [apiPath, 'car', 'fetchBrands'].join('/'),
  fetchCarList: [apiPath, 'car', 'fetchCarList'].join('/'),
  getModels: [apiPath, 'car', 'getModels'].join('/'),
  createCar: [apiPath, 'car', 'createCar'].join('/'),
  removeCar: [apiPath, 'car', 'removeCar'].join('/'),
  updateCar: [apiPath, 'car', 'updateCar'].join('/'),
  addCar: [apiPath, 'car', 'addCar'].join('/'),
  // sms
  confirmPhone: [apiPath, 'auth', 'confirmPhone'].join('/'),
  // notification
  fetchNotifications: [apiPath, 'notification', 'fetchNotifications'].join('/'),
  notificationReadUpdate: [apiPath, 'notification', 'readUpdate'].join('/'),
  notificationRemove: [apiPath, 'notification', 'remove'].join('/'),
  acceptNotification: [apiPath, 'notification', 'acceptNotification'].join('/'),
  // crew
  fetchCrew: [apiPath, 'crew', 'fetchCrew'].join('/'),
  makeSchedule: [apiPath, 'crew', 'makeSchedule'].join('/'),
  inviteReplacement: [apiPath, 'crew', 'inviteReplacement'].join('/'),
  activeCarsUpdate: [apiPath, 'crew', 'activeCarsUpdate'].join('/'),
  swapShift: [apiPath, 'crew', 'swapShift'].join('/'),
  takeSickLeaveOrVacation: [apiPath, 'crew', 'takeSickLeaveOrVacation'].join('/'),
  cancelSickLeaveOrVacation: [apiPath, 'crew', 'cancelSickLeaveOrVacation'].join('/'),
  sendMessageToChat: [apiPath, 'crew', 'sendMessageToChat'].join('/'),
  readChatMessages: [apiPath, 'crew', 'readChatMessages'].join('/'),
  fetchChatMessages: [apiPath, 'crew', 'fetchChatMessages'].join('/'),
  endWorkShift: [apiPath, 'crew', 'endWorkShift'].join('/'),
  changeIsRoundFuel: [apiPath, 'crew', 'changeIsRoundFuel'].join('/'),
  changeFuelSeason: [apiPath, 'crew', 'changeFuelSeason'].join('/'),
  kickReplacement: [apiPath, 'crew', 'kickReplacement'].join('/'),
  fetchCrewList: [apiPath, 'crew', 'fetchCrewList'].join('/'),
  fetchCrewByRef: [serverHost, apiPath, 'crew', 'fetchCrewByRef'].join('/'),
} as ApiUrl;
