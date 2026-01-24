"""
AgentBuy - Browser Tools

Tools for web automation - navigating, clicking, typing, and visual analysis.
Used for interacting with any website (Starbucks, Amazon, etc.)
"""
import asyncio
import base64
import logging
from dataclasses import dataclass
from typing import Optional

from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


@dataclass
class BrowserState:
    """Current state of the browser."""
    url: str
    title: str
    screenshot_b64: Optional[str] = None
    page_text: Optional[str] = None
    interactive_elements: list[dict] = None


class BrowserTools:
    """
    Browser automation tools for the agent.
    Uses Playwright for web interaction and GPT-4V for visual understanding.
    """
    
    def __init__(self, vision_client: AsyncOpenAI = None, headless: bool = True):
        self.vision_client = vision_client
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self._playwright = None
    
    async def _ensure_browser(self):
        """Ensure browser is initialized."""
        if not self.browser:
            self._playwright = await async_playwright().start()
            self.browser = await self._playwright.chromium.launch(
                headless=self.headless,
                args=['--disable-blink-features=AutomationControlled']
            )
            self.context = await self.browser.new_context(
                viewport={'width': 1280, 'height': 800},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )
            self.page = await self.context.new_page()
    
    async def navigate(self, url: str) -> dict:
        """
        Navigate to a URL.
        
        Args:
            url: The URL to navigate to
            
        Returns:
            Current page state with title and URL
        """
        await self._ensure_browser()
        
        try:
            await self.page.goto(url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(1)  # Wait for dynamic content
            
            return {
                "success": True,
                "url": self.page.url,
                "title": await self.page.title()
            }
        except Exception as e:
            logger.error(f"Navigation failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def click(self, selector: str = None, text: str = None) -> dict:
        """
        Click an element by CSS selector or visible text.
        
        Args:
            selector: CSS selector of element to click
            text: Visible text of element to click (alternative to selector)
            
        Returns:
            Success status and new page state
        """
        await self._ensure_browser()
        
        try:
            if text:
                # Find by visible text
                await self.page.click(f"text={text}", timeout=5000)
            elif selector:
                await self.page.click(selector, timeout=5000)
            else:
                return {"success": False, "error": "Must provide selector or text"}
            
            await asyncio.sleep(0.5)  # Wait for navigation/update
            
            return {
                "success": True,
                "url": self.page.url,
                "title": await self.page.title()
            }
        except Exception as e:
            logger.error(f"Click failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def type_text(self, selector: str, text: str, clear: bool = True) -> dict:
        """
        Type text into an input field.
        
        Args:
            selector: CSS selector of input field
            text: Text to type
            clear: Whether to clear existing text first
            
        Returns:
            Success status
        """
        await self._ensure_browser()
        
        try:
            if clear:
                await self.page.fill(selector, text)
            else:
                await self.page.type(selector, text)
            
            return {"success": True, "typed": text}
        except Exception as e:
            logger.error(f"Type failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def screenshot(self) -> dict:
        """
        Take a screenshot of the current page.
        
        Returns:
            Base64 encoded screenshot
        """
        await self._ensure_browser()
        
        try:
            screenshot_bytes = await self.page.screenshot(full_page=False)
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            return {
                "success": True,
                "screenshot_b64": screenshot_b64,
                "url": self.page.url
            }
        except Exception as e:
            logger.error(f"Screenshot failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def analyze_page(self, question: str = "What is on this page and what actions can I take?") -> dict:
        """
        Take screenshot and analyze with GPT-4 Vision.
        
        Args:
            question: What to analyze about the page
            
        Returns:
            Analysis of the page content and available actions
        """
        await self._ensure_browser()
        
        if not self.vision_client:
            return {"success": False, "error": "Vision client not configured"}
        
        try:
            # Take screenshot
            screenshot_bytes = await self.page.screenshot(full_page=False)
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            # Analyze with GPT-4V
            response = await self.vision_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"""Analyze this webpage screenshot. 
                                
Current URL: {self.page.url}

Question: {question}

Provide a structured response:
1. Page Overview: What type of page is this?
2. Key Elements: What interactive elements are visible (buttons, forms, links)?
3. Current State: Is there a form filled out, items in cart, etc?
4. Suggested Actions: What actions can I take on this page?"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{screenshot_b64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "success": True,
                "url": self.page.url,
                "title": await self.page.title(),
                "analysis": analysis
            }
            
        except Exception as e:
            logger.error(f"Page analysis failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_page_text(self) -> dict:
        """
        Get all visible text from the current page.
        
        Returns:
            Text content of the page
        """
        await self._ensure_browser()
        
        try:
            text = await self.page.inner_text('body')
            # Truncate if too long
            if len(text) > 5000:
                text = text[:5000] + "\n...[truncated]"
            
            return {
                "success": True,
                "url": self.page.url,
                "text": text
            }
        except Exception as e:
            logger.error(f"Get text failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def scroll(self, direction: str = "down", amount: int = 500) -> dict:
        """
        Scroll the page.
        
        Args:
            direction: "up" or "down"
            amount: Pixels to scroll
            
        Returns:
            Success status
        """
        await self._ensure_browser()
        
        try:
            if direction == "down":
                await self.page.evaluate(f"window.scrollBy(0, {amount})")
            else:
                await self.page.evaluate(f"window.scrollBy(0, -{amount})")
            
            await asyncio.sleep(0.3)
            return {"success": True, "scrolled": direction, "amount": amount}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def wait_for(self, selector: str, timeout: int = 10000) -> dict:
        """
        Wait for an element to appear.
        
        Args:
            selector: CSS selector to wait for
            timeout: Max wait time in ms
            
        Returns:
            Success status
        """
        await self._ensure_browser()
        
        try:
            await self.page.wait_for_selector(selector, timeout=timeout)
            return {"success": True, "found": selector}
        except Exception as e:
            return {"success": False, "error": f"Element not found: {selector}"}
    
    async def close(self):
        """Close the browser."""
        if self.browser:
            await self.browser.close()
        if self._playwright:
            await self._playwright.stop()
