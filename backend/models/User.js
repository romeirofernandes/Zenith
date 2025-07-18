const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  displayName: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });

// Instance method to get full name
userSchema.methods.getFullName = function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.displayName || this.email;
};

// Static method to find user by Firebase UID
userSchema.statics.findByFirebaseUid = function(uid) {
  return this.findOne({ firebaseUid: uid });
};

// Static method to create or update user from Firebase data
userSchema.statics.createFromFirebase = async function(firebaseUser) {
  const userData = {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.display_name || firebaseUser.name || '',
    phoneNumber: firebaseUser.phone_number || '',
    lastLogin: new Date()
  };

  return this.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    userData,
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;