import { MidiEventType } from './types.js';
import type { MidiEventParams } from './types.js';
import { translateTickTime } from './util.js';

export class MidiEvent {
  static readonly NOTE_OFF = MidiEventType.NOTE_OFF;
  static readonly NOTE_ON = MidiEventType.NOTE_ON;
  static readonly AFTER_TOUCH = MidiEventType.AFTER_TOUCH;
  static readonly CONTROLLER = MidiEventType.CONTROLLER;
  static readonly PROGRAM_CHANGE = MidiEventType.PROGRAM_CHANGE;
  static readonly CHANNEL_AFTERTOUCH = MidiEventType.CHANNEL_AFTERTOUCH;
  static readonly PITCH_BEND = MidiEventType.PITCH_BEND;

  time!: number[];
  type!: number;
  channel!: number;
  param1!: number;
  param2: number | undefined;

  constructor(params: MidiEventParams) {
    this.setTime(params.time);
    this.setType(params.type);
    this.setChannel(params.channel);
    this.setParam1(params.param1);
    if (params.param2 !== undefined) {
      this.setParam2(params.param2);
    }
  }

  setTime(ticks?: number): void {
    this.time = translateTickTime(ticks || 0);
  }

  setType(type: number): void {
    if (type < MidiEvent.NOTE_OFF || type > MidiEvent.PITCH_BEND) {
      throw new Error('Trying to set an unknown event: ' + type);
    }
    this.type = type;
  }

  setChannel(channel: number): void {
    if (channel < 0 || channel > 15) {
      throw new Error('Channel is out of bounds.');
    }
    this.channel = channel;
  }

  setParam1(p: number): void {
    this.param1 = p;
  }

  setParam2(p: number): void {
    this.param2 = p;
  }

  toBytes(): number[] {
    const byteArray: number[] = [];
    const typeChannelByte = this.type | (this.channel & 0xf);

    byteArray.push(...this.time);
    byteArray.push(typeChannelByte);
    byteArray.push(this.param1);

    if (this.param2 !== undefined && this.param2 !== null) {
      byteArray.push(this.param2);
    }

    return byteArray;
  }
}
