import csv
import json
import os

topics = [
    # =========================================================================
    # 1. Rhetoric & Persuasion
    # =========================================================================
    {
        "id": "aristotelian-rhetorical-triangle-ethos-pathos-logos",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "rhetoric;persuasion;classical-rhetoric;argumentation;philosophy",
        "title": "The Aristotelian Rhetorical Triangle: Ethos, Pathos & Logos in Modern Discourse",
        "description": "Aristotle's Rhetoric establishes that durable persuasion requires balancing three appeals: Ethos (the speaker's perceived authority, credibility, and character), Pathos (emotional resonance and stakeholder empathy), and Logos (logical cohesion, empirical evidence, and deductive reasoning). Over-reliance on Logos alone fails to drive action without emotional buy-in, while ungrounded Pathos collapses under scrutiny.",
        "resources": [
            {"label": "Aristotle: Rhetoric (Translated by W. Rhys Roberts, MIT Classics)", "url": "http://classics.mit.edu/Aristotle/rhetoric.html"},
            {"label": "Stanford Encyclopedia of Philosophy: Aristotle's Rhetoric", "url": "https://plato.stanford.edu/entries/aristotle-rhetoric/"},
            {"label": "Harvard Business Review: The Necessary Art of Persuasion (Jay A. Conger)", "url": "https://hbr.org/1998/05/the-necessary-art-of-persuasion"}
        ]
    },
    {
        "id": "cialdini-principles-of-persuasion",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "persuasion;influence;cialdini;behavioral-psychology;social-proof",
        "title": "Cialdini's Six Principles of Influence: Psychological Triggers in Persuasion",
        "description": "Robert Cialdini's research identifies six universal psychological heuristics that guide human compliance: Reciprocity, Scarcity, Authority, Consistency/Commitment, Liking, and Consensus (Social Proof). Ethical communicators leverage these triggers to reduce cognitive friction in decision-making rather than engineer manipulative coercion.",
        "resources": [
            {"label": "Robert B. Cialdini: Influence: The Psychology of Persuasion (Harper Business)", "url": "https://www.influenceatwork.com/our-founder/robert-cialdini-phd/"},
            {"label": "Association for Psychological Science: The Science of Social Influence", "url": "https://www.psychologicalscience.org/observer/the-science-of-influence"},
            {"label": "Harvard Business Review: Harnessing the Science of Persuasion", "url": "https://hbr.org/2001/10/harnessing-the-science-of-persuasion"}
        ]
    },
    {
        "id": "framing-effects-and-cognitive-anchoring-in-persuasion",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "framing;cognitive-bias;kahneman-tversky;persuasion;decision-making",
        "title": "Framing Effects & Prospect Theory in Argument Design",
        "description": "Amos Tversky and Daniel Kahneman demonstrated that individuals respond differently to identical information depending on whether it is framed as a potential gain or a potential loss. Because human psychology exhibits loss aversion, framing proposals around risk mitigation and loss prevention activates stronger urgency than equivalent upside gain descriptions.",
        "resources": [
            {"label": "Amos Tversky & Daniel Kahneman: The Framing of Decisions and the Psychology of Choice (Science 1981)", "url": "https://www.science.org/doi/10.1126/science.7455683"},
            {"label": "Daniel Kahneman: Thinking, Fast and Slow (Farrar, Straus and Giroux)", "url": "https://us.macmillan.com/books/9780374533557/thinkingfastandslow"},
            {"label": "American Psychological Association: Decision Framing and Behavioral Economics", "url": "https://www.apa.org/pubs/journals/xge"}
        ]
    },
    {
        "id": "elaboration-likelihood-model-central-vs-peripheral",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "elaboration-likelihood;elm;persuasion;cognitive-processing;psychology",
        "title": "The Elaboration Likelihood Model (ELM): Central vs Peripheral Persuasion Routes",
        "description": "Developed by Richard Petty and John Cacioppo, ELM posits that persuasion occurs via two distinct cognitive routes depending on audience motivation and ability. The Central Route involves deep, deliberate scrutiny of argument strength (yielding lasting attitude change), whereas the Peripheral Route relies on surface heuristics, attractive presentation, and speaker charisma (yielding temporary compliance).",
        "resources": [
            {"label": "Richard E. Petty & John T. Cacioppo: The Elaboration Likelihood Model of Persuasion (Advances in Experimental Social Psychology 1986)", "url": "https://www.sciencedirect.com/science/article/pii/S0065260108602142"},
            {"label": "American Psychological Association: Cognitive Elaboration and Attitude Change", "url": "https://www.apa.org/pubs/journals/psp"},
            {"label": "Journal of Consumer Research: Testing the Central and Peripheral Routes to Persuasion", "url": "https://academic.oup.com/jcr"}
        ]
    },
    {
        "id": "monroe-motivated-sequence-persuasive-speech",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "public-speaking;persuasion;monroe-sequence;presentation-design;rhetoric",
        "title": "The Monroe Motivated Sequence: Structuring Action-Oriented Persuasion",
        "description": "Developed by Alan H. Monroe, the Motivated Sequence is a five-step psychological framework for persuasive presentations: Attention (hooking the audience), Need (demonstrating an acute problem), Satisfaction (proposing the concrete solution), Visualization (contrasting positive and negative futures), and Action (issuing an immediate, specific call to action).",
        "resources": [
            {"label": "Alan H. Monroe: Principles and Types of Speech (Scott, Foresman and Company)", "url": "https://www.worldcat.org/title/principles-and-types-of-speech/oclc/183177"},
            {"label": "Purdue University Online Writing Lab (OWL): Monroe's Motivated Sequence", "url": "https://owl.purdue.edu/owl/general_writing/academic_writing/monroes_motivated_sequence.html"},
            {"label": "Toastmasters International: Using Monroe's Motivated Sequence in Persuasive Speeches", "url": "https://www.toastmasters.org/resources/using-monroes-motivated-sequence"}
        ]
    },
    {
        "id": "inoculation-theory-building-cognitive-resistance",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "inoculation-theory;persuasion;prebunking;critical-thinking;rhetoric",
        "title": "Inoculation Theory: Prebunking & Building Cognitive Resistance to Misinformation",
        "description": "William McGuire's Inoculation Theory demonstrates that exposing people to a weakened, forewarning dose of counter-arguments—along with explicit refutations—builds cognitive antibodies that resist subsequent persuasive attacks. In professional communication, inoculating an audience against inevitable competitor objections strengthens long-term buy-in.",
        "resources": [
            {"label": "William J. McGuire: Inducing Resistance to Persuasion: Some Contemporary Approaches (Advances in Experimental Social Psychology 1964)", "url": "https://www.sciencedirect.com/science/article/pii/S0065260108600520"},
            {"label": "Nature Human Behaviour: The Psychological Science of Prebunking and Misinformation Inoculation", "url": "https://www.nature.com/articles/s41562-022-01456-0"},
            {"label": "Cambridge University Department of Psychology: Inoculation Theory Research Lab", "url": "https://www.psychol.cam.ac.uk/"}
        ]
    },
    {
        "id": "enthymeme-and-syllogistic-reasoning-in-arguments",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "logic;argumentation;enthymeme;critical-thinking;rhetoric",
        "title": "Enthymemes & Syllogistic Argumentation: The Mechanics of Implied Logic",
        "description": "An enthymeme is a rhetorical syllogism in which one of the premises is left unstated, relying on the audience's preexisting shared beliefs to complete the deductive link. While enthymemes make communication concise and engaging, unexamined suppressed premises frequently conceal logical fallacies and false assumptions.",
        "resources": [
            {"label": "Stanford Encyclopedia of Philosophy: Aristotle's Logic & The Syllogism", "url": "https://plato.stanford.edu/entries/aristotle-logic/"},
            {"label": "University of Pittsburgh Department of Communication: Argumentation and Enthymemes", "url": "https://www.comm.pitt.edu/argument-structure"},
            {"label": "Stephen Toulmin: The Uses of Argument (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/uses-of-argument/2666CDA389D66BFDE93EF8E6E77A93F5"}
        ]
    },

    # =========================================================================
    # 2. Negotiation Frameworks & Strategy
    # =========================================================================
    {
        "id": "harvard-principled-negotiation-getting-to-yes",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "negotiation;harvard-pon;principled-negotiation;interests-vs-positions;conflict",
        "title": "Principled Negotiation: The Harvard Program on Negotiation (PON) Model",
        "description": "Developed by Roger Fisher and William Ury, Principled Negotiation moves parties away from positional bargaining toward integrative problem-solving by focusing on four core pillars: separate the people from the problem, focus on underlying interests rather than stated positions, invent options for mutual gain, and insist on using objective criteria.",
        "resources": [
            {"label": "Roger Fisher & William Ury: Getting to Yes: Negotiating Agreement Without Giving In (Penguin)", "url": "https://www.pon.harvard.edu/shop/getting-to-yes-negotiating-agreement-without-giving-in/"},
            {"label": "Harvard Law School: Program on Negotiation (PON) Resource Center", "url": "https://www.pon.harvard.edu/"},
            {"label": "William Ury: Getting Past No: Negotiating in Difficult Situations", "url": "https://www.williamury.com/books/getting-past-no/"}
        ]
    },
    {
        "id": "batna-reservation-value-and-zopa-math",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "negotiation;batna;zopa;reservation-price;game-theory",
        "title": "Negotiation Calculus: BATNA, Reservation Price & The Zone of Possible Agreement (ZOPA)",
        "description": "Power in negotiation stems directly from the strength of one's Best Alternative to a Negotiated Agreement (BATNA). The Reservation Price represents the lowest economic threshold a party will accept before walking away to their BATNA; the overlap between the buyer's maximum price and the seller's reservation price defines the Zone of Possible Agreement (ZOPA).",
        "resources": [
            {"label": "Harvard Business School: BATNA and Reservation Price Calculations in Strategic Negotiation", "url": "https://www.pon.harvard.edu/daily/batna/translate-your-batna-to-the-current-deal/"},
            {"label": "Howard Raiffa: The Art and Science of Negotiation (Harvard University Press)", "url": "https://www.hup.harvard.edu/books/9780674048133"},
            {"label": "MIT Sloan: Negotiation and Conflict Management Course Materials", "url": "https://ocw.mit.edu/courses/15-667-negotiation-and-conflict-management-spring-2001/"}
        ]
    },
    {
        "id": "anchoring-first-offers-and-concession-patterns",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "anchoring;negotiation;concessions;behavioral-economics;tactics",
        "title": "First-Offer Anchoring & Strategic Concession Sequencing",
        "description": "The first numerical offer in a negotiation acts as a powerful cognitive anchor that disproportionately pulls the final settlement toward itself, provided the anchor is substantiated with plausible rationale. Effective negotiators sequence concessions in diminishing step sizes (e.g. $500, then $250, then $100) to signal to the counterpart that they are approaching their absolute reservation limit.",
        "resources": [
            {"label": "Adam D. Galinsky & Thomas Mussweiler: First Offers as Anchors: The Role of Perspective-Taking and Counteranchoring (JPSP 2001)", "url": "https://psycnet.apa.org/record/2001-18237-009"},
            {"label": "Harvard Program on Negotiation: How to Counter an Opening Anchor in Negotiation", "url": "https://www.pon.harvard.edu/daily/negotiation-skills-daily/what-is-anchoring-in-negotiation/"},
            {"label": "Leigh Thompson: The Mind and Heart of the Negotiator (Pearson Education)", "url": "https://www.pearson.com/en-us/subject-catalog/p/mind-and-heart-of-the-negotiator-the/P200000003444"}
        ]
    },
    {
        "id": "tactical-empathy-and-calibrated-questions-voss",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "tactical-empathy;hostage-negotiation;chris-voss;calibrated-questions;communication",
        "title": "Tactical Empathy: Emotional Labeling, Mirroring & Calibrated 'How' Questions",
        "description": "Developed in FBI crisis hostage negotiation by Chris Voss, Tactical Empathy uses active emotional labeling ('It sounds like you feel...') and mirroring (repeating the last 1-3 critical words) to diffuse counterpart hostility and disarm defensive barriers. Replacing demand statements with calibrated open-ended questions ('How am I supposed to do that?') transfers the burden of problem-solving to the counterpart without provoking resistance.",
        "resources": [
            {"label": "Chris Voss & Tahl Raz: Never Split the Difference: Negotiating As If Your Life Depended On It (Harper Business)", "url": "https://www.blackswanltd.com/never-split-the-difference"},
            {"label": "FBI Law Enforcement Bulletin: Crisis Negotiation Skills and Active Listening", "url": "https://leb.fbi.gov/articles/featured-articles/crisis-negotiation-skills"},
            {"label": "Harvard PON: Tactical Empathy and Emotional Intelligence in High-Stakes Deals", "url": "https://www.pon.harvard.edu/daily/negotiation-skills-daily/negotiation-skills-emotional-intelligence/"}
        ]
    },
    {
        "id": "meso-multiple-equivalent-simultaneous-offers",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "meso;negotiation;integrative-bargaining;value-creation;deal-structuring",
        "title": "Multiple Equivalent Simultaneous Offers (MESO): Uncovering Hidden Preferences",
        "description": "Presenting three distinct contract proposals of equal economic value to the seller simultaneously (MESO) prevents single-issue stalemates. The counterpart's choice among the packages immediately reveals their hidden priorities and relative trade-off curves without requiring them to explicitly expose their reservation thresholds.",
        "resources": [
            {"label": "Geoffrey J. Leonardelli et al.: Multiple Equivalent Simultaneous Offers (MESOs) in Negotiation (Organizational Behavior and Human Decision Processes 2019)", "url": "https://www.sciencedirect.com/science/article/pii/S074959781830507X"},
            {"label": "Harvard Business School: MESO Strategy in Complex Commercial Deals", "url": "https://www.pon.harvard.edu/daily/negotiation-skills-daily/meso-negotiation-strategies-for-creating-value/"},
            {"label": "Kellogg School of Management: Creative Deal Structuring and Value Discovery", "url": "https://www.kellogg.northwestern.edu/"}
        ]
    },
    {
        "id": "logrolling-and-multi-issue-tradeoff-matrices",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "logrolling;integrative-negotiation;tradeoffs;value-creation;dealmaking",
        "title": "Logrolling: Expanding the Pie via Multi-Issue Asymmetric Valuation",
        "description": "Single-issue negotiations inevitably degenerate into zero-sum distributive battles over price. Logrolling expands total deal value by bundling multiple negotiable issues (payment terms, delivery speed, intellectual property rights, warranty duration) and trading high-priority items for one party in exchange for concessions on issues that are low-cost to them but highly valued by the counterpart.",
        "resources": [
            {"label": "Max H. Bazerman & Margaret A. Neale: Negotiating Rationally (Free Press)", "url": "https://www.simonandschuster.com/books/Negotiating-Rationally/Max-H-Bazerman/9780029019863"},
            {"label": "Harvard Business Review: Expand the Pie: Creating Value in Negotiation", "url": "https://hbr.org/2007/09/investigative-negotiation"},
            {"label": "CFA Institute: Multi-Attribute Decision Making and Integrative Bargaining", "url": "https://www.cfainstitute.org/"}
        ]
    },

    # =========================================================================
    # 3. Active Listening & Feedback Mechanics
    # =========================================================================
    {
        "id": "nonviolent-communication-nvc-rosenberg-framework",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "nvc;nonviolent-communication;marshall-rosenberg;empathy;conflict-resolution",
        "title": "Nonviolent Communication (NVC): Observations, Feelings, Needs & Requests",
        "description": "Marshall Rosenberg's Nonviolent Communication framework restructures interpersonal dialogue through four concrete steps: state objective Observations free of moralistic evaluations, express genuine Feelings without disguised thoughts, identify underlying universal human Needs, and articulate concrete, actionable Requests without coercive demands.",
        "resources": [
            {"label": "Marshall B. Rosenberg: Nonviolent Communication: A Language of Life (PuddleDancer Press)", "url": "https://www.cnvc.org/store/books/nonviolent-communication-a-language-of-life"},
            {"label": "Center for Nonviolent Communication (CNVC) Core Principles and Needs Inventory", "url": "https://www.cnvc.org/training/resource/needs-inventory"},
            {"label": "Stanford Medicine: Nonviolent Communication in Healthcare and Difficult Dialogues", "url": "https://med.stanford.edu/"}
        ]
    },
    {
        "id": "situation-behavior-impact-sbi-feedback-model",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "feedback;sbi-model;management;communication;professional-development",
        "title": "The SBI Feedback Model: Situation, Behavior & Impact Delivery",
        "description": "Developed by the Center for Creative Leadership, the SBI model eliminates defensive reactions by grounding feedback in objective reality: anchor the specific Situation (time and place), describe the observable Behavior without inferring internal intent, and state the measurable Impact the action had on the team, project, or individual.",
        "resources": [
            {"label": "Center for Creative Leadership (CCL): The SBI Feedback Model Guide", "url": "https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-vs-impact-sbii-feedback-model/"},
            {"label": "Harvard Business Review: The Right Way to Give Constructive Feedback", "url": "https://hbr.org/2019/03/the-feedback-fallacy"},
            {"label": "Douglas Stone & Sheila Heen: Thanks for the Feedback: The Science and Art of Receiving Feedback Well (Penguin)", "url": "https://www.stoneandheen.com/thanks-for-the-feedback"}
        ]
    },
    {
        "id": "radical-candor-care-personally-challenge-directly",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "radical-candor;feedback;leadership;kim-scott;workplace-culture",
        "title": "Radical Candor: Balancing Personal Care with Direct Challenge",
        "description": "Kim Scott's Radical Candor framework organizes feedback across two orthogonal axes: Caring Personally and Challenging Directly. Failing to challenge directly while caring personally produces 'Ruinous Empathy' (withholding critical guidance to spare feelings), while challenging directly without care degenerates into 'Obnoxious Aggression'.",
        "resources": [
            {"label": "Kim Scott: Radical Candor: Be a Kick-Ass Boss Without Losing Your Humanity (St. Martin's Press)", "url": "https://www.radicalcandor.com/the-book/"},
            {"label": "First Round Review: Radical Candor: The Surprising Secret to Being a Good Boss", "url": "https://review.firstround.com/radical-candor-the-surprising-secret-to-being-a-good-boss/"},
            {"label": "MIT Sloan Management Review: The Art of Giving and Receiving Feedback", "url": "https://sloanreview.mit.edu/"}
        ]
    },
    {
        "id": "active-listening-levels-and-reflective-synthesis",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "active-listening;reflective-listening;empathy;dialogue;listening-levels",
        "title": "Active Listening Architecture: Internal, Focused & Global Listening Levels",
        "description": "Effective listening progresses through three distinct depths: Level 1 Internal Listening (filtering speech through one's own internal monologue and reaction planning), Level 2 Focused Listening (concentrating fully on the speaker's explicit words and cognitive meaning), and Level 3 Global Listening (sensing prosody, emotional tone, body posture, and unspoken context).",
        "resources": [
            {"label": "Carl R. Rogers & Richard E. Farson: Active Listening (Industrial Relations Center, University of Chicago 1957)", "url": "https://www.chicagobooth.edu/"},
            {"label": "Harvard Business Review: What Great Listeners Actually Do (Jack Zenger & Joseph Folkman)", "url": "https://hbr.org/2016/07/what-great-listeners-actually-do"},
            {"label": "Laura Whitworth et al.: Co-Active Coaching: New Skills for Coaching People Toward Success in Work and Life", "url": "https://coactive.com/resources/books/"}
        ]
    },
    {
        "id": "the-johari-window-and-blind-spot-discovery",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "johari-window;self-awareness;feedback;group-dynamics;psychology",
        "title": "The Johari Window: Expanding the Open Arena via Disclosure & Feedback",
        "description": "Created by Joseph Luft and Harrington Ingham, the Johari Window maps interpersonal knowledge across four quadrants: Open/Arena (known to self and others), Blind Spot (known to others, unknown to self), Hidden/Facade (known to self, concealed from others), and Unknown. High-performing teams enlarge the Open Arena through reciprocal disclosure and proactive feedback solicitation.",
        "resources": [
            {"label": "Joseph Luft & Harrington Ingham: The Johari Window: A Graphic Model of Interpersonal Awareness (Human Relations Training News 1955)", "url": "https://www.tandfonline.com/"},
            {"label": "Center for Creative Leadership: Using the Johari Window to Build Self-Awareness", "url": "https://www.ccl.org/articles/leading-effectively-articles/increase-self-awareness-with-the-johari-window/"},
            {"label": "University of Cambridge: Interpersonal Skills and the Johari Window Model", "url": "https://www.cl.cam.ac.uk/"}
        ]
    },
    {
        "id": "ask-tell-ask-coaching-and-mentorship-feedback",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "feedback;coaching;ask-tell-ask;mentorship;pedagogy",
        "title": "The Ask-Tell-Ask Feedback Loop in Mentorship & Performance Coaching",
        "description": "The Ask-Tell-Ask framework begins by asking the learner to self-assess their performance ('How did that go?'), telling them specific observations and behavioral adjustments, and asking for their reaction and implementation plan. This preserves learner agency and activates metacognition rather than triggering defensiveness through unsolicited advice.",
        "resources": [
            {"label": "Academic Medicine: The Ask-Tell-Ask Model of Educational Feedback", "url": "https://journals.lww.com/academicmedicine/Fulltext/2006/03000/Ask_Tell_Ask__A_Model_for_Formative_Feedback.14.aspx"},
            {"label": "Harvard Macy Institute: Transforming Medical Education Feedback Models", "url": "https://www.harvardmacy.org/"},
            {"label": "Center for Creative Leadership: Feedback Loops that Drive Sustainable Behavioral Change", "url": "https://www.ccl.org/"}
        ]
    },

    # =========================================================================
    # 4. Nonverbal Communication & Vocal Dynamics
    # =========================================================================
    {
        "id": "microexpressions-and-facial-action-coding-system",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "nonverbal;microexpressions;paul-ekman;facs;emotion-detection",
        "title": "Facial Action Coding System (FACS) & Microexpression Analysis",
        "description": "Paul Ekman's Facial Action Coding System (FACS) anatomically classifies every human facial movement into discrete Action Units (AUs). Involuntary microexpressions lasting 1/25th to 1/5th of a second reveal genuine felt emotion before conscious suppression occurs, though scientific consensus cautions against relying on nonverbal cues alone for lie detection without baseline context.",
        "resources": [
            {"label": "Paul Ekman & Wallace V. Friesen: Facial Action Coding System: A Technique for the Measurement of Facial Movement (Consulting Psychologists Press)", "url": "https://www.paulekman.com/facial-action-coding-system/"},
            {"label": "Paul Ekman: Telling Lies: Clues to Deceit in the Marketplace, Politics, and Marriage (W. W. Norton)", "url": "https://wwnorton.com/books/9780393337228"},
            {"label": "American Psychological Association: The Science of Nonverbal Behavior and Facial Expression", "url": "https://www.apa.org/pubs/journals/amp"}
        ]
    },
    {
        "id": "vocal-prosody-pitch-inflection-and-status-signaling",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "prosody;vocal-tone;speech-mechanics;paralinguistics;status-signaling",
        "title": "Vocal Prosody: Pitch, Pace, Pauses & Up-Talk vs Down-Tonal Authority",
        "description": "Paralinguistic cues—including vocal pitch variation, tempo, resonant timbre, and strategic pausing—account for a massive share of emotional and status interpretation in spoken dialogue. Ending declarative sentences with rising inflection ('up-talk') signals deference or uncertainty, whereas authoritative speech terminates with steady downward cadence and disciplined silence.",
        "resources": [
            {"label": "Albert Mehrabian: Silent Messages: Implicit Communication of Emotions and Attitudes (Wadsworth)", "url": "http://www.kaaj.com/psych/smorder.html"},
            {"label": "Alex Pentland: Honest Signals: How They Shape Our World (MIT Press)", "url": "https://mitpress.mit.edu/9780262515122/honest-signals/"},
            {"label": "Journal of the Acoustical Society of America: Fundamental Frequency and Perceived Dominance in Human Speech", "url": "https://pubs.aip.org/asa/jasa"}
        ]
    },
    {
        "id": "proxemics-and-spatial-interaction-zones-hall",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "proxemics;spatial-zones;edward-t-hall;nonverbal;body-language",
        "title": "Proxemics: Edward T. Hall's Four Interpersonal Distance Zones",
        "description": "Anthropologist Edward T. Hall coined Proxemics to study how humans unconsciously structure interpersonal physical space: Intimate space (0 to 18 inches), Personal space (1.5 to 4 feet for trusted conversation), Social space (4 to 12 feet for professional interaction), and Public space (12+ feet for public speaking). Violating spatial norms triggers autonomic stress responses.",
        "resources": [
            {"label": "Edward T. Hall: The Hidden Dimension (Anchor Books / Doubleday 1966)", "url": "https://www.penguinrandomhouse.com/books/74246/the-hidden-dimension-by-edward-t-hall/"},
            {"label": "Journal of Nonverbal Behavior: Spatial Behavior and Proxemics in Interpersonal Encounters", "url": "https://link.springer.com/journal/10919"},
            {"label": "Stanford Virtual Human Interaction Lab: Nonverbal Communication and Spatial Dynamics", "url": "https://vhil.stanford.edu/"}
        ]
    },
    {
        "id": "kinesics-mirroring-and-postural-congruence",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "kinesics;mirroring;chameleon-effect;body-language;rapport",
        "title": "Kinesics & The Chameleon Effect: Rapport Building via Postural Synchrony",
        "description": "Tanya Chartrand and John Bargh's research on the 'Chameleon Effect' demonstrated that subtle, unconscious mirroring of a conversation partner's posture, gestures, and breathing cadence creates measurable interpersonal rapport and trust. Conversely, aggressive or forced artificial body mimicry triggers uncanny-valley skepticism and destroys conversational authenticity.",
        "resources": [
            {"label": "Tanya L. Chartrand & John A. Bargh: The Chameleon Effect: The Perception-Behavior Link and Social Interaction (JPSP 1999)", "url": "https://psycnet.apa.org/record/1999-05244-006"},
            {"label": "Ray L. Birdwhistell: Kinesics and Context: Essays on Body Motion Communication (University of Pennsylvania Press)", "url": "https://www.upenn.edu/pennpress/book/838.html"},
            {"label": "Harvard Business Review: The Power of Physical Rapport in Leadership", "url": "https://hbr.org/2013/05/the-surprising-science-of-body-language"}
        ]
    },
    {
        "id": "emblematic-gestures-and-cross-cultural-traps",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "emblems;gestures;nonverbal;cross-cultural;body-language",
        "title": "Emblematic Gestures: Culture-Specific Meanings & Nonverbal Pitfalls",
        "description": "Unlike universal facial expressions of basic emotion, emblematic gestures (such as the 'thumbs-up', 'OK ring', or 'peace sign') are arbitrary linguistic symbols that carry wildly divergent and offensive meanings across cultures. Cross-cultural communicators avoid culture-specific emblems to prevent accidental insult during international exchanges.",
        "resources": [
            {"label": "David Matsumoto et al.: Nonverbal Communication: Science and Applications (SAGE Publications)", "url": "https://us.sagepub.com/en-us/nam/nonverbal-communication/book234608"},
            {"label": "Journal of Cross-Cultural Psychology: Universal and Cultural Aspects of Nonverbal Communication", "url": "https://journals.sagepub.com/home/jcc"},
            {"label": "US Foreign Service Institute: Cross-Cultural Protocol and Gesture Etiquette", "url": "https://www.state.gov/foreign-service-institute/"}
        ]
    },

    # =========================================================================
    # 5. Public Speaking & Persuasive Storytelling
    # =========================================================================
    {
        "id": "minto-pyramid-principle-top-down-structuring",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "pyramid-principle;barbara-minto;mckinsey;business-communication;structured-thinking",
        "title": "The Minto Pyramid Principle: Top-Down Deductive Storytelling & MECE Grouping",
        "description": "Developed by Barbara Minto at McKinsey & Company, the Pyramid Principle requires communicators to state the core conclusion/recommendation first at the pyramid peak, followed by supporting key arguments logically grouped into mutually exclusive, collectively exhaustive (MECE) sub-branches. This top-down hierarchy matches how executive brains parse complex information.",
        "resources": [
            {"label": "Barbara Minto: The Pyramid Principle: Logic in Writing and Thinking (Financial Times / Prentice Hall)", "url": "https://www.minto.com/"},
            {"label": "McKinsey & Company Insights: Communicating Complex Ideas with the Pyramid Principle", "url": "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights"},
            {"label": "Harvard Business School: Structuring Executive Presentations Using Minto Logic", "url": "https://hbsp.harvard.edu/"}
        ]
    },
    {
        "id": "nancy-duarte-sparkline-presentation-structure",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "public-speaking;storytelling;nancy-duarte;sparkline;presentations",
        "title": "Duarte's Persuasive Sparkline: Juxtaposing 'What Is' vs 'What Could Be'",
        "description": "Nancy Duarte's analysis of historic speeches (Steve Jobs, Martin Luther King Jr.) revealed a universal presentation architecture: alternating continuously between the current reality ('What is') and the envisioned future ('What could be'). This contrast creates narrative dramatic tension that culminates in a call to action and a 'New Bliss' resolution.",
        "resources": [
            {"label": "Nancy Duarte: Resonate: Present Visual Stories that Transform Audiences (Wiley)", "url": "https://www.duarte.com/resonate/"},
            {"label": "TED Talk: Nancy Duarte: The Secret Structure of Great Talks", "url": "https://www.ted.com/talks/nancy_duarte_the_secret_structure_of_great_talks"},
            {"label": "Harvard Business Review: Structure Your Presentation Like a Story", "url": "https://hbr.org/2012/10/structure-your-presentation-like-a-story"}
        ]
    },
    {
        "id": "yerkes-dodson-law-and-stage-fright-modulation",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "stage-fright;public-speaking;yerkes-dodson;performance-anxiety;physiological-regulation",
        "title": "Managing Stage Anxiety: The Yerkes-Dodson Law & Physiological Arousal Reappraisal",
        "description": "The Yerkes-Dodson Law dictates that cognitive and speaking performance peaks under moderate physiological arousal; complete absence of arousal causes flat delivery, while excessive anxiety impairs working memory. Alison Wood Brooks' research shows that cognitively reappraising nervous arousal as excitement ('anxiety reappraisal') produces superior speaking performance compared to trying to suppress it as calm.",
        "resources": [
            {"label": "Alison Wood Brooks: Get Excited: Reappraising Pre-Performance Anxiety as Excitement (Journal of Experimental Psychology 2014)", "url": "https://psycnet.apa.org/record/2013-44161-001"},
            {"label": "Robert M. Yerkes & John D. Dodson: The Relation of Strength of Stimulus to Rapidity of Habit-Formation (Journal of Comparative Neurology 1908)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/cne.920180503"},
            {"label": "Harvard Business Review: How to Overcome Stage Fright", "url": "https://hbr.org/2019/09/how-to-overcome-stage-fright"}
        ]
    },
    {
        "id": "signposting-and-cognitive-scaffolding-in-technical-talks",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "public-speaking;signposting;cognitive-scaffolding;technical-communication;pedagogy",
        "title": "Verbal Signposting & Cognitive Scaffolding in Complex Technical Presentations",
        "description": "Signposting uses explicit verbal cues (previews, internal summaries, transitions, and retrospectives) to map an audience's mental progress through dense material. Without explicit signposts, listener working memory saturates under high intrinsic cognitive load, leading to audience drop-off during technical transitions.",
        "resources": [
            {"label": "John Sweller: Cognitive Load Theory (Educational Psychology Review 1998)", "url": "https://link.springer.com/article/10.1023/A:1022193728205"},
            {"label": "Toastmasters International: The Art of Verbal Signposting", "url": "https://www.toastmasters.org/magazine/magazine-issues/2020/aug/signpost-your-speech"},
            {"label": "Stanford Engineering: Guidelines for Giving Clear Technical Talks", "url": "https://engineering.stanford.edu/"}
        ]
    },
    {
        "id": "handling-hostile-qa-and-the-bridging-technique",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "media-training;bridging;qa;crisis-communication;public-speaking",
        "title": "Handling Hostile Audience Q&A: The Acknowledge-Bridge-Deliver Protocol",
        "description": "When managing antagonistic questions in public forums, combative responses damage credibility while evasive dodges signal weakness. Media training's Bridging method navigates attacks via a three-step movement: Acknowledge the core emotion or premise of the question, construct a verbal Bridge ('and what that really highlights is...'), and Deliver the core substantive point.",
        "resources": [
            {"label": "Harvard Business Review: How to Handle Difficult Questions from an Audience", "url": "https://hbr.org/2014/11/how-to-handle-difficult-questions-after-a-presentation"},
            {"label": "Wharton Executive Education: Strategic Media Training & The Bridging Technique", "url": "https://executiveeducation.wharton.upenn.edu/"},
            {"label": "Toastmasters International: Master the Q&A Session", "url": "https://www.toastmasters.org/magazine/magazine-issues/2019/nov/master-the-qa"}
        ]
    },

    # =========================================================================
    # 6. Written Communication & Business Clarity
    # =========================================================================
    {
        "id": "bottom-line-up-front-bluf-writing-principle",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "bluf;business-writing;executive-communication;clarity;efficiency",
        "title": "Bottom Line Up Front (BLUF): Military Precision in Written Communications",
        "description": "Originally formulated in US military intelligence doctrines, the BLUF principle places the critical conclusion, decision request, and core consequence in the first sentence of any email or memo. Background context, supporting data, and secondary caveats follow beneath, respecting recipient time and eliminating bury-the-lede confusion.",
        "resources": [
            {"label": "Harvard Business Review: How to Write Emails with Military Precision", "url": "https://hbr.org/2016/11/how-to-write-email-with-military-precision"},
            {"label": "US Army Field Manual 1-02: Operational Terms and Communication Protocols", "url": "https://armypubs.army.mil/"},
            {"label": "Wharton School of Business: Executive Communication and Directness in Writing", "url": "https://executiveeducation.wharton.upenn.edu/"}
        ]
    },
    {
        "id": "minto-scqa-framework-for-business-documents",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "scqa;business-writing;problem-solving;narrative-structure;minto",
        "title": "The SCQA Narrative Architecture: Situation, Complication, Question, Answer",
        "description": "Barbara Minto's SCQA framework structures problem-solving narratives: Situation establishes shared undisputed context, Complication introduces the catalyst/problem disrupting that context, Question frames the exact strategic problem to solve, and Answer delivers the proposed recommendation and path forward.",
        "resources": [
            {"label": "Barbara Minto: The Minto Pyramid Principle: Logic in Writing (SCQA Model)", "url": "https://www.minto.com/"},
            {"label": "INSEAD: Using the SCQA Framework to Drive Business Strategy Decisions", "url": "https://knowledge.insead.edu/"},
            {"label": "Corporate Finance Institute: SCQA Framework in Management Consulting", "url": "https://corporatefinanceinstitute.com/resources/management/scqa-framework/"}
        ]
    },
    {
        "id": "email-tone-calibration-and-egocentrism-bias",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "email;tone-calibration;egocentrism-bias;digital-communication;written-clarity",
        "title": "Email Tone Calibration: Mitigating Egocentrism Bias in Text",
        "description": "Justin Kruger's research on egocentrism in communication revealed that email senders believe recipients correctly interpret their sarcastic, humorous, or urgent tone 84% of the time, while recipients accurately interpret it only 56% of the time (barely better than a coin flip). Calibration requires explicit tone labeling and removing ambiguous brevity.",
        "resources": [
            {"label": "Justin Kruger et al.: Egocentrism Over the Distance: The Fallacy of Email Communication (JPSP 2005)", "url": "https://psycnet.apa.org/record/2005-15582-005"},
            {"label": "Harvard Business Review: The Surprising Risks of Email Ambiguity", "url": "https://hbr.org/2013/02/the-danger-of-vague-emails"},
            {"label": "American Psychological Association: Why Email Miscommunications Happen", "url": "https://www.apa.org/monitor/feb06/email"}
        ]
    },
    {
        "id": "flesch-kincaid-readability-and-cognitive-fluency",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "readability;flesch-kincaid;cognitive-fluency;prose-craft;plain-language",
        "title": "Readability Metrics: Flesch-Kincaid Grading & Cognitive Fluency in Prose",
        "description": "The Flesch Reading Ease and Flesch-Kincaid Grade Level formulas evaluate syntactic complexity based on average sentence length and syllables per word. High cognitive fluency (plain language) dramatically increases reader comprehension, persuasive trust, and retention across general and professional audiences.",
        "resources": [
            {"label": "Rudolf Flesch: A New Readability Yardstick (Journal of Applied Psychology 1948)", "url": "https://psycnet.apa.org/record/1949-01119-001"},
            {"label": "US Plain Language Action and Information Network (PLAIN): Federal Plain Language Guidelines", "url": "https://www.plainlanguage.gov/guidelines/"},
            {"label": "Daniel M. Oppenheimer: Consequences of Erudite Vernacular Utilized Irrespective of Necessity: Problems with Using Long Words Needlessly (Applied Cognitive Psychology 2006)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1178"}
        ]
    },
    {
        "id": "george-orwell-rules-for-clarity-and-vigor",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "prose-craft;writing-clarity;george-orwell;editing;business-communication",
        "title": "George Orwell's Six Rules for Writing: Eliminating Jargon & Stale Metaphors",
        "description": "In 'Politics and the English Language' (1946), George Orwell established six timeless editorial rules: never use a metaphor you are used to seeing in print; never use a long word where a short one will do; if it is possible to cut a word out, always cut it out; never use the passive where you can use the active; never use a foreign phrase or jargon word if you can think of an everyday English equivalent; and break any of these rules sooner than say anything outright barbarous.",
        "resources": [
            {"label": "George Orwell: Politics and the English Language (Horizon 1946 / The Orwell Foundation)", "url": "https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/"},
            {"label": "The Economist Style Guide: Clarity, Brevity, and Precision in Prose", "url": "https://www.economist.com/style-guide"},
            {"label": "William Zinsser: On Writing Well: The Classic Guide to Writing Nonfiction (Harper Perennial)", "url": "https://www.harpercollins.com/products/on-writing-well-william-zinsser"}
        ]
    },

    # =========================================================================
    # 7. Conflict Resolution & De-escalation
    # =========================================================================
    {
        "id": "thomas-kilmann-conflict-mode-instrument-tki",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "tki;conflict-modes;negotiation;assertiveness;cooperativeness",
        "title": "Thomas-Kilmann Conflict Modes (TKI): Assertiveness vs Cooperativeness",
        "description": "The Thomas-Kilmann Conflict Mode Instrument plots five behavioral responses across two dimensions (Assertiveness and Cooperativeness): Competing (assertive, uncooperative), Collaborating (assertive, cooperative), Compromising (intermediate), Avoiding (unassertive, uncooperative), and Accommodating (unassertive, cooperative). Mastery requires choosing the mode appropriate to situational stakes.",
        "resources": [
            {"label": "Kenneth W. Thomas & Ralph H. Kilmann: Thomas-Kilmann Conflict Mode Instrument (Kilmann Diagnostics)", "url": "https://kilmanndiagnostics.com/overview-thomas-kilmann-conflict-mode-instrument-tki/"},
            {"label": "Harvard Business Review: Managing Conflict: Choosing the Right Approach", "url": "https://hbr.org/2012/01/how-to-manage-conflict"},
            {"label": "Center for Creative Leadership: Conflict Management Styles and Situational Deployment", "url": "https://www.ccl.org/articles/leading-effectively-articles/calm-conflict-in-the-workplace/"}
        ]
    },
    {
        "id": "the-third-story-framework-difficult-conversations",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "difficult-conversations;the-third-story;conflict-resolution;harvard-pon;mediation",
        "title": "The Third Story: Mediating Disagreements from a Neutral Perspective",
        "description": "From Harvard Negotiation Project's 'Difficult Conversations', initiating a sensitive discussion from one's own story instantly puts the other party on defense. Starting from 'The Third Story'—the story a neutral third-party mediator would tell describing the differences between both views without judgment—invites collaborative problem-solving.",
        "resources": [
            {"label": "Douglas Stone, Bruce Patton, Sheila Heen: Difficult Conversations: How to Discuss What Matters Most (Penguin)", "url": "https://www.stoneandheen.com/difficult-conversations"},
            {"label": "Harvard PON: How to Start Difficult Conversations Using the Third Story", "url": "https://www.pon.harvard.edu/daily/dispute-resolution/how-to-deal-with-difficult-people/"},
            {"label": "Stanford Graduate School of Business: The Art of Difficult Conversations", "url": "https://www.gsb.stanford.edu/insights/art-difficult-conversations"}
        ]
    },
    {
        "id": "gottman-four-horsemen-and-repair-attempts",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "gottman;conflict;criticism;defensiveness;contempt;repair-attempts",
        "title": "Gottman's Four Horsemen of Conflict & In-Flight Repair Attempts",
        "description": "John Gottman's empirical relationship research identifies four lethal communication patterns that predict relationship dissolution: Criticism (attacking character), Contempt (superior mockery/sarcasm, the single strongest predictor of failure), Defensiveness, and Stonewalling. Countering them requires gentle startups, appreciation cultures, taking responsibility, and issuing de-escalating repair attempts.",
        "resources": [
            {"label": "John M. Gottman & Robert W. Levenson: A Two-Factor Model for Predicting When a Couple Will Divorce (Family Process 2002)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1545-5300.2002.41106.x"},
            {"label": "The Gottman Institute: The Four Horsemen and Their Antidotes", "url": "https://www.gottman.com/blog/the-four-horsemen-the-antidotes/"},
            {"label": "American Psychological Association: Research Analysis of the Gottman Conflict Model", "url": "https://www.apa.org/monitor/2012/03/marriage-prediction"}
        ]
    },
    {
        "id": "de-escalation-in-high-affect-confrontations",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "de-escalation;emotional-regulation;conflict-management;crisis-communication",
        "title": "Verbal De-escalation: Down-Regulating Amygdala Hijack in High-Stakes Hostility",
        "description": "During intense confrontation, autonomic arousal (amygdala hijack) impairs prefrontal executive function and logical processing in counterparts. Verbal de-escalation protocols prioritize lowering speech volume and cadence, acknowledging affective intensity without validating factual distortions, and eliminating trigger phrasing ('calm down', 'you're overreacting').",
        "resources": [
            {"label": "Substance Abuse and Mental Health Services Administration (SAMHSA): De-escalation Techniques and Principles", "url": "https://www.samhsa.gov/"},
            {"label": "Daniel Goleman: Emotional Intelligence: Why It Can Matter More Than IQ (Bantam Books)", "url": "https://www.danielgoleman.info/biography/"},
            {"label": "Crisis Prevention Institute (CPI): Top 10 De-escalation Tips for Crisis Intervention", "url": "https://www.crisisprevention.com/Blog/De-escalation-Tips"}
        ]
    },
    {
        "id": "ladder-of-inference-chris-argyris",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "ladder-of-inference;chris-argyris;mental-models;conflict;cognitive-bias",
        "title": "The Ladder of Inference: Dismantling Rapid Assumption Leaps in Conflict",
        "description": "Chris Argyris' Ladder of Inference maps how individuals leap from observable data, through selected reality, attributed meanings, and unverified assumptions, directly to emotional conclusions and hostile actions. De-escalating workplace misunderstandings requires 'walking down the ladder' to identify exactly where divergent interpretations separated from objective facts.",
        "resources": [
            {"label": "Chris Argyris: Overcoming Organizational Defenses: Facilitating Organizational Learning (Allyn & Bacon 1990)", "url": "https://www.worldcat.org/title/overcoming-organizational-defenses-facilitating-organizational-learning/oclc/20827299"},
            {"label": "Peter M. Senge: The Fifth Discipline Fieldbook: Strategies for Building a Learning Organization (Doubleday)", "url": "https://www.penguinrandomhouse.com/books/164082/the-fifth-discipline-fieldbook-by-peter-m-senge/"},
            {"label": "Harvard Business Review: How to Stop Jumping to Conclusions", "url": "https://hbr.org/2016/09/how-to-stop-jumping-to-conclusions"}
        ]
    },

    # =========================================================================
    # 8. Cross-Cultural Communication
    # =========================================================================
    {
        "id": "high-context-vs-low-context-communication-hall",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "cross-cultural;high-context;low-context;edward-t-hall;global-communication",
        "title": "High-Context vs Low-Context Cultures: Decoding Explicit & Implicit Meaning",
        "description": "Edward T. Hall classified cultural communication along a context spectrum. In Low-Context cultures (USA, Germany), message meaning is explicit, precise, and contained strictly within verbal words. In High-Context cultures (Japan, Arab world), meaning is deeply embedded in situational hierarchy, shared history, subtle body cues, and reading between the lines ('kuuki wo yomu').",
        "resources": [
            {"label": "Edward T. Hall: Beyond Culture (Anchor Books / Doubleday 1976)", "url": "https://www.penguinrandomhouse.com/books/74244/beyond-culture-by-edward-t-hall/"},
            {"label": "INSEAD: Navigating High and Low Context Cultural Barriers", "url": "https://knowledge.insead.edu/leadership-organisational-behaviour/how-navigate-cultural-differences-international-team"},
            {"label": "Harvard Business Review: Communicating Across Cultures", "url": "https://hbr.org/2014/05/navigating-the-cultural-minefield"}
        ]
    },
    {
        "id": "erin-meyer-culture-map-framework",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "culture-map;erin-meyer;cross-cultural;global-teams;management",
        "title": "The Culture Map: Eight Scales for Cross-Cultural Communication & Feedback",
        "description": "Erin Meyer's Culture Map framework plots national working styles across 8 behavioral dimensions: Communicating (explicit vs implicit), Evaluating (direct vs indirect negative feedback), Persuading (principles-first vs applications-first), Leading, Deciding, Trusting, Disagreeing, and Scheduling. Misalignments between evaluating directness and communicating context cause severe global workplace friction.",
        "resources": [
            {"label": "Erin Meyer: The Culture Map: Breaking Through the Invisible Boundaries of Global Business (PublicAffairs)", "url": "https://erinmeyer.com/books/the-culture-map/"},
            {"label": "Harvard Business Review: Navigating the Cultural Minefield (Erin Meyer)", "url": "https://hbr.org/2014/05/navigating-the-cultural-minefield"},
            {"label": "INSEAD Knowledge: Managing Multi-Cultural Project Teams", "url": "https://knowledge.insead.edu/"}
        ]
    },
    {
        "id": "hofstede-cultural-dimensions-and-power-distance",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "hofstede;power-distance;cultural-dimensions;cross-cultural;organizational-behavior",
        "title": "Hofstede's Cultural Dimensions: Power Distance & Hierarchy in Workplace Dialogue",
        "description": "Geert Hofstede's seminal cross-cultural research identifies core dimensions governing societal norms, notably Power Distance Index (PDI). In high-PDI environments, open upward criticism of senior leadership is considered deeply insubordinate, requiring indirect questioning and private backchannel communication to surface organizational concerns.",
        "resources": [
            {"label": "Geert Hofstede: Culture's Consequences: Comparing Values, Behaviors, Institutions and Organizations Across Nations (SAGE Publications)", "url": "https://geerthofstede.com/research-and-vsm/"},
            {"label": "Hofstede Insights: Cultural Dimensions Comparison Methodology", "url": "https://www.hofstede-insights.com/models/national-culture/"},
            {"label": "Journal of Cross-Cultural Psychology: Power Distance and Upward Communication in Multinationals", "url": "https://journals.sagepub.com/home/jcc"}
        ]
    },
    {
        "id": "saving-face-and-indirect-criticism-in-east-asia",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "saving-face;mianzi;cross-cultural;feedback;indirect-communication",
        "title": "The Dynamics of Face (Mianzi): Preserving Social Dignity in Asian Business Negotiations",
        "description": "In East Asian business cultures, 'Face' (Mianzi/Lian) represents social credit, dignity, and standing within a relational network. Direct public contradiction or blunt criticism causes irreversible loss of face, destroying negotiation goodwill; effective communicators deliver critical guidance via private 1-on-1 intermediaries and polite indirection.",
        "resources": [
            {"label": "David Yau-Fai Ho: On the Concept of Face (American Journal of Sociology 1976)", "url": "https://www.jstor.org/stable/2777599"},
            {"label": "Harvard Business Review: Negotiating in China: The Power of Face and Guanxi", "url": "https://hbr.org/2003/10/the-chinese-negotiation"},
            {"label": "Stanford University Center for East Asian Studies: Cross-Cultural Business Etiquette", "url": "https://ceas.stanford.edu/"}
        ]
    },
    {
        "id": "chronemics-monochronic-vs-polychronic-time-norms",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "chronemics;time-perception;cross-cultural;monochronic;polychronic",
        "title": "Chronemics: Monochronic Linear Time vs Polychronic Relational Time",
        "description": "Chronemics examines how cultural time perception dictates communication rhythm. Monochronic cultures view time as a linear, discrete resource to be scheduled and spent ('time is money'), prioritizing rigid agenda punctuality. Polychronic cultures treat time as fluid and simultaneous, subordinating strict schedules to interpersonal relationship maintenance.",
        "resources": [
            {"label": "Edward T. Hall: The Dance of Life: The Other Dimension of Time (Anchor Books 1983)", "url": "https://www.penguinrandomhouse.com/books/74245/the-dance-of-life-by-edward-t-hall/"},
            {"label": "Academy of Management Executive: Time Orientation and Cross-Cultural Management", "url": "https://journals.aom.org/journal/ame"},
            {"label": "International Journal of Intercultural Relations: Chronemics in Cross-Cultural Business Negotiations", "url": "https://www.sciencedirect.com/journal/international-journal-of-intercultural-relations"}
        ]
    },

    # =========================================================================
    # 9. Group Communication Dynamics & Team Safety
    # =========================================================================
    {
        "id": "lean-coffee-facilitation-and-agenda-less-meetings",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "lean-coffee;meeting-facilitation;agile-communication;collaboration;meeting-design",
        "title": "Lean Coffee Facilitation: Democratic Agenda Building for Group Alignment",
        "description": "Lean Coffee is an agenda-less, democratic meeting framework where participants generate discussion topics on sticky notes, pitch them in 15 seconds, dot-vote on priority, and manage timeboxed discussions using a kanban board (To Do, Doing, Done). Roman voting (thumbs up/sideways/down) enables real-time collective decisions on whether to extend topic timeboxes.",
        "resources": [
            {"label": "Jim Benson & Jeremy Lightsmith: Lean Coffee Framework and Principles", "url": "http://leancoffee.org/"},
            {"label": "Agile Alliance: Facilitating Effective Retrospectives with Lean Coffee", "url": "https://www.agilealliance.org/glossary/lean-coffee/"},
            {"label": "Harvard Business Review: Stop the Meeting Madness", "url": "https://hbr.org/2017/07/stop-the-meeting-madness"}
        ]
    },
    {
        "id": "fist-to-five-consensus-voting-protocol",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "fist-to-five;consensus-decision;meeting-facilitation;team-communication;alignment",
        "title": "Fist-to-Five Consensus Gauging: Granular Agreement in Team Deliberation",
        "description": "Fist-to-Five is a nonverbal consensus-gauging protocol where participants simultaneously display 0 to 5 fingers (0 = veto/blocking, 1-2 = major reservations, 3 = neutral support, 4-5 = active championship). Unlike binary thumbs up/down votes, it immediately surfaces latent dissent and clarifies whether opposition is foundational or manageable through minor amendments.",
        "resources": [
            {"label": "National School Reform Faculty (NSRF): Fist to Five Protocol for Consensus", "url": "https://nsrfharmony.org/protocols/"},
            {"label": "Interaction Associates: Consensus Decision-Making Protocols in Leadership", "url": "https://www.interactionassociates.com/"},
            {"label": "MIT Sloan Management Review: The Art of High-Stakes Decision Making", "url": "https://sloanreview.mit.edu/"}
        ]
    },
    {
        "id": "meeting-facilitation-liberating-structures-1-2-4-all",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "facilitation;liberating-structures;meeting-design;group-dynamics;collaboration",
        "title": "Meeting Facilitation Protocols: Liberating Structures & The 1-2-4-All Method",
        "description": "Traditional unstructured open meetings allow dominant extroverts to monopolize 80% of airtime while stifling quiet domain experts. Liberating Structures protocols (such as '1-2-4-All') sequence discussions: 1 minute of silent reflection, 2 minutes in pairs, 4 minutes in quads, and collective plenary sharing, engaging 100% of participants simultaneously.",
        "resources": [
            {"label": "Henri Lipmanowicz & Keith McCandless: The Surprising Power of Liberating Structures", "url": "https://www.liberatingstructures.com/"},
            {"label": "Harvard Business Review: How to Design and Run Effective Meetings", "url": "https://hbr.org/2015/03/how-to-run-a-more-effective-meeting"},
            {"label": "MIT Leadership Center: Facilitation Techniques for Distributed and In-Person Teams", "url": "https://leadership.mit.edu/"}
        ]
    },
    {
        "id": "gary-klein-pre-mortem-facilitation-protocol",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "pre-mortem;gary-klein;risk-communication;project-management;meeting-design",
        "title": "Gary Klein's Pre-Mortem Protocol: Prospective Hindsight in Kickoff Meetings",
        "description": "Gary Klein's Pre-Mortem protocol counters managerial optimism bias and social pressure by directing project teams at kickoff to imagine that the project has failed catastrophically months in the future. Team members individually write detailed explanations of how the disaster occurred, creating psychological safety to voice candid risk critiques that standard planning meetings suppress.",
        "resources": [
            {"label": "Gary Klein: Performing a Project Premortem (Harvard Business Review 2007)", "url": "https://hbr.org/2007/09/performing-a-project-premortem"},
            {"label": "Daniel Kahneman: Thinking, Fast and Slow (Farrar, Straus and Giroux)", "url": "https://us.macmillan.com/books/9780374533557/thinkingfastandslow"},
            {"label": "American Psychological Association: Prospective Hindsight in Strategic Risk Assessment", "url": "https://www.apa.org/pubs/journals/amp"}
        ]
    },
    {
        "id": "nominal-group-technique-for-unbiased-ideation",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "nominal-group-technique;brainstorming;ideation;meeting-facilitation;decision-making",
        "title": "Nominal Group Technique (NGT): Eliminating Production Blocking in Group Ideation",
        "description": "Traditional open brainstorming suffers from production blocking (only one person talking at a time) and evaluation apprehension. The Nominal Group Technique replaces verbal brainstorming with silent written idea generation, round-robin recording, structured group clarification, and anonymous multi-voting ranking to ensure meritocratic idea selection.",
        "resources": [
            {"label": "Andre L. Delbecq & Andrew H. Van de Ven: A Group Process Model for Problem Identification and Program Planning (Journal of Applied Behavioral Science 1971)", "url": "https://journals.sagepub.com/doi/10.1177/002188637100700404"},
            {"label": "CDC: Gaining Consensus Among Stakeholders Through the Nominal Group Technique", "url": "https://www.cdc.gov/evaluation/guides/index.htm"},
            {"label": "Harvard Business Review: Better Brainstorming: Focus on Questions, Not Answers", "url": "https://hbr.org/2018/03/better-brainstorming"}
        ]
    },

    # =========================================================================
    # 10. Digital, Asynchronous & Distributed Communication
    # =========================================================================
    {
        "id": "media-richness-theory-and-channel-selection",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "media-richness-theory;channel-selection;async-communication;digital-collaboration",
        "title": "Media Richness Theory: Matching Channel Bandwidth to Message Ambiguity",
        "description": "Daft and Lengel's Media Richness Theory classifies communication channels by their ability to convey multiple informational cues (body language, tone, immediate feedback). Low-ambiguity routine coordination belongs in lean media (asynchronous tickets, RFC docs), while high-ambiguity emotional conflict or strategic alignment mandates rich media (synchronous video or in-person).",
        "resources": [
            {"label": "Richard L. Daft & Robert H. Lengel: Organizational Information Requirements, Media Richness and Structural Design (Management Science 1986)", "url": "https://www.jstor.org/stable/2631608"},
            {"label": "MIT Sloan Management Review: The Right Media for the Right Message", "url": "https://sloanreview.mit.edu/"},
            {"label": "Harvard Business Review: When to Use Email vs Video vs In-Person", "url": "https://hbr.org/2020/09/how-to-collaborate-effectively-in-a-remote-world"}
        ]
    },
    {
        "id": "async-first-communication-and-rfc-decision-making",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "async-first;rfc-documents;remote-work;distributed-teams;documentation",
        "title": "Async-First Operating Models: Written RFC Culture & Deep Work Protection",
        "description": "Asynchronous-first organizations replace low-density synchronous status meetings with high-fidelity long-form Request for Comments (RFC) written proposals (Amazon 6-pagers, Stripe writing culture). Readers absorb, critique, and annotate proposals inline asynchronously, preserving unfragmented blocks for deep work and democratizing input across global time zones.",
        "resources": [
            {"label": "GitLab Handbook: All-Remote Asynchronous Communication Guide", "url": "https://handbook.gitlab.com/handbook/company/culture/all-remote/asynchronous/"},
            {"label": "Amazon Shareholder Letters (Jeff Bezos): The Six-Page Memo Architecture (2017)", "url": "https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders"},
            {"label": "Stripe Engineering: How Stripe Builds an Asynchronous Writing Culture", "url": "https://stripe.com/blog"}
        ]
    },
    {
        "id": "online-disinhibition-effect-and-digital-incivility",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "online-disinhibition;digital-incivility;cyberpsychology;slack-hygiene;remote-work",
        "title": "The Online Disinhibition Effect: Preventing Digital Incivility & Text Friction",
        "description": "John Suler's research on the Online Disinhibition Effect explains how perceived anonymity, invisibility, asynchronous lag, and solipsistic introjection cause individuals to act with greater hostility and less empathy online than in person. Distributed teams counter digital incivility by enforcing strict Slack norms, camera-on 1-on-1 reconciliations, and generous assumption of positive intent.",
        "resources": [
            {"label": "John Suler: The Online Disinhibition Effect (CyberPsychology & Behavior 2004)", "url": "https://www.liebertpub.com/doi/10.1089/1094931041291295"},
            {"label": "Harvard Business Review: How to Prevent Remote Team Incivility and Toxicity", "url": "https://hbr.org/2021/04/how-to-manage-a-toxic-remote-colleague"},
            {"label": "American Psychological Association: The Psychology of Online Communication Dynamics", "url": "https://www.apa.org/pubs/journals/ppm"}
        ]
    },
    {
        "id": "slack-hygiene-and-context-collapse-prevention",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "slack-hygiene;context-collapse;attention-economy;interruption-management",
        "title": "Chat Channel Hygiene: Threading, Asynchronous Pings & Context Collapse",
        "description": "Real-time group chat applications (Slack, Microsoft Teams) trigger constant attention fragmentation and context collapse when broad channels are flooded with disjointed discussions. Strict channel hygiene mandates using threaded discussions for all sub-topics, avoiding naked '@here/@channel' pings, and migrating resolved conclusions to searchable permanent knowledge bases.",
        "resources": [
            {"label": "Cal Newport: A World Without Email: Reimagining Work in an Age of Communication Overload (Portfolio)", "url": "https://www.calnewport.com/books/a-world-without-email/"},
            {"label": "Gloria Mark: Multitasking in the Digital Age (Synthesis Lectures on Human-Centered Informatics)", "url": "https://www.morganclaypool.com/doi/abs/10.2200/S00635ED1V01Y201503HCI029"},
            {"label": "Basecamp Guide: Communication Rules and Chat Room Hygiene", "url": "https://basecamp.com/guides/how-we-communicate"}
        ]
    },
    {
        "id": "asynchronous-video-messaging-and-loom-hygiene",
        "group_name": "mind-growth",
        "category": "communication",
        "tags": "async-video;loom;remote-work;documentation;knowledge-transfer",
        "title": "Asynchronous Video Messaging: Screen-Share Walkthroughs & Meeting Replacement",
        "description": "Asynchronous video messaging (e.g. Loom, recorded screen walkthroughs) bridges the gap between text documentation and synchronous meetings by conveying visual demonstrations and vocal prosody without requiring calendar coordination. Best practices dictate keeping videos under 3-5 minutes, pairing with bulleted text summaries, and including clear next-step calls to action.",
        "resources": [
            {"label": "GitLab Handbook: Guidelines for Asynchronous Video Communication", "url": "https://handbook.gitlab.com/handbook/communication/"},
            {"label": "Harvard Business Review: Why You Should Try Asynchronous Video Updates", "url": "https://hbr.org/2021/10/the-case-for-asynchronous-video-in-remote-work"},
            {"label": "Nielsen Norman Group: Video Communication in Digital Product Design", "url": "https://www.nngroup.com/"}
        ]
    }
]

# Write CSV & SQL files
os.makedirs('seeds', exist_ok=True)

csv_filepath = os.path.join('seeds', 'topics_mind_growth_communication.csv')
sql_filepath = os.path.join('seeds', 'seed_topics_mind_growth_communication.sql')

# Write RFC 4180 compliant CSV
with open(csv_filepath, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['id', 'group_name', 'category', 'tags', 'title', 'description', 'resources'])
    
    for t in topics:
        writer.writerow([
            t['id'],
            t['group_name'],
            t['category'],
            t['tags'],
            t['title'],
            t['description'],
            json.dumps(t['resources'], ensure_ascii=False)
        ])

print(f"Generated {len(topics)} topics successfully at {csv_filepath}")

# Write PostgreSQL Idempotent SQL Seed
with open(sql_filepath, mode='w', encoding='utf-8') as f_sql:
    f_sql.write('-- ==============================================================================\n')
    f_sql.write(f'-- TOPICS SEED DATA: MIND-GROWTH -> COMMUNICATION ({len(topics)} Topics)\n')
    f_sql.write('-- ==============================================================================\n\n')
    
    for t in topics:
        topic_id = t['id'].replace("'", "''")
        group_name = t['group_name'].replace("'", "''")
        category = t['category'].replace("'", "''")
        tags = [tag.strip().replace("'", "''") for tag in t['tags'].split(';') if tag.strip()]
        tags_sql = "ARRAY[" + ", ".join([f"'{tag}'" for tag in tags]) + "]::TEXT[]"
        title = t['title'].replace("'", "''")
        desc = t['description'].replace("'", "''")
        res_json = json.dumps(t['resources'], ensure_ascii=False).replace("'", "''")
        
        f_sql.write(f"INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)\n")
        f_sql.write(f"VALUES ('{topic_id}', '{group_name}', '{category}', {tags_sql}, '{title}', '{desc}', '{res_json}'::JSONB)\n")
        f_sql.write("ON CONFLICT (id) DO UPDATE SET\n")
        f_sql.write("    title = EXCLUDED.title,\n")
        f_sql.write("    description = EXCLUDED.description,\n")
        f_sql.write("    tags = EXCLUDED.tags,\n")
        f_sql.write("    resources = EXCLUDED.resources;\n\n")

print(f"Generated SQL seed file successfully at {sql_filepath}")

# Validation with csv.DictReader and json.loads on every single row
print("\n--- VALIDATING CSV WITH csv.DictReader + json.loads ---")
with open(csv_filepath, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    assert reader.fieldnames == ['id', 'group_name', 'category', 'tags', 'title', 'description', 'resources'], f"Invalid headers: {reader.fieldnames}"
    
    row_count = 0
    ids_seen = set()
    for row_idx, row in enumerate(reader, start=1):
        row_count += 1
        t_id = row['id']
        assert t_id, f"Row {row_idx}: id is empty"
        assert t_id not in ids_seen, f"Row {row_idx}: duplicate id {t_id}"
        ids_seen.add(t_id)
        
        assert row['group_name'] == 'mind-growth', f"Row {row_idx}: invalid group_name {row['group_name']}"
        assert row['category'] == 'communication', f"Row {row_idx}: invalid category {row['category']}"
        assert row['tags'], f"Row {row_idx}: tags is empty"
        assert row['title'], f"Row {row_idx}: title is empty"
        assert row['description'], f"Row {row_idx}: description is empty"
        
        # Validate resources JSON
        try:
            res = json.loads(row['resources'])
            assert isinstance(res, list), f"Row {row_idx}: resources is not a list"
            assert 2 <= len(res) <= 4, f"Row {row_idx}: resources length {len(res)} outside expected [2, 4]"
            for r_item in res:
                assert 'label' in r_item and 'url' in r_item, f"Row {row_idx}: missing label or url in resource {r_item}"
                assert r_item['label'].strip(), f"Row {row_idx}: empty label"
                assert r_item['url'].startswith('http'), f"Row {row_idx}: invalid url {r_item['url']}"
        except Exception as e:
            raise AssertionError(f"Row {row_idx} ({t_id}) failed JSON validation: {e}")

print(f"SUCCESS: All {row_count} rows passed strict validation with csv.DictReader and json.loads!")
