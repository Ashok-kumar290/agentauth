"""
AgentBuy - Stripe Payment Tools

Tools for processing payments via Stripe.
Connects to AgentAuth for authorization and Stripe for payment execution.
"""
import logging
import os
from typing import Optional

import stripe

logger = logging.getLogger(__name__)


class StripePaymentTools:
    """
    Stripe payment processing tools.
    Uses Stripe test/sandbox mode for demo.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("STRIPE_SECRET_KEY")
        if self.api_key:
            stripe.api_key = self.api_key
            logger.info("Stripe initialized")
        else:
            logger.warning("STRIPE_SECRET_KEY not set - payments disabled")
    
    async def create_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        description: str = None,
        merchant_name: str = None,
        authorization_code: str = None
    ) -> dict:
        """
        Create a Stripe PaymentIntent for processing.
        
        Args:
            amount: Amount in dollars (e.g., 10.00)
            currency: Currency code (default: usd)
            description: Payment description
            merchant_name: Name of the merchant
            authorization_code: AgentAuth authorization code
            
        Returns:
            PaymentIntent details
        """
        if not self.api_key:
            return {
                "success": False,
                "error": "Stripe not configured"
            }
        
        try:
            # Convert to cents for Stripe
            amount_cents = int(amount * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                automatic_payment_methods={
                    "enabled": True,
                    "allow_redirects": "never"  # For test mode without return_url
                },
                description=description or f"Payment to {merchant_name}",
                metadata={
                    "merchant_name": merchant_name or "Unknown",
                    "agentauth_code": authorization_code or "none",
                    "source": "agentbuy_demo"
                }
            )
            
            logger.info(f"Created PaymentIntent: {intent.id} for ${amount}")
            
            return {
                "success": True,
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount,
                "amount_cents": amount_cents,
                "currency": currency,
                "status": intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def confirm_payment(
        self,
        payment_intent_id: str,
        payment_method: str = "pm_card_visa"  # Test card
    ) -> dict:
        """
        Confirm a payment intent (for demo, uses test card).
        
        Args:
            payment_intent_id: The PaymentIntent ID
            payment_method: Payment method ID (default: test Visa)
            
        Returns:
            Confirmation result
        """
        if not self.api_key:
            return {"success": False, "error": "Stripe not configured"}
        
        try:
            intent = stripe.PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method
            )
            
            logger.info(f"Confirmed payment: {intent.id} - {intent.status}")
            
            # Get receipt URL if available (may not be present immediately)
            receipt_url = None
            if hasattr(intent, 'latest_charge') and intent.latest_charge:
                try:
                    charge = stripe.Charge.retrieve(intent.latest_charge)
                    receipt_url = charge.receipt_url
                except:
                    pass
            
            return {
                "success": intent.status == "succeeded",
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,  # Convert back to dollars
                "receipt_url": receipt_url
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Payment confirmation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def process_payment(
        self,
        amount: float,
        merchant_name: str,
        description: str = None,
        authorization_code: str = None
    ) -> dict:
        """
        Full payment flow: create intent + confirm with test card.
        
        This is the main method for demo - it processes the full payment.
        
        Args:
            amount: Amount in dollars
            merchant_name: Merchant name
            description: Payment description
            authorization_code: AgentAuth authorization code
            
        Returns:
            Complete payment result
        """
        # Step 1: Create intent
        intent_result = await self.create_payment_intent(
            amount=amount,
            description=description or f"Payment to {merchant_name}",
            merchant_name=merchant_name,
            authorization_code=authorization_code
        )
        
        if not intent_result.get("success"):
            return intent_result
        
        # Step 2: Confirm with test card
        confirm_result = await self.confirm_payment(
            payment_intent_id=intent_result["payment_intent_id"]
        )
        
        if confirm_result.get("success"):
            return {
                "success": True,
                "message": f"Payment of ${amount:.2f} to {merchant_name} succeeded",
                "payment_id": confirm_result["payment_intent_id"],
                "amount": amount,
                "merchant": merchant_name,
                "authorization_code": authorization_code,
                "receipt_url": confirm_result.get("receipt_url")
            }
        else:
            return confirm_result
    
    async def get_payment_status(self, payment_intent_id: str) -> dict:
        """Get the status of a payment."""
        if not self.api_key:
            return {"success": False, "error": "Stripe not configured"}
        
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "success": True,
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100
            }
        except stripe.error.StripeError as e:
            return {"success": False, "error": str(e)}
