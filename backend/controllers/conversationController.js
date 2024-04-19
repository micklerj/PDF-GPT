const Conversation = require("../model/conversation");

exports.fetchConversation = async (req, res) => {
  try {
    const convID = req.query.convID;
    if (!convID) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }
    const conversation = await Conversation.findOne({ convID });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.newConversation = async(req, res) => {
  try {
    const { convID, pdfName, qaSequence } = req.body;

    if(!convID || !pdfName || !qaSequence) {
      return res.status(400);
    }
    const existingConversation = await Conversation.findOne({ convID });
    if (existingConversation) {
      return res.status(409).json({ message: 'A conversation with this ID already exists' });
    }

    const newConversation = new Conversation ({ convID, pdfName, qaSequence});
    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    console.error(err);
  }
}

exports.addQA = async(req, res) => {
  try {
    const { convID } = req.params;
    const { question, answer } = req.body;
  
    if (!convID || !question || !answer) {
      return res.status(400).json({ message: 'Missing required fields.'});
    }
    const conversation = await Conversation.findOne({ convID });
    
    if(!conversation) {
      return res.status(404).json({ message: 'Conversation not found.'});
    }
    conversation.qaSequence.push({ question, answer });

    await conversation.save();
    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
  }
}

exports.convo = {
  chatHistory: [],

  // upon switching to a new chat, update local chatHistory with chat history from mongoDB
  updateHistory: async function(id) {
    axios.get('http://localhost:3500/api/getConversation/?convID=' + id)
    .then(response => {
      const QAs = response.data.qaSequence;
      if(!QAs || QAs.length === 0) {
        return;
      }
      // clear local chatHistory
      this.chatHistory = [];

      // Access the chat history from the response data
      QAs.forEach(document => {
        const question = document.question;
        const answer = document.answer;

        // add entries to chat history
        this.chatHistory.push(new HumanMessage(question));
        this.chatHistory.push(new AIMessage(answer));
      });
    })
      .catch(error => {
        console.error('Error:', error);
      }); 
  },

  // pass in user input to chat bot
  askQuestion: async function(id, pdfPath, user_input) {
    const model = new ChatOpenAI({});

    // vector store retriever
    const VECTOR_STORE_PATH = `./${pdfPath}.index`;
    const vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
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

    // add entries to chat history
    this.chatHistory.push(new HumanMessage(user_input));
    this.chatHistory.push(new AIMessage(response.answer));

    // add entries to database
    const putData = {
      "question": user_input,
      "answer": response.answer
    };
    axios.put('http://localhost:3500/api/addQA/' + id, putData)
      .catch(error => {
        console.error('Error:', error);
      }); 
    
    return response.answer;

  }
}