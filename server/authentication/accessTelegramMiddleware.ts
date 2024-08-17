import { Request, Response, NextFunction } from 'express';
import CheckIpService from '../utilities/checkIPService';

const accessTelegramMiddleware = (request: Request, response: Response, next: NextFunction) => {
  const subnets = [
    '91.108.4.0/22',
    '149.154.160.0/20',
  ];

  if (subnets.find((subnet) => CheckIpService.isCorrectIP(request.ip as string, subnet))) {
    return next();
  }

  return response.status(401).json({ message: 'Unauthorized' });
};

export default accessTelegramMiddleware;
