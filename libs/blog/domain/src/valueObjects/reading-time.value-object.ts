import type { ValueObject } from '@toxictoast/shared-kernel';

export class ReadingTime implements ValueObject<number> {
  private constructor(private readonly minutes: number) {}

  static fromMarkdown(markdown: string, wordsPerMinute = 200): ReadingTime {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;
    return new ReadingTime(Math.ceil(words / wordsPerMinute));
  }

  get value(): number {
    return this.minutes;
  }

  equals(other: ValueObject<number>): boolean {
    return other.value === this.minutes;
  }
}
