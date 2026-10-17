const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true,
             match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] },
    password: { type: String, required: true, select: false }, // not returned by queries
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);


// Hash password before saving (async hook: no next() needed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove password from any JSON response
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);