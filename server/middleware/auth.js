import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_token_secret_trip_planner_atlas_2025';

/**
 * Lightweight cookie parser to extract HttpOnly session tokens without external dependencies
 */
function extractCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Authenticate requests using HttpOnly session cookie or Authorization Bearer header
 */
export function authenticateToken(req, res, next) {
  // 1. Check HttpOnly cookie first
  let token = extractCookie(req.headers.cookie, 'token');

  // 2. Fall back to Authorization: Bearer <token> header
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired or is invalid. Please sign in again.',
    });
  }
}
