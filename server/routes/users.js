const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('joinedGroups', 'name description avatar memberCount')
      .populate('createdGroups', 'name description avatar memberCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile(),
      groups: {
        joined: user.joinedGroups,
        created: user.createdGroups
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { interests: { $in: [new RegExp(query, 'i')] } },
        { favoriteContent: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .select('username avatar bio interests favoriteContent isOnline lastSeen')
    .sort({ isOnline: -1, lastSeen: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { interests: { $in: [new RegExp(query, 'i')] } },
        { favoriteContent: { $in: [new RegExp(query, 'i')] } }
      ]
    });

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 