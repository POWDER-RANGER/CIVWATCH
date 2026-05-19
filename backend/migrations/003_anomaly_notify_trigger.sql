-- Migration 003: pg_notify trigger on anomaly_events
-- Fires after every INSERT and notifies the backend anomalyListener,
-- which broadcasts the new row to all connected socket.io clients.
-- Channel: alerts_channel
-- Payload: full row as JSON (row_to_json(NEW))

CREATE OR REPLACE FUNCTION notify_anomaly_insert()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify('alerts_channel', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$;

-- Idempotent: drop if exists before recreating
DROP TRIGGER IF EXISTS anomaly_events_notify ON anomaly_events;

CREATE TRIGGER anomaly_events_notify
  AFTER INSERT ON anomaly_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_anomaly_insert();
