const Sauce = require('../models/sauces');


exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (Sauces) => {
          res.status(200).json(Sauces);
        }
      ).catch(
        (error) => {
          res.status(400).json({
            error: error,
            message: "Error to connect to database"
          });
        }
      );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (Sauce) => {
        res.status(200).json(Sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error,
          message : "Sauce not find"
        });
      }
    );
};

exports.deleteOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if(sauce.userId != req.auth.userId) {
        res.status(409).json({ message : "Can't change sauce who is not yours"});
      }
      else {
        Sauce.deleteOne({_id: req.params.id})
          .then((sauce) => {
            res.status(200).json({ message: "Sauce delete"});
          })
          .catch((error) => { res.status(500).json({ message: "Server problem"})});
      }
  })
  .catch((error) => { res.status(404).json({ message: "Sauce not find"})});
}

exports.createSauce = (req, res, next) => {
  const bodyReq = JSON.parse(req.body.sauce);
  delete bodyReq._id;
  delete bodyReq._userId;
  const lasauce = new Sauce({
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ...bodyReq
  });
  if(req.auth.userId == bodyReq.userId) {
    lasauce.save()
    .then(() => { res.status(201).json({message: 'Sauce create'})})
    .catch(() => { res.status(500).json({ message: 'Server problem'})});
  }
  else {
    res.status(409).json({message: "Can't create sauce from other users"});
  }
};

exports.modifySauce = (req, res, next) => {
  const lasauce = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete lasauce._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(409).json({ message : "Can't modify sauce of other users"});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...lasauce, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Sauce update'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(500).json({ message: 'Server problem' });
      });
};

exports.likeSystem = (req, res, next) => {
  const lasauce = JSON.parse(req.body.like);
  switch (lasauce) {
     case 1:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if(req.body.userId == req.auth.userId) {
            if(sauce.usersLiked.includes(req.auth.userId)){
              res.status(409).json({ message: 'Sauce déjà liké' });
            }
            if(sauce.usersDisliked.includes(req.auth.userId)){
              res.status(409).json({ message: 'Vous ne pouvez pas liké et dislike la même sauce' });
            }
            else {
              Sauce.updateOne(
                { _id: req.params.id },
                { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
              )
                .then(() => res.status(200).json({ message: 'like !' }))
                .catch((error) => res.status(400).json({ error }));
            }
          }
          else {
            res.status(409).json({ message: "Vous ne pouvez pas liké ou disliké au nom d'un autre" });
          }
        })
        .catch((error) => res.status(404).json({ message: 'sauce introuvé'}));
      break;
     case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if(req.body.userId == req.auth.userId) {
            if (sauce.usersLiked.includes(req.auth.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } }
              )
                .then(() =>
                  res.status(200).json({ message: 'Aucun like ou dislike pour cette sauce' })
                )
                .catch((error) => res.status(400).json({ error }));
            }
            if (sauce.usersDisliked.includes(req.auth.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  $pull: { usersDisliked: req.auth.userId },
                  $inc: { dislikes: -1 },
                }
              )
                .then(() =>
                  res.status(200).json({ message: 'Aucun like ou dislike pour cette sauce' })
                )
                .catch((error) => res.status(400).json({ error }));
            }
          }
          else {
            res.status(409).json({ message: "Vous ne pouvez pas liké ou disliké au nom d'un autre" });
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;
    case -1:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if(req.body.userId == req.auth.userId) {
            if(sauce.usersDisliked.includes(req.auth.userId)){
              res.status(409).json({ message: 'Sauce déjà disliké' });
            }
            if(sauce.usersLiked.includes(req.auth.userId)){
              res.status(409).json({ message: 'Vous ne pouvez pas liké et dislike la même sauce' });
            }
            else {
              Sauce.updateOne(
                { _id: req.params.id },
                { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } }
              )
                .then(() => res.status(200).json({ message: 'Dislike !' }))
                .catch((error) => res.status(400).json({ error }));
            }
          }
          else {
            res.status(409).json({ message: "Vous ne pouvez pas liké ou disliké au nom d'un autre" });
          }
        })
        .catch((error) => res.status(404).json({ message: 'sauce introuvé'}));
      break;
    default:
      console.log(error);
  };  
};