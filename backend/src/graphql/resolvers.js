/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Remind from '../models/Remind';
import { issueToken, getAuthUser, getRefreshTokenUser } from '../utils/authentication';

const Mailgun = require('mailgun-js');

const mailgun = Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const resolvers = {
  Query: {
    me: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      return User.findById(authUser.id);
    },
    user: async (root, args, { req }) => {
      await getAuthUser(req, true);
      return User.findOne({ username: args.username });
    },
    users: async (root, args, { req }) => {
      await getAuthUser(req, true);
      return User.find({});
    },
    refreshToken: async (root, args, { req }) => {
      const authUser = await getRefreshTokenUser(req, true);
      const tokens = await issueToken(authUser);
      return {
        message: 'Refresh token issued successfully',
        ...tokens,
      };
    },
    allReminders: async (root, args, { req }) => {
      await getAuthUser(req, true);
      return Remind.find({});
    },
    reminder: async (root, args, { req }) => {
      await getAuthUser(req, true);
      return Remind.findById(args.id);
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = await User.findOne({ email: args.email });
      if (user) {
        return {
          message: 'Email already exists',
          token: null,
          refreshToken: null,
        };
      }
      args.password = await bcrypt.hash(args.password, 10);
      const newUser = await User.create(args);
      const tokens = await issueToken(newUser);
      return {
        message: 'User created successfully',
        ...tokens,
      };
    },
    login: async (root, args) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        return {
          message: 'User not found',
          token: null,
          refreshToken: null,
        };
      }
      const isValid = await bcrypt.compare(args.password, user.password);
      if (!isValid) {
        return {
          message: 'Invalid password',
          token: null,
          refreshToken: null,
        };
      }
      const tokens = await issueToken(user);
      return {
        message: 'User logged in successfully',
        ...tokens,
      };
    },
    updateUser: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      await User.findByIdAndUpdate(authUser.id, args, { new: true });
      return 'User updated successfully';
    },
    createReminder: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      if (!authUser) {
        return 'User not found';
      }
      args.user = authUser.id;
      const remind = await Remind.create(args);
      authUser.myReminders.push(remind.id);
      await authUser.save();
      const message = {
        from: 'Jay <jayakrishna.madem@gmail.com>',
        to: authUser.email,
        subject: `Reminder created - ${args.title}`,
        text: `You have created a new reminder.\n${args.message}`,
        html: `<strong>Your ${args.sendTime} reminder has been created </strong>
        <p>${args.message}</p>
        <p>You will also recieve another email at the time of your reminder</p>
        `,
      };
      mailgun.messages().send(message, (error, body) => {
        if (error) console.log(error);
        else console.log(body);
      });
      const schedule = {
        from: 'Jay <jayakrishna.madem@gmail.com>',
        to: authUser.email,
        subject: `Reminder - ${args.title}`,
        text: `${args.message}`,
        html: `<strong>Reminder!!! The time of your reminder</strong>
        <p>${args.message}</p>
        `,
        'o:deliverytime': `${args.sendTime}`, // "Fri, Jul 15 2022 08:45:30 +0530"
      };
      mailgun.messages().send(schedule, (error, body) => {
        if (error) console.log(error);
        else console.log(body);
      });
      return 'Reminder created successfully';
    },
    updateReminder: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      if (!authUser) {
        return 'User not found';
      }
      const reminder = await Remind.findById(args.id);
      if (!reminder) {
        return 'Reminder not found';
      }
      if (reminder.user.toString() !== authUser.id) {
        return 'You are not authorized to update this reminder';
      }
      await Remind.findByIdAndUpdate(args.id, args, { new: true });
      return 'Reminder updated successfully';
    },
    deleteReminder: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      if (!authUser) {
        return 'User not found';
      }
      const reminder = await Remind.findById(args.id);
      if (!reminder) {
        return 'Reminder not found';
      }
      if (reminder.user.toString() !== authUser.id) {
        return 'You are not authorized to delete this reminder';
      }
      await Remind.findByIdAndDelete(args.id);
      authUser.myReminders.pull(args.id);
      await authUser.save();
      return 'Reminder deleted successfully';
    },
  },
  User: {
    myReminders: async (root, args, { req }) => {
      const authUser = await getAuthUser(req, true);
      return Remind.find({ user: authUser.id });
    },
  },
  Remind: {
    user: async (root, args, { req }) => {
      await getAuthUser(req, true);
      return User.findById(root.user);
    },
  },
};

export default resolvers;
