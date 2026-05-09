export interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export async function executeCodePiston(sourceCode: string, language: string, stdin: string): Promise<PistonResponse> {
  const url = "https://emkc.org/api/v2/piston/execute";
  
  // Map our language strings to Piston aliases/versions
  const langMap: Record<string, { lang: string; version: string }> = {
    "typescript": { lang: "typescript", version: "5.0.3" },
    "javascript": { lang: "javascript", version: "18.15.0" },
    "python": { lang: "python", version: "3.10.0" },
    "java": { lang: "java", version: "15.0.2" },
    "cpp": { lang: "cpp", version: "10.2.0" }
  };

  const config = langMap[language] || langMap["javascript"];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: config.lang,
      version: config.version,
      files: [
        {
          content: sourceCode,
        },
      ],
      stdin: stdin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.statusText}`);
  }

  return response.json();
}
