"""
LangChain Integration for AgentAuth

Provides tools for LangChain agents to request authorized payments.
"""
from typing import Optional, Type
from pydantic import BaseModel, Field

try:
    from langchain_core.tools import BaseTool
    from langchain_core.callbacks import CallbackManagerForToolRun
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    BaseTool = object

from agentauth.client import AgentAuth
from agentauth.exceptions import AuthorizationDenied


class AuthorizePaymentInput(BaseModel):
    """Input schema for the authorize payment tool."""
    amount: float = Field(description="The payment amount in the consent's currency")
    merchant_id: str = Field(description="The merchant identifier")
    merchant_name: Optional[str] = Field(default=None, description="The merchant display name")
    description: Optional[str] = Field(default=None, description="Payment description")


class AgentAuthTool(BaseTool if LANGCHAIN_AVAILABLE else object):
    """
    LangChain tool for AgentAuth payment authorization.
    
    This tool allows LangChain agents to request payment authorization
    using a pre-established consent token.
    
    Example:
        ```python
        from agentauth.langchain import AgentAuthTool
        from langchain.agents import initialize_agent
        
        # Create tool with delegation token
        tool = AgentAuthTool(
            api_key="aa_live_xxx",
            delegation_token="eyJ..."
        )
        
        # Use in agent
        agent = initialize_agent(
            tools=[tool],
            llm=llm,
            agent="zero-shot-react-description"
        )
        
        result = agent.run("Buy a $300 flight from Delta Airlines")
        ```
    """
    
    name: str = "authorize_payment"
    description: str = """Use this tool to authorize a payment. 
    The user has pre-authorized spending up to a certain limit.
    Input should include the amount, merchant_id, and optionally merchant_name.
    Returns an authorization code if approved, or a denial reason if not."""
    
    args_schema: Type[BaseModel] = AuthorizePaymentInput
    
    # Instance attributes
    api_key: Optional[str] = None
    base_url: str = "http://localhost:8000"
    delegation_token: Optional[str] = None
    currency: str = "USD"
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "http://localhost:8000",
        delegation_token: Optional[str] = None,
        currency: str = "USD",
        **kwargs
    ):
        """
        Initialize the AgentAuth tool.
        
        Args:
            api_key: AgentAuth API key
            base_url: AgentAuth API base URL
            delegation_token: Pre-established delegation token from consent
            currency: Default currency for transactions
        """
        if not LANGCHAIN_AVAILABLE:
            raise ImportError(
                "LangChain is required for this tool. "
                "Install with: pip install agentauth[langchain]"
            )
        
        super().__init__(**kwargs)
        self.api_key = api_key
        self.base_url = base_url
        self.delegation_token = delegation_token
        self.currency = currency
        self._client = AgentAuth(api_key=api_key, base_url=base_url)
    
    def set_delegation_token(self, token: str) -> None:
        """Set or update the delegation token."""
        self.delegation_token = token
    
    def _run(
        self,
        amount: float,
        merchant_id: str,
        merchant_name: Optional[str] = None,
        description: Optional[str] = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Execute the payment authorization."""
        if not self.delegation_token:
            return "Error: No delegation token set. User must first create a consent."
        
        try:
            auth = self._client.authorize(
                token=self.delegation_token,
                amount=amount,
                currency=self.currency,
                merchant_id=merchant_id,
                merchant_name=merchant_name,
            )
            
            if auth.allowed:
                return f"✅ Payment authorized! Authorization code: {auth.authorization_code}. This code should be provided to the merchant to complete the transaction."
            else:
                return f"❌ Payment denied. Reason: {auth.reason}. Message: {auth.message}"
                
        except AuthorizationDenied as e:
            return f"❌ Payment denied: {e.reason}"
        except Exception as e:
            return f"Error authorizing payment: {str(e)}"


class CreateConsentTool(BaseTool if LANGCHAIN_AVAILABLE else object):
    """
    LangChain tool for creating user consents.
    
    This tool allows agents to help users create spending consents.
    """
    
    name: str = "create_consent"
    description: str = """Use this tool to create a spending consent for the user.
    This establishes authorization limits before making purchases.
    Input should include max_amount, currency, and a description of allowed purchases."""
    
    api_key: Optional[str] = None
    base_url: str = "http://localhost:8000"
    user_id: str = "default_user"
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "http://localhost:8000",
        user_id: str = "default_user",
        **kwargs
    ):
        if not LANGCHAIN_AVAILABLE:
            raise ImportError(
                "LangChain is required. Install with: pip install agentauth[langchain]"
            )
        
        super().__init__(**kwargs)
        self.api_key = api_key
        self.base_url = base_url
        self.user_id = user_id
        self._client = AgentAuth(api_key=api_key, base_url=base_url)
    
    def _run(
        self,
        intent: str,
        max_amount: float,
        currency: str = "USD",
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Create a spending consent."""
        try:
            consent = self._client.consents.create(
                user_id=self.user_id,
                intent=intent,
                max_amount=max_amount,
                currency=currency,
            )
            
            return f"""✅ Consent created successfully!
- Consent ID: {consent.consent_id}
- Max Amount: ${consent.constraints.max_amount} {consent.constraints.currency}
- Token: {consent.delegation_token[:50]}...

Use the authorize_payment tool with this token to make purchases within the limit."""
            
        except Exception as e:
            return f"Error creating consent: {str(e)}"


def get_agentauth_tools(
    api_key: Optional[str] = None,
    base_url: str = "http://localhost:8000",
    delegation_token: Optional[str] = None,
    user_id: str = "default_user",
) -> list:
    """
    Get all AgentAuth tools for LangChain.
    
    Returns:
        List of LangChain tools for consent creation and payment authorization.
    """
    if not LANGCHAIN_AVAILABLE:
        raise ImportError(
            "LangChain is required. Install with: pip install agentauth[langchain]"
        )
    
    return [
        CreateConsentTool(api_key=api_key, base_url=base_url, user_id=user_id),
        AgentAuthTool(api_key=api_key, base_url=base_url, delegation_token=delegation_token),
    ]
