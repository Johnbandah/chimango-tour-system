const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Tour = require('./models/Tour');
const Booking = require('./models/Booking');
const Activity = require('./models/Activity');
const CustomBooking = require('./models/CustomBooking');
const PasswordReset = require('./models/PasswordReset');
const Review = require('./models/Review');
const PaymentRequest = require('./models/PaymentRequest');

// Import email service
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendPaymentVerificationEmail
} = require('./services/emailService');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.8.132:5173'],
  credentials: true
}));
app.use(express.json());

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://192.168.8.132:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// ==================== SOCKET.IO CHAT ====================
const connectedUsers = new Map();
const chatMessages = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user-join', (userData) => {
    connectedUsers.set(socket.id, {
      id: socket.id,
      userId: userData.userId,
      name: userData.name,
      role: userData.role
    });
    
    socket.emit('chat-history', chatMessages);
    
    const userList = Array.from(connectedUsers.values());
    io.emit('users-list', userList);
    
    console.log(`${userData.name} joined the chat`);
  });

  socket.on('send-message', (messageData) => {
    const message = {
      id: Date.now(),
      senderId: socket.id,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole,
      message: messageData.message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    chatMessages.push(message);
    
    if (chatMessages.length > 100) {
      chatMessages.shift();
    }
    
    io.emit('new-message', message);
  });

  socket.on('mark-read', () => {
    chatMessages.forEach(msg => {
      if (!msg.isRead && msg.senderId !== socket.id) {
        msg.isRead = true;
      }
    });
    io.emit('messages-read');
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', {
      name: data.name,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      
      const userList = Array.from(connectedUsers.values());
      io.emit('users-list', userList);
    }
  });
});

// ==================== TEST ROUTE ====================
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== TOUR ROUTES ====================

app.get('/api/tours', async (req, res) => {
  try {
    const { destination, minPrice, maxPrice } = req.query;
    const query = { status: 'published' };
    
    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    const tours = await Tour.find(query).sort({ createdAt: -1 });
    res.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ACTIVITY ROUTES ====================

app.get('/api/activities', async (req, res) => {
  try {
    const { category, region, difficulty } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (region) query.region = region;
    if (difficulty) query.difficulty = difficulty;
    
    const activities = await Activity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== USER ROUTES ====================

app.post('/api/users/register', async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone
    });
    
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, fullName);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/users/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { fullName, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { fullName, phone },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BOOKING ROUTES ====================

app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, tourId, travelDate, numTravelers, promoCode } = req.body;
    
    if (!userId || !tourId || !travelDate || !numTravelers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    let totalPrice = tour.price * numTravelers;
    if (promoCode === 'SUMMER10') {
      totalPrice = totalPrice * 0.9;
    }
    
    const booking = new Booking({
      user: userId,
      tour: tourId,
      travelDate: new Date(travelDate),
      numTravelers,
      totalPrice,
      promoCode: promoCode || null,
      status: 'confirmed',
      paymentStatus: 'paid'
    });
    
    await booking.save();
    await booking.populate('tour');
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('tour')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CUSTOM BOOKING ROUTES ====================

app.post('/api/check-availability', async (req, res) => {
  try {
    const { activityId, selectedDate } = req.body;
    
    const bookings = await CustomBooking.find({
      'selectedActivities.activity': activityId,
      'selectedActivities.selectedDate': new Date(selectedDate),
      status: { $in: ['confirmed', 'pending'] }
    });
    
    let totalPeopleBooked = 0;
    bookings.forEach(booking => {
      booking.selectedActivities.forEach(activity => {
        if (activity.activity.toString() === activityId) {
          totalPeopleBooked += activity.numberOfPeople;
        }
      });
    });
    
    const activity = await Activity.findById(activityId);
    const maxCapacity = activity?.maxPeople || 20;
    const availableSpots = maxCapacity - totalPeopleBooked;
    
    res.json({
      available: availableSpots > 0,
      availableSpots,
      totalBooked: totalPeopleBooked,
      maxCapacity,
      message: availableSpots > 0 
        ? `${availableSpots} spot(s) available` 
        : 'Fully booked'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/custom-bookings', async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    const { userId, selectedActivities, totalPrice, specialRequests, airportPickup, flightNumber, arrivalTime, personalDetails, bookingCode, nationality, paymentMethod } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    if (!selectedActivities || !selectedActivities.length) {
      return res.status(400).json({ message: 'selectedActivities is required' });
    }
    
    // Validate each selected activity
    for (const activity of selectedActivities) {
      if (!activity.activity) {
        return res.status(400).json({ message: 'activity ID is required in selectedActivities' });
      }
      if (!activity.selectedDate) {
        return res.status(400).json({ message: 'selectedDate is required' });
      }
    }
    
    const booking = new CustomBooking({
      user: userId,
      selectedActivities: selectedActivities.map(act => ({
        activity: act.activity,
        numberOfDays: act.numberOfDays,
        numberOfPeople: act.numberOfPeople,
        totalPrice: act.totalPrice,
        selectedDate: new Date(act.selectedDate)
      })),
      totalPrice,
      specialRequests: specialRequests || '',
      airportPickup: airportPickup || false,
      flightNumber: flightNumber || '',
      arrivalTime: arrivalTime || '',
      personalDetails: {
        fullName: personalDetails?.fullName || '',
        email: personalDetails?.email || '',
        phone: personalDetails?.phone || '',
        passportNumber: personalDetails?.passportNumber || '',
        emergencyContact: personalDetails?.emergencyContact || ''
      },
      bookingCode: bookingCode || 'CHM-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      nationality: nationality || 'malawian',
      paymentMethod: paymentMethod || null,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await booking.save();
    await booking.populate('selectedActivities.activity');
    
    console.log('Booking saved successfully:', booking._id);
    
    // Send booking confirmation email
    try {
      const { sendBookingConfirmationEmail } = require('./services/emailService');
      await sendBookingConfirmationEmail(
        personalDetails.email,
        personalDetails.fullName,
        booking
      );
      console.log('Booking confirmation email sent to:', personalDetails.email);
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }
    
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Custom booking error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send detailed error for debugging
    res.status(500).json({ 
      message: error.message,
      errorType: error.name,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

app.get('/api/custom-bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await CustomBooking.find({ user: req.params.userId })
      .populate('selectedActivities.activity')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching custom bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/custom-bookings', async (req, res) => {
  try {
    const bookings = await CustomBooking.find()
      .populate('selectedActivities.activity')
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all custom bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/custom-bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await CustomBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/custom-bookings/confirm/:bookingCode', async (req, res) => {
  try {
    const booking = await CustomBooking.findOneAndUpdate(
      { bookingCode: req.params.bookingCode },
      { status: 'confirmed', paymentStatus: 'paid' },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/custom-bookings/activity/:activityId', async (req, res) => {
  try {
    const bookings = await CustomBooking.find({
      'selectedActivities.activity': req.params.activityId,
      status: { $in: ['confirmed', 'pending'] }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching activity bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PAYMENT REQUEST ROUTES ====================

// Payment Request Routes
app.post('/api/payment-request', async (req, res) => {
  try {
    const PaymentRequest = require('./models/PaymentRequest');
    const paymentRequest = new PaymentRequest(req.body);
    await paymentRequest.save();
    console.log('Payment request saved:', paymentRequest.bookingCode);
    res.status(201).json({ message: 'Payment request saved', payment: paymentRequest });
  } catch (error) {
    console.error('Payment request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/payment-requests/pending', async (req, res) => {
  try {
    const PaymentRequest = require('./models/PaymentRequest');
    const payments = await PaymentRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/payment-requests/:id/verify', async (req, res) => {
  try {
    const PaymentRequest = require('./models/PaymentRequest');
    const payment = await PaymentRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', verifiedAt: new Date() },
      { new: true }
    );
    res.json(payment);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== REVIEW ROUTES ====================

app.get('/api/reviews/activity/:activityId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      activity: req.params.activityId, 
      status: 'approved' 
    }).populate('user', 'fullName').sort({ createdAt: -1 });
    
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, activityId, bookingId, rating, comment } = req.body;
    
    const existingReview = await Review.findOne({ user: userId, activity: activityId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this activity' });
    }
    
    const review = new Review({
      user: userId,
      activity: activityId,
      booking: bookingId,
      rating,
      comment,
      status: 'approved'
    });
    
    await review.save();
    await review.populate('user', 'fullName');
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== FORGOT PASSWORD ROUTES ====================

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If your email is registered, you will receive a reset link' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await PasswordReset.create({ email, token, expiresAt });
    
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.fullName, token);
      console.log('Password reset email sent to:', email);
      res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      console.log('Reset link (email failed):', resetUrl);
      res.json({ message: 'Reset link generated but email failed. Check server console.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    const resetEntry = await PasswordReset.findOne({ 
      token, 
      expiresAt: { $gt: new Date() },
      used: false
    });
    
    if (!resetEntry) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    res.json({ message: 'Token valid', email: resetEntry.email });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const resetEntry = await PasswordReset.findOne({ 
      token, 
      expiresAt: { $gt: new Date() },
      used: false
    });
    
    if (!resetEntry) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findOneAndUpdate(
      { email: resetEntry.email },
      { password: hashedPassword }
    );
    
    resetEntry.used = true;
    await resetEntry.save();
    
    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== WISHLIST ROUTES ====================

app.post('/api/wishlist', async (req, res) => {
  try {
    const Wishlist = require('./models/Wishlist');
    const { userId, activityId } = req.body;
    
    const existing = await Wishlist.findOne({ user: userId, activity: activityId });
    if (existing) {
      return res.status(400).json({ message: 'Activity already in wishlist' });
    }
    
    const wishlistItem = new Wishlist({ user: userId, activity: activityId });
    await wishlistItem.save();
    await wishlistItem.populate('activity');
    
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/wishlist/:userId/:activityId', async (req, res) => {
  try {
    const Wishlist = require('./models/Wishlist');
    await Wishlist.findOneAndDelete({ 
      user: req.params.userId, 
      activity: req.params.activityId 
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/wishlist/:userId', async (req, res) => {
  try {
    const Wishlist = require('./models/Wishlist');
    const wishlist = await Wishlist.find({ user: req.params.userId })
      .populate('activity')
      .sort({ createdAt: -1 });
    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/wishlist/check/:userId/:activityId', async (req, res) => {
  try {
    const Wishlist = require('./models/Wishlist');
    const wishlistItem = await Wishlist.findOne({ 
      user: req.params.userId, 
      activity: req.params.activityId 
    });
    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== IMAGE UPLOAD ====================

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

app.use('/uploads', express.static(uploadDir));

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ imageUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const imageUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    res.json({ images: imageUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// ==================== EXPORT BOOKINGS ====================

const ExcelJS = require('exceljs');

app.get('/api/export-bookings', async (req, res) => {
  try {
    const bookings = await CustomBooking.find()
      .populate('user', 'fullName email phone')
      .populate('selectedActivities.activity', 'name location');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');
    
    worksheet.columns = [
      { header: 'Booking Code', key: 'bookingCode', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Activity', key: 'activity', width: 30 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Travel Date', key: 'travelDate', width: 15 },
      { header: 'Days', key: 'days', width: 10 },
      { header: 'People', key: 'people', width: 10 },
      { header: 'Total Price (MK)', key: 'totalPrice', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    
    bookings.forEach(booking => {
      const activity = booking.selectedActivities[0]?.activity;
      worksheet.addRow({
        bookingCode: booking.bookingCode || 'N/A',
        customerName: booking.personalDetails?.fullName || booking.user?.fullName || 'N/A',
        email: booking.personalDetails?.email || booking.user?.email || 'N/A',
        phone: booking.personalDetails?.phone || booking.user?.phone || 'N/A',
        activity: activity?.name || 'N/A',
        location: activity?.location || 'N/A',
        travelDate: booking.selectedActivities[0]?.selectedDate 
          ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() 
          : 'N/A',
        days: booking.selectedActivities[0]?.numberOfDays || 0,
        people: booking.selectedActivities[0]?.numberOfPeople || 0,
        totalPrice: booking.totalPrice || 0,
        status: booking.status || 'N/A'
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export bookings' });
  }
});
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filepath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image file not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

const pushService = require('./services/pushService');

// Subscribe to push notifications
app.post('/api/push/subscribe', (req, res) => {
  try {
    const subscription = req.body;
    pushService.saveSubscription(subscription);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Subscription failed' });
  }
});

// Unsubscribe from push notifications
app.post('/api/push/unsubscribe', (req, res) => {
  try {
    const { endpoint } = req.body;
    pushService.removeSubscription(endpoint);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Unsubscribe failed' });
  }
});

// Send test notification (for admin)
app.post('/api/push/send-test', async (req, res) => {
  try {
    const { title, body } = req.body;
    const results = await pushService.sendNotificationToAll(title, body);
    res.json({ message: 'Notifications sent', results });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
});

// Send booking confirmation notification
const sendBookingNotification = async (userId, bookingCode, activityName) => {
  // In production, you would get the user's subscription from database
  // For now, we'll send to all subscribers
  await pushService.sendNotificationToAll(
    'Booking Confirmed! 🎉',
    `Your booking ${bookingCode} for ${activityName} has been confirmed.`,
    '/icon.png',
    '/bookings'
  );
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'goshsolution@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Verify payment
app.put('/api/payment-requests/:id/verify', async (req, res) => {
  try {
    const payment = await PaymentRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', verifiedAt: new Date() },
      { new: true }
    );
    res.json(payment);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm booking
app.put('/api/custom-bookings/confirm/:bookingCode', async (req, res) => {
  try {
    const booking = await CustomBooking.findOneAndUpdate(
      { bookingCode: req.params.bookingCode },
      { status: 'confirmed', paymentStatus: 'paid' },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by booking code
app.get('/api/custom-bookings/code/:bookingCode', async (req, res) => {
  try {
    const booking = await CustomBooking.findOne({ bookingCode: req.params.bookingCode })
      .populate('selectedActivities.activity');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by booking code
app.get('/api/custom-bookings/code/:bookingCode', async (req, res) => {
  try {
    const booking = await CustomBooking.findOne({ bookingCode: req.params.bookingCode })
      .populate('selectedActivities.activity');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});