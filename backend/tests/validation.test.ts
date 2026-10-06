import { describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../src/middleware/validation';

function createResponse() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return response as unknown as Response & typeof response;
}

describe('request validation middleware', () => {
  it('stores parsed and coerced body values before continuing', () => {
    const req = { body: { count: '4' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateBody(z.object({ count: z.coerce.number().int() }));

    middleware(req, res, next);

    expect(req.validatedBody).toEqual({ count: 4 });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns a client error for an invalid body without continuing', () => {
    const req = { body: { count: 'not a number' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateBody(z.object({ count: z.coerce.number().int() }));

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('stores validated query values before continuing', () => {
    const req = { query: { limit: '25' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateQuery(z.object({ limit: z.coerce.number().int().max(200) }));

    middleware(req, res, next);

    expect(req.validatedQuery).toEqual({ limit: 25 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid query values', () => {
    const req = { query: { limit: '999' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateQuery(z.object({ limit: z.coerce.number().int().max(200) }));

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Query validation failed' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('stores validated route parameters before continuing', () => {
    const req = { params: { id: 'record-1' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateParams(z.object({ id: z.string().regex(/^record-\d+$/) }));

    middleware(req, res, next);

    expect(req.validatedParams).toEqual({ id: 'record-1' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid route parameters', () => {
    const req = { params: { id: 'invalid' } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as unknown as NextFunction;
    const middleware = validateParams(z.object({ id: z.string().regex(/^record-\d+$/) }));

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Params validation failed' }));
    expect(next).not.toHaveBeenCalled();
  });
});

