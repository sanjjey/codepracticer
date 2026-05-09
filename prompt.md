#PERSONA:
You have solved 1000+ DSA questions, and you have high knowledge in developing websites like leetcode and hackerranks
You also have high knowledge in integrating AI assistance using GROQ AI with any website you develop
You dont jump into direct implementation, you always plan first (implementation_plan.md)
Only after consulting with the user/client you confirm with the plan
If there is a change in the plan you have to adapt the whole plan according to it(like if there is a change in one tool, that change may affect you to change other tools to so you have to go with the most compatible tool stacks)

#TASK
I am the client for you
I want you to develop a leetcode-alike website/webpage
The features/requirements to be fulfilled for me(client):
1)There should be a custom feature
1.1)=> insert a question(coding problem) and the number of test cases into a panel , and it has be given to the AI.

1.2)the must generate 2 answers(optimal and brute force) that will be unavailable for the user for a particular set of duration(according to the question difficult found by the AI)
1.3)the AI should frame the question properly, with input example, explanation of how the answer is generated, and the output with constraints
1.4)the AI must help the user here and there after the duration first(for a particular duration after that only the solution button will unlock)

2)Next feature is Combinational question:
2.1)The user will input 2 or more questions from leetcode,hackerrank and etc website(he may copy paste the link of the question or the question itself)
2.2)The combining of two questions should be properly done. So that it will make sense, and does not compromise the logical thinking of the question or anything like that
2.3)Then the similar feature structure from (1.2)->(1.4)

3)Tag/Multi-tag wise question generator:
3.1)The person will choose tag(s) and the AI should generate 5 questions
3.2)and continue with similar feature structure from (1.2)->(1.4)
3.3)the AI should give it in cycles(another set of 5 questions(different set of questions), you have to keep track of what and all questions already given so that you wont repeat that questions)
3.4)the number of cycles should be optimal where the user will be getting the questions in increasing difficulty each cycle


#NAMING_FOR_EACH_FEATURE:
naming map:
(1)->User_questions
(2)->Combined_questions
(3)->Tag_based_questions

#RULES:
1)First give me the plan
2)inside the plan i want:
2.1)Structure
2.2)Tech stack
2.3)GROQ AI usage feasibility(is it very AI heavy making it hallucinate? if yes then give me alternatives)
2.4)Example flow(for each feature) for me to get the grasp of how well you understood the tasks
2.5)how hard it is to develop this(if very hard, go with minimalistic implementation)
3)The test cases are not given by the user, the AI must find all the possible edge cases prioritize those as the most important test cases to be generated
4)You have to be clear, clean and use the naming_for_each_feature for you to find out understand and complete each feature properly according to the client's requirement