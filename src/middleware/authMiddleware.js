// handle authorization
function userAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    // Redirect to login page
    return res.redirect("/login");
  }
}

module.exports = { userAuthenticated };
