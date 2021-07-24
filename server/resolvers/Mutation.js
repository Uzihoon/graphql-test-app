const { authorizeWithGithub } = require('../lib');
const fetch = require('node-fetch');

module.exports = {
  async postPhoto(parent, args, { db, currentUser }) {
    if (!currentUser) {
      throw new Error('Only an authorized user can post a photo');
    }

    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    };

    const { insertedIds } = await db.collection('photos').insert(newPhoto);
    newPhoto.id = insertedIds[0];

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

    const a = await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    const { _id, ...user } = await db
      .collection('users')
      .findOne({ githubLogin: login });

    return { user, token: access_token };
  },
  async addFakeUsers(parent, { count }, { db }) {
    const randomUserAPi = `https://randomuser.me/api/?results=${count}`;

    const { results } = await fetch(randomUserAPi).then(res => res.json());

    const users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1
    }));

    await db.collection('users').insert(users);

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
