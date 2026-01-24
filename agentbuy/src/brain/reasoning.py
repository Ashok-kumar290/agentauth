"""
AgentBuy - ReAct Reasoning Engine

Implements the Think → Act → Observe loop for autonomous decision making.
"""
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Optional

from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class ThoughtType(Enum):
    """Types of thoughts the agent can have."""
    REASONING = "reasoning"      # Planning what to do
    OBSERVATION = "observation"  # Interpreting results
    DECISION = "decision"        # Making a choice
    COMPLETE = "complete"        # Goal achieved
    ERROR = "error"              # Something went wrong


@dataclass
class Thought:
    """A single thought in the reasoning chain."""
    type: ThoughtType
    content: str
    next_action: Optional[str] = None
    action_input: Optional[dict] = None
    confidence: float = 0.8
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_complete(self) -> bool:
        return self.type == ThoughtType.COMPLETE
    
    @property
    def is_error(self) -> bool:
        return self.type == ThoughtType.ERROR


@dataclass
class ActionResult:
    """Result of executing an action."""
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: float = 0


@dataclass
class AgentStep:
    """A single step in the agent's reasoning process."""
    step_number: int
    thought: Thought
    action: Optional[str] = None
    action_input: Optional[dict] = None
    observation: Optional[str] = None
    
    def to_message(self) -> str:
        """Convert step to message for LLM context."""
        parts = [f"Thought: {self.thought.content}"]
        if self.action:
            parts.append(f"Action: {self.action}")
            if self.action_input:
                parts.append(f"Action Input: {json.dumps(self.action_input)}")
        if self.observation:
            parts.append(f"Observation: {self.observation}")
        return "\n".join(parts)


@dataclass
class AgentContext:
    """Context for the agent's reasoning."""
    goal: str
    user_id: str
    session_id: str
    steps: list[AgentStep] = field(default_factory=list)
    memory: dict = field(default_factory=dict)
    max_steps: int = 15
    
    def add_step(self, thought: Thought, action: str = None, 
                 action_input: dict = None, observation: str = None):
        step = AgentStep(
            step_number=len(self.steps) + 1,
            thought=thought,
            action=action,
            action_input=action_input,
            observation=observation
        )
        self.steps.append(step)
        return step
    
    def get_history(self) -> str:
        """Get reasoning history for LLM context."""
        if not self.steps:
            return "No previous steps."
        return "\n\n".join(step.to_message() for step in self.steps)


REACT_SYSTEM_PROMPT = """You are an autonomous AI agent that helps users make purchases.
You use a structured reasoning process: THINK → ACT → OBSERVE → REPEAT until goal is achieved.

## Your Capabilities
You have access to tools for:
- Browsing websites and interacting with web pages
- Checking user's budget and authorization via AgentAuth
- Searching for products and stores
- Placing orders and tracking them

## Response Format
Always respond in this exact JSON format:
{
    "thought": "Your reasoning about what to do next",
    "thought_type": "reasoning|decision|complete|error",
    "action": "tool_name or null if complete",
    "action_input": {"param": "value"} or null,
    "confidence": 0.0-1.0
}

## Guidelines
1. Always THINK before acting - explain your reasoning
2. Use the minimum number of steps necessary
3. Verify results before proceeding
4. If unsure, ask for clarification via the ask_user tool
5. Always check authorization before making purchases
6. If you encounter an error, try to recover or explain why you can't

## Current Context
User ID: {user_id}
Session ID: {session_id}
Goal: {goal}

## Available Tools
{tools_description}

## Previous Steps
{history}

What is your next thought and action?"""


class ReActEngine:
    """
    The core reasoning engine using ReAct pattern.
    
    ReAct = Reasoning + Acting
    The agent thinks about what to do, executes an action,
    observes the result, and repeats until the goal is achieved.
    """
    
    def __init__(
        self,
        llm_client: AsyncOpenAI,
        tools: dict[str, Callable],
        model: str = "gpt-4o"
    ):
        self.llm = llm_client
        self.tools = tools
        self.model = model
    
    def _get_tools_description(self) -> str:
        """Generate tools description for the prompt."""
        descriptions = []
        for name, tool in self.tools.items():
            doc = tool.__doc__ or "No description"
            descriptions.append(f"- {name}: {doc.strip().split(chr(10))[0]}")
        return "\n".join(descriptions)
    
    async def think(self, context: AgentContext) -> Thought:
        """Generate the next thought based on current context."""
        prompt = REACT_SYSTEM_PROMPT.format(
            user_id=context.user_id,
            session_id=context.session_id,
            goal=context.goal,
            tools_description=self._get_tools_description(),
            history=context.get_history()
        )
        
        try:
            response = await self.llm.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": "What is your next thought and action?"}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            
            thought_type = ThoughtType(result.get("thought_type", "reasoning"))
            
            return Thought(
                type=thought_type,
                content=result.get("thought", ""),
                next_action=result.get("action"),
                action_input=result.get("action_input"),
                confidence=result.get("confidence", 0.8)
            )
            
        except Exception as e:
            logger.error(f"Error in think phase: {e}")
            return Thought(
                type=ThoughtType.ERROR,
                content=f"Failed to reason: {str(e)}",
                confidence=0.0
            )
    
    async def act(self, action: str, action_input: dict) -> ActionResult:
        """Execute an action using the appropriate tool."""
        import time
        start = time.time()
        
        if action not in self.tools:
            return ActionResult(
                success=False,
                error=f"Unknown tool: {action}"
            )
        
        try:
            tool = self.tools[action]
            result = await tool(**(action_input or {}))
            
            return ActionResult(
                success=True,
                data=result,
                execution_time_ms=(time.time() - start) * 1000
            )
            
        except Exception as e:
            logger.error(f"Error executing {action}: {e}")
            return ActionResult(
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )
    
    async def observe(self, result: ActionResult) -> str:
        """Convert action result to observation string."""
        if result.success:
            if isinstance(result.data, dict):
                return json.dumps(result.data, indent=2)
            return str(result.data)
        else:
            return f"ERROR: {result.error}"
    
    async def run(self, goal: str, user_id: str, session_id: str = None) -> dict:
        """
        Run the full ReAct loop until goal is achieved or max steps reached.
        
        Returns:
            dict with success status, final result, and reasoning trace
        """
        import uuid
        
        context = AgentContext(
            goal=goal,
            user_id=user_id,
            session_id=session_id or str(uuid.uuid4())
        )
        
        logger.info(f"Starting ReAct loop for goal: {goal}")
        
        for step_num in range(context.max_steps):
            logger.info(f"Step {step_num + 1}/{context.max_steps}")
            
            # THINK
            thought = await self.think(context)
            logger.info(f"Thought: {thought.content[:100]}...")
            
            if thought.is_complete:
                context.add_step(thought)
                return {
                    "success": True,
                    "result": thought.content,
                    "steps": len(context.steps),
                    "trace": [s.to_message() for s in context.steps]
                }
            
            if thought.is_error:
                context.add_step(thought)
                return {
                    "success": False,
                    "error": thought.content,
                    "steps": len(context.steps),
                    "trace": [s.to_message() for s in context.steps]
                }
            
            # ACT
            if thought.next_action:
                logger.info(f"Action: {thought.next_action}")
                result = await self.act(thought.next_action, thought.action_input)
                
                # OBSERVE
                observation = await self.observe(result)
                logger.info(f"Observation: {observation[:100]}...")
                
                context.add_step(
                    thought=thought,
                    action=thought.next_action,
                    action_input=thought.action_input,
                    observation=observation
                )
            else:
                context.add_step(thought)
        
        # Max steps reached
        return {
            "success": False,
            "error": f"Max steps ({context.max_steps}) reached without completing goal",
            "steps": len(context.steps),
            "trace": [s.to_message() for s in context.steps]
        }
