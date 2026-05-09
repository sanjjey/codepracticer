export interface JDoodleResponse {
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
}

export async function executeCodeJDoodle(sourceCode: string, language: string, stdin: string): Promise<JDoodleResponse> {
  const url = "https://api.jdoodle.com/v1/execute";
  
  // Map our language strings to JDoodle language codes
  const langMap: Record<string, { lang: string; versionIndex: string }> = {
    "typescript": { lang: "nodejs", versionIndex: "4" }, // JDoodle uses nodejs for both
    "javascript": { lang: "nodejs", versionIndex: "4" },
    "python": { lang: "python3", versionIndex: "4" },
    "java": { lang: "java", versionIndex: "4" },
    "cpp": { lang: "cpp17", versionIndex: "1" }
  };

  const config = langMap[language] || langMap["javascript"];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: sourceCode,
      stdin: stdin,
      language: config.lang,
      versionIndex: config.versionIndex,
    }),
  });

  if (!response.ok) {
    throw new Error(`JDoodle API error: ${response.statusText}`);
  }

  return response.json();
}
