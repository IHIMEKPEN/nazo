import mongoose from 'mongoose';
import request from 'supertest';
import { User } from '../../../api/models';
import { createServer } from 'http';
import { app } from '../../../api/bootstrap';
import { MONGODB_URI_TEST } from '../../../config';

const server = createServer(app);
const req = request(server);

beforeAll(() => mongoose.connect(MONGODB_URI_TEST));
afterAll(async () => {
  await User.deleteMany();
  await mongoose.connection.close();
  return server.close();
});

describe('Auth Controller', () => {
  const userData = { firstname: 'aa', lastname: 'aa', email: 'aa@gmail.com', password: 'pass' };

  describe('POST /register - register a user', () => {
    afterEach(async () => await User.deleteMany());
    const endPoint = '/api/v1/auth/register';

    it('should return 400 status code and error message if user already exist', async () => {
      await req.post(endPoint).send(userData);
      const res = await req.post(endPoint).send(userData);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/exist/);
    });
    it('should response with error message if firstname field is omitted', async () => {
      const res = await req.post(endPoint).send({ lastname: 'aa', email: 'aa@gmail.com', password: 'pass' });

      expect(res.body.error.field).toBe('firstname');
      expect(res.body.error).toHaveProperty('message');
    });
    it('should response with error message if lastname field is omitted', async () => {
      const res = await req.post(endPoint).send({ firstname: 'aa', email: 'aa@gmail.com', password: 'pass' });

      expect(res.body.error.field).toBe('lastname');
      expect(res.body.error).toHaveProperty('message');
    });
    it('should response with error message if email field is omitted', async () => {
      const res = await req.post(endPoint).send({ firstname: 'aa', lastname: 'aa', password: 'pass' });

      expect(res.body.error.field).toBe('email');
      expect(res.body.error).toHaveProperty('message');
    });
    it('should response with error message if password field is omitted', async () => {
      const res = await req.post(endPoint).send({ firstname: 'aa', lastname: 'aa', email: 'aa@a.com' });

      expect(res.body.error.field).toBe('password');
      expect(res.body.error).toHaveProperty('message');
    });
    it('should return status code 200', async () => {
      const res = await req.post(endPoint).send(userData);
      expect(res.status).toBe(200);
    });
    it('should return a success message', async () => {
      const res = await req.post(endPoint).send(userData);
      expect(res.body).toHaveProperty('message');
    });
    it('should return JSON as content type', async () => {
      const res = await req.post(endPoint).send(userData);
      expect(res.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    });
    it('should return the new registered user data', async () => {
      const res = await req.post(endPoint).send(userData);
      expect(res.body.data.user).toHaveProperty('firstname', 'aa');
    });
  });

  describe('POST /login - user logs in', () => {
    afterEach(async () => await User.deleteMany());

    it('should return 400 status code and error message if wrong email is provided', async () => {
      await req.post('/api/v1/auth/register').send(userData);
      const endPoint = '/api/v1/auth/login';
      const res = await req.post(endPoint).send({ email: 'bb@b.com', password: 'pass' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('message');
    });
    it('should return 400 status code and error message if email is omitted', async () => {
      await req.post('/api/v1/auth/register').send(userData);
      const endPoint = '/api/v1/auth/login';
      const res = await req.post(endPoint).send({ password: 'pass' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('message');
    });
    it('should return 400 status code and error message if password is omitted', async () => {
      await req.post('/api/v1/auth/register').send(userData);
      const endPoint = '/api/v1/auth/login';
      const res = await req.post(endPoint).send({ email: 'aa@a.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('message');
    });
    it('should return 200 status code and token for successfuly login', async () => {
      await req.post('/api/v1/auth/register').send(userData);
      const endPoint = '/api/v1/auth/login';
      const res = await req.post(endPoint).send({ email: 'aa@gmail.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });
  });
});
