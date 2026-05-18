import PasswordResetTokenModel from "../models/PasswordResetToken";
import UserRepository from "./UserRepository";

export type PasswordResetTokenRow = {
  id: string;
  userId: string;
};

class PasswordResetTokenRepository {
  async create(userId: string, tokenHash: string) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PasswordResetTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
    });
  }

  async findValidByHash(tokenHash: string) {
    const resetToken = await PasswordResetTokenModel.findOne({
      tokenHash,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).exec();

    if (!resetToken) {
      return undefined;
    }

    return {
      id: resetToken._id.toString(),
      userId: resetToken.userId,
    };
  }

  async resetPassword(tokenId: string, userId: string, passwordHash: string) {
    await UserRepository.updatePassword(userId, passwordHash);
    await PasswordResetTokenModel.findByIdAndUpdate(tokenId, {
      usedAt: new Date(),
    }).exec();
  }
}

export default new PasswordResetTokenRepository();
