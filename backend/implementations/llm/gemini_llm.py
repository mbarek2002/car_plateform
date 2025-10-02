import google.generativeai as genai
from interfaces.llm_interface import LLMInterface

class GeminiLLM(LLMInterface):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'models/gemini-2.5-flash',
                system_instruction=(
        "You are a helpful assistant. Answer strictly based on the provided Context. "
        "Do not repeat the prompt or the instructions. If the Context is insufficient, "
        'reply exactly: "I\'m not sure based on the context." Respond in one concise paragraph.'
    ),
    generation_config={
        "temperature": 0.2,       
        "top_p": 0.9,
        "top_k": 40,
        "max_output_tokens": 200,  
        "stop_sequences": [     
            "Context:",
            "Question:",
            "Answer:",
            "If unsure, say:"
        ],
    })
    
    def generate(self, prompt: str) -> str:
        parts = prompt.split("Question:", 1)
        context_block = parts[0] if parts else ""
        question_block = "Question:" + parts[1] if len(parts) == 2 else prompt

        response = self.model.generate_content([context_block.strip(), question_block.strip()])
        print(response)
        return response.text.strip()        
        # response = self.model.generate_content(prompt)
        # return response.text
    