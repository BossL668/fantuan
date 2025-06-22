const express = require('express');
const Message = require('../models/Message');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const groupId = req.params.groupId;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isMember(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const messages = await Message.getGroupMessages(groupId, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse(), // Show oldest first
      pagination: {
        current: parseInt(page),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Send a message to a group
router.post('/group/:groupId', auth, async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo, mentions } = req.body;
    const groupId = req.params.groupId;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isMember(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Create new message
    const message = new Message({
      group: groupId,
      sender: req.user.userId,
      content,
      messageType,
      replyTo,
      mentions: mentions || []
    });

    await message.save();

    // Populate sender info
    await message.populate('sender', 'username avatar');
    await message.populate('replyTo', 'content sender');
    await message.populate('mentions', 'username');

    // Update group's last activity
    group.lastActivity = new Date();
    await group.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Edit a message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    await message.editMessage(content);
    await message.populate('sender', 'username avatar');

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or admin
    const group = await Group.findById(message.group);
    const userRole = group.getMemberRole(req.user.userId);
    
    if (message.sender.toString() !== req.user.userId && 
        userRole !== 'admin' && 
        group.creator.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add reaction to message
router.post('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(req.user.userId, emoji);
    await message.populate('reactions.user', 'username');

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: message
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    if (error.message === 'User already reacted with this emoji') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove reaction from message
router.delete('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(req.user.userId, emoji);
    await message.populate('reactions.user', 'username');

    res.json({
      success: true,
      message: 'Reaction removed successfully',
      data: message
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Pin/unpin message (admin only)
router.post('/:messageId/pin', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is admin
    const group = await Group.findById(message.group);
    const userRole = group.getMemberRole(req.user.userId);
    
    if (userRole !== 'admin' && group.creator.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can pin messages'
      });
    }

    await message.togglePin();

    res.json({
      success: true,
      message: message.isPinned ? 'Message pinned successfully' : 'Message unpinned successfully',
      data: message
    });

  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 