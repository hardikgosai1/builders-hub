import { NextResponse } from 'next/server';

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
const HUBSPOT_INFRABUIDL_FORM_GUID = process.env.HUBSPOT_INFRABUIDL_FORM_GUID;

export async function POST(request: Request) {
  try {
    if (!HUBSPOT_API_KEY || !HUBSPOT_PORTAL_ID || !HUBSPOT_INFRABUIDL_FORM_GUID) {
      console.error('Missing environment variables: HUBSPOT_API_KEY, HUBSPOT_PORTAL_ID, or HUBSPOT_INFRABUIDL_FORM_GUID');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const clonedRequest = request.clone();
    let formData;
    try {
      formData = await clonedRequest.json();
      console.log('Received form data:', formData);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const fields: { name: string; value: string | boolean | string[] }[] = [];
    Object.entries(formData).forEach(([name, value]: [string, any]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      
      let formattedValue: string | boolean | string[] = value;
      
      // Handle arrays (for checkbox groups that return arrays)
      if (Array.isArray(value)) {
        // For HubSpot, arrays should be converted to semicolon-separated strings
        formattedValue = (value as string[]).join(';');
      }
      // Handle booleans
      else if (typeof value === 'boolean') {
        if (name !== 'gdpr' && name !== 'marketing_consent') {
          formattedValue = value ? 'Yes' : 'No';
        }
      }
      // Handle dates
      else if (value instanceof Date) {
        formattedValue = (value as Date).toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      
      fields.push({
        name: name,
        value: formattedValue
      });
    });
    
    const hubspotPayload: {
      fields: { name: string; value: string | boolean | string[] }[];
      context: { pageUri: string; pageName: string };
      legalConsentOptions?: {
        consent: {
          consentToProcess: boolean;
          text: string;
          communications: Array<{
            value: boolean;
            subscriptionTypeId: number;
            text: string;
          }>;
        };
      };
    } = {
      fields: fields,
      context: {
        pageUri: request.headers.get('referer') || 'https://build.avax.network',
        pageName: 'infraBUIDL Grant Application'
      }
    };

    // Add legal consent options if GDPR consent was given
    if (formData.gdpr === true) {
      hubspotPayload.legalConsentOptions = {
        consent: {
          consentToProcess: true,
          text: "I agree and authorize the Avalanche Foundation to utilize artificial intelligence systems to process the information in my application, any related material I provide and any related communications between me and the Avalanche Foundation, in order to assess the eligibility and suitability of my application and proposal.",
          communications: [
            {
              value: formData.marketing_consent === true,
              subscriptionTypeId: 999,
              text: "I would like to receive marketing emails from the Avalanche Foundation."
            }
          ]
        }
      };
    }
  
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_INFRABUIDL_FORM_GUID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`
        },
        body: JSON.stringify(hubspotPayload)
      }
    );

    const responseStatus = hubspotResponse.status;
    let hubspotResult;
    try {
      const clonedResponse = hubspotResponse.clone();
      try {
        hubspotResult = await hubspotResponse.json();
      } catch (jsonError) {
        const text = await clonedResponse.text();
        console.error('Non-JSON response from HubSpot:', text);
        hubspotResult = { status: 'error', message: text };
      }
    } catch (error) {
      console.error('Error reading HubSpot response:', error);
      hubspotResult = { status: 'error', message: 'Could not read HubSpot response' };
    }
    
    console.log('HubSpot response:', hubspotResult);
    if (!hubspotResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          status: responseStatus,
          response: hubspotResult
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}