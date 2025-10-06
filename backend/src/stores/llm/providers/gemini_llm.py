import google.generativeai as genai
from src.stores.llm.llm_interface import LLMInterface

class GeminiLLM(LLMInterface):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            'models/gemini-2.5-pro',
                system_instruction=(
        "You are a helpful assistant. Answer strictly based on the provided Context. "
        "Do not repeat the prompt or the instructions. If the Context is insufficient, "
        'reply exactly: "I\'m not sure based on the context." Respond in one concise paragraph.'
    ),
    generation_config={
        "temperature": 0.2,
        "top_p": 0.9,
        "top_k": 40,
        # "max_output_tokens": 200,  
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
        print("response")
        print(response)
        print("response")

        try:
            if(
                response.candidates 
                and response.candidates[0].content
                and response.candidates[0].content.parts
            ):
                text = response.candidates[0].content.parts[0].text.strip()
                return text if text else  "I'm not sure based on the context."
            # ✅ Handle cases where generation was stopped or empty
            finish_reason = getattr(response.candidates[0], "finish_reason", None)
            print(f"⚠️ Gemini stopped early. Finish reason: {finish_reason}")
            return "I'm not sure based on the context."
            
        except Exception as e:
            print("❌ Error while parsing Gemini response:", e)
            return "I'm not sure based on the context."

        # return response.text.strip()        
        # response = self.model.generate_content(prompt)
        # return response.text
    