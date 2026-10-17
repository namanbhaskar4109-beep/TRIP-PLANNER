import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_token_secret_trip_planner_atlas_2025';

/**
 * Parse cookies safely from the Cookie request header
 */
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

/**
 * Middleware to authenticate requests using HttpOnly cookie or Authorization Bearer header
 */
export function authenticateToken(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies.token || cookies.session_token;

  // Fallback: Authorization header (Bearer <token>)
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session payload. Please sign in again.',
      });
    }

    // Attach user payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        isExpired: true,
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication credentials. Please sign in again.',
    });
  }
}
