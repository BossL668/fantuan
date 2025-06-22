const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, tags, isPrivate, maxMembers, rules } = req.body;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'Group name already exists'
      });
    }

    // Create new group
    const group = new Group({
      name,
      description,
      category,
      tags: tags || [],
      creator: req.user.userId,
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 100,
      rules: rules || []
    });

    // Add creator as admin member
    await group.addMember(req.user.userId, 'admin');
    await group.save();

    // Update user's created groups
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { createdGroups: group._id }
    });

    // Populate creator info
    await group.populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during group creation'
    });
  }
});

// Get all public groups with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPrivate: false };

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    const groups = await Group.find(query)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Group.countDocuments(query);

    res.json({
      success: true,
      groups,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + groups.length < total
      }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get group by ID
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'username avatar bio')
      .populate('members.user', 'username avatar bio isOnline lastSeen')
      .populate('pinnedMessages', 'content sender createdAt');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      group
    });

  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Join a group
router.post('/:groupId/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'This is a private group'
      });
    }

    await group.addMember(req.user.userId);
    
    // Update user's joined groups
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { joinedGroups: group._id }
    });

    res.json({
      success: true,
      message: 'Successfully joined the group'
    });

  } catch (error) {
    console.error('Join group error:', error);
    if (error.message === 'Group is full') {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }
    if (error.message === 'User is already a member') {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Leave a group
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Group creator cannot leave. Transfer ownership first.'
      });
    }

    await group.removeMember(req.user.userId);
    
    // Update user's joined groups
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { joinedGroups: group._id }
    });

    res.json({
      success: true,
      message: 'Successfully left the group'
    });

  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update group (admin only)
router.put('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin or creator
    const userRole = group.getMemberRole(req.user.userId);
    if (userRole !== 'admin' && group.creator.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update group settings'
      });
    }

    const { name, description, category, tags, isPrivate, maxMembers, rules } = req.body;

    // Check if new name conflicts with existing group
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ name });
      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: 'Group name already exists'
        });
      }
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (category) group.category = category;
    if (tags) group.tags = tags;
    if (isPrivate !== undefined) group.isPrivate = isPrivate;
    if (maxMembers) group.maxMembers = maxMembers;
    if (rules) group.rules = rules;

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      group
    });

  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's groups
router.get('/user/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'joinedGroups',
        populate: {
          path: 'creator',
          select: 'username avatar'
        }
      })
      .populate({
        path: 'createdGroups',
        populate: {
          path: 'creator',
          select: 'username avatar'
        }
      });

    res.json({
      success: true,
      groups: {
        joined: user.joinedGroups,
        created: user.createdGroups
      }
    });

  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 