import { createClient } from '@supabase/supabase-js';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import axios from 'axios';




dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Define the prompt template


const text = "hello"
const embeddings = [1,2,3,4]
        const lex = createClient(process.env.SUPABASE_URL_LC_CHATBOT, process.env.SUPABASE_API_KEY);

        // Initialize SupabaseVectorStore correctly
        const vectorStore = new SupabaseVectorStore(
            lex,
            {
            tableName: 'documents',
            queryName: 'match_documents'
            }
        );

        // Add document and embeddings to the vector store
        await vectorStore.addDocuments([{ text, embeddings }]);

        // Example: Using asRetriever to retrieve chunks/documents
        const retriever = vectorStore.asRetriever();
        const chunks = await retriever.fetchChunks();
        console.log('Retrieved Chunks:', chunks);


