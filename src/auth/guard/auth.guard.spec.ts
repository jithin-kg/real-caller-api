import { AuthGuard } from './auth.service';

describe('AuthguardGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard()).toBeDefined();
  });
});
