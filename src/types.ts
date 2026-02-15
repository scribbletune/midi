/** Channel voice message status bytes */
export const MidiEventType = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  AFTER_TOUCH: 0xa0,
  CONTROLLER: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_AFTERTOUCH: 0xd0,
  PITCH_BEND: 0xe0,
} as const;

export type MidiEventTypeValue =
  (typeof MidiEventType)[keyof typeof MidiEventType];

/** Meta event type bytes */
export const MetaEventType = {
  SEQUENCE: 0x00,
  TEXT: 0x01,
  COPYRIGHT: 0x02,
  TRACK_NAME: 0x03,
  INSTRUMENT: 0x04,
  LYRIC: 0x05,
  MARKER: 0x06,
  CUE_POINT: 0x07,
  CHANNEL_PREFIX: 0x20,
  END_OF_TRACK: 0x2f,
  TEMPO: 0x51,
  SMPTE: 0x54,
  TIME_SIG: 0x58,
  KEY_SIG: 0x59,
  SEQ_EVENT: 0x7f,
} as const;

export type MetaEventTypeValue =
  (typeof MetaEventType)[keyof typeof MetaEventType];

export interface MidiEventParams {
  type: number;
  channel: number;
  param1: number;
  param2?: number;
  time?: number;
}

export interface MetaEventParams {
  type: number;
  data?: number[] | number | string;
  time?: number;
}

export interface FileConfig {
  ticks?: number;
}

/** Either a numeric MIDI pitch or a symbolic note name like "c4" */
export type PitchInput = number | string;
