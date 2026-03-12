import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../../dist/index.mjs');
const {
  buildCloudinaryUrl, buildCloudinaryBlurPlaceholder, buildCloudinarySrcset,
  createCloudinaryLoader,
  generateBlurPlaceholder, shimmerPlaceholder, shimmerPlaceholderDark,
  colorPlaceholder, gradientPlaceholder, placeholders,
} = mod;

describe('buildCloudinaryUrl', () => {
  it('builds basic URL with defaults', () => {
    const url = buildCloudinaryUrl('my-cloud', 'image.jpg');
    assert.ok(url.includes('res.cloudinary.com/my-cloud'));
    assert.ok(url.includes('q_auto'));
    assert.ok(url.includes('f_auto'));
    assert.ok(url.endsWith('/image.jpg'));
  });

  it('includes width and height', () => {
    const url = buildCloudinaryUrl('cloud', 'img.jpg', { width: 800, height: 600 });
    assert.ok(url.includes('w_800'));
    assert.ok(url.includes('h_600'));
  });

  it('includes crop and gravity', () => {
    const url = buildCloudinaryUrl('cloud', 'img.jpg', { crop: 'fill', gravity: 'face' });
    assert.ok(url.includes('c_fill'));
    assert.ok(url.includes('g_face'));
  });

  it('includes quality and format', () => {
    const url = buildCloudinaryUrl('cloud', 'img.jpg', { quality: 80, format: 'webp' });
    assert.ok(url.includes('q_80'));
    assert.ok(url.includes('f_webp'));
  });

  it('includes blur', () => {
    const url = buildCloudinaryUrl('cloud', 'img.jpg', { blur: 500 });
    assert.ok(url.includes('e_blur:500'));
  });
});

describe('buildCloudinaryBlurPlaceholder', () => {
  it('returns a low-quality blurred URL', () => {
    const url = buildCloudinaryBlurPlaceholder('cloud', 'img.jpg');
    assert.ok(url.includes('w_20'));
    assert.ok(url.includes('e_blur:1000'));
  });
});

describe('buildCloudinarySrcset', () => {
  it('generates srcset string with default widths', () => {
    const srcset = buildCloudinarySrcset('cloud', 'img.jpg');
    assert.ok(srcset.includes('320w'));
    assert.ok(srcset.includes('1280w'));
    assert.ok(srcset.includes(', '));
  });

  it('uses custom widths', () => {
    const srcset = buildCloudinarySrcset('cloud', 'img.jpg', [100, 200]);
    assert.ok(srcset.includes('100w'));
    assert.ok(srcset.includes('200w'));
    assert.ok(!srcset.includes('320w'));
  });
});

describe('createCloudinaryLoader', () => {
  it('returns a loader function', () => {
    const loader = createCloudinaryLoader('cloud');
    assert.equal(typeof loader, 'function');
  });

  it('builds URL from public ID', () => {
    const loader = createCloudinaryLoader('cloud');
    const url = loader({ src: 'folder/image.jpg', width: 400 });
    assert.ok(url.includes('cloud'));
    assert.ok(url.includes('w_400'));
    assert.ok(url.includes('folder/image.jpg'));
  });

  it('returns absolute paths unchanged', () => {
    const loader = createCloudinaryLoader('cloud');
    const url = loader({ src: '/local/image.jpg', width: 400 });
    assert.equal(url, '/local/image.jpg');
  });
});

describe('blur placeholders', () => {
  it('generateBlurPlaceholder returns base64 data URI', () => {
    const result = generateBlurPlaceholder(300, 200);
    assert.ok(result.startsWith('data:image/svg+xml;base64,'));
  });

  it('shimmerPlaceholder returns base64 data URI', () => {
    const result = shimmerPlaceholder(300, 200);
    assert.ok(result.startsWith('data:image/svg+xml;base64,'));
  });

  it('shimmerPlaceholderDark returns base64 data URI', () => {
    const result = shimmerPlaceholderDark(300, 200);
    assert.ok(result.startsWith('data:image/svg+xml;base64,'));
  });

  it('colorPlaceholder returns base64 data URI', () => {
    const result = colorPlaceholder('#ff0000');
    assert.ok(result.startsWith('data:image/svg+xml;base64,'));
  });

  it('gradientPlaceholder returns base64 data URI', () => {
    const result = gradientPlaceholder('#000', '#fff', 'diagonal');
    assert.ok(result.startsWith('data:image/svg+xml;base64,'));
  });
});

describe('static placeholders', () => {
  it('provides gray, white, dark, transparent', () => {
    assert.ok(placeholders.gray.startsWith('data:image/png;base64,'));
    assert.ok(placeholders.white.startsWith('data:image/png;base64,'));
    assert.ok(placeholders.dark.startsWith('data:image/png;base64,'));
    assert.ok(placeholders.transparent.startsWith('data:image/png;base64,'));
  });
});
