import { describe, it, expect } from 'vitest';
import { MidiEvent } from '../src/event.js';
import { MidiEventType } from '../src/types.js';

describe('MidiEvent', () => {
  describe('static constants', () => {
    it('has correct event type values', () => {
      expect(MidiEvent.NOTE_OFF).toBe(0x80);
      expect(MidiEvent.NOTE_ON).toBe(0x90);
      expect(MidiEvent.AFTER_TOUCH).toBe(0xa0);
      expect(MidiEvent.CONTROLLER).toBe(0xb0);
      expect(MidiEvent.PROGRAM_CHANGE).toBe(0xc0);
      expect(MidiEvent.CHANNEL_AFTERTOUCH).toBe(0xd0);
      expect(MidiEvent.PITCH_BEND).toBe(0xe0);
    });

    it('matches MidiEventType constants', () => {
      expect(MidiEvent.NOTE_ON).toBe(MidiEventType.NOTE_ON);
      expect(MidiEvent.NOTE_OFF).toBe(MidiEventType.NOTE_OFF);
    });
  });

  describe('constructor', () => {
    it('creates an event with all parameters', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
        time: 0,
      });

      expect(event.type).toBe(MidiEvent.NOTE_ON);
      expect(event.channel).toBe(0);
      expect(event.param1).toBe(60);
      expect(event.param2).toBe(90);
    });

    it('handles missing param2', () => {
      const event = new MidiEvent({
        type: MidiEvent.PROGRAM_CHANGE,
        channel: 0,
        param1: 19,
      });

      expect(event.param2).toBeUndefined();
    });

    it('defaults time to 0 ticks', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
      });

      expect(event.time).toEqual([0]);
    });
  });

  describe('setType', () => {
    it('rejects types below NOTE_OFF', () => {
      expect(
        () =>
          new MidiEvent({
            type: 0x70,
            channel: 0,
            param1: 0,
          }),
      ).toThrow('unknown event');
    });

    it('rejects types above PITCH_BEND', () => {
      expect(
        () =>
          new MidiEvent({
            type: 0xf0,
            channel: 0,
            param1: 0,
          }),
      ).toThrow('unknown event');
    });
  });

  describe('setChannel', () => {
    it('accepts valid channels 0-15', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 15,
        param1: 60,
        param2: 90,
      });
      expect(event.channel).toBe(15);
    });

    it('rejects channel below 0', () => {
      expect(
        () =>
          new MidiEvent({
            type: MidiEvent.NOTE_ON,
            channel: -1,
            param1: 60,
          }),
      ).toThrow('out of bounds');
    });

    it('rejects channel above 15', () => {
      expect(
        () =>
          new MidiEvent({
            type: MidiEvent.NOTE_ON,
            channel: 16,
            param1: 60,
          }),
      ).toThrow('out of bounds');
    });
  });

  describe('toBytes', () => {
    it('serializes a NOTE_ON event correctly', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, type|channel=0x90, param1=60, param2=90]
      expect(bytes).toEqual([0, 0x90, 60, 90]);
    });

    it('serializes with correct channel in status byte', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 9,
        param1: 36,
        param2: 100,
        time: 0,
      });

      const bytes = event.toBytes();
      // type|channel = 0x90 | 9 = 0x99
      expect(bytes[1]).toBe(0x99);
    });

    it('omits param2 for PROGRAM_CHANGE', () => {
      const event = new MidiEvent({
        type: MidiEvent.PROGRAM_CHANGE,
        channel: 0,
        param1: 19,
        time: 0,
      });

      const bytes = event.toBytes();
      // [time=0, type|channel=0xC0, param1=19] -- no param2
      expect(bytes).toEqual([0, 0xc0, 19]);
    });

    it('includes tick time encoding', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
        time: 128,
      });

      const bytes = event.toBytes();
      // 128 ticks = [0x81, 0x00] in variable-length encoding
      expect(bytes[0]).toBe(0x81);
      expect(bytes[1]).toBe(0x00);
    });
  });
});
