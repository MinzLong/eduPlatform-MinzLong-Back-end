const express = require('express');
const auth = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router();

// Get likes for a course
router.get('/:id/likes', async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course) {
      return res.json({ likes: 0, likedBy: [] });
    }
    res.json({ likes: course.likes, likedBy: course.likedBy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// Like or unlike a course
router.post('/:id/like', auth, async (req, res) => {
  try {
    let course = await Course.findOne({ id: req.params.id });
    const userId = req.user.id;

    if (!course) {
      course = new Course({ id: req.params.id, likes: 0, likedBy: [] });
    }

    // Check if the user already liked the course
    if (course.likedBy.includes(userId)) {
      // Unlike the course
      course.likes -= 1;
      course.likedBy.pull(userId);
    } else {
      // Like the course
      course.likes += 1;
      course.likedBy.push(userId);
    }

    await course.save();
    res.json({ likes: course.likes, likedBy: course.likedBy });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like/unlike the course' });
  }
});

module.exports = router;
