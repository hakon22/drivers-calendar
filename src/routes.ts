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
  // car
  fetchBrands: [serverHost, apiPath, 'car', 'fetchBrands'].join('/'),
  getModels: [apiPath, 'car', 'getModels'].join('/'),
  // sms
  confirmPhone: [apiPath, 'auth', 'confirmPhone'].join('/'),
  // index
  fetchAppData: [serverHost, apiPath, 'app', 'fetchAppData'].join('/'),
} as ApiUrl;
