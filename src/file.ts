import { Track } from './track.js';
import { codes2Str, str2Bytes } from './util.js';
import type { FileConfig } from './types.js';

export class File {
  static readonly HDR_CHUNKID = 'MThd';
  static readonly HDR_CHUNK_SIZE = '\x00\x00\x00\x06';
  static readonly HDR_TYPE0 = '\x00\x00';
  static readonly HDR_TYPE1 = '\x00\x01';

  ticks: number;
  tracks: Track[];

  constructor(config?: FileConfig) {
    const c = config || {};
    if (c.ticks !== undefined) {
      if (typeof c.ticks !== 'number') {
        throw new Error('Ticks per beat must be a number!');
      }
      if (c.ticks <= 0 || c.ticks >= 1 << 15 || c.ticks % 1 !== 0) {
        throw new Error('Ticks per beat must be an integer between 1 and 32767!');
      }
    }
    this.ticks = c.ticks || 128;
    this.tracks = [];
  }

  addTrack(): Track;
  addTrack(track: Track): this;
  addTrack(track?: Track): Track | this {
    if (track) {
      this.tracks.push(track);
      return this;
    } else {
      const newTrack = new Track();
      this.tracks.push(newTrack);
      return newTrack;
    }
  }

  toBytes(): string {
    const trackCount = this.tracks.length.toString(16);

    let bytes = File.HDR_CHUNKID + File.HDR_CHUNK_SIZE;

    if (parseInt(trackCount, 16) > 1) {
      bytes += File.HDR_TYPE1;
    } else {
      bytes += File.HDR_TYPE0;
    }

    bytes += codes2Str(str2Bytes(trackCount, 2));
    bytes += String.fromCharCode(this.ticks / 256, this.ticks % 256);

    this.tracks.forEach((track) => {
      bytes += codes2Str(track.toBytes());
    });

    return bytes;
  }

  toUint8Array(): Uint8Array {
    const str = this.toBytes();
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  }

  toBlob(genericType?: boolean): Blob {
    return new Blob([this.toUint8Array() as BlobPart], {
      type: genericType ? 'application/octet-stream' : 'audio/x-midi',
    });
  }
}
