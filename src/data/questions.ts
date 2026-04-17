export function parseQuestionsText(text: string) {
  const parsed = [];
  const lines = text.split('\n');
  
  let currentQuestion: any = null;
  let lastAppended = 'none'; // 'question' | 'option' | 'none'
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;
    
    // Check if new question
    const qMatch = line.match(/^(?:Q\d+|\d+)[\.\)\-]\s+(.*)/i);
    if (qMatch) {
      if (currentQuestion && currentQuestion.options.length > 0 && (currentQuestion.correctIndex !== -1 || currentQuestion.answer)) {
        parsed.push(currentQuestion);
      }
      currentQuestion = {
        question: qMatch[1],
        options: [],
        answer: "",
        correctIndex: -1
      };
      lastAppended = 'question';
      continue;
    }
    
    // Check if option
    const optMatch = line.match(/^([A-Za-z])[\.\)\-]\s+(.*)/);
    if (optMatch && currentQuestion) {
      currentQuestion.options.push(optMatch[2].trim());
      lastAppended = 'option';
      continue;
    }
    
    // Check if answer
    const ansMatch = line.match(/^(?:Correct\s+)?Answer:\s+(.*)/i);
    if (ansMatch && currentQuestion) {
      let matchText = ansMatch[1].trim();
      
      const letterMatch = matchText.match(/^([A-Za-z])[\.\)]?$/i);
      if (letterMatch) {
        const charCode = letterMatch[1].toUpperCase().charCodeAt(0);
        const idx = charCode - 65;
        if (idx >= 0 && idx < currentQuestion.options.length) {
          currentQuestion.correctIndex = idx;
          currentQuestion.answer = currentQuestion.options[idx];
        } else {
          currentQuestion.answer = matchText;
        }
      } else {
        currentQuestion.answer = matchText;
        // Try to figure out the right option index by matching string
        let found = currentQuestion.options.findIndex((o: string) => o.toLowerCase() === matchText.toLowerCase());
        if (found !== -1) {
            currentQuestion.correctIndex = found;
            currentQuestion.answer = currentQuestion.options[found];
        } else {
            // strip punctuation and extra spaces for fuzzy match
            const sanitize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const sMatch = sanitize(matchText);
            let fuzzyFound = currentQuestion.options.findIndex((o: string) => {
                const oSan = sanitize(o);
                return oSan === sMatch || oSan.includes(sMatch) || sMatch.includes(oSan);
            });
            if (fuzzyFound !== -1) {
                currentQuestion.correctIndex = fuzzyFound;
                currentQuestion.answer = currentQuestion.options[fuzzyFound];
            }
        }
      }
      
      lastAppended = 'none';
      parsed.push({...currentQuestion});
      currentQuestion = null; // reset to avoid duplicate pushes
      continue;
    }
    
    // If it's a continuation of text
    if (currentQuestion) {
       if (lastAppended === 'question') {
           currentQuestion.question += " " + line;
       } else if (lastAppended === 'option' && currentQuestion.options.length > 0) {
           currentQuestion.options[currentQuestion.options.length - 1] += " " + line;
       }
    }
  }
  
  if (currentQuestion && currentQuestion.options.length > 0 && (currentQuestion.correctIndex !== -1 || currentQuestion.answer)) {
      if (!parsed.find(p => p.question === currentQuestion.question)) {
          parsed.push(currentQuestion);
      }
  }
  
  return parsed;
}

export const rawInitialQuestions = `
1. Why was the United Nations created in the modern international system?
A. To act only as a world trade court
B. To replace all national governments with one central authority
C. To reduce conflict, promote cooperation, and build a rules-based global order
D. To focus only on industrial production targets
Answer: C

2. Which of the following best explains the importance of global order for sustainable development?
A. Global order matters only for military strategy and not for development
B. Development improves most when countries ignore all common rules
C. Sustainability depends only on local weather patterns and not on cooperation
D. Stable cooperation and shared institutions make collective action more effective
Answer: D

3. The United Nations was established in which year?
A. 1945
B. 1919
C. 1955
D. 1965
Answer: A

4. The Sustainable Development Goals (SDGs) are described as a call for action by:
a) Only developed countries
b) Only developing countries
c) All countries – poor, rich, and middle income
d) United Nations agencies only
Correct Answer: All countries – poor, rich, and middle income

5. The Millennium Development Goals (MDGs) primarily focused on reducing:
a) Climate change
b) Industrial emissions
c) Economic inequality
d) Extreme poverty
Correct Answer: Extreme poverty

6. Agenda 21 was adopted at the Earth Summit held in:
a) Johannesburg
b) New York
c) Rio de Janeiro
d) Paris
Correct Answer: Rio de Janeiro

7. What is a major criticism of the current growth model?
A. It always distributes benefits equally across all groups
B. It removes all pressure on natural resources automatically
C. It guarantees sustainability if GDP rises quickly
D. It can produce inequality and ecological stress when growth ignores social and environmental limits
Answer: D

8. Business-as-usual development is often criticized because it:
A. Treats environmental and social costs as secondary or external
B. Always keeps consumption within ecological limits
C. Removes the need for public policy and planning
D. Produces zero pollution in rapidly growing economies
Answer: A

9. Why does the course argue that change is necessary in development practice?
A. Because existing patterns are creating unsustainable ecological and social outcomes
B. Because sustainability has already been fully achieved
C. Because inequality automatically disappears over time
D. Because development and environment are completely unrelated
Answer: A

10. A 'need for change' argument in sustainable development usually means:
A. Rejecting all forms of development activity
B. Moving toward more balanced, inclusive, and long-term forms of progress
C. Expanding extraction without any social review
D. Treating growth as purely a short-term output problem
Answer: B

11. Which statement best expresses the Brundtland idea of sustainability?
A. Only present consumption matters in policy design
B. Development should meet present needs without damaging future generations' ability to meet theirs
C. Future resources should be ignored if current growth is strong
D. Sustainability is concerned only with forests and not with people
Answer: B

12. The environment-society-economy balance is important because:
A. Economic output alone is enough to define sustainability
B. Social and ecological issues can be solved later and separately
C. Sustainable development must integrate ecological, social, and economic dimensions together
D. The three dimensions should be treated as fully unrelated
Answer: C

13. The Sustainable Development Goals replaced a previous UN framework known as the:
A. Kyoto Protocol Goals
B. Rio Principles
C. Human Development Index
D. Millennium Development Goals
Answer: D

14. What is the importance of Agenda 2030 in the SDG framework?
A. It applies only to one region of the world
B. It is limited to environmental clean-up with no social agenda
C. It provides a universal time-bound framework for action up to 2030
D. It replaced all targets with general statements only
Answer: C

15. The shift from MDGs to SDGs is best described as:
A. A move away from targets and indicators
B. A narrowing of goals to only three themes
C. A replacement of development policy with trade policy alone
D. A move to a broader, more inclusive, and more integrated development agenda
Answer: D

16. What is one major role of the United Nations in the SDG context?
A. It functions only as a trade court for private companies
B. It provides coordination, cooperation platforms, and shared global direction
C. It replaces the need for any national government
D. It works only on military alliances and not on development
Answer: B

17. Transboundary water cooperation matters because:
A. Water systems often cross political borders and require shared management
B. Water quality is always a purely local issue
C. Rivers can be fully controlled by one district alone
D. Sanitation has no relation to ecosystem health
Answer: A

18. Resilient agriculture is important because it:
A. Depends only on short-term chemical intensification
B. Helps food systems cope with climate stress and major shocks
C. Eliminates the need for soil care
D. Ignores ecosystem health completely
Answer: B

19. Hidden hunger refers mainly to:
A. Micronutrient deficiency even when some calories may be available
B. The absence of all water sources
C. A temporary market shortage of luxury goods
D. A condition limited only to rich countries
Answer: A

20. Access to affordable and clean energy can directly support:
A. Only luxury consumption in high-income cities
B. Lighting, communication, health, learning, and livelihood activity
C. Only industrial exports with no household benefit
D. Only fossil fuel expansion
Answer: B
`;

export const defaultQuestions = parseQuestionsText(rawInitialQuestions);
