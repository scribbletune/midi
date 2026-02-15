import { describe, it, expect } from 'vitest';
import { MetaEvent } from '../src/meta-event.js';
import { MetaEventType } from '../src/types.js';

describe('MetaEvent', () => {
  describe('static constants', () => {
    it('has correct meta event type values', () => {
      expect(MetaEvent.SEQUENCE).toBe(0x00);
      expect(MetaEvent.TEXT).toBe(0x01);
      expect(MetaEvent.COPYRIGHT).toBe(0x02);
      expect(MetaEvent.TRACK_NAME).toBe(0x03);
      expect(MetaEvent.INSTRUMENT).toBe(0x04);
      expect(MetaEvent.LYRIC).toBe(0x05);
      expect(MetaEvent.MARKER).toBe(0x06);
      expect(MetaEvent.CUE_POINT).toBe(0x07);
      expect(MetaEvent.CHANNEL_PREFIX).toBe(0x20);
      expect(MetaEvent.END_OF_TRACK).toBe(0x2f);
      expect(MetaEvent.TEMPO).toBe(0x51);
      expect(MetaEvent.SMPTE).toBe(0x54);
      expect(MetaEvent.TIME_SIG).toBe(0x58);
      expect(MetaEvent.KEY_SIG).toBe(0x59);
      expect(MetaEvent.SEQ_EVENT).toBe(0x7f);
    });

    it('matches MetaEventType constants', () => {
      expect(MetaEvent.TEMPO).toBe(MetaEventType.TEMPO);
      expect(MetaEvent.TIME_SIG).toBe(MetaEventType.TIME_SIG);
    });
  });

  describe('constructor', () => {
    it('creates an event with array data', () => {
      const event = new MetaEvent({
        type: MetaEvent.TEMPO,
        data: [7, 161, 32],
        time: 0,
      });

      expect(event.type).toBe(MetaEvent.TEMPO);
      expect(event.data).toEqual([7, 161, 32]);
    });

    it('creates an event with string data', () => {
      const event = new MetaEvent({
        type: MetaEvent.TEXT,
        data: 'hello',
      });

      expect(event.type).toBe(MetaEvent.TEXT);
      expect(event.data).toBe('hello');
    });

    it('creates an event with number data', () => {
      const event = new MetaEvent({
        type: MetaEvent.CHANNEL_PREFIX,
        data: 1,
      });

      expect(event.data).toBe(1);
    });

    it('handles undefined data', () => {
      const event = new MetaEvent({
        type: MetaEvent.END_OF_TRACK,
      });

      expect(event.data).toBeUndefined();
    });
  });

  describe('toBytes', () => {
    it('throws when type is not set (0)', () => {
      const event = new MetaEvent({ type: 0 });
      // type 0 is falsy, so it should throw
      expect(() => event.toBytes()).toThrow('Type for meta-event not specified');
    });

    it('serializes array data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.TEMPO,
        data: [7, 161, 32],
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, 0xFF, type=0x51, length=3, 7, 161, 32]
      expect(bytes).toEqual([0, 0xff, 0x51, 3, 7, 161, 32]);
    });

    it('serializes number data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.CHANNEL_PREFIX,
        data: 1,
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, 0xFF, type=0x20, length=1, data=1]
      expect(bytes).toEqual([0, 0xff, 0x20, 1, 1]);
    });

    it('serializes string data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.TEXT,
        data: 'AB',
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, 0xFF, type=0x01, length=2, 65, 66]
      expect(bytes).toEqual([0, 0xff, 0x01, 2, 65, 66]);
    });

    it('serializes with no data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.END_OF_TRACK,
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, 0xFF, type=0x2f, length=0]
      expect(bytes).toEqual([0, 0xff, 0x2f, 0]);
    });

    it('includes time signature data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.TIME_SIG,
        data: [4, 2, 0x18, 0x08],
        time: 0,
      });

      const bytes = event.toBytes();
      expect(bytes).toEqual([0, 0xff, 0x58, 4, 4, 2, 0x18, 0x08]);
    });

    it('includes key signature data correctly', () => {
      const event = new MetaEvent({
        type: MetaEvent.KEY_SIG,
        data: [0, 0], // C major
        time: 0,
      });

      const bytes = event.toBytes();
      expect(bytes).toEqual([0, 0xff, 0x59, 2, 0, 0]);
    });
  });
});
