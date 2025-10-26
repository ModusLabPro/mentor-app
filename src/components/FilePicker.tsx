import { Alert, Platform } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

interface FilePickerProps {
  onFileSelected: (file: any) => void;
  onError?: (error: string) => void;
}

class FilePicker {
  private onFileSelected: (file: any) => void;
  private onError?: (error: string) => void;

  constructor({ onFileSelected, onError }: FilePickerProps) {
    this.onFileSelected = onFileSelected;
    this.onError = onError;
  }

  async pick() {
    try {
      console.log('Starting real file picker...');
      
      const result = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        console.log('File selected:', file);
        
        // Преобразуем результат DocumentPicker в формат, ожидаемый приложением
        const selectedFile = {
          name: file.name || 'unknown_file',
          type: file.type || 'application/octet-stream',
          size: file.size || 0,
          uri: file.uri,
          fileCopyUri: file.fileCopyUri,
        };
        
        this.onFileSelected(selectedFile);
      }
    } catch (error) {
      console.error('DocumentPicker error:', error);
      
      if (isErrorWithCode(error, errorCodes.cancel)) {
        console.log('User cancelled file picker');
        return;
      }
      
      this.onError?.(error.message || 'Ошибка выбора файла');
    }
  }

  static isCancel(error: any) {
    return isErrorWithCode(error, errorCodes.cancel);
  }

  static types = types;
}

export default FilePicker;
