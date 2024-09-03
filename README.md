license: Apache-2.0
current chatbot model license: llama3.1 (https://llama.meta.com/llama3_1/license/)
Created by: Jonathan Korstad
Jon's Hugging Face Profile: https://huggingface.co/jkorstad
Current Chatbot Model: meta-llama/Meta-Llama-3.1-70B-Instruct


Library App Setup:
Create a .env file in root folder (or in the backend folder for dual backend boot - Node Express server works better with .env file in backend folder). 

Add your HF api write token as follows:
HUGGING_FACE_API_TOKEN=[enter your hf api "write" token here **without any quotes, brackets, or spaces**]

If you're unfamiliar with Hugging Face or how to setup your "write" token, refer to the following documentation:
https://huggingface.co/docs/hub/en/security-tokens


For initial requirements setup and server startup:

Start the backend server of choice (I recommend the Flask server, but the Node Express server works as well):
1. cd .\library-app\library-app-backend
2. pip install -r requirements.txt
3. python server.py

**OPTIONAL NODE SERVER** For the Node Express server run the following in the same backend folder:
1. cd .\library-app\library-app-backend
2. npm install
2(alternative server). node server.js

**Then**
Start the frontend application:
1. cd .\library-app\library-app-frontend
2. npm install
3. npm start
