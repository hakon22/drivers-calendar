/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import type { Item } from '@/types/Item';

class Market {
  async getAll(req: Request, res: Response) {
    try {
      const items: Item[] = [
        {
          id: 1, name: 'Яблоко', description: 'Подмосковное', image: '/static/media/apple.png', price: '50',
        },
      ];
      res.json({ code: 1, items });
    } catch (e) {
      console.log(e);
      res.sendStatus(401);
    }
  }
}

export default new Market();
