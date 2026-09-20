"""
Learning style assessment: 12 questions, each option tagged with the
learning-style dimension it represents. Whichever dimension gets the most
selections wins. Ties are broken in a fixed, explainable order.
"""

QUESTIONS = [
    {
        "id": 1,
        "question": "Which type of study method do you prefer most?",
        "options": [
            {"key": "visual", "text": "Watching videos / visual aids"},
            {"key": "auditory", "text": "Listening to lectures / audio"},
            {"key": "reading", "text": "Reading notes / text"},
            {"key": "kinesthetic", "text": "Hands-on practice / doing activities"},
        ],
    },
    {
        "id": 2,
        "question": "How do you best remember information?",
        "options": [
            {"key": "visual", "text": "By picturing charts, colors or images"},
            {"key": "auditory", "text": "By repeating it out loud or discussing it"},
            {"key": "reading", "text": "By writing it down and re-reading it"},
            {"key": "kinesthetic", "text": "By actually doing/practicing it"},
        ],
    },
    {
        "id": 3,
        "question": "When learning a new concept, diagrams and flowcharts help you...",
        "options": [
            {"key": "visual", "text": "A lot — I understand things faster visually"},
            {"key": "auditory", "text": "A little — I'd rather someone explain it"},
            {"key": "reading", "text": "A little — I prefer detailed text explanations"},
            {"key": "kinesthetic", "text": "Only if I can interact with them"},
        ],
    },
    {
        "id": 4,
        "question": "In a lab or practical class, you feel most confident when you...",
        "options": [
            {"key": "kinesthetic", "text": "Get to try it hands-on immediately"},
            {"key": "visual", "text": "See a demo first"},
            {"key": "auditory", "text": "Hear step-by-step spoken instructions"},
            {"key": "reading", "text": "Follow a written manual"},
        ],
    },
    {
        "id": 5,
        "question": "How do you usually revise before an exam?",
        "options": [
            {"key": "reading", "text": "Re-read notes and textbooks"},
            {"key": "visual", "text": "Make mind-maps or diagrams"},
            {"key": "auditory", "text": "Explain topics aloud to myself or friends"},
            {"key": "kinesthetic", "text": "Solve practice problems repeatedly"},
        ],
    },
    {
        "id": 6,
        "question": "What kind of study environment works best for you?",
        "options": [
            {"key": "reading", "text": "Quiet space with books and notes"},
            {"key": "auditory", "text": "Space where I can talk/discuss or play audio"},
            {"key": "visual", "text": "Space with visual boards, charts or color-coded notes"},
            {"key": "kinesthetic", "text": "Space where I can move around or use models"},
        ],
    },
    {
        "id": 7,
        "question": "When solving a tough problem, you prefer to...",
        "options": [
            {"key": "kinesthetic", "text": "Try different approaches by trial and error"},
            {"key": "visual", "text": "Sketch it out or draw the problem"},
            {"key": "reading", "text": "Write down the steps logically"},
            {"key": "auditory", "text": "Talk it through with someone"},
        ],
    },
    {
        "id": 8,
        "question": "In class, you pay the most attention when the teacher...",
        "options": [
            {"key": "visual", "text": "Uses slides, diagrams or videos"},
            {"key": "auditory", "text": "Explains verbally with a clear voice"},
            {"key": "reading", "text": "Provides detailed written notes"},
            {"key": "kinesthetic", "text": "Gives a live demo or activity"},
        ],
    },
    {
        "id": 9,
        "question": "When you learn a new coding concept, you prefer to...",
        "options": [
            {"key": "kinesthetic", "text": "Start coding it immediately"},
            {"key": "visual", "text": "Watch a video walkthrough"},
            {"key": "reading", "text": "Read the documentation"},
            {"key": "auditory", "text": "Listen to someone explain the logic"},
        ],
    },
    {
        "id": 10,
        "question": "How do you prefer to receive feedback on your work?",
        "options": [
            {"key": "reading", "text": "Written comments"},
            {"key": "auditory", "text": "Verbal discussion"},
            {"key": "visual", "text": "Marked-up diagrams or highlighted examples"},
            {"key": "kinesthetic", "text": "A live walkthrough where I redo it"},
        ],
    },
    {
        "id": 11,
        "question": "When you're stuck on a topic, what helps you the most?",
        "options": [
            {"key": "visual", "text": "Watching a tutorial video"},
            {"key": "auditory", "text": "Asking someone to explain it out loud"},
            {"key": "reading", "text": "Searching for a well-written article"},
            {"key": "kinesthetic", "text": "Trying it out myself until it clicks"},
        ],
    },
    {
        "id": 12,
        "question": "Which activity sounds most enjoyable to you as a way to learn?",
        "options": [
            {"key": "kinesthetic", "text": "Building a small project"},
            {"key": "reading", "text": "Reading a well-structured book/blog"},
            {"key": "visual", "text": "Watching an animated explainer"},
            {"key": "auditory", "text": "Listening to a podcast/lecture"},
        ],
    },
]

STYLE_LABELS = {
    "visual": "Visual Learner",
    "auditory": "Auditory Learner",
    "reading": "Reading/Writing Learner",
    "kinesthetic": "Kinesthetic Learner",
}

STYLE_EXPLANATIONS = {
    "visual": "You understand and remember information best when it's presented as images, diagrams, charts, colors and videos.",
    "auditory": "You learn best by listening — lectures, discussions, explaining concepts aloud, and verbal repetition stick with you.",
    "reading": "You absorb information best through written words — textbooks, notes, lists and written summaries work best for you.",
    "kinesthetic": "You learn best through direct, hands-on experience — practising, building, and doing rather than just watching or reading.",
}

STYLE_TIPS = {
    "visual": [
        "Use diagrams and flowcharts to break down complex topics.",
        "Watch concept explanation videos before reading text.",
        "Create visual revision notes with colors and mind-maps.",
        "Convert long notes into charts or infographics.",
    ],
    "auditory": [
        "Listen to recorded lectures or explanations while revising.",
        "Explain topics aloud to yourself or a study partner.",
        "Join or form a discussion group for difficult concepts.",
        "Read your notes out loud during revision.",
    ],
    "reading": [
        "Read textbook chapters and structured notes carefully.",
        "Make written summaries in your own words after each topic.",
        "Practice writing full answers, not just remembering points.",
        "Use bullet-point lists to organize key facts.",
    ],
    "kinesthetic": [
        "Solve coding problems and lab exercises hands-on.",
        "Build small projects to apply what you've learned.",
        "Take frequent breaks and use physical practice (whiteboards, models).",
        "Learn through simulations and interactive exercises.",
    ],
}

STYLE_REVISION_TECHNIQUES = {
    "visual": ["Mind-mapping", "Color-coded flashcards", "Diagram-based revision sheets"],
    "auditory": ["Recorded self-explanations", "Group discussions", "Verbal Q&A drills"],
    "reading": ["Written summaries", "Practice answer writing", "Structured note review"],
    "kinesthetic": ["Practice problem sets", "Mini hands-on projects", "Timed mock tests"],
}


def score_answers(answers: list) -> dict:
    scores = {"visual": 0, "auditory": 0, "reading": 0, "kinesthetic": 0}
    for a in answers:
        if a in scores:
            scores[a] += 1
    # Deterministic tie-break order
    order = ["visual", "auditory", "reading", "kinesthetic"]
    best = max(order, key=lambda k: (scores[k], -order.index(k)))
    return {"scores": scores, "style_key": best, "style_label": STYLE_LABELS[best]}
