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
            message: "Impossible de charger les sauces"
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
          message : "Sauce introuvable"
        });
      }
    );
};

exports.deleteOneSauce = (req, res, next) => {
  Sauce.deleteOne({
    _id: req.params.id
  }).then(
    (Sauce) => {
      res.status(200).json(Sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error,
        message : "Sauce introuvable"
      });
    }
  );
};

exports.createSauce = (req, res, next) => {
  const bodyReq = JSON.parse(req.body.sauce);
  delete bodyReq._id;
  delete bodyReq._userId;
  const lasauce = new Sauce({
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ...bodyReq
  });

  lasauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
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
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...lasauce, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.likeSystem = (req, res, next) => {
  const lasauce = JSON.parse(req.body.like);
  delete req.body.userId;
  switch (lasauce) {
     case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
      )
        .then(() => res.status(200).json({ message: 'like !' }))
        .catch((error) => res.status(400).json({ error }));
      break;
     case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
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
        })
        .catch((error) => res.status(404).json({ error }));
      break;
    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } }
      )
        .then(() => {
          res.status(200).json({ message: 'Dislike en vue !' });
        })
        .catch((error) => res.status(400).json({ error }));
      break;
    default:
      console.log(error);
  }  
};