import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  myReminders: [{
    type: Schema.Types.ObjectId,
    ref: 'Remind',
  }],
  createdOn: {
    type: String,
    default: new Date().toLocaleString(),
  },
  modifiedOn: {
    type: String,
    default: new Date().toLocaleString(),
  },
}, {
  timestamps: false,
});

const User = model('User', UserSchema);

export default User;
