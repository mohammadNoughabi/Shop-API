// utils/removeFile.ts
import fs from 'fs/promises';
import path from 'path';

// function to remove single file
export const removeFile = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.unlink(filePath);
  } catch {
    // swallow error – file may not exist
  }
};

// function to remove multiple files
export const removeFiles = async (filenames: string[]): Promise<void> => {
  await Promise.all(filenames.map((file) => removeFile(file)));
};
