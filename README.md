# LeetAI: AI-Powered LeetCode Platform

LeetAI is a robust, local-first DSA practice platform that uses AI to generate programming challenges and automatically verifies them using a hybrid execution engine.

## 🚀 Features

- **AI Problem Generation:** Uses Groq (Llama-3/Mixtral) to frame professional-grade DSA problems from raw ideas.
- **Auto-Verification:** Automatically runs AI-generated solutions against generated test cases to ensure 100% accuracy in "Expected Outputs."
- **Local-First Execution:** Executes code directly on your machine for zero-latency, unlimited testing during development.
- **Hybrid Cloud Fallback:** Automatically switches to JDoodle or Judge0 when deployed to production (Vercel).
- **Multi-Language Support:** Practice in TypeScript, JavaScript, Python, Java, and C++.
- **Database Persistence:** Stores your problems and progress in Supabase.

## 🛠️ Prerequisites

To run this project locally, you need:
1. **Node.js** (v18+)
2. **Local Compilers:** Ensure `python`, `node`, and `java` are in your system PATH to enable local code execution.
3. **Supabase Project:** For database and authentication.
4. **Groq API Key:** For generating problems.

## 📦 Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/sanjjey/codepracticer.git
   cd codepracticer
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Groq (Required for Generation)
   GROQ_API_KEY=your_groq_key

   # Supabase (Required for Persistence)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # JDoodle (Optional - Prod Fallback)
   JDOODLE_CLIENT_ID=your_jdoodle_id
   JDOODLE_CLIENT_SECRET=your_jdoodle_secret
   ```

4. **Initialize Database:**
   Copy the contents of `supabase_schema.sql` and run them in the **SQL Editor** of your Supabase dashboard to create the necessary tables.

## 🏃 Running Locally

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start practicing!

## 🛡️ Deployment

This project is optimized for deployment on **Vercel**. 
When deployed, it automatically switches from "Local Execution" to "Cloud Execution" using JDoodle/Judge0, ensuring your users can run code without needing local compilers.

---
Built with ❤️ for the DSA Community.
