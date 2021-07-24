const { ApolloServer } = require('apollo-server');

const typeDefs = /* GraphQL */ `
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

const photos = [];
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
        ...args.input
      };
      photos.push(newPhoto);

      return newPhoto;
    }
  },

  Photo: {
    url: parent => `http://localhost:4000/photo/${parent.id}.jpg`
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: true
});

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
