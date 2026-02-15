import { describe, it, expect } from 'vitest';
import { Track } from '../src/track.js';
import { MidiEvent } from '../src/event.js';
import { MetaEvent } from '../src/meta-event.js';

describe('Track', () => {
  describe('constructor', () => {
    it('creates an empty track by default', () => {
      const track = new Track();
      expect(track.events).toEqual([]);
    });

    it('accepts pre-existing events', () => {
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
      });
      const track = new Track({ events: [event] });
      expect(track.events).toHaveLength(1);
    });
  });

  describe('addEvent', () => {
    it('adds an event to the track', () => {
      const track = new Track();
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
      });
      track.addEvent(event);
      expect(track.events).toHaveLength(1);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      const event = new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: 0,
        param1: 60,
        param2: 90,
      });
      const result = track.addEvent(event);
      expect(result).toBe(track);
    });
  });

  describe('addNoteOn', () => {
    it('adds a NOTE_ON event', () => {
      const track = new Track();
      track.addNoteOn(0, 'c4');

      expect(track.events).toHaveLength(1);
      const event = track.events[0] as MidiEvent;
      expect(event.type).toBe(MidiEvent.NOTE_ON);
      expect(event.param1).toBe(60); // c4
      expect(event.param2).toBe(90); // DEFAULT_VOLUME
    });

    it('accepts numeric pitch', () => {
      const track = new Track();
      track.addNoteOn(0, 60);

      const event = track.events[0] as MidiEvent;
      expect(event.param1).toBe(60);
    });

    it('uses custom velocity', () => {
      const track = new Track();
      track.addNoteOn(0, 'c4', 0, 127);

      const event = track.events[0] as MidiEvent;
      expect(event.param2).toBe(127);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.addNoteOn(0, 'c4')).toBe(track);
    });
  });

  describe('addNoteOff', () => {
    it('adds a NOTE_OFF event', () => {
      const track = new Track();
      track.addNoteOff(0, 'c4');

      const event = track.events[0] as MidiEvent;
      expect(event.type).toBe(MidiEvent.NOTE_OFF);
      expect(event.param1).toBe(60);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.addNoteOff(0, 'c4')).toBe(track);
    });
  });

  describe('addNote', () => {
    it('adds both NOTE_ON and NOTE_OFF events', () => {
      const track = new Track();
      track.addNote(0, 'c4', 128);

      expect(track.events).toHaveLength(2);
      expect((track.events[0] as MidiEvent).type).toBe(MidiEvent.NOTE_ON);
      expect((track.events[1] as MidiEvent).type).toBe(MidiEvent.NOTE_OFF);
    });

    it('sets correct pitch on both events', () => {
      const track = new Track();
      track.addNote(0, 'e4', 128);

      expect((track.events[0] as MidiEvent).param1).toBe(64); // e4
      expect((track.events[1] as MidiEvent).param1).toBe(64);
    });

    it('only adds NOTE_ON when duration is 0 or undefined', () => {
      const track = new Track();
      track.addNote(0, 'c4');

      expect(track.events).toHaveLength(1);
      expect((track.events[0] as MidiEvent).type).toBe(MidiEvent.NOTE_ON);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.addNote(0, 'c4', 128)).toBe(track);
    });
  });

  describe('addChord', () => {
    it('adds NOTE_ON then NOTE_OFF for each pitch', () => {
      const track = new Track();
      track.addChord(0, ['c4', 'e4', 'g4'], 256);

      // 3 note-ons + 3 note-offs = 6 events
      expect(track.events).toHaveLength(6);

      // First 3 should be NOTE_ON
      for (let i = 0; i < 3; i++) {
        expect((track.events[i] as MidiEvent).type).toBe(MidiEvent.NOTE_ON);
      }

      // Last 3 should be NOTE_OFF
      for (let i = 3; i < 6; i++) {
        expect((track.events[i] as MidiEvent).type).toBe(MidiEvent.NOTE_OFF);
      }
    });

    it('sets correct pitches', () => {
      const track = new Track();
      track.addChord(0, ['c4', 'e4', 'g4'], 256);

      expect((track.events[0] as MidiEvent).param1).toBe(60); // c4
      expect((track.events[1] as MidiEvent).param1).toBe(64); // e4
      expect((track.events[2] as MidiEvent).param1).toBe(67); // g4
    });

    it('throws on non-array chord', () => {
      const track = new Track();
      expect(() =>
        track.addChord(0, 'c4' as unknown as string[], 256),
      ).toThrow();
    });

    it('throws on empty chord array', () => {
      const track = new Track();
      expect(() => track.addChord(0, [], 256)).toThrow();
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.addChord(0, ['c4', 'e4', 'g4'], 256)).toBe(track);
    });
  });

  describe('setInstrument', () => {
    it('adds a PROGRAM_CHANGE event', () => {
      const track = new Track();
      track.setInstrument(0, 0x13);

      const event = track.events[0] as MidiEvent;
      expect(event.type).toBe(MidiEvent.PROGRAM_CHANGE);
      expect(event.param1).toBe(0x13);
      expect(event.channel).toBe(0);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.setInstrument(0, 0)).toBe(track);
    });
  });

  describe('setTempo', () => {
    it('adds a TEMPO meta event', () => {
      const track = new Track();
      track.setTempo(120);

      const event = track.events[0] as MetaEvent;
      expect(event.type).toBe(MetaEvent.TEMPO);
      expect(event.data).toEqual([7, 161, 32]);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.setTempo(120)).toBe(track);
    });
  });

  describe('setTimeSignature', () => {
    it('adds a TIME_SIG meta event for 4/4', () => {
      const track = new Track();
      track.setTimeSignature(4, 4);

      const event = track.events[0] as MetaEvent;
      expect(event.type).toBe(MetaEvent.TIME_SIG);
      // denominator 4 = log2(4) = 2
      expect(event.data).toEqual([4, 2, 0x18, 0x08]);
    });

    it('adds a TIME_SIG meta event for 3/8', () => {
      const track = new Track();
      track.setTimeSignature(3, 8);

      const event = track.events[0] as MetaEvent;
      // denominator 8 = log2(8) = 3
      expect(event.data).toEqual([3, 3, 0x18, 0x08]);
    });

    it('throws on non-power-of-2 denominator', () => {
      const track = new Track();
      expect(() => track.setTimeSignature(4, 3)).toThrow(
        'power of 2',
      );
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.setTimeSignature(4, 4)).toBe(track);
    });
  });

  describe('setKeySignature', () => {
    it('adds a KEY_SIG meta event for C major', () => {
      const track = new Track();
      track.setKeySignature(0);

      const event = track.events[0] as MetaEvent;
      expect(event.type).toBe(MetaEvent.KEY_SIG);
      expect(event.data).toEqual([0, 0]);
    });

    it('adds a KEY_SIG for 2 sharps (D major)', () => {
      const track = new Track();
      track.setKeySignature(2);

      const event = track.events[0] as MetaEvent;
      expect(event.data).toEqual([2, 0]);
    });

    it('handles minor keys', () => {
      const track = new Track();
      track.setKeySignature(0, true);

      const event = track.events[0] as MetaEvent;
      expect(event.data).toEqual([0, 1]);
    });

    it('returns this for chaining', () => {
      const track = new Track();
      expect(track.setKeySignature(0)).toBe(track);
    });
  });

  describe('aliases', () => {
    it('noteOn is an alias for addNoteOn', () => {
      expect(Track.prototype.noteOn).toBe(Track.prototype.addNoteOn);
    });

    it('noteOff is an alias for addNoteOff', () => {
      expect(Track.prototype.noteOff).toBe(Track.prototype.addNoteOff);
    });

    it('note is an alias for addNote', () => {
      expect(Track.prototype.note).toBe(Track.prototype.addNote);
    });

    it('chord is an alias for addChord', () => {
      expect(Track.prototype.chord).toBe(Track.prototype.addChord);
    });

    it('instrument is an alias for setInstrument', () => {
      expect(Track.prototype.instrument).toBe(Track.prototype.setInstrument);
    });

    it('tempo is an alias for setTempo', () => {
      expect(Track.prototype.tempo).toBe(Track.prototype.setTempo);
    });

    it('timeSignature is an alias for setTimeSignature', () => {
      expect(Track.prototype.timeSignature).toBe(
        Track.prototype.setTimeSignature,
      );
    });

    it('keySignature is an alias for setKeySignature', () => {
      expect(Track.prototype.keySignature).toBe(
        Track.prototype.setKeySignature,
      );
    });
  });

  describe('toBytes', () => {
    it('starts with MTrk header bytes', () => {
      const track = new Track();
      const bytes = track.toBytes();

      expect(bytes[0]).toBe(0x4d); // M
      expect(bytes[1]).toBe(0x54); // T
      expect(bytes[2]).toBe(0x72); // r
      expect(bytes[3]).toBe(0x6b); // k
    });

    it('ends with end-of-track bytes', () => {
      const track = new Track();
      const bytes = track.toBytes();
      const len = bytes.length;

      expect(bytes[len - 4]).toBe(0x00);
      expect(bytes[len - 3]).toBe(0xff);
      expect(bytes[len - 2]).toBe(0x2f);
      expect(bytes[len - 1]).toBe(0x00);
    });

    it('includes track length after header', () => {
      const track = new Track();
      const bytes = track.toBytes();

      // Empty track: length = end bytes only = 4 bytes
      // Length bytes are at positions 4-7
      const length =
        (bytes[4]! << 24) | (bytes[5]! << 16) | (bytes[6]! << 8) | bytes[7]!;
      expect(length).toBe(4); // just end-of-track bytes
    });

    it('includes event bytes in length calculation', () => {
      const track = new Track();
      track.addNote(0, 'c4', 128);

      const bytes = track.toBytes();
      const length =
        (bytes[4]! << 24) | (bytes[5]! << 16) | (bytes[6]! << 8) | bytes[7]!;

      // NOTE_ON (4 bytes: time + status + pitch + velocity) +
      // NOTE_OFF (6 bytes: time[2] + status + pitch + velocity) +
      // end-of-track (4 bytes)
      expect(length).toBeGreaterThan(4);
    });
  });

  describe('method chaining (fluent API)', () => {
    it('supports chaining multiple operations', () => {
      const track = new Track();
      const result = track
        .addNote(0, 'c4', 128)
        .addNote(0, 'd4', 128)
        .addNote(0, 'e4', 128)
        .setTempo(120)
        .setTimeSignature(4, 4)
        .setInstrument(0, 19);

      expect(result).toBe(track);
      expect(track.events.length).toBeGreaterThan(0);
    });

    it('supports chaining with aliases', () => {
      const track = new Track();
      const result = track
        .note(0, 'c4', 128)
        .note(0, 'd4', 128)
        .tempo(120)
        .timeSignature(4, 4)
        .instrument(0, 19);

      expect(result).toBe(track);
    });
  });
});
