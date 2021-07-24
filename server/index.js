const { ApolloServer } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');

const typeDefs = /* GraphQL */ `
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  scalar DateTime

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos(after: DateTime): [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

const tags = [
  { photoID: 1, userID: 'gPlake' },
  { photoID: 2, userID: 'sSchmidt' },
  { photoID: 2, userID: 'mHattrup' },
  { photoID: 2, userID: 'gPlake' }
];

const photos = [
  {
    id: 1,
    name: 'Dropping the Heart Cute',
    description: 'THe heart chute is one of my favorite chutes',
    category: 'ACTION',
    githubUser: 'gPlake',
    created: '3-28-2020'
  },
  {
    id: 2,
    name: 'Enjoying the sunshine',
    category: 'SELFIE',
    githubUser: 'sSchmidt',
    created: '1-2-2021'
  },
  {
    id: 3,
    name: 'Gunbarrel 25',
    description: '25 laps on gunbarrel today',
    category: 'LANDSCAPE',
    githubUser: 'sSchmidt',
    created: '2021-03-02'
  }
];

const users = [
  {
    githubLogin: 'mHattrup',
    name: 'Mike Hattrup'
  },
  {
    githubLogin: 'gPlake',
    name: 'Glen Plake'
  },
  {
    githubLogin: 'sSchmidt',
    name: 'Scot Schmidt'
  }
];
let _id = 0;

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },

  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date()
      };
      photos.push(newPhoto);

      return newPhoto;
    }
  },

  Photo: {
    url: parent => `http://localhost:4000/photo/${parent.id}.jpg`,
    postedBy: parent => users.find(u => u.githubLogin === parent.githubUser),
    taggedUsers: parent =>
      tags
        .filter(tag => tag.photoID === parent.id)
        .map(tag => tag.userID)
        .map(userID => users.find(u => u.githubLogin === userID))
  },

  User: {
    postedPhotos: parent =>
      photos.filter(p => p.githubUser === parent.githubLogin),
    inPhotos: parent =>
      tags
        .filter(tag => tag.userID === parent.id)
        .map(tag => tag.photoID)
        .map(photoID => photos.find(p => p.id === photoID))
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid data time value',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true
});

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
