import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";
  // Secure flag must be explicitly opted in via env so HTTP deployments can set cookies.
  const secureCookie = process.env.COOKIE_SECURE === "true";

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite, // CSRF attacks cross-site request forgery attacks
    secure: secureCookie,
  });

  return token;
};
