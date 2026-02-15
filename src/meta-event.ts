import { MetaEventType } from './types.js';
import type { MetaEventParams } from './types.js';
import { translateTickTime } from './util.js';

export class MetaEvent {
  static readonly SEQUENCE = MetaEventType.SEQUENCE;
  static readonly TEXT = MetaEventType.TEXT;
  static readonly COPYRIGHT = MetaEventType.COPYRIGHT;
  static readonly TRACK_NAME = MetaEventType.TRACK_NAME;
  static readonly INSTRUMENT = MetaEventType.INSTRUMENT;
  static readonly LYRIC = MetaEventType.LYRIC;
  static readonly MARKER = MetaEventType.MARKER;
  static readonly CUE_POINT = MetaEventType.CUE_POINT;
  static readonly CHANNEL_PREFIX = MetaEventType.CHANNEL_PREFIX;
  static readonly END_OF_TRACK = MetaEventType.END_OF_TRACK;
  static readonly TEMPO = MetaEventType.TEMPO;
  static readonly SMPTE = MetaEventType.SMPTE;
  static readonly TIME_SIG = MetaEventType.TIME_SIG;
  static readonly KEY_SIG = MetaEventType.KEY_SIG;
  static readonly SEQ_EVENT = MetaEventType.SEQ_EVENT;

  time: number[];
  type: number;
  data: number[] | number | string | undefined;

  constructor(params: MetaEventParams) {
    this.time = translateTickTime(0);
    this.type = 0;
    this.setTime(params.time);
    this.setType(params.type);
    this.setData(params.data);
  }

  setTime(ticks?: number): void {
    this.time = translateTickTime(ticks || 0);
  }

  setType(t: number): void {
    this.type = t;
  }

  setData(d?: number[] | number | string): void {
    this.data = d;
  }

  toBytes(): number[] {
    if (!this.type) {
      throw new Error('Type for meta-event not specified.');
    }

    const byteArray: number[] = [];
    byteArray.push(...this.time);
    byteArray.push(0xff, this.type);

    if (Array.isArray(this.data)) {
      byteArray.push(this.data.length);
      byteArray.push(...this.data);
    } else if (typeof this.data === 'number') {
      byteArray.push(1, this.data);
    } else if (this.data !== null && this.data !== undefined) {
      // string data
      byteArray.push(this.data.length);
      const dataBytes = this.data.split('').map((x) => x.charCodeAt(0));
      byteArray.push(...dataBytes);
    } else {
      byteArray.push(0);
    }

    return byteArray;
  }
}
