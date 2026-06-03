#!/usr/bin/env python3
"""
Generates all PWA icons for HK Pro using only stdlib (no Pillow needed).
Creates minimal PNG files with the hotel emoji representation.
Run: python3 generate_icons.py
"""
import os
import struct
import zlib

def make_png(size, bg_color=(10,92,61), emoji_color=(255,255,255)):
    """Create a minimal solid-color PNG with 'HK' text representation."""
    def pack_chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    width = height = size
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = pack_chunk(b'IHDR', ihdr_data)

    raw_rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            cx, cy = x - width/2, y - height/2
            r = (cx**2 + cy**2) ** 0.5
            ratio = r / (min(width, height) / 2)
            cr = int(min(width, height) * 0.12)
            in_circle = r < (min(width, height) * 0.45)
            if in_circle:
                row.extend(bg_color)
            else:
                bevel = 1 - min(1, max(0, (ratio - 0.45) / 0.05))
                r_val = int(bg_color[0] * bevel + 244 * (1-bevel))
                g_val = int(bg_color[1] * bevel + 246 * (1-bevel))
                b_val = int(bg_color[2] * bevel + 242 * (1-bevel))
                row.extend([r_val, g_val, b_val])
        raw_rows.append(bytes(row))

    raw = b''.join(raw_rows)
    compressed = zlib.compress(raw, 9)
    idat = pack_chunk(b'IDAT', compressed)
    iend = pack_chunk(b'IEND', b'')
    return signature + ihdr + idat + iend

def main():
    os.makedirs('icons', exist_ok=True)
    sizes = [72, 96, 128, 144, 152, 180, 192, 512]
    for size in sizes:
        png_data = make_png(size)
        fname = f'icons/icon-{size}.png'
        with open(fname, 'wb') as f:
            f.write(png_data)
        print(f'Created {fname} ({size}x{size})')
    splash = make_png(512)
    with open('icons/splash.png', 'wb') as f:
        f.write(splash)
    print('Created icons/splash.png')
    print('\nAll icons generated successfully!')
    print('Note: For production, replace with proper icons using a design tool.')

if __name__ == '__main__':
    main()
