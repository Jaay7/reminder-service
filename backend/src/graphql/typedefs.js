import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Query {
    me: User
    user(username: String!): User
    users: [User]
    refreshToken: Auth
    allReminders: [Remind]
    reminder(id: ID!): Remind
  }

  type User {
    id: ID!
    username: String!
    email: String!
    fullName: String!
    phoneNumber: String!
    myReminders: [Remind]
    createdOn: String
    modifiedOn: String
  }
  type Auth {
    message: String
    token: String!
    refreshToken: String!
  }
  type Remind {
    id: ID!
    title: String!
    message: String!
    user: User!
    sendTime: String!
    createdOn: String
    modifiedOn: String
    status: String
  }
  
  type Mutation {
    createUser(
      username: String!
      email: String!
      fullName: String!
      password: String!
      phoneNumber: String!
      createdOn: String
    ): Auth
    login(email: String!, password: String!): Auth
    updateUser(
      username: String!
      email: String!
      fullName: String!
      phoneNumber: String
      modifiedOn: String
    ): String
    createReminder(
      title: String!
      message: String!
      sendTime: String!
      createdOn: String
    ): String
    updateReminder(
      id: ID
      title: String!
      message: String!
      sendTime: String!
      createdOn: String
      modifiedOn: String
      status: String
    ): String
    deleteReminder(id: ID!): String
  }
`;

export default typeDefs;
