import { Question, Subtopic } from '../types/nuet';

export const MATH_SUBTOPICS: Subtopic[] = ['Algebra', 'Geometry', 'Probability', 'Functions'];
export const CT_SUBTOPICS: Subtopic[] = [
  'Main Conclusion',
  'Assumption',
  'Flaw',
  'Problem Solving',
];

export const ALL_SUBTOPICS: Subtopic[] = [...MATH_SUBTOPICS, ...CT_SUBTOPICS];

export const QUESTION_BANK: Question[] = [
  {
    id: 'math-1',
    section: 'Mathematics',
    subtopic: 'Algebra',
    difficulty: 'Standard',
    prompt:
      'If 2^(x + 1) + 2^(x - 1) = 40, where x is a real number, what is the value of x² − x?',
    options: ['6', '12', '20', '30', '8'],
    correctIndex: 1,
    explanation:
      'Factor out 2^(x - 1): 2^(x - 1) × (2² + 1) = 40, which gives 2^(x - 1) × 5 = 40. Dividing by 5 yields 2^(x - 1) = 8 = 2³, so x − 1 = 3 and x = 4. Therefore, x² − x = 4² − 4 = 16 − 4 = 12.',
    keyTerms: ['Exponential Equation', 'Factoring Powers', 'Quadratic Expression'],
  },
  {
    id: 'math-2',
    section: 'Mathematics',
    subtopic: 'Geometry',
    difficulty: 'Standard',
    prompt:
      'A circle is inscribed inside a square of side length 12 cm. A smaller square is inscribed inside that circle. What is the area of the region inside the circle but outside the smaller square, in cm²?',
    options: ['36π − 36', '18π − 36', '36π − 72', '72 − 18π', '144 − 36π'],
    correctIndex: 2,
    explanation:
      'Because the circle is inscribed in the outer square of side 12 cm, its diameter is 12 cm and its radius is r = 6 cm. The area of the circle is πr² = 36π cm². The smaller square is inscribed in the circle, so its diagonal equals the diameter 12 cm. A square with diagonal d has area d² / 2 = 12² / 2 = 72 cm². Thus, the shaded area is 36π − 72 cm².',
    keyTerms: ['Inscribed Circle', 'Diagonal of a Square', 'Composite Area'],
  },
  {
    id: 'math-3',
    section: 'Mathematics',
    subtopic: 'Probability',
    difficulty: 'Challenging',
    prompt:
      'A box contains 4 red marbles, 3 blue marbles, and 3 green marbles. Two marbles are drawn at random without replacement. What is the probability that both marbles are the same color?',
    options: ['1/5', '4/15', '17/50', '2/9', '7/30'],
    correctIndex: 1,
    explanation:
      'There are 10 marbles in total, so there are C(10, 2) = (10 × 9) / 2 = 45 equally likely pairs. The number of same-color pairs is C(4, 2) = 6 (both red), C(3, 2) = 3 (both blue), and C(3, 2) = 3 (both green), giving 6 + 3 + 3 = 12 favorable pairs. The probability is 12 / 45 = 4 / 15.',
    keyTerms: ['Without Replacement', 'Combinations', 'Mutually Exclusive Events'],
  },
  {
    id: 'math-4',
    section: 'Mathematics',
    subtopic: 'Functions',
    difficulty: 'Standard',
    prompt:
      'Let f(x) = (2x + 3) / (x − 1) for x ≠ 1. If f⁻¹(k) = 4, where f⁻¹ denotes the inverse function of f, what is the value of k?',
    options: ['7/2', '11/3', '11/5', '5/2', '13/3'],
    correctIndex: 1,
    explanation:
      'By definition of an inverse function, f⁻¹(k) = 4 is equivalent to k = f(4). Substituting x = 4 into f(x) directly gives k = (2(4) + 3) / (4 − 1) = 11 / 3.',
    keyTerms: ['Inverse Function', 'Domain Restriction', 'Function Evaluation'],
  },
  {
    id: 'math-5',
    section: 'Mathematics',
    subtopic: 'Algebra',
    difficulty: 'Challenging',
    prompt:
      'The sum of the first n terms of an arithmetic progression is given by Sₙ = 3n² + 2n for all positive integers n. What is the 10th term of this progression?',
    options: ['53', '56', '59', '61', '65'],
    correctIndex: 2,
    explanation:
      'The nth term of any sequence is aₙ = Sₙ − Sₙ₋₁. For n = 10, S₁₀ = 3(10²) + 2(10) = 320 and S₉ = 3(9²) + 2(9) = 243 + 18 = 261. Hence, a₁₀ = 320 − 261 = 59.',
    keyTerms: ['Arithmetic Progression', 'Partial Sum', 'General Term'],
  },
  {
    id: 'math-6',
    section: 'Mathematics',
    subtopic: 'Geometry',
    difficulty: 'Challenging',
    prompt:
      'Points A(1, 2) and B(7, 10) are the endpoints of a diameter of a circle in the coordinate plane. Which of the following is the equation of the line tangent to the circle at point B?',
    options: [
      '4x − 3y = −2',
      '3x + 4y = 61',
      '3x − 4y = −19',
      '4x + 3y = 58',
      '3x + 4y = 49',
    ],
    correctIndex: 1,
    explanation:
      'The slope of diameter AB is (10 − 2) / (7 − 1) = 8 / 6 = 4 / 3. A tangent line at B is perpendicular to the radius/diameter, so its slope is the negative reciprocal −3 / 4. Using point-slope form through B(7, 10): y − 10 = (−3/4)(x − 7), which rearranges to 4y − 40 = −3x + 21, or 3x + 4y = 61.',
    keyTerms: ['Tangent Line', 'Perpendicular Slope', 'Coordinate Geometry'],
  },
  {
    id: 'ct-1',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Main Conclusion',
    difficulty: 'Standard',
    prompt:
      'Over the past five years, remote and hybrid work arrangements have left nearly 25% of downtown office towers vacant across major cities. Some municipal leaders have proposed offering generous tax subsidies to corporations that mandate full-time office attendance, hoping to revive downtown foot traffic. However, surveys consistently show that employees value flexible hours more than commuter perks, meaning corporate mandates often trigger resignations rather than sustained occupancy. Meanwhile, urban housing shortages continue to drive up rents for young professionals. Rather than spending public funds on subsidies to lure companies back to desks, city governments should prioritize rezoning vacant commercial districts for mixed-use residential housing.\n\nWhich one of the following best expresses the main conclusion of the above argument?',
    options: [
      'Nearly a quarter of downtown office towers in major cities have remained vacant due to remote work.',
      'Offering tax subsidies to corporations will fail to revive downtown foot traffic because employees resign over office mandates.',
      'City governments should focus on rezoning empty commercial areas for mixed-use residential housing instead of subsidizing corporate office returns.',
      'Urban housing shortages are the primary cause of rising rents for young professionals in major cities.',
      'Flexible working hours are more effective at retaining employees than commuter perks.',
    ],
    correctIndex: 2,
    explanation:
      'The passage builds up evidence about office vacancies, the failure of corporate mandates, and housing shortages in order to advocate a specific policy recommendation in the final sentence: city governments should prioritize rezoning vacant commercial districts for mixed-use residential housing rather than offering tax subsidies. Options A, D, and E are premises, while B is an intermediate reason supporting the final recommendation.',
    keyTerms: ['Main Conclusion', 'Intermediate Conclusion', 'Premise'],
  },
  {
    id: 'ct-2',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Assumption',
    difficulty: 'Standard',
    prompt:
      'In a city-wide poll, 68% of respondents stated that high ticket prices discouraged them from riding public buses. To reduce severe rush-hour traffic congestion caused by private cars, the city council plans to eliminate all bus fares starting next month. Since cost was the most cited barrier in the poll, making buses free will substantially reduce the number of private cars on the road during rush hour.\n\nWhich one of the following is an assumption upon which the argument depends?',
    options: [
      'The city council has enough tax revenue to maintain current bus schedules without ticket sales.',
      'All respondents in the city-wide poll own a private car that they drive during rush hour.',
      'A meaningful number of rush-hour car commuters are not prevented from taking buses by non-price factors such as route coverage or travel time.',
      'Bus ridership will increase by at least 68% within the first month after fares are eliminated.',
      'Eliminating bus fares is the only feasible policy for reducing urban air pollution.',
    ],
    correctIndex: 2,
    explanation:
      'The argument concludes that removing bus fares will substantially cut rush-hour car traffic because poll respondents cited ticket prices as a barrier. For free buses to actually pull rush-hour drivers out of their cars, it must be true that enough of those rush-hour drivers are actually willing and able to switch once cost is removed—meaning they are not completely deterred by non-price obstacles like inconvenient routes or slow commute times. Option B is too extreme ("All respondents"), and D states an unwarranted exact percentage.',
    keyTerms: ['Necessary Assumption', 'Sufficient vs Necessary', 'Bridge Principle'],
  },
  {
    id: 'ct-3',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Flaw',
    difficulty: 'Standard',
    prompt:
      'A survey of 1,200 university undergraduates found that students who drank three or more cups of coffee per day achieved an average GPA that was 14% higher than students who drank no coffee. Clearly, regular caffeine consumption directly boosts academic performance. Therefore, students who want to improve their grades should increase their daily coffee intake.\n\nWhich one of the following best describes the main flaw in the reasoning above?',
    options: [
      'It relies on a sample size of 1,200 students, which is too small to represent all undergraduates.',
      'It assumes that a correlation between coffee consumption and higher GPA proves that coffee causes better academic performance.',
      'It ignores the fact that some university majors grade more strictly than others.',
      'It contradicts itself by claiming caffeine boosts performance while acknowledging some students drink no coffee.',
      'It appeals to popularity by using a survey of undergraduate habits.',
    ],
    correctIndex: 1,
    explanation:
      'The argument observes an association (correlation) between drinking coffee and having a higher GPA, and immediately leaps to a causal claim ("directly boosts academic performance") and a recommendation. It overlooks confounding factors—for instance, students who study longer hours may drink more coffee to stay alert, and the extra study hours (not the coffee) drive the higher GPA.',
    keyTerms: ['Correlation vs Causation', 'Confounding Variable', 'Logical Flaw'],
  },
  {
    id: 'ct-4',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Problem Solving',
    difficulty: 'Challenging',
    prompt:
      'A campus print shop prices custom event flyers using three tiers:\n• Tier 1 (1 to 100 flyers): $12 setup fee + $0.25 per flyer.\n• Tier 2 (101 to 300 flyers): $12 setup fee + $0.25 each for the first 100 flyers, and $0.15 each for every additional flyer beyond 100.\n• Tier 3 (Over 300 flyers): $0 setup fee, flat rate of $0.20 per flyer for the entire order.\n\nA student club needs at least 260 flyers and has a maximum budget of $62.00. What is the maximum number of flyers the club can afford?',
    options: ['266', '280', '300', '310', '315'],
    correctIndex: 3,
    explanation:
      'Check Tier 2 first: 100 flyers cost $12 + 100($0.25) = $37.00. With a $62.00 budget, $25.00 remains, which buys floor(25 / 0.15) = 166 additional flyers, totaling 266 flyers for $61.90. (300 flyers in Tier 2 would cost $37 + 200($0.15) = $67.00, exceeding the budget.) However, Tier 3 applies for orders over 300 flyers and waives the $12 setup fee: at $0.20 per flyer, $62.00 / $0.20 = 310 flyers, which is strictly greater than 300 and costs exactly $62.00. Thus, 310 is the maximum.',
    keyTerms: ['Piecewise Pricing', 'Boundary Threshold', 'Optimization'],
  },
  {
    id: 'ct-5',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Assumption',
    difficulty: 'Challenging',
    prompt:
      'To curb plastic pollution in coastal waters, a municipality banned single-use plastic shopping bags at all supermarkets. One year later, plastic bag sales dropped by 85%, yet municipal landfill audits revealed that the total weight of plastic waste discarded by households rose by 12%. Local commentators concluded that the ban failed to reduce plastic pollution in coastal waters.\n\nWhich one of the following is an assumption required for the commentators’ conclusion to be valid?',
    options: [
      'Supermarkets profited more from selling reusable bags than from giving away single-use bags.',
      'Changes in the total weight of household plastic waste in municipal landfills reliably reflect changes in the amount of plastic polluting coastal waters.',
      'Households discarded 12% more single-use shopping bags after the ban than before the ban.',
      'Most coastal plastic pollution originates from commercial fishing rather than household waste.',
      'Consumers did not switch from plastic shopping bags to paper shopping bags.',
    ],
    correctIndex: 1,
    explanation:
      'The policy’s objective is to curb plastic pollution in coastal waters, whereas the commentators’ evidence is the weight of household plastic waste ending up in municipal landfills. For increased landfill weight to prove the ban failed in coastal waters, the commentators must assume that municipal landfill waste weight is a reliable indicator of coastal water pollution (ignoring, for instance, that thicker reusable bags weigh more when eventually placed in landfills rather than blowing into the sea).',
    keyTerms: ['Unstated Assumption', 'Metric Alignment', 'Causal Inference'],
  },
  {
    id: 'ct-6',
    section: 'Critical Thinking & Problem Solving',
    subtopic: 'Problem Solving',
    difficulty: 'Challenging',
    prompt:
      'Four students—Amina, Bekzat, Daniyar, and Elena—sit around a circular table with 4 evenly spaced chairs numbered 1, 2, 3, and 4 in clockwise order (so 1 is opposite 3, and 2 is opposite 4). Each student is preparing a different subject: Math, Physics, Chemistry, or Biology.\n1. Amina sits directly opposite the student studying Physics.\n2. Bekzat sits in the chair immediately following the Math student in clockwise order (1 → 2 → 3 → 4 → 1).\n3. Elena sits in Chair 2 and is studying Biology.\n4. Daniyar does not sit opposite Elena.\n\nWho is sitting in Chair 3, and what subject are they studying?',
    options: [
      'Amina, studying Chemistry',
      'Daniyar, studying Physics',
      'Amina, studying Math',
      'Bekzat, studying Math',
      'Daniyar, studying Chemistry',
    ],
    correctIndex: 2,
    explanation:
      'Elena is in Chair 2 (Biology). Since Daniyar does not sit opposite Elena (Chair 4), Daniyar must be in Chair 1 or Chair 3. Amina sits opposite the Physics student; Amina cannot be in Chair 4 because Chair 2 is Elena (Biology), so Amina must also be in {1, 3} opposite Daniyar. Therefore, Bekzat is in Chair 4, and Daniyar studies Physics. Since Bekzat (Chair 4) sits immediately clockwise after the Math student, the Math student must be in Chair 3. Because Daniyar studies Physics, Chair 3 must be Amina studying Math (leaving Daniyar in Chair 1 with Physics and Bekzat in Chair 4 with Chemistry).',
    keyTerms: ['Constraint Satisfaction', 'Spatial Deduction', 'Elimination'],
  },
];
