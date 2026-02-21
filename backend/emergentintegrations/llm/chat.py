class UserMessage:
    def __init__(self, text=""):
        self.text = text

class LlmChat:
    def __init__(self, api_key="", session_id="", system_message=""):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model_provider = "openai"
        self.model_name = "gpt-4"

    def with_model(self, provider, model):
        self.model_provider = provider
        self.model_name = model
        return self

    async def send_message(self, message):
        return "AI features require the Emergent Integrations service to be configured. Please set up your EMERGENT_LLM_KEY to enable AI chat functionality."
