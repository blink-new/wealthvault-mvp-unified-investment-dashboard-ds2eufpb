import { blink } from '../blink/client'

export interface ExtractedData {
  policyNumber?: string
  premium?: number
  frequency?: 'Monthly' | 'Quarterly' | 'Yearly'
  maturity?: string
  nominee?: string
  coverage?: number
  companyName?: string
  policyName?: string
}

export const extractDataFromDocument = async (file: File): Promise<ExtractedData> => {
  try {
    // Upload file to storage first
    const { publicUrl } = await blink.storage.upload(
      file,
      `documents/${Date.now()}-${file.name}`,
      { upsert: true }
    )

    // Extract text from document using Blink's data extraction
    const extractedText = await blink.data.extractFromUrl(publicUrl)

    // Use AI to parse the extracted text and identify key investment data
    const { object } = await blink.ai.generateObject({
      prompt: `Analyze this insurance/investment document text and extract key information. Look for:
      - Policy number (usually starts with letters/numbers)
      - Premium amount (annual, monthly, quarterly)
      - Payment frequency (monthly, quarterly, yearly)
      - Maturity date
      - Nominee name
      - Sum assured/coverage amount
      - Company name
      - Policy/plan name
      
      Document text: ${extractedText}`,
      schema: {
        type: 'object',
        properties: {
          policyNumber: { type: 'string' },
          premium: { type: 'number' },
          frequency: { 
            type: 'string', 
            enum: ['Monthly', 'Quarterly', 'Yearly'] 
          },
          maturity: { type: 'string' },
          nominee: { type: 'string' },
          coverage: { type: 'number' },
          companyName: { type: 'string' },
          policyName: { type: 'string' }
        }
      }
    })

    return {
      policyNumber: object.policyNumber || '',
      premium: object.premium || 0,
      frequency: object.frequency as ExtractedData['frequency'] || 'Yearly',
      maturity: object.maturity || '',
      nominee: object.nominee || '',
      coverage: object.coverage || 0,
      companyName: object.companyName || '',
      policyName: object.policyName || ''
    }
  } catch (error) {
    console.error('OCR extraction failed:', error)
    throw new Error('Failed to extract data from document. Please try again or enter details manually.')
  }
}

export const processDocumentWithPassword = async (file: File, password?: string): Promise<string> => {
  try {
    // Upload file to storage
    const { publicUrl } = await blink.storage.upload(
      file,
      `documents/${Date.now()}-${file.name}`,
      { upsert: true }
    )

    // For password-protected PDFs, we'll need to handle them differently
    // For now, we'll extract what we can and inform the user
    if (password && file.type === 'application/pdf') {
      // In a real implementation, you'd use a PDF library that supports passwords
      console.log('Password provided for PDF:', password)
    }

    return publicUrl
  } catch (error) {
    console.error('Document processing failed:', error)
    throw new Error('Failed to process document')
  }
}