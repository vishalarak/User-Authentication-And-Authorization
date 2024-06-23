import { promises as fsPromises } from 'fs';
import { existsSync } from 'fs';

// Check if a file or directory exists at a given path.
export const checkIfFileOrDirectoryExists = (path: string): boolean => {
  return existsSync(path);
};

// Get file data from a given path via promise interface
export const getFile = async (
  path: string,
  encoding?: BufferEncoding,
): Promise<string | Buffer> => {
  if (encoding) {
    return fsPromises.readFile(path, { encoding });
  } else {
    return fsPromises.readFile(path);
  }
};

// Writes a file at a given path via a promise interface.
export const createFile = async (
  path: string,
  fileName: string,
  data: string,
): Promise<void> => {
  if (!checkIfFileOrDirectoryExists(path)) {
    await fsPromises.mkdir(path, { recursive: true });
  }
  return fsPromises.writeFile(`${path}/${fileName}`, data, 'utf8');
};

// Delete file at the given path via a promise interface
export const deleteFile = async (path: string): Promise<void> => {
  return fsPromises.unlink(path);
};
