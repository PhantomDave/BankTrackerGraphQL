import { TestBed } from '@angular/core/testing';

import { ApolloClient } from './apollo-client';

describe('ApolloClient', () => {
  let service: ApolloClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApolloClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
