export const prompt1 = 
`Hello, your role is that of a summarizer and classifier. You shall be provided with a meeting transcript from which you are supposed to extract valuable and significant information into 2 lines of concise holistic descriptions known as alerts. Examples of significant information could be anything related to updates, changes, experimentation, breakages, debugging, follow-ups, depreciations, generic, etc. While summarizing, omit the speaker information, and just focus on the information conveyed in a passive tone. You shall also be given a list of components, some of which could be the points of discussion in the meeting. This is where your role as a classifier comes in: your duty is to associate and classify each alert to exactly ONE and ONLY of the components from the provided list. If you feel that an alert can be mapped to more than one component, go with only one component, the one that most aptly fits the alert. Ensure that you extracts the alerts such that they can be associated with one of the components from the given list. All the Best ! Make Daddy Proud !\n\n

Let us try to learn from the following example:\n\n

Example 1:\n\n

List of Components:\n\n

System A\n
System B\n
System C\n
Library A\n
Library B\n
Library C\n
General\n\n

Transcript:\n\n

John: Hey everyone, how's it going? It's been a while since we all caught up like this.\n

Sarah: Yeah, it has! I missed these meetings. How's everyone holding up?\n

Michael: Hanging in there, trying to stay sane with all these projects. John, you had something specific to discuss about System A, right?\n

John: Right, right. So, I've been looking at System A, and we need to make some code changes to improve the data we're feeding into our Machine Learning model. Currently, it's using Library A, and I think there are some bottlenecks there.\n

Sarah: Oh, I noticed that too. Sometimes the data doesn't align well with our model's requirements. What do you suggest?\n

John: Well, first, I think we should refactor the data preprocessing code. It's a bit messy right now, and we need to make it more efficient. Also, we could use some additional features that would enhance the model's predictions.\n

Michael: Sounds good. Do we have a timeline for these changes, John?\n

John: Umm, I think we can start working on it next week. But I also wanted to discuss something else. I've been researching a new library called Library C. It's supposed to be more robust and flexible for our needs.\n

Sarah: Library C? I haven't heard of it. What's the advantage over Library A?\n

John: Well, Library C has better support for handling complex data structures and it's got a more active community. Plus, it integrates seamlessly with our existing tech stack. Michael: That sounds promising. Sarah, what do you think?\n

Sarah: I'd be willing to give it a try. If it can improve our data processing and model performance, it's worth exploring. [There's a brief pause as they contemplate the change]\n

John: Great! I'll start by making those code changes we discussed earlier, and then we can plan a migration to Library C. I'll also look into some sample projects that have successfully transitioned.\n
Sarah: Awesome. Let's do this! Michael: Sounds like a plan. Thanks for bringing this up, John. Anything else we need to cover today?\n

John: Nope, that's it for now. I'll keep you updated on the progress. Oh and also we have team lunch next week!\n\n

Alerts based on the provided meeting transcript:\n\n

Alert 1:\n
Component: System A\n
Message: Code changes in System A are necessary to improve the quality of data fed into the ML model.\n\n

Alert 2:\n
Component: System A\n
Message: Data preprocessing code needs to be refactored in System A.\n\n

Alert 3:\n
Component: System A\n
Message: Plan a migration to Library C after code changes in System A.\n\n

Alert 4:\n
Component: General\n
Message: Team lunch is scheduled for next week.\n\n

Example 2:\n\n

List of Components:\n\n

Employee Database\n
Customer Database\n
Product Inventory Database\n
Payroll Schema\n
Sales Schema\n
Financial Schema\n
DBXTool\n
Customer Management API\n
Sales Analytics API\n
Order Processing API\n\n

Transcript:\n\n

Emily: Good morning, everyone. It's great to have us all here today.\n

Daniel: Yes, indeed. It's been a busy month. How's everyone doing?\n

Lisa: Hanging in there. There's a lot on our plate, especially with the work on Employee Database, Customer Database, Product Inventory Database, and Payroll, Sales, and Financial Schemas.\n
Emily: Agreed, Lisa. That's actually one of the points I wanted to discuss. I've noticed that the Employee Database has been experiencing some performance issues. Queries seem slower than usual.\n

Daniel: I've seen that too. It's impacting our Customer Management API, which relies on Employee Database.\n

Lisa: Do you think it's a schema issue, Emily?\n

Emily: It might be. I'll dive deeper and check if the Payroll Schema needs optimization. But we also need to ensure our API endpoints using Customer Management API, Sales Analytics API, and Order Processing API can handle these changes seamlessly.\n

Daniel: That's a good point. We should do some load testing on those endpoints to be sure.\n

Emily: Exactly. And speaking of schemas, the Financial Schema seems to have some redundant data. I think we can clean that up for improved efficiency.\n

Lisa: Sounds like a plan. What's the timeline for these changes?\n

Emily: I'd say we start looking into these optimizations next week. In the meantime, I've been exploring a new database management tool that could help us streamline our database operations. It's called DBXTool.\n

Daniel: DBXTool? I haven't heard of it. What sets it apart from our current tools?\n

Emily: It's designed for handling multiple databases and provides real-time monitoring and performance analysis. Plus, it integrates seamlessly with our current tech stack.\n

Lisa: That could be a game-changer. Daniel, what are your thoughts?\n

Daniel: I'm definitely interested in exploring it further. If it can enhance our database management and help with these optimizations, it's worth a try.\n

[They take a moment to consider the potential change.]\n

Emily: Great! We'll start with optimizing Employee Database, and then we can look into integrating DBXTool. I'll also gather some case studies of successful migrations to share with the team.\n

Lisa: Sounds like a plan. Also, everyone please fill in their progress reports for this week.\n

Daniel: Thanks for bringing this to our attention, Emily. Anything else on the agenda for today?\n

Emily: That's it for now. I'll keep you updated on our progress.\n
Meeting Ends:\n\n

Alert 1:\n
Component: Employee Database\n
Message: Performance issues in Employee Database observed. Queries are slower than usual.\n\n

Alert 2:\n
Component: Payroll Schema\n
Message: Payroll Schema might need optimization to address the performance issues in Employee Database.\n\n

Alert 3:\n
Component: Customer Management API, Sales Analytics API, Order Processing API\n
Message: Load testing required for API endpoints using Customer Management API, Sales Analytics API, and Order Processing API to ensure they can handle database changes seamlessly.\n\n

Alert 4:\n
Component: Financial Schema\n
Message: Financial Schema has redundant data that can be cleaned up for improved efficiency.\n\n

Alert 5:\n
Component: DBXTool\n
Message: Consider integrating DBXTool, a database management tool, for streamlining database operations and performance monitoring.\n\n

Alert 6:\n
Component: General\n
Message: Fill in weekly progress reports.\n

Example 3:\n\n

List of Components:\n\n`;


export const prompt2 = 'Now, From each of the above alerts that you have outputted, you need to label each of them to the most appropriate label, from the following list of labels:';

export const prompt3 = 'Also you need to classify each alert based on it '

export const initialLabels = [
    "API Deprecations",
    "Security Patch",
    "Breaking Database Change",
    "Library Updates",
    "Database Changes",
    "Documentation Update",
    "Code Review",
    "Infrastructure",
    "Bug Fix",
    "Feature Enhancement",
    "Performance Optimization",
    "New Feature Development",
    "General"
  ];
export const labelMap = new Map([
    ["API Deprecations", "warning"],
    ["Security Patch", "warning"],
    ["Breaking Database Change", "warning"],
    ["Library Updates", "info"],
    ["Database Changes", "info"],
    ["General", "info"],
    ["Documentation Update", "note"],
    ["Code Review", "note"],
    ["Infrastructure", "note"],
    ["Bug Fix", "success"],
    ["Feature Enhancement", "success"],
    ["Performance Optimization", "success"],
    ["New Feature Development", "success"]
  ]);
  