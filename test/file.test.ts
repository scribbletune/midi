import { describe, it, expect } from 'vitest';
import { File } from '../src/file.js';
import { Track } from '../src/track.js';

describe('File', () => {
  describe('constructor', () => {
    it('defaults ticks to 128', () => {
      const file = new File();
      expect(file.ticks).toBe(128);
    });

    it('accepts custom ticks', () => {
      const file = new File({ ticks: 1000 });
      expect(file.ticks).toBe(1000);
    });

    it('starts with empty tracks array', () => {
      const file = new File();
      expect(file.tracks).toEqual([]);
    });

    it('throws on non-number ticks', () => {
      expect(
        () => new File({ ticks: 'not a number' as unknown as number }),
      ).toThrow('must be a number');
    });

    it('throws on ticks >= 32768', () => {
      expect(() => new File({ ticks: 85000 })).toThrow(
        'must be an integer between 1 and 32767',
      );
    });

    it('throws on non-integer ticks', () => {
      expect(() => new File({ ticks: 133.7 })).toThrow(
        'must be an integer between 1 and 32767',
      );
    });

    it('throws on zero ticks', () => {
      expect(() => new File({ ticks: 0 })).toThrow(
        'must be an integer between 1 and 32767',
      );
    });

    it('throws on negative ticks', () => {
      expect(() => new File({ ticks: -1 })).toThrow(
        'must be an integer between 1 and 32767',
      );
    });

    it('accepts maximum valid ticks (32767)', () => {
      const file = new File({ ticks: 32767 });
      expect(file.ticks).toBe(32767);
    });

    it('accepts minimum valid ticks (1)', () => {
      const file = new File({ ticks: 1 });
      expect(file.ticks).toBe(1);
    });
  });

  describe('addTrack', () => {
    it('returns a new Track when called without arguments', () => {
      const file = new File();
      const track = file.addTrack();

      expect(track).toBeInstanceOf(Track);
      expect(file.tracks).toHaveLength(1);
      expect(file.tracks[0]).toBe(track);
    });

    it('returns this (File) when called with a track', () => {
      const file = new File();
      const track = new Track();
      const result = file.addTrack(track);

      expect(result).toBe(file);
      expect(file.tracks).toHaveLength(1);
      expect(file.tracks[0]).toBe(track);
    });

    it('supports adding multiple tracks', () => {
      const file = new File();
      file.addTrack();
      file.addTrack();
      file.addTrack();

      expect(file.tracks).toHaveLength(3);
    });
  });

  describe('toBytes', () => {
    it('starts with MThd header', () => {
      const file = new File();
      file.addTrack();
      const bytes = file.toBytes();

      expect(bytes.substring(0, 4)).toBe('MThd');
    });

    it('has correct chunk size (6 bytes)', () => {
      const file = new File();
      file.addTrack();
      const bytes = file.toBytes();

      // Bytes 4-7 should be \x00\x00\x00\x06
      expect(bytes.charCodeAt(4)).toBe(0);
      expect(bytes.charCodeAt(5)).toBe(0);
      expect(bytes.charCodeAt(6)).toBe(0);
      expect(bytes.charCodeAt(7)).toBe(6);
    });

    it('uses Type 0 for single track', () => {
      const file = new File();
      file.addTrack();
      const bytes = file.toBytes();

      // Bytes 8-9: Type 0
      expect(bytes.charCodeAt(8)).toBe(0);
      expect(bytes.charCodeAt(9)).toBe(0);
    });

    it('uses Type 1 for multiple tracks', () => {
      const file = new File();
      file.addTrack();
      file.addTrack();
      const bytes = file.toBytes();

      // Bytes 8-9: Type 1
      expect(bytes.charCodeAt(8)).toBe(0);
      expect(bytes.charCodeAt(9)).toBe(1);
    });

    it('encodes ticks per beat correctly', () => {
      const file = new File({ ticks: 128 });
      file.addTrack();
      const bytes = file.toBytes();

      // Bytes 12-13: ticks per beat
      const ticksHigh = bytes.charCodeAt(12);
      const ticksLow = bytes.charCodeAt(13);
      expect(ticksHigh * 256 + ticksLow).toBe(128);
    });

    it('includes track data', () => {
      const file = new File();
      file.addTrack();
      const bytes = file.toBytes();

      // Should be longer than just the header (14 bytes)
      expect(bytes.length).toBeGreaterThan(14);
    });
  });

  describe('toUint8Array', () => {
    it('returns a Uint8Array', () => {
      const file = new File();
      file.addTrack();
      const arr = file.toUint8Array();

      expect(arr).toBeInstanceOf(Uint8Array);
    });

    it('has same content as toBytes', () => {
      const file = new File();
      file.addTrack().addNote(0, 'c4', 128);
      const bytes = file.toBytes();
      const arr = file.toUint8Array();

      expect(arr.length).toBe(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        expect(arr[i]).toBe(bytes.charCodeAt(i));
      }
    });
  });

  describe('toBlob', () => {
    it('returns a Blob with audio/x-midi type by default', () => {
      const file = new File();
      file.addTrack();
      const blob = file.toBlob();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/x-midi');
    });

    it('returns a Blob with generic type when requested', () => {
      const file = new File();
      file.addTrack();
      const blob = file.toBlob(true);

      expect(blob.type).toBe('application/octet-stream');
    });

    it('has same size as toBytes output', () => {
      const file = new File();
      file.addTrack().addNote(0, 'c4', 128);
      const blob = file.toBlob();
      const bytes = file.toBytes();

      expect(blob.size).toBe(bytes.length);
    });
  });
});
