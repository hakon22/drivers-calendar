import { Request, Response, NextFunction } from 'express';
import CheckIpService from '../utilities/checkIPService';

const getClientIp = (req: Request) => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor && !Array.isArray(xForwardedFor)) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress;
};

const accessTelegramMiddleware = (request: Request, response: Response, next: NextFunction) => {
  const subnets = [
    '91.108.4.0/22',
    '91.105.192.0/23',
    '91.108.8.0/22',
    '91.108.12.0/22',
    '91.108.16.0/22',
    '91.108.20.0/22',
    '91.108.56.0/23',
    '91.108.58.0/23',
    '95.161.64.0/20',
    '149.154.160.0/20',
    '149.154.160.0/21',
    '149.154.168.0/22',
    '149.154.172.0/22',
    '185.76.151.0/24',
  ];

  if (subnets.find((subnet) => CheckIpService.isCorrectIP(getClientIp(request) as string, subnet))) {
    return next();
  }

  return response.status(401).json({ message: 'Unauthorized' });
};

export default accessTelegramMiddleware;
