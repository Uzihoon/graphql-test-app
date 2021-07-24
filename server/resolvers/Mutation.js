module.exports = {
  postPhoto(parent, args) {
    const newPhoto = {
      id: _id++,
      ...args.input,
      created: new Date()
    };
    photos.push(newPhoto);

    return newPhoto;
  }
};
