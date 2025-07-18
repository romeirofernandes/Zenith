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
  wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }
],
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
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resume: {
    skills: [String],
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String
      }
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String
      }
    ],
    coCurricular: [String],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date, 
        credentials: String
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String
      }
    ],
    summary: String,
    linkedin: {
      type: String,
      default: ''
    },
    profileLinks: [
      {
        platform: String, 
        url: String
      }
    ]
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