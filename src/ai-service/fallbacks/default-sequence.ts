export const DefaultSequenceFallback = {
  sequence: [
    {
      message:
        "Hi there! I noticed your impressive background and thought you might be interested in connecting. Your experience in the industry really caught my attention, and I'd love to learn more about your current work.",
      type: 'opening',
      confidence: 0.72,
      aiReasoning:
        'Professional opening that acknowledges their background without being too specific, maintaining authenticity while being broadly applicable.',
    },
    {
      message:
        "I'm always interested in connecting with professionals who are making an impact in their field. Would you be open to sharing insights about your current role and the challenges you're working on?",
      type: 'follow-up',
      confidence: 0.68,
      aiReasoning:
        'Builds rapport by showing genuine interest in their work and inviting them to share, which most professionals enjoy doing.',
    },
    {
      message:
        "I'd love to continue this conversation over a brief call if you're interested. Even a 15-minute chat could be valuable for both of us. Would next week work for a quick connection call?",
      type: 'call-to-action',
      confidence: 0.75,
      aiReasoning:
        'Clear call-to-action with specific time commitment (15 minutes) and mutual value proposition, plus flexible timing.',
    },
  ],
  thinking_process: {
    analysis:
      'This fallback sequence is designed to be professional yet personable, avoiding overly specific details that might seem inauthentic. The approach focuses on genuine interest in their professional experience while maintaining broad applicability. The progression moves logically from acknowledgment to curiosity to action.',
    tone_of_voice:
      'Professional, respectful, and genuinely interested. The tone balances business formality with human warmth, avoiding both overly casual and overly corporate language. Each message maintains authenticity while being broadly applicable.',
    sequence_logic:
      'Opening: Acknowledge their background and express genuine interest. Follow-up: Build rapport by asking about their current work and challenges. Call-to-action: Propose a specific, low-commitment next step with mutual value. This creates a natural conversation flow that feels organic rather than scripted.',
  },
  prospect_analysis:
    'Using a general professional analysis since specific prospect information is unavailable. This sequence assumes a mid-to-senior level professional who values meaningful connections and is likely open to networking if approached respectfully. The messaging is designed to work across various industries and roles.',
  metadata: {
    model_used: 'fallback',
    cost: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  },
};
