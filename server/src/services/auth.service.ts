import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { config } from '../config';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

export class AuthService {
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async initAdminUser() {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: config.adminUsername },
    });

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(config.adminPassword, 10);

    await prisma.user.create({
      data: {
        username: config.adminUsername,
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Admin user created successfully');
  }
}

export const authService = new AuthService();
