import { Schema, model } from 'mongoose';

const RemindSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sendTime: {
    type: String,
    required: true,
  },
  createdOn: {
    type: String,
    default: new Date().toLocaleString(),
  },
  modifiedOn: {
    type: String,
    default: new Date().toLocaleString(),
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'sent', 'cancelled'],
  },
}, {
  timestamps: false,
});

const Remind = model('Remind', RemindSchema);

export default Remind;
