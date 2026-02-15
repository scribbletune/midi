import { describe, it, expect } from 'vitest';
import Midi, { File, Track, Event, MidiEvent, MetaEvent, Util } from '../src/index.js';
import { DEFAULT_VOLUME, DEFAULT_DURATION, DEFAULT_CHANNEL } from '../src/constants.js';

describe('Integration', () => {
  describe('default namespace export', () => {
    it('has all expected members', () => {
      expect(Midi.File).toBe(File);
      expect(Midi.Track).toBe(Track);
      expect(Midi.Event).toBe(MidiEvent);
      expect(Midi.MetaEvent).toBe(MetaEvent);
      expect(Midi.Util).toBe(Util);
      expect(Midi.DEFAULT_VOLUME).toBe(DEFAULT_VOLUME);
      expect(Midi.DEFAULT_DURATION).toBe(DEFAULT_DURATION);
      expect(Midi.DEFAULT_CHANNEL).toBe(DEFAULT_CHANNEL);
    });
  });

  describe('named exports', () => {
    it('exports Event as alias for MidiEvent', () => {
      expect(Event).toBe(MidiEvent);
    });
  });

  describe('creating a MIDI file (imperative style)', () => {
    it('creates a file with notes', () => {
      const file = new File();
      const track = new Track();
      file.addTrack(track);
      track.setTimeSignature(4, 4);

      track.addNote(0, 'c4', 64);
      track.addNote(0, 'd4', 64);
      track.addNote(0, 'e4', 64);
      track.addNote(0, 'f4', 64);
      track.addNote(0, 'g4', 64);
      track.addNote(0, 'a4', 64);
      track.addNote(0, 'b4', 64);
      track.addNote(0, 'c5', 64);

      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
      expect(bytes.substring(0, 4)).toBe('MThd');
    });
  });

  describe('creating a MIDI file (fluent style)', () => {
    it('creates a file using method chaining', () => {
      const file = new File();
      file
        .addTrack()
        .addNote(0, 'c4', 32)
        .addNote(0, 'd4', 32)
        .addNote(0, 'e4', 32)
        .addNote(0, 'f4', 32)
        .addNote(0, 'g4', 32)
        .addNote(0, 'a4', 32)
        .addNote(0, 'b4', 32)
        .addNote(0, 'c5', 32)
        .setInstrument(0, 0x13)
        .addNoteOn(0, 'c4', 64)
        .addNoteOn(0, 'e4')
        .addNoteOn(0, 'g4')
        .addNoteOff(0, 'c4', 47)
        .addNoteOff(0, 'e4')
        .addNoteOff(0, 'g4')
        .addNoteOn(0, 'c4', 1)
        .addNoteOn(0, 'e4')
        .addNoteOn(0, 'g4')
        .addNoteOff(0, 'c4', 384)
        .addNoteOff(0, 'e4')
        .addNoteOff(0, 'g4');

      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
      expect(bytes.substring(0, 4)).toBe('MThd');
    });
  });

  describe('chords', () => {
    it('creates a file with chords using noteOn/noteOff', () => {
      const file = new File();
      const track = new Track();
      file.addTrack(track);

      track.addNoteOn(0, 'c4', 64);
      track.addNoteOn(0, 'e4');
      track.addNoteOn(0, 'g4');
      track.addNoteOff(0, 'c4', 47);
      track.addNoteOff(0, 'e4');
      track.addNoteOff(0, 'g4');

      expect(track.events).toHaveLength(6);
      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
    });

    it('creates a file with addChord', () => {
      const file = new File();
      const track = file.addTrack();
      track.addChord(0, ['c4', 'e4', 'g4'], 256);

      expect(track.events).toHaveLength(6);
      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
    });
  });

  describe('binary output consistency', () => {
    it('produces identical output for same input', () => {
      const createFile = () => {
        const file = new File();
        const track = file.addTrack();
        track.setTimeSignature(4, 4);
        track.addNote(0, 'c4', 64);
        track.addNote(0, 'd4', 64);
        track.addNote(0, 'e4', 64);
        return file.toBytes();
      };

      const bytes1 = createFile();
      const bytes2 = createFile();
      expect(bytes1).toBe(bytes2);
    });

    it('toUint8Array matches toBytes', () => {
      const file = new File();
      const track = file.addTrack();
      track.addNote(0, 'c4', 128);
      track.addNote(0, 'e4', 128);
      track.addNote(0, 'g4', 128);

      const bytes = file.toBytes();
      const arr = file.toUint8Array();

      expect(arr.length).toBe(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        expect(arr[i]).toBe(bytes.charCodeAt(i));
      }
    });
  });

  describe('multi-track file', () => {
    it('creates a valid multi-track file', () => {
      const file = new File();
      const track1 = file.addTrack();
      const track2 = file.addTrack();

      track1.addNote(0, 'c4', 128);
      track2.addNote(1, 'e4', 128);

      const bytes = file.toBytes();
      expect(bytes.substring(0, 4)).toBe('MThd');
      // Type 1 (multi-track)
      expect(bytes.charCodeAt(9)).toBe(1);
      // Track count = 2
      expect(bytes.charCodeAt(11)).toBe(2);
    });
  });

  describe('tempo and time signature', () => {
    it('creates a file with tempo and time signature', () => {
      const file = new File();
      const track = file.addTrack();
      track.setTempo(140);
      track.setTimeSignature(3, 4);
      track.setKeySignature(-3, true); // 3 flats, minor
      track.addNote(0, 'c4', 128);

      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
    });
  });

  describe('instrument changes', () => {
    it('creates a file with instrument changes', () => {
      const file = new File();
      const track = file.addTrack();
      track.setInstrument(0, 0); // Acoustic Grand Piano
      track.addNote(0, 'c4', 128);
      track.setInstrument(0, 0x13); // Church Organ
      track.addNote(0, 'c4', 128);

      const bytes = file.toBytes();
      expect(bytes.length).toBeGreaterThan(0);
    });
  });
});
