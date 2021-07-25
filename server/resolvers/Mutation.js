const { authorizeWithGithub, uploadStream } = require('../lib');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
  async postPhoto(parent, args, { db, currentUser, pubsub }) {
    if (!currentUser) {
      throw new Error('Only an authorized user can post a photo');
    }
    console.log(args.input);
    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    };

    const { _id } = await db.collection('photos').insertOne(newPhoto);
    newPhoto.id = _id;
    console.log(_id);
    const toPath = path.join(__dirname, '..', 'assets', 'photos', `${_id}.jpg`);

    const { stream } = args.input.file;
    console.log(stream);
    await uploadStream(stream, toPath);

    pubsub.publish('photo-added', { newPhoto });
    return newPhoto;
  },

  async githubAuth(parent, { code }, { db }) {
    let {
      message,
      access_token,
      avatar_url,
      login,
      name,
      ...test
    } = await authorizeWithGithub({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code
    });

    if (message) {
      throw new Error(message);
    }

    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    };

    await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    const { _id, ...user } = await db
      .collection('users')
      .findOne({ githubLogin: login });

    return { user, token: access_token };
  },
  async addFakeUsers(parent, { count }, { db, pubsub }) {
    const randomUserAPi = `https://randomuser.me/api/?results=${count}`;

    const { results } = await fetch(randomUserAPi).then(res => res.json());

    const users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1
    }));

    await db.collection('users').insertMany(users);

    users.map(newUser => {
      pubsub.publish('user-added', { newUser });
    });

    return users;
  },

  async fakeUserAuth(parent, { githubLogin }, { db }) {
    const user = await db.collection('users').findOne({ githubLogin });

    if (!user) {
      throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
    }

    return {
      token: user.githubToken,
      user
    };
  }
};
