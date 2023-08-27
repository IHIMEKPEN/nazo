import { hashData } from '../../api/utils/index';

describe('Helper Functions', () => {
  describe('hashData', () => {
    it('should return a string of length 64 byte characters', async () => {
      const res = await hashData('a', 10);

      expect(res).toHaveLength(60);
    });
  });
});
