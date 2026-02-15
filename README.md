# @scribbletune/midi

A pure-TypeScript MIDI file generator with zero dependencies. A modern rewrite of [jsmidgen](https://github.com/dingram/jsmidgen).

## Install

```bash
npm install @scribbletune/midi
```

## Example Usage

The MIDI file structure is made up of one or more tracks, which contain one or
more events. These events can be note on/off events, instrument changes, tempo
changes, or more exotic things.

```typescript
import { writeFileSync } from "fs";
import { File, Track } from "@scribbletune/midi";

const file = new File();
const track = new Track();
file.addTrack(track);

track.addNote(0, "c4", 64);
track.addNote(0, "d4", 64);
track.addNote(0, "e4", 64);
track.addNote(0, "f4", 64);
track.addNote(0, "g4", 64);
track.addNote(0, "a4", 64);
track.addNote(0, "b4", 64);
track.addNote(0, "c5", 64);

writeFileSync("test.mid", file.toUint8Array());
```

This will create a MIDI file that plays an ascending C major scale starting at middle C.

## Fluent API

The library supports a fluent (chained) style using method aliases:

```typescript
import { writeFileSync } from "fs";
import { File } from "@scribbletune/midi";

const file = new File();
file
  .addTrack()

  .note(0, "c4", 32)
  .note(0, "d4", 32)
  .note(0, "e4", 32)
  .note(0, "f4", 32)
  .note(0, "g4", 32)
  .note(0, "a4", 32)
  .note(0, "b4", 32)
  .note(0, "c5", 32)

  // switch channel 0 from grand piano (default, number 0)
  // to church organ (number 19)
  .instrument(0, 19)

  // create a chord by starting multiple notes without a time gap
  .noteOn(0, "c4", 64)
  .noteOn(0, "e4")
  .noteOn(0, "g4")

  // stop all notes at once
  .noteOff(0, "c4", 47)
  .noteOff(0, "e4")
  .noteOff(0, "g4")

  // alternatively, use addChord for convenience
  .addChord(0, ["c4", "e4", "g4"], 64)

  .setTempo(120)
  .setTimeSignature(4, 4);

writeFileSync("test.mid", file.toUint8Array());
```

Note the use of `instrument()` (alias of `setInstrument()`), and
`noteOn()`/`noteOff()` (aliases of `addNoteOn()`/`addNoteOff()`) to produce chords.

## Imports

```typescript
// Named imports (recommended)
import { File, Track, MidiEvent, MetaEvent, Util } from "@scribbletune/midi";

// Default namespace import (backwards-compatible style)
import Midi from "@scribbletune/midi";
new Midi.File();

// CommonJS
const Midi = require("@scribbletune/midi");
const { File, Track } = require("@scribbletune/midi");
```

## Reference

### File

- `new File([config])` - Create a new MIDI file. Optional `config.ticks` sets ticks per beat (default 128, must be integer 1-32767).
- `addTrack()` - Add a new Track and return it.
- `addTrack(track)` - Add an existing Track and return the File.
- `toBytes()` - Serialize to a string of bytes.
- `toUint8Array()` - Serialize to a `Uint8Array`.
- `toBlob([genericType])` - Serialize to a `Blob`. Uses `audio/x-midi` MIME type by default, or `application/octet-stream` if `genericType` is `true`.

### Track

Time and duration are specified in "ticks" (128 ticks per beat by default). A quarter note = 128 ticks.

Pitch can be a note name with octave (`c4`, `a#3`, `eb5`) or a MIDI number (`60`). Middle C is `c4` or `60`.

- `addNote(channel, pitch, duration[, time[, velocity]])` - Add a complete note (on + off). `time` adds a rest before the note. `velocity` sets strike intensity (default 90).
- `addNoteOn(channel, pitch[, time[, velocity]])` - Start a note.
- `addNoteOff(channel, pitch[, time[, velocity]])` - End a note.
- `addChord(channel, pitches, duration[, velocity])` - Add a chord from an array of pitches.
- `setInstrument(channel, instrument[, time])` - Change instrument (0-based, see [General MIDI](https://en.wikipedia.org/wiki/General_MIDI#Program_change_events), subtract 1).
- `setTempo(bpm[, time])` - Set tempo in beats per minute.
- `setTimeSignature(numerator, denominator[, time])` - Set time signature. Denominator must be a power of 2.
- `setKeySignature(accidentals[, minor[, time]])` - Set key signature. Positive = sharps, negative = flats.

All Track methods return `this` for chaining. Each method also has a shorthand alias: `note`, `noteOn`, `noteOff`, `chord`, `instrument`, `tempo`, `timeSignature`, `keySignature`.

## License

MIT
