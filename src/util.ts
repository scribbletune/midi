export const midi_letter_pitches: Record<string, number> = {
  a: 21,
  b: 23,
  c: 12,
  d: 14,
  e: 16,
  f: 17,
  g: 19,
};

export const midi_pitches_letter: Record<string, string> = {
  '12': 'c',
  '13': 'c#',
  '14': 'd',
  '15': 'd#',
  '16': 'e',
  '17': 'f',
  '18': 'f#',
  '19': 'g',
  '20': 'g#',
  '21': 'a',
  '22': 'a#',
  '23': 'b',
};

export const midi_flattened_notes: Record<string, string> = {
  'a#': 'bb',
  'c#': 'db',
  'd#': 'eb',
  'f#': 'gb',
  'g#': 'ab',
};

/**
 * Convert a symbolic note name (e.g. "c4") to a numeric MIDI pitch (e.g. 60).
 */
export function midiPitchFromNote(n: string): number {
  const matches = /([a-g])(#+|b+)?([0-9]+)$/i.exec(n);
  if (!matches) {
    throw new Error(`Invalid note name: ${n}`);
  }
  const note = matches[1]!.toLowerCase();
  const accidental = matches[2] || '';
  const octave = parseInt(matches[3]!, 10);
  return (
    12 * octave +
    midi_letter_pitches[note]! +
    (accidental.substring(0, 1) === '#' ? 1 : -1) * accidental.length
  );
}

/**
 * Ensure that the given argument is converted to a MIDI pitch.
 * Accepts a numeric pitch, a numeric string, or a note name.
 */
export function ensureMidiPitch(p: number | string): number {
  if (typeof p === 'number' || !/[^0-9]/.test(p)) {
    return parseInt(String(p), 10);
  }
  return midiPitchFromNote(p);
}

/**
 * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name (e.g. "c4").
 */
export function noteFromMidiPitch(
  n: number,
  returnFlattened?: boolean,
): string {
  let octave = 0;
  let noteNum = n;

  if (n > 23) {
    octave = Math.floor(n / 12) - 1;
    noteNum = n - octave * 12;
  }

  let noteName = midi_pitches_letter[String(noteNum)];
  if (!noteName) {
    throw new Error(`Invalid MIDI pitch: ${n}`);
  }

  if (returnFlattened && noteName.indexOf('#') > 0) {
    noteName = midi_flattened_notes[noteName]!;
  }

  return noteName + octave;
}

/**
 * Convert beats per minute (BPM) to microseconds per quarter note (MPQN).
 * Returns a 3-byte array.
 */
export function mpqnFromBpm(bpm: number): number[] {
  let mpqn = Math.floor(60000000 / bpm);
  const ret: number[] = [];
  do {
    ret.unshift(mpqn & 0xff);
    mpqn >>= 8;
  } while (mpqn);
  while (ret.length < 3) {
    ret.push(0);
  }
  return ret;
}

/**
 * Convert microseconds per quarter note (MPQN) to beats per minute (BPM).
 */
export function bpmFromMpqn(mpqn: number | number[]): number {
  let m: number;
  if (Array.isArray(mpqn)) {
    m = 0;
    for (let i = 0, l = mpqn.length - 1; l >= 0; ++i, --l) {
      m |= mpqn[i]! << (l * 8);
    }
  } else {
    m = mpqn;
  }
  return Math.floor(60000000 / m);
}

/**
 * Converts an array of bytes to a string of characters.
 */
export function codes2Str(byteArray: number[]): string {
  return String.fromCharCode(...byteArray);
}

/**
 * Converts a hex string to an array of bytes, optionally padded to finalBytes length.
 */
export function str2Bytes(str: string, finalBytes?: number): number[] {
  let s = str;
  if (finalBytes) {
    while (s.length / 2 < finalBytes) {
      s = '0' + s;
    }
  }

  const bytes: number[] = [];
  for (let i = s.length - 1; i >= 0; i = i - 2) {
    const chars = i === 0 ? s[i]! : s[i - 1]! + s[i]!;
    bytes.unshift(parseInt(chars, 16));
  }

  return bytes;
}

/**
 * Translates number of ticks to MIDI variable-length quantity format.
 */
export function translateTickTime(ticks: number): number[] {
  let buffer = ticks & 0x7f;
  let t = ticks >> 7;

  while (t) {
    buffer <<= 8;
    buffer |= (t & 0x7f) | 0x80;
    t = t >> 7;
  }

  const bList: number[] = [];
  while (true) {
    bList.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bList;
}

/** Aggregated Util object for backwards compatibility */
export const Util = {
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
};
