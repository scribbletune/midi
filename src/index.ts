import { Util } from './util.js';
import { MidiEvent } from './event.js';
import { MetaEvent } from './meta-event.js';
import { Track } from './track.js';
import { File } from './file.js';
import { DEFAULT_VOLUME, DEFAULT_DURATION, DEFAULT_CHANNEL } from './constants.js';

// Named exports (modern usage)
export { Util } from './util.js';
export { MidiEvent as Event, MidiEvent } from './event.js';
export { MetaEvent } from './meta-event.js';
export { Track } from './track.js';
export { File } from './file.js';
export { DEFAULT_VOLUME, DEFAULT_DURATION, DEFAULT_CHANNEL } from './constants.js';
export type {
  MidiEventParams,
  MetaEventParams,
  FileConfig,
  PitchInput,
  MidiEventTypeValue,
  MetaEventTypeValue,
} from './types.js';
export { MidiEventType, MetaEventType } from './types.js';

// Default namespace export (backwards compatibility)
const Midi = {
  Util,
  File,
  Track,
  Event: MidiEvent,
  MetaEvent,
  DEFAULT_VOLUME,
  DEFAULT_DURATION,
  DEFAULT_CHANNEL,
};

export default Midi;
