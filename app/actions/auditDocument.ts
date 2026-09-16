"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";

export async function auditDocumentWithAI(docId: string, documentType: string, fileUrl: string, companyName: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: "Falta la API Key de Gemini en las variables de entorno." };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Descargar el archivo desde Supabase para pasarlo a Gemini
    const response = await fetch(fileUrl);
    if (!response.ok) {
      return { error: "No se pudo descargar el archivo para auditarlo." };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Gemini requiere mimetype y buffer convertido a base64 inlineData
    // Asumimos PDF, aunque podría ser imagen. En un entorno real se chequearía el Content-Type.
    const mimeType = response.headers.get("content-type") || "application/pdf";
    
    const prompt = `Actúa como un auditor de recursos humanos y seguridad e higiene.
Tienes que auditar este documento subido por la empresa "${companyName}".
El tipo de documento esperado es: ${documentType}.

Revisa el documento e indica:
1. ¿El documento pertenece realmente a la empresa o a sus empleados?
2. ¿Parece válido y no vencido?
3. ¿Corresponde al tipo de documento esperado?

Devuelve un resumen muy corto de tu veredicto (máximo 30 palabras) y un estado sugerido ("APPROVED", "REJECTED", o "PENDING" si no estás seguro).
Formato de salida JSON estricto:
{"verdict": "...", "suggestedStatus": "APPROVED"}
`;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = modelResponse.text;
    if (!text) return { error: "La IA no devolvió respuesta." };
    
    const result = JSON.parse(text);
    return { success: true, verdict: result.verdict, suggestedStatus: result.suggestedStatus };
    
  } catch (err: any) {
    console.error("Error auditar documento:", err);
    return { error: err.message || "Ocurrió un error inesperado al analizar el documento." };
  }
}
