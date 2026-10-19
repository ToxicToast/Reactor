import {
  Result,
  ValidationError,
  type ValueObject,
} from '@toxictoast/shared-kernel';

export class Slug implements ValueObject<string> {
  private static readonly PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private constructor(private readonly slug: string) {}

  static fromTitle(title: string): Result<Slug> {
    const slug = title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return Slug.create(slug);
  }

  static create(slug: string): Result<Slug> {
    return Slug.PATTERN.test(slug)
      ? Result.ok(new Slug(slug))
      : Result.fail(new ValidationError(`Invalid slug: "${slug}"`));
  }

  get value(): string {
    return this.slug;
  }

  equals(other: ValueObject<string>): boolean {
    return other.value === this.slug;
  }
}
