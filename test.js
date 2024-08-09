// Import necessary packages using ES6 module syntax
import {  createClient } from '@supabase/supabase-js';
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
const standaloneQuestionTemplate = 'Given a question convert it to a standalone question.: {question} standalone question:';
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);

// Create a function to generate the standalone question
async function generateStandaloneQuestion(question) {
    const promptText = await standaloneQuestionPrompt.format({ question });
    const result = await model.generateContent(promptText);
    const response = result.response.text() || 'No response';
    return response;
}

// Example usage
(async () => {
    const question = 'What are the technical requirements for running Scrimba? I have a very old laptop which is not that powerful.';
    const standaloneQuestion = await generateStandaloneQuestion(question);
    console.log('Standalone Question:', standaloneQuestion);
    await sendData(standaloneQuestion);
})();

async function sendData(standaloneQuestion) {
    try {
        console.log('Sending Data:', { question: standaloneQuestion });
        const response = await axios.post('http://127.0.0.1:5000/api/get_embeddings', {
            question: standaloneQuestion
        });
        console.log('Response Data:', response.data);
        const text = standaloneQuestion;
        const embeddings = response.data.embeddings;

        await matchDocuments(text, embeddings);
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

async function matchDocuments(text, embeddings) {
    try {
        const client = createClient(process.env.SUPABASE_URL_LC_CHATBOT, process.env.SUPABASE_API_KEY);

        // Ensure the vector store is correctly initialized with the appropriate parameters
        const vectorStore = new SupabaseVectorStore(embeddings, {
          client,
          tableName: 'documents',
          queryName: 'match_documents'
      })
      const retriever = vectorStore.asRetriever()
chunks = text.pipe(retriever)
console.log(chunks)
        // Store the document and its embeddings in the vector store
        await vectorStore.addDocuments([{ text, embeddings }]);

        // Perform similarity search
        const matchedDocuments = await vectorStore.similaritySearchVectorWithScore(embeddings, {
            threshold: 0.8,  // Adjust threshold as needed
        });

        console.log('Matched Documents:', matchedDocuments);
        return matchedDocuments;
    } catch (error) {
        console.error('Error matching documents:', error);
        throw error;
    }
}