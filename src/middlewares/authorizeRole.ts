import jwtService from "../APIs/authentication/jwt.service";

const authorizeRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res
          .status(401)
          .json({ success: false, message: "No token provided" });
      }
      const decoded = jwtService.validateRefreshToken(refreshToken);
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Access denied" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};

export default authorizeRole;
