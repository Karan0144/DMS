import { createWorker } from 'tesseract.js';

export async function extractDataFromImage(imageFile) {
  try {
    console.log('Starting OCR processing for:', imageFile.name);
    
    const worker = await createWorker();
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:.-/ ',
      preserve_interword_spaces: '1'
    });
    
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(imageFile);
    });

    const { data: { text } } = await worker.recognize(base64Image);
    console.log('Raw extracted text:', text);
    
    await worker.terminate();

    // Clean up the text by removing extra spaces between characters
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    console.log('Cleaned text:', cleanedText);

    const extractedData = parseExtractedText(cleanedText);
    console.log('Parsed data:', extractedData);
    
    return extractedData;
  } catch (error) {
    console.error('Error extracting data from image:', error);
    throw error;
  }
}

function parseExtractedText(text) {
  const extractedData = {
    loadType: '',
    customer: '',
    containerNumber: '',
    port: ''
  };

  // Clean and normalize the text
  const normalizedText = text.toLowerCase();
  console.log('Normalized text:', normalizedText);

  // Extract load type
  if (normalizedText.includes('bill only')) {
    extractedData.loadType = 'Bill Only';
  } else if (normalizedText.includes('import')) {
    extractedData.loadType = 'Import';
  } else if (normalizedText.includes('export')) {
    extractedData.loadType = 'Export';
  } else if (normalizedText.includes('road')) {
    extractedData.loadType = 'Road';
  }

  // Extract customer
  const customerMatch = normalizedText.match(/customer:\s*([^:]+?)(?=\s*(?:container:|port:|$))/i);
  if (customerMatch && customerMatch[1]) {
    extractedData.customer = customerMatch[1].trim();
  }

  // Extract container number
  const containerMatch = normalizedText.match(/container:\s*([a-z]{4}\d{6,7})/i);
  if (containerMatch && containerMatch[1]) {
    extractedData.containerNumber = containerMatch[1].toUpperCase();
  }

  // Extract port
  if (normalizedText.includes('port of la')) {
    extractedData.port = 'Port of LA';
  } else if (normalizedText.includes('long beach')) {
    extractedData.port = 'Long Beach Port';
  } else if (normalizedText.includes('oakland')) {
    extractedData.port = 'Oakland Port';
  }

  console.log('Extraction results:', {
    loadType: extractedData.loadType || 'Not detected',
    customer: extractedData.customer || 'Not detected',
    containerNumber: extractedData.containerNumber || 'Not detected',
    port: extractedData.port || 'Not detected'
  });

  return {
    loadType: extractedData.loadType || 'Not detected',
    customer: extractedData.customer || 'Not detected',
    containerNumber: extractedData.containerNumber || 'Not detected',
    port: extractedData.port || 'Not detected'
  };
}