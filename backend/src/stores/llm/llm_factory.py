from src.stores.llm.llm_interface import LLMInterface
from src.stores.llm.providers import GeminiLLM , NgrokLLM , HuggingFaceTransformerLLM , HuggingFaceLLM

class LLMFactory:
    @staticmethod
    def create(provider: str, api_key: str = None, **kwargs) -> LLMInterface:
        if provider == "gemini":
            return GeminiLLM(api_key)
        elif provider == "ngrok":
            return NgrokLLM(kwargs.get("ngrok_url", "https://fa90292743cb.ngrok-free.app"))
        elif provider == "huggingface":
            return HuggingFaceTransformerLLM(api_key,kwargs.get("base_model", "unsloth/llama-3-8b-bnb-4bit") ,kwargs.get("adapter_model", "ihebmbarek/driver_model"))
        else:
            raise ValueError(f"Unknown LLM provider: {provider}")
