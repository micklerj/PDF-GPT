const fs = require('fs');
const {RecursiveCharacterTextSplitter} = require('langchain/text_splitter');
const pdf = require('pdf-parse');

const { ObjectId } = require("mongodb");
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const {HNSWLib} = require('@langchain/community/vectorstores/hnswlib');
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

const {createStuffDocumentsChain} = require('langchain/chains/combine_documents');
const {ChatPromptTemplate} = require('@langchain/core/prompts');
const {createRetrievalChain} = require('langchain/chains/retrieval');
const {createHistoryAwareRetriever} = require('langchain/chains/history_aware_retriever');
const {MessagesPlaceholder} = require('@langchain/core/prompts');

// vectorize the pdf file into a local vector store
const vectorizePDF = async (pdfname) => {
  const pdfPath = `./${pdfname}.pdf`;
  const VECTOR_STORE_PATH = `./${pdfname}.index`;

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // If the vector store file exists, load it into memory
    console.log('Vector exists...');
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // If the vector store file doesn't exist, create it
    console.log('Creating vector store...');

    //const text = fs.readFileSync("murder_mystery_show.txt", "utf8");    // for .txt files
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    const textSplitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 1000,
      chunkOverlap: 100 
    });  
    const docs = await textSplitter.createDocuments([text]);
    // Create a vector store from the documents.
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // Save the vector store to a file
    await vectorStore.save(VECTOR_STORE_PATH);
  }  
}

// generate a new sessionId string
const genSessionID = async () => {
  const sessionId = new ObjectId().toString();
  return sessionId;
}


const convo = {
  chatHistory: [],

  // pass in user input to chat bot
  askQuestion: async function(pdfname, user_input) {
    const model = new ChatOpenAI({});

    // vector store retriever
    const VECTOR_STORE_PATH = `./${pdfname}.index`;
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
    const vectorStoreRetriever = vectorStore.asRetriever();

    // create search query aware of the user input and the chat history to pass to vector store
    const retrieverPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
      ],
    ]);

    // access vector store
    const retrieverChain = await createHistoryAwareRetriever({
      llm: model,
      retriever: vectorStoreRetriever,
      rephrasePrompt: retrieverPrompt,
    });

    // final prompt for the openAI model
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Answer the user's questions based on the following context: {context}. If you don't know the answer, just say that you don't know, don't try to make up an answer.",
      ],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);

    // access openAI model with the prompt
    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt: prompt,
    });

    // combine the retriever chain with the openAI model chain
    const conversationChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever: retrieverChain,
    });

    // get AI response from calling the chain
    const response = await conversationChain.invoke({
      chat_history: this.chatHistory,
      input: user_input,
    });
    console.log(response.answer);

    // add entries to chat history
    this.chatHistory.push(new HumanMessage(user_input));
    this.chatHistory.push(new AIMessage(response.answer));
  }
}



module.exports = {vectorizePDF, genSessionID, convo};