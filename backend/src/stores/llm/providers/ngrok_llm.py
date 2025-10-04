import requests
from src.stores.llm.llm_interface import LLMInterface

class NgrokLLM(LLMInterface):
    def __init__(self, 
                #  api_key: str = None,
                 ngrok_url: str = "https://03bb4920c870.ngrok-free.app"):
        """
        NgrokLLM connects to a remote LLM served via ngrok.

        Parameters:
        - ngrok_url: The public ngrok URL of the model endpoint (e.g. from Colab)
        - api_key: Optional (for future use if you secure the endpoint)
        """
        # self.api_key = api_key
        self.ngrok_url = ngrok_url.rstrip('/')  # Remove trailing slash if exists
        print(f"🔗 Connected to remote LLM endpoint: {self.ngrok_url}")

    def generate(self, prompt: str, max_tokens: int = 300, temperature: float = 0.7) -> str:
        """
        Sends a text generation request to the remote model via ngrok.

        Args:
            prompt (str): Input question or text prompt
            max_tokens (int): Maximum tokens to generate
            temperature (float): Sampling temperature

        Returns:
            str: Generated text or an error message
        """
        try:
            response = requests.post(
                f"{self.ngrok_url}/ask",
                json={
                    "query": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=60
            )

            if response.status_code == 200:
                data = response.json()
                return data.get("answer", "").strip()

            print(f"❌ Request failed: {response.status_code} - {response.text}")
            return "Error generating response from remote LLM."

        except requests.exceptions.RequestException as e:
            print(f"⚠️ Connection error with ngrok: {e}")
            return "Failed to connect to the remote LLM."
