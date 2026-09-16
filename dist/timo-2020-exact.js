const exactTimo2020English = [
  "The age of Ashley 5 years ago is equal to the age of Amy 4 years later. When Ashley is 20 years old, how old is Amy?\n(A) 11\n(B) 29\n(C) 19\n(D) 21",
  "Today is 3rd April, Monday. Which day of the week will it be on the last day of this month?\n(A) Monday\n(B) Saturday\n(C) Tuesday\n(D) Sunday",
  "According to the pattern below, how many squares are there in the first 28 figures counting from the left?\n(A) 15\n(B) 14\n(C) 8\n(D) 9",
  "Consider the pattern below, find the sum of the first 6 numbers in the sequence?\n1, 3, 9, 27, ...\n(A) 365\n(B) 360\n(C) 362\n(D) 364",
  "Thor wrote a 2-digit number on a piece of paper and asked Loki to guess it.\nLoki asked: “Is the number 72?”\nThor replied: “One of the digits is correct. The position of that digit is wrong.”\nLoki asked again: “Is the number 42?”\nThor replied: “One of the digits is correct. The position of that digit is correct.”\nGiven two digits in the number are different, find the number written by Thor.\n(A) 74\n(B) 22\n(C) 47\n(D) 27",
  "Calculate 327 − 169 − 132 + 173 + 669.\n(A) 868\n(B) 968\n(C) 869\n(D) 768",
  "Find the sum of 10 consecutive natural numbers from 11 to 20.\n(A) 105\n(B) 300\n(C) 310\n(D) 155",
  "Calculate 36 × 42 − 4 × 9 × 17 − 15 × 36.\n(A) 360\n(B) 3600\n(C) 180\n(D) 350",
  "Find the value of 1001 × 123.\n(A) 123321\n(B) 123123\n(C) 321123\n(D) 321321",
  "Find the value of 1 + 2 + 4 + 8 + 16 + 32 + 64 + 128.\n(A) 255\n(B) 256\n(C) 254\n(D) 257",
  "How many 2-digit even numbers are there?\n(A) 50\n(B) 45\n(C) 44\n(D) 49",
  "The sum of A and B is 60. A is 2 times of B. Find the value of B.\n(A) 30\n(B) 40\n(C) 10\n(D) 20",
  "According to the following pattern, find the value of the next term.\n1, 6, 16, 31, 51, 76, 106, ...\n(A) 111\n(B) 121\n(C) 131\n(D) 141",
  "Phineas and Ferb took a test and received the results. The sum of their marks is 162 and Phineas got 22 marks higher than Ferb did. How many marks did Phineas receive?\n(A) 70\n(B) 90\n(C) 92\n(D) 72",
  "Define the operation symbol a ⊕ b = a × b − b. Find the value of (5 ⊕ 7).\n(A) 28\n(B) 30\n(C) 12\n(D) 35",
  "How many line segments are there in the figure below?\n(A) 4\n(B) 6\n(C) 8\n(D) 9",
  "How many squares are there in the figure below?\n(A) 4\n(B) 5\n(C) 6\n(D) 10",
  "A parking lot has the dimension as the figure below. Find its perimeter in meter.\n(A) 360\n(B) 280\n(C) 90\n(D) 450",
  "A box in the figure below has 8 vertices. How many sides does it have?\n(A) 6\n(B) 8\n(C) 9\n(D) 12",
  "In the middle of a square garden with perimeter 80m, they built a square pool with perimeter 32m as the figure below. What is the area value of the shaded region in m²?\n(A) 336\n(B) 48\n(C) 400\n(D) 144",
  "How many 2-digit numbers without digit 0 are there?\n(A) 90\n(B) 80\n(C) 81\n(D) 91",
  "After Candace gave 4 pens to Phineas, they had an equal number of pens. How many pens did Candace have originally, given that their sum of pens is 18?\n(A) 14\n(B) 11\n(C) 13\n(D) 22",
  "How many ways are there from A to B given that each step you can only move up or move right along the lines?\n(A) 11\n(B) 8\n(C) 9\n(D) 10",
  "Sam has 6 candies. Each day she can only eat 1 candy or 2 candies. In how many ways can she eat all those candies?\n(A) 2\n(B) 10\n(C) 13\n(D) 9",
  "Choose 2 digits, without repetition, from 0, 2, 4, 6 to form 2-digit numbers. How many even numbers are there?\n(A) 8\n(B) 9\n(C) 6\n(D) 12"
];

const exactTimo2020Figures = {
  3: "assets/fig-timo-2020-03.svg",
  16: "assets/fig-timo-2020-16.svg",
  17: "assets/fig-timo-2020-17.svg",
  18: "assets/fig-timo-2020-18.svg",
  19: "assets/fig-timo-2020-19.svg",
  20: "assets/fig-timo-2020-20.svg",
  23: "assets/fig-timo-2020-23.svg"
};

window.questionsTimo2020.forEach((question, index) => {
  question.en = exactTimo2020English[index];
  if (exactTimo2020Figures[question.n]) question.image = exactTimo2020Figures[question.n];
});
