from transformers import pipeline
from src.stores.llm.llm_interface import LLMInterface

class HuggingFaceLLM(LLMInterface):
    def __init__(self, api_key: str = None, model_name: str = "ihebmbarek/llama3-healthcare-full"):
        """
        Local LLM using Transformers pipeline.
        Popular models:
        - gpt2: Fast, small (default)
        - distilgpt2: Even faster, smaller
        - microsoft/DialoGPT-medium: Better for conversations
        - google/flan-t5-base: Instruction-following
        """
        print(f"Using model: {model_name}")
        self.model_name = model_name
        self.pipeline = pipeline(
            "text-generation",
            model=model_name,
            max_new_tokens=500,
            device=-1  # CPU, use 0 for GPU
        )
    
    def generate(self, prompt: str) -> str:
        """Generate text from prompt"""
        result = self.pipeline(
            prompt,
            max_new_tokens=500,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            num_return_sequences=1
        )
        return result[0]['generated_text']
