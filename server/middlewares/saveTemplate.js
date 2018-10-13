import UploadFormTemplate from '../models/UploadFormTemplate';

export const saveTemplate =  (req, res, next) => {

  const { saveTemplate, title, wikiSource, categories, ...rest } = req.body;

  if (saveTemplate) {
    UploadFormTemplate.create({
      user: req.user._id,
      title,
      wikiSource,
      form: { ...rest, categories: categories.split(',') },
    })
    .then((result) => {
      console.log(result);
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send('Something went wrong while saving the template, please try again');
    })
  } else {
    next();
  }

}