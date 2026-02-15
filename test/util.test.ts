import { describe, it, expect } from 'vitest';
import {
  midi_letter_pitches,
  midi_pitches_letter,
  midi_flattened_notes,
  midiPitchFromNote,
  ensureMidiPitch,
  noteFromMidiPitch,
  mpqnFromBpm,
  bpmFromMpqn,
  codes2Str,
  str2Bytes,
  translateTickTime,
  Util,
} from '../src/util.js';

describe('midi_letter_pitches', () => {
  it('maps note letters to correct base pitches', () => {
    expect(midi_letter_pitches['a']).toBe(21);
    expect(midi_letter_pitches['b']).toBe(23);
    expect(midi_letter_pitches['c']).toBe(12);
    expect(midi_letter_pitches['d']).toBe(14);
    expect(midi_letter_pitches['e']).toBe(16);
    expect(midi_letter_pitches['f']).toBe(17);
    expect(midi_letter_pitches['g']).toBe(19);
  });
});

describe('midiPitchFromNote', () => {
  it('converts natural notes correctly', () => {
    expect(midiPitchFromNote('a1')).toBe(33);
    expect(midiPitchFromNote('b2')).toBe(47);
    expect(midiPitchFromNote('c3')).toBe(48);
    expect(midiPitchFromNote('d4')).toBe(62);
    expect(midiPitchFromNote('e5')).toBe(76);
    expect(midiPitchFromNote('f6')).toBe(89);
    expect(midiPitchFromNote('g7')).toBe(103);
  });

  it('converts sharp notes correctly', () => {
    expect(midiPitchFromNote('c#3')).toBe(49);
    expect(midiPitchFromNote('f#6')).toBe(90);
    expect(midiPitchFromNote('g#7')).toBe(104);
  });

  it('converts flat notes correctly', () => {
    expect(midiPitchFromNote('bb1')).toBe(34);
    expect(midiPitchFromNote('eb4')).toBe(63);
  });

  it('handles unconventional notes', () => {
    expect(midiPitchFromNote('fb4')).toBe(64);
    expect(midiPitchFromNote('e#4')).toBe(65);
  });

  it('handles cross-octave notes', () => {
    expect(midiPitchFromNote('b#2')).toBe(48);
    expect(midiPitchFromNote('cb3')).toBe(47);
  });

  it('is case-insensitive', () => {
    expect(midiPitchFromNote('C4')).toBe(60);
    expect(midiPitchFromNote('A4')).toBe(69);
  });

  it('handles middle C (c4 = 60)', () => {
    expect(midiPitchFromNote('c4')).toBe(60);
  });

  it('throws on invalid note names', () => {
    expect(() => midiPitchFromNote('xyz')).toThrow();
    expect(() => midiPitchFromNote('')).toThrow();
  });
});

describe('ensureMidiPitch', () => {
  it('passes through numeric values', () => {
    expect(ensureMidiPitch(2)).toBe(2);
    expect(ensureMidiPitch(60)).toBe(60);
    expect(ensureMidiPitch(127)).toBe(127);
  });

  it('converts note name strings', () => {
    expect(ensureMidiPitch('c3')).toBe(48);
    expect(ensureMidiPitch('c4')).toBe(60);
  });

  it('handles numeric strings', () => {
    expect(ensureMidiPitch('60')).toBe(60);
    expect(ensureMidiPitch('0')).toBe(0);
  });
});

describe('noteFromMidiPitch', () => {
  it('converts pitches to note names', () => {
    expect(noteFromMidiPitch(33)).toBe('a1');
    expect(noteFromMidiPitch(47)).toBe('b2');
    expect(noteFromMidiPitch(48)).toBe('c3');
    expect(noteFromMidiPitch(49)).toBe('c#3');
    expect(noteFromMidiPitch(62)).toBe('d4');
    expect(noteFromMidiPitch(76)).toBe('e5');
    expect(noteFromMidiPitch(89)).toBe('f6');
    expect(noteFromMidiPitch(90)).toBe('f#6');
    expect(noteFromMidiPitch(103)).toBe('g7');
    expect(noteFromMidiPitch(104)).toBe('g#7');
  });

  it('returns flattened notes when requested', () => {
    expect(noteFromMidiPitch(34, true)).toBe('bb1');
    expect(noteFromMidiPitch(63, true)).toBe('eb4');
  });

  it('returns sharp notes by default', () => {
    expect(noteFromMidiPitch(34)).toBe('a#1');
    expect(noteFromMidiPitch(63)).toBe('d#4');
  });

  it('handles low octave notes (0-23)', () => {
    expect(noteFromMidiPitch(12)).toBe('c0');
    expect(noteFromMidiPitch(21)).toBe('a0');
  });
});

describe('mpqnFromBpm', () => {
  it('converts 120 BPM correctly', () => {
    expect(mpqnFromBpm(120)).toEqual([7, 161, 32]);
  });

  it('converts 60 BPM correctly', () => {
    // 60 BPM = 1,000,000 microseconds per quarter note
    const result = mpqnFromBpm(60);
    expect(result.length).toBe(3);
    // Reconstruct the value
    const value = (result[0]! << 16) | (result[1]! << 8) | result[2]!;
    expect(value).toBe(1000000);
  });

  it('always returns a 3-byte array', () => {
    expect(mpqnFromBpm(120)).toHaveLength(3);
    expect(mpqnFromBpm(60)).toHaveLength(3);
    expect(mpqnFromBpm(200)).toHaveLength(3);
  });
});

describe('bpmFromMpqn', () => {
  it('converts 500000 microseconds to 120 BPM', () => {
    expect(bpmFromMpqn(500000)).toBe(120);
  });

  it('converts 1000000 microseconds to 60 BPM', () => {
    expect(bpmFromMpqn(1000000)).toBe(60);
  });

  it('handles array input', () => {
    // [7, 161, 32] = 500000 microseconds = 120 BPM
    expect(bpmFromMpqn([7, 161, 32])).toBe(120);
  });

  it('round-trips with mpqnFromBpm', () => {
    expect(bpmFromMpqn(mpqnFromBpm(120))).toBe(120);
    expect(bpmFromMpqn(mpqnFromBpm(60))).toBe(60);
  });
});

describe('codes2Str', () => {
  it('converts byte array to string', () => {
    expect(codes2Str([65, 66, 67])).toBe('ABC');
  });

  it('handles empty array', () => {
    expect(codes2Str([])).toBe('');
  });

  it('handles single element', () => {
    expect(codes2Str([65])).toBe('A');
  });
});

describe('str2Bytes', () => {
  it('converts hex string to byte array', () => {
    expect(str2Bytes('c')[0]).toBe(12);
  });

  it('pads with zeros to reach finalBytes length', () => {
    const result = str2Bytes('1', 4);
    expect(result).toHaveLength(4);
    expect(result[3]).toBe(1);
    expect(result[0]).toBe(0);
  });

  it('handles multi-byte hex strings', () => {
    const result = str2Bytes('FF');
    expect(result[0]).toBe(255);
  });
});

describe('translateTickTime', () => {
  it('translates small tick values', () => {
    expect(translateTickTime(16)).toEqual([16]);
    expect(translateTickTime(32)).toEqual([32]);
  });

  it('translates larger tick values to variable-length encoding', () => {
    expect(translateTickTime(128)).toEqual([129, 0]);
    expect(translateTickTime(512)).toEqual([132, 0]);
  });

  it('handles zero', () => {
    expect(translateTickTime(0)).toEqual([0]);
  });

  it('handles boundary value 127 (max single-byte)', () => {
    expect(translateTickTime(127)).toEqual([127]);
  });
});

describe('Util aggregated object', () => {
  it('contains all utility functions', () => {
    expect(Util.midi_letter_pitches).toBe(midi_letter_pitches);
    expect(Util.midi_pitches_letter).toBe(midi_pitches_letter);
    expect(Util.midi_flattened_notes).toBe(midi_flattened_notes);
    expect(Util.midiPitchFromNote).toBe(midiPitchFromNote);
    expect(Util.ensureMidiPitch).toBe(ensureMidiPitch);
    expect(Util.noteFromMidiPitch).toBe(noteFromMidiPitch);
    expect(Util.mpqnFromBpm).toBe(mpqnFromBpm);
    expect(Util.bpmFromMpqn).toBe(bpmFromMpqn);
    expect(Util.codes2Str).toBe(codes2Str);
    expect(Util.str2Bytes).toBe(str2Bytes);
    expect(Util.translateTickTime).toBe(translateTickTime);
  });
});
