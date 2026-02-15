import { MidiEvent } from './event.js';
import { MetaEvent } from './meta-event.js';
import { ensureMidiPitch, mpqnFromBpm, str2Bytes } from './util.js';
import { DEFAULT_VOLUME } from './constants.js';
import type { PitchInput } from './types.js';

export class Track {
  static readonly START_BYTES = [0x4d, 0x54, 0x72, 0x6b];
  static readonly END_BYTES = [0x00, 0xff, 0x2f, 0x00];

  events: Array<MidiEvent | MetaEvent>;

  constructor(config?: { events?: Array<MidiEvent | MetaEvent> }) {
    this.events = config?.events ?? [];
  }

  addEvent(event: MidiEvent | MetaEvent): this {
    this.events.push(event);
    return this;
  }

  addNoteOn(
    channel: number,
    pitch: PitchInput,
    time?: number,
    velocity?: number,
  ): this {
    this.events.push(
      new MidiEvent({
        type: MidiEvent.NOTE_ON,
        channel: channel,
        param1: ensureMidiPitch(pitch),
        param2: velocity || DEFAULT_VOLUME,
        time: time || 0,
      }),
    );
    return this;
  }

  addNoteOff(
    channel: number,
    pitch: PitchInput,
    time?: number,
    velocity?: number,
  ): this {
    this.events.push(
      new MidiEvent({
        type: MidiEvent.NOTE_OFF,
        channel: channel,
        param1: ensureMidiPitch(pitch),
        param2: velocity || DEFAULT_VOLUME,
        time: time || 0,
      }),
    );
    return this;
  }

  addNote(
    channel: number,
    pitch: PitchInput,
    dur?: number,
    time?: number,
    velocity?: number,
  ): this {
    this.addNoteOn(channel, pitch, time, velocity);
    if (dur) {
      this.addNoteOff(channel, pitch, dur, velocity);
    }
    return this;
  }

  addChord(
    channel: number,
    chord: PitchInput[],
    dur?: number,
    velocity?: number,
  ): this {
    if (!Array.isArray(chord) || chord.length === 0) {
      throw new Error('Chord must be a non-empty array of pitches');
    }
    chord.forEach((note) => {
      this.addNoteOn(channel, note, 0, velocity);
    });
    chord.forEach((note, index) => {
      if (index === 0) {
        this.addNoteOff(channel, note, dur);
      } else {
        this.addNoteOff(channel, note);
      }
    });
    return this;
  }

  setInstrument(channel: number, instrument: number, time?: number): this {
    this.events.push(
      new MidiEvent({
        type: MidiEvent.PROGRAM_CHANGE,
        channel: channel,
        param1: instrument,
        time: time || 0,
      }),
    );
    return this;
  }

  setTempo(bpm: number, time?: number): this {
    this.events.push(
      new MetaEvent({
        type: MetaEvent.TEMPO,
        data: mpqnFromBpm(bpm),
        time: time || 0,
      }),
    );
    return this;
  }

  setTimeSignature(
    numerator: number,
    denominator: number,
    time?: number,
  ): this {
    const ddlog2 = Math.log2(denominator);
    if (ddlog2 !== Math.floor(ddlog2)) {
      throw new Error(
        'Time signature denominator must be an exact power of 2!',
      );
    }
    this.events.push(
      new MetaEvent({
        type: MetaEvent.TIME_SIG,
        data: [numerator & 0xff, Math.floor(ddlog2) & 0xff, 0x18, 0x08],
        time: time || 0,
      }),
    );
    return this;
  }

  setKeySignature(
    accidentals: number,
    minor?: boolean,
    time?: number,
  ): this {
    this.events.push(
      new MetaEvent({
        type: MetaEvent.KEY_SIG,
        data: [accidentals & 0xff, minor ? 1 : 0],
        time: time || 0,
      }),
    );
    return this;
  }

  toBytes(): number[] {
    let trackLength = 0;
    const eventBytes: number[] = [];
    const startBytes = Track.START_BYTES;
    const endBytes = Track.END_BYTES;

    this.events.forEach((event) => {
      const bytes = event.toBytes();
      trackLength += bytes.length;
      eventBytes.push(...bytes);
    });

    trackLength += endBytes.length;

    const lengthBytes = str2Bytes(trackLength.toString(16), 4);

    return startBytes.concat(lengthBytes, eventBytes, endBytes);
  }

  // Aliases for fluent API
  declare noteOn: Track['addNoteOn'];
  declare noteOff: Track['addNoteOff'];
  declare note: Track['addNote'];
  declare chord: Track['addChord'];
  declare instrument: Track['setInstrument'];
  declare tempo: Track['setTempo'];
  declare timeSignature: Track['setTimeSignature'];
  declare keySignature: Track['setKeySignature'];
}

// Prototype-level aliases (no per-instance overhead)
Track.prototype.noteOn = Track.prototype.addNoteOn;
Track.prototype.noteOff = Track.prototype.addNoteOff;
Track.prototype.note = Track.prototype.addNote;
Track.prototype.chord = Track.prototype.addChord;
Track.prototype.instrument = Track.prototype.setInstrument;
Track.prototype.tempo = Track.prototype.setTempo;
Track.prototype.timeSignature = Track.prototype.setTimeSignature;
Track.prototype.keySignature = Track.prototype.setKeySignature;
