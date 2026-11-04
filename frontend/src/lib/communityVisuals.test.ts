import { describe, expect, it } from 'vitest';
import { Briefcase, Users } from 'lucide-react';
import { communityColor, communityIcon } from './communityVisuals';

describe('communityColor', () => {
  it('returns the explicit color when one is provided', () => {
    expect(communityColor('any-id', 'bg-amber-500')).toBe('bg-amber-500');
  });

  it('deterministically derives the same color for the same id', () => {
    const first = communityColor('11111111-1111-1111-1111-111111111111');
    const second = communityColor('11111111-1111-1111-1111-111111111111');
    expect(first).toBe(second);
  });

  it('only ever returns a value from the known palette', () => {
    const palette = [
      'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
      'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500',
    ];
    for (const id of ['a', 'bb', 'ccc', 'community-42', 'z']) {
      expect(palette).toContain(communityColor(id));
    }
  });
});

describe('communityIcon', () => {
  it('resolves a known icon name', () => {
    expect(communityIcon('Briefcase')).toBe(Briefcase);
  });

  it('falls back to Users for an unknown or missing icon name', () => {
    expect(communityIcon('NotARealIcon')).toBe(Users);
    expect(communityIcon(undefined)).toBe(Users);
    expect(communityIcon(null)).toBe(Users);
  });
});
