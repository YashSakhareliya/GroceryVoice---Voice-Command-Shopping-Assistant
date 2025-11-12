import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Admin from '../models/admin.js';


export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        req.user = user;
        req.role = 'user';
        if(!user) {
           // find it is a admin or not 
            const admin = await Admin.findById(decoded.id).select('-password');
            if(admin){
                req.user = admin;
                req.role = 'admin';
            }
        }
        
        if (!req.user) {
            return res.status(401).json({
            success: false,
            message: 'User not found'
            });
        }

        next();
        } catch (error) {

        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });

        }
    }

    if (!token) {
        return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
        });
    }
};


export const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};
