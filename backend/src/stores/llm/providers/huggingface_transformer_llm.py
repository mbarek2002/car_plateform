from transformers import pipeline , AutoModelForCausalLM , AutoTokenizer
from peft import PeftModel
from src.stores.llm.llm_interface import LLMInterface

class HuggingFaceTransformerLLM(LLMInterface):
    def __init__(self, 
                api_key: str = None,
                base_model: str = "unsloth/llama-3-8b-bnb-4bit",
                adapter_model:str = "ihebmbarek/driver_model", 
                device: int = -1
                ):
        """
        Local LLM using a base model + LoRA adapter.
        - base_model: The original large model (e.g. Llama 3)
        - adapter_model: Your LoRA fine-tuned adapter
        """
        print(f"🔹 Loading base model: {base_model}")
        print(f"🔹 Applying adapter: {adapter_model}")

        self.tokenizer = AutoTokenizer.from_pretrained(adapter_model)

        # load base model
        base = AutoModelForCausalLM.from_pretrained(
            base_model,
            device_map="auto"if device==0 else None,
        )

        # Apply your LoRA adapter
        self.model = PeftModel.from_pretrained(
            base,
            adapter_model,
            device_map="auto",
        )        
        
        # Create generation pipeline
        self.pipeline = pipeline(
            "text-generation",
            model=self.model,
            tokenizer = self.tokenizer , 
            max_new_tokens=500,
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
