import { Request, Response } from 'express';
export declare const getBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<void>;
export declare const createBooking: (req: Request, res: Response) => Promise<void>;
export declare const updateBookingStatus: (req: Request, res: Response) => Promise<void>;
export declare const cancelBooking: (req: Request, res: Response) => Promise<void>;
export declare const getProviderStats: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=bookingController.d.ts.map