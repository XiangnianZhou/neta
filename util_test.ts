import { $parseTime, $merge } from './util.ts';
import { assertEquals } from './deps.ts';

Deno.test('util.parseTime() function', (): void => {
    const timeStr = '01:02:05,500';
    const expected = ((60 + 2) * 60 + 5) * 1000 + 500;
    const actual = $parseTime(timeStr);
    assertEquals(actual, expected);
});

Deno.test('util.merge() function', (): void => {
    const arr1 = ['key1', 'key2', 'key3'];
    const arr2 = ['v1', 'v2', 'v3'];
    const actual = $merge(arr1, arr2);
    const expected = {
        key1: 'v1',
        key2: 'v2',
        key3: 'v3'
    }
    assertEquals(actual, expected);
});
