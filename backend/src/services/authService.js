import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function createAuthResponse(user) {
  const token = signToken(user._id);
  return {
    token,
    user: {
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      avatar:       user.avatar,
      grade:        user.grade,
      totalScore:   user.totalScore,
      quizzesTaken: user.quizzesTaken,
      badges:       user.badges,
    },
  };
}
