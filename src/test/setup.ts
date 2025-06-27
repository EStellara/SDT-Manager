import '@testing-library/jest-dom'

// Mock DragEvent and DataTransfer for drag-and-drop testing
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer;

  constructor(type: string, options?: { bubbles?: boolean; dataTransfer?: DataTransfer }) {
    super(type, options);
    this.dataTransfer = options?.dataTransfer || new DataTransfer();
  }
} as any;

global.DataTransfer = class DataTransfer {
  items: DataTransferItemList;
  files: FileList;

  constructor() {
    this.items = {
      length: 0,
      add: (file: File) => {
        // Add file to both items and files
        const fileArray = Array.from(this.files || []);
        fileArray.push(file);
        this.files = Object.assign(fileArray, {
          length: fileArray.length,
          item: (index: number) => fileArray[index] || null
        }) as FileList;
        this.items.length = fileArray.length;
      }
    } as any;
    this.files = Object.assign([], {
      length: 0,
      item: () => null
    }) as FileList;
  }

  get dropEffect() { return 'copy'; }
  set dropEffect(_value: string) { /* no-op */ }
} as any;
