export interface Judge0Response {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

export async function executeCode(sourceCode: string, language: string, stdin: string, customApiKey?: string): Promise<Judge0Response> {
  const url = `https://${process.env.JUDGE0_RAPIDAPI_HOST}/submissions?base64_encoded=true&wait=true`;
  
  // Map our language strings to Judge0 IDs
  const langMap: Record<string, number> = {
    "typescript": 74,
    "javascript": 63,
    "python": 71,
    "java": 62,
    "cpp": 54
  };

  const apiKey = customApiKey || process.env.JUDGE0_RAPIDAPI_KEY!;

  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': process.env.JUDGE0_RAPIDAPI_HOST!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source_code: btoa(sourceCode),
      language_id: langMap[language] || 63,
      stdin: btoa(stdin)
    })
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.statusText}`);
  }
  const result = await response.json();
  
  // Base64 decode stdout and stderr
  if (result.stdout) result.stdout = atob(result.stdout);
  if (result.stderr) result.stderr = atob(result.stderr);
  if (result.compile_output) result.compile_output = atob(result.compile_output);
  
  return result;
}
