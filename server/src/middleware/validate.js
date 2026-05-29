const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      schemas.query.parse(req.query);
    }
    if (schemas.params) {
      schemas.params.parse(req.params);
    }
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }
};

module.exports = validate;
