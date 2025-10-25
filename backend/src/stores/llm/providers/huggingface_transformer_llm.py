from transformers import pipeline , AutoModelForCausalLM , AutoTokenizer
from src.stores.llm.llm_interface import LLMInterface

from peft import PeftModel, PeftConfig
# from unsloth.chat_templates import get_chat_template
# from unsloth import FastLanguageModel

class HuggingFaceTransformerLLM(LLMInterface):
    def __init__(self, 
                api_key: str = None,
                base_model: str = "unsloth/Llama-3.2-3B-Instruct",
                # base_model: str = "unsloth/llama-3-8b-bnb-4bit",
                adapter_model:str = "ihebmbarek/driver_finetune_llama_3b", 
                # adapter_model:str = "ihebmbarek/driver_model", 
                device: int = -1
                ):
        """
        Local LLM using a base model + LoRA adapter.
        - base_model: The original large model (e.g. Llama 3)
        - adapter_model: Your LoRA fine-tuned adapter
        """
        print(f"🔹 Loading base model: {base_model}")
        print(f"🔹 Applying adapter: {adapter_model}")

        # config = PeftConfig.from_pretrained(adapter_model)
        # base_model = AutoModelForCausalLM.from_pretrained(config.base_model_name_or_path)
        # tokenizer = AutoTokenizer.from_pretrained(adapter_model)

        # self.model = PeftModel.from_pretrained(base_model, adapter_model)
        # self.tokenizer = get_chat_template(
        #     tokenizer,
        #     chat_template = "llama-3.1",
        # )



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

        # FastLanguageModel.for_inference(self.model)

        # messages = [
        #     {"role": "user", "content": prompt},
        # ]
        # inputs = self.tokenizer.apply_chat_template(
        #     messages,
        #     tokenize = True,
        #     add_generation_prompt = True, # Must add for generation
        #     return_tensors = "pt",
        # ).to("cuda")

        # outputs = self.model.generate(input_ids = inputs, max_new_tokens = 64, use_cache = True,
        #                         temperature = 1.5, min_p = 0.1)
        # self.tokenizer.batch_decode(outputs)

        result = self.pipeline(
            prompt,
            max_new_tokens=500,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            num_return_sequences=1
        )
        return result[0]['generated_text']
