import { Request, Response, NextFunction } from 'express';
import { PassportRequest } from '../db/tables/Users';
import RolesEnum from '../types/user/enum/RolesEnum';

const checkRoleAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dataValues: { role } } = req.user as PassportRequest;
    if (role === RolesEnum.ADMIN) {
      next();
    } else {
      res.sendStatus(403);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

export default checkRoleAccess;
