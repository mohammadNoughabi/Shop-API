import fs from 'fs/promises';
import path from 'path';
import { removeFile, removeFiles } from '../../src/utils/removeFile.ts';
import { describe, it, expect } from 'vitest';

describe('removeFile', () => {
  it('should remove a single file', async () => {
    const filePath = path.join(process.cwd(), 'uploads', 'testfile.txt');
    await fs.writeFile(filePath, 'test content');
    await removeFile('testfile.txt');
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(false);
  });

  it('should remove multiple files', async () => {
    const filePaths = ['file1.txt', 'file2.txt'].map((name) =>
      path.join(process.cwd(), 'uploads', name),
    );
    await Promise.all(
      filePaths.map((filePath) => fs.writeFile(filePath, 'test content')),
    );
    await removeFiles(['file1.txt', 'file2.txt']);
    const fileExists = await Promise.all(
      filePaths.map((filePath) =>
        fs
          .access(filePath)
          .then(() => true)
          .catch(() => false),
      ),
    );
    expect(fileExists).toEqual([false, false]);
  });
});
