import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { rolResolverGuard } from './rol-resolver.guard';

describe('rolResolverGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => rolResolverGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
