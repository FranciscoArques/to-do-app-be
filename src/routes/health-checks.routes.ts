import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/firebaseService';

export class HealthCheckRoutes {
  public router: Router;

  constructor() {
    this.router = Router(),
    this.init()
  }

  private init(): void {
    this.router.get('/ping', pingController),
    this.router.get('/ping-db', pingDbController)
  }
};

const pingController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.send({ message: 'pong' });
};

const pingDbController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const docRef = db.collection('test').doc('RH7TimcfFiBnq1IqgRZj');
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send('Document not found');
    }

    res.status(200).send(doc.data());
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).send('Internal Server Error');
  }
};
