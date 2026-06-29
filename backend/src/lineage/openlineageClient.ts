import axios from 'axios';
import CircuitBreaker from 'opossum';
import logger from '../utils/logger';

import Joi from 'joi';
import { env } from '../config/env';

const OPENLINEAGE_URL = env.OPENLINEAGE_URL || 'http://localhost:3000/api/v1/lineage';

const schema = Joi.object({
  eventType: Joi.string().required(),
  eventTime: Joi.string().isoDate().required(),
  producer: Joi.string().required(),
  job: Joi.object().required(),
  input: Joi.object().required(),
  output: Joi.object().required()
});

const breaker = new CircuitBreaker(async (event: any) => {
  await axios.post(OPENLINEAGE_URL, event, { timeout: 5000 });
}, {
  timeout: 7000,
  errorThresholdPercentage: 50,
  resetTimeout: 30_000
});

export async function emitLineageEvent(event: any) {
  const { error } = schema.validate(event);
  if (error) {
    logger.warn('OpenLineage event validation failed', { error: error.message });
    throw error;
  }

  try {
    await breaker.fire(event);
    logger.info('Lineage emitted', { producer: event.producer, job: event.job });
    return true;
  } catch (err) {
    logger.warn('Lineage emission failed (will be retried by outbox)', { err: err?.message || err });
    throw err;
  }
}
