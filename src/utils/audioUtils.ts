
// API endpoint for file conversion
const API_ENDPOINT = 'https://echo-backend-623078948634.europe-west1.run.app/api/convert';

export interface ConversionResult {
  success: boolean;
  audioUrl?: string;
  scriptUrl?: string;
  title?: string;
  requestId?: string;
  error?: string;
}

/**
 * Upload file to the backend API for conversion to audio
 * @param file - The file to upload
 * @param hostUrl - The host URL (optional, defaults to 'string')
 * @returns ConversionResult with audioUrl, title, and requestId
 */
export const uploadFileForConversion = async (file: File, hostUrl: string = 'string'): Promise<ConversionResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('host_url', hostUrl);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.audioUrl) {
      return {
        success: true,
        audioUrl: data.audioUrl,
        scriptUrl: data.scriptUrl,
        title: data.title,
        requestId: data.requestId,
      };
    } else {
      return {
        success: false,
        error: 'Conversion failed: Invalid response from server',
      };
    }
  } catch (error) {
    console.error('Error uploading file for conversion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file. Please try again.',
    };
  }
};

// Legacy function for backward compatibility (kept for demo audio)
export const convertTextToSpeech = async (text: string): Promise<ConversionResult> => {
  // Simulate a delay like we're waiting for the server to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Legacy demo audio
    return {
      success: true,
      audioUrl: 'https://drive.google.com/uc?export=download&id=150-O1iKysYz9VGVfojgCm8-M6sLl-oDT'
    };
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return {
      success: false,
      error: 'Failed to convert text to speech. Please try again.'
    };
  }
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('File reading error'));
    };
    reader.readAsText(file);
  });
};
