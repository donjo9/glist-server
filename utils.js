const jwt = require("jsonwebtoken");

function getUserId(AuthHeader) {
  if (AuthHeader) {
    const token = AuthHeader.replace("Bearer ", "");
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  }

  throw new Error("Not authenticated");
}

function getToken({ id, name, email }) {
  const token = jwt.sign(
    {
      userId: id,
      data: { name, email },
    },
    process.env.JWT_SECRET
  );
  return token;
}

module.exports = { getUserId, getToken };
