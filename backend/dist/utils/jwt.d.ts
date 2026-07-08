export interface JwtPayload {
    userId: string;
    email: string;
    roleId: string;
    roleName: string;
}
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload | null;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=jwt.d.ts.map