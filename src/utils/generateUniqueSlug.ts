import slugify from 'slugify';
import crypto from 'crypto';

const generateUniqueSlug = (text: string, existingSlugs?: string[]): string => {
  const slug = slugify(text, { lower: true, strict: true });
  let uniqueSlug = slug;
  let counter = 1;

  while (existingSlugs && existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}-${crypto.randomBytes(4).toString('hex')}`;
    counter++;
  }

  return uniqueSlug;
};

export default generateUniqueSlug;
