import csv
import json
import os

topics = [
    # =========================================================================
    # 1. Cognitive Biases & Heuristics
    # =========================================================================
    {
        "id": "availability-heuristic-and-salience-bias",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "cognitive-biases;heuristics;availability-heuristic;kahneman-tversky;decision-making",
        "title": "The Availability Heuristic: Frequency Estimation via Memory Ease",
        "description": "The availability heuristic is a mental shortcut where individuals assess the probability or frequency of an event based on how readily concrete examples come to mind. Heavily publicized, emotionally vivid, or recent events are recalled with greater cognitive ease, leading to systematic overestimation of rare dangers and underestimation of common risks.",
        "resources": [
            {"label": "Amos Tversky & Daniel Kahneman: Availability: A Heuristic for Judging Frequency and Probability (Cognitive Psychology 1973)", "url": "https://www.sciencedirect.com/science/article/pii/0010028573900339"},
            {"label": "Daniel Kahneman: Thinking, Fast and Slow (Farrar, Straus and Giroux)", "url": "https://us.macmillan.com/books/9780374533557/thinkingfastandslow"},
            {"label": "American Psychological Association: Availability Heuristic Definition & Research", "url": "https://dictionary.apa.org/availability-heuristic"}
        ]
    },
    {
        "id": "confirmation-bias-and-motivated-reasoning",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "cognitive-biases;confirmation-bias;motivated-reasoning;epistemology;psychology",
        "title": "Confirmation Bias: Selective Information Search & Evidence Dismissal",
        "description": "Confirmation bias is the tendency to search for, interpret, favor, and recall information in a manner that confirms preexisting hypotheses while ignoring or critically discounting contrary evidence. Peter Wason's 2-4-6 selection tasks demonstrated that humans rarely attempt to falsify their working theories spontaneously.",
        "resources": [
            {"label": "Peter C. Wason: On the Failure to Eliminate Hypotheses in a Conceptual Task (Quarterly Journal of Experimental Psychology 1960)", "url": "https://www.tandfonline.com/doi/abs/10.1080/17470216008416717"},
            {"label": "Raymond S. Nickerson: Confirmation Bias: A Ubiquitous Phenomenon in Many Guises (Review of General Psychology 1998)", "url": "https://journals.sagepub.com/doi/10.1037/1089-2680.2.2.175"},
            {"label": "Stanford Encyclopedia of Philosophy: Epistemology and Motivated Reasoning", "url": "https://plato.stanford.edu/"}
        ]
    },
    {
        "id": "sunk-cost-fallacy-and-escalation-of-commitment",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "sunk-cost;escalation-of-commitment;decision-making;behavioral-economics",
        "title": "The Sunk Cost Fallacy: Escalation of Commitment & Loss Aversion",
        "description": "The sunk cost fallacy occurs when decision-makers justify continuing an endeavor based on cumulative past investments of time, capital, or effort that cannot be recovered, rather than prospective future costs and benefits. Driven by loss aversion and desire to avoid appearing wasteful, individuals escalate commitment to failing trajectories.",
        "resources": [
            {"label": "Hal R. Arkes & Catherine Blumer: The Psychology of Sunk Cost (Organizational Behavior and Human Decision Processes 1985)", "url": "https://www.sciencedirect.com/science/article/pii/0749597885900494"},
            {"label": "Barry M. Staw: Knee-Deep in the Big Muddy: A Study of Escalating Commitment to a Chosen Course of Action (OBHP 1976)", "url": "https://www.sciencedirect.com/science/article/pii/0030507376900052"},
            {"label": "Harvard Business Review: Knowing When to Pull the Plug", "url": "https://hbr.org/1987/03/knowing-when-to-pull-the-plug"}
        ]
    },
    {
        "id": "anchoring-and-adjustment-heuristic",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "anchoring;heuristics;kahneman-tversky;numerical-cognition;psychology",
        "title": "Anchoring & Adjustment: Numerical Priming & Insufficient Correction",
        "description": "The anchoring and adjustment heuristic is a cognitive bias wherein initial exposure to an arbitrary reference value ('anchor') disproportionately influences subsequent quantitative judgments. Even when participants know the anchor is random or irrelevant, cognitive adjustments away from the starting anchor remain systematically insufficient.",
        "resources": [
            {"label": "Amos Tversky & Daniel Kahneman: Judgment under Uncertainty: Heuristics and Biases (Science 1974)", "url": "https://www.science.org/doi/10.1126/science.185.4157.1124"},
            {"label": "Thomas Mussweiler & Fritz Strack: The Numeric Priming Effect in Economic Estimations (JPSP 1999)", "url": "https://psycnet.apa.org/record/1999-05244-002"},
            {"label": "American Psychological Association: Anchoring Effect Overview", "url": "https://dictionary.apa.org/anchoring-effect"}
        ]
    },
    {
        "id": "dunning-kruger-effect-metacognitive-calibration",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "dunning-kruger;metacognition;self-assessment;cognitive-bias;expertise",
        "title": "The Dunning-Kruger Effect: Metacognitive Deficits in Novice Self-Assessment",
        "description": "David Dunning and Justin Kruger demonstrated that novices in complex cognitive domains suffer a dual burden: they make erroneous judgments and lack the domain metacognition required to recognize their own incompetence. Conversely, true domain experts frequently suffer from the curse of knowledge, mistakenly assuming their peers possess equal mastery.",
        "resources": [
            {"label": "Justin Kruger & David Dunning: Unskilled and Unaware of It: How Difficulties in Recognizing One's Own Incompetence Lead to Inflated Self-Assessments (JPSP 1999)", "url": "https://psycnet.apa.org/record/1999-15054-002"},
            {"label": "David Dunning: The Dunning-Kruger Effect: On Being Ignorant of One's Own Ignorance (Advances in Experimental Social Psychology 2011)", "url": "https://www.sciencedirect.com/science/article/pii/B9780123855220000056"},
            {"label": "Psychological Science: Metacognitive Calibration and Expertise", "url": "https://www.psychologicalscience.org/"}
        ]
    },
    {
        "id": "fundamental-attribution-error-and-actor-observer-bias",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "attribution-theory;social-psychology;fundamental-attribution-error;cognitive-bias",
        "title": "The Fundamental Attribution Error & Actor-Observer Asymmetry",
        "description": "Lee Ross coined the Fundamental Attribution Error (FAE) to describe the human tendency to overemphasize internal personality traits while underestimating situational context when explaining other people's behavior. The Actor-Observer Bias shows that when explaining our own shortcomings, we attribute outcomes to external situational constraints rather than personal flaws.",
        "resources": [
            {"label": "Lee Ross: The Intuitive Psychologist and His Shortcomings: Distortions in the Attribution Process (Advances in Experimental Social Psychology 1977)", "url": "https://www.sciencedirect.com/science/article/pii/S0065260108603573"},
            {"label": "Edward E. Jones & Victor A. Harris: The Attribution of Attitudes (Journal of Experimental Social Psychology 1967)", "url": "https://www.sciencedirect.com/science/article/abs/pii/0022103167900340"},
            {"label": "American Psychological Association: Attribution Theory and Actor-Observer Differences", "url": "https://dictionary.apa.org/fundamental-attribution-error"}
        ]
    },
    {
        "id": "hindsight-bias-and-the-i-knew-it-all-along-phenomenon",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "hindsight-bias;memory-distortion;decision-making;epistemic-bias",
        "title": "Hindsight Bias: Memory Reconstruction & The 'I-Knew-It-All-Along' Illusion",
        "description": "Baruch Fischhoff's pioneering research on hindsight bias showed that once an event outcome is known, individuals unconsciously reconstruct their memory to believe they had predicted the outcome all along. Hindsight bias distorts organizational post-mortems by penalizing decision-makers for unforeseeable black swans while overestimating future predictability.",
        "resources": [
            {"label": "Baruch Fischhoff: Hindsight != Foresight: The Effect of Outcome Knowledge on Judgment Under Uncertainty (JEP: Human Perception and Performance 1975)", "url": "https://psycnet.apa.org/record/1976-02758-001"},
            {"label": "Neal J. Roese & Kathleen D. Vohs: Hindsight Bias (Perspectives on Psychological Science 2012)", "url": "https://journals.sagepub.com/doi/abs/10.1177/1745691612454392"},
            {"label": "Harvard Business Review: The Problem with Hindsight Bias in Leadership", "url": "https://hbr.org/2014/10/the-trouble-with-hindsight"}
        ]
    },
    {
        "id": "base-rate-fallacy-and-representativeness-heuristic",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "base-rate-fallacy;representativeness;bayesian-reasoning;heuristics;probability",
        "title": "The Base Rate Fallacy: Representativeness & Neglect of Prior Probabilities",
        "description": "The base rate fallacy occurs when people evaluate the likelihood of a hypothesis by its descriptive similarity to a stereotype (representativeness heuristic) while ignoring the statistical base rate frequencies of the population. In clinical testing and legal reasoning, neglecting prior probabilities leads to massive overestimations of false positives.",
        "resources": [
            {"label": "Daniel Kahneman & Amos Tversky: On the Psychology of Prediction (Psychological Review 1973)", "url": "https://psycnet.apa.org/record/1973-31530-001"},
            {"label": "Maya Bar-Hillel: The Base-Rate Fallacy in Probability Judgments (Acta Psychologica 1980)", "url": "https://www.sciencedirect.com/science/article/pii/0001691880900463"},
            {"label": "Gerd Gigerenzer & Ulrich Hoffrage: How to Improve Bayesian Reasoning Without Instruction (Psychological Review 1995)", "url": "https://psycnet.apa.org/record/1996-03522-001"}
        ]
    },
    {
        "id": "conjunction-fallacy-and-the-linda-problem",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "conjunction-fallacy;linda-problem;probability;kahneman-tversky;formal-logic",
        "title": "The Conjunction Fallacy: The 'Linda Problem' & Probabilistic Violations",
        "description": "The conjunction fallacy is a formal logical error where individuals judge a compound conjunction of two events (A and B) as more probable than a single constituent event (A alone), violating the basic laws of probability (P(A ∩ B) <= P(A)). Tversky and Kahneman's famous 'Linda Problem' showed that narrative plausibility routinely overrules mathematical consistency.",
        "resources": [
            {"label": "Amos Tversky & Daniel Kahneman: Extensional Versus Intuitive Reasoning: The Conjunction Fallacy in Probability Judgment (Psychological Review 1983)", "url": "https://psycnet.apa.org/record/1984-06396-001"},
            {"label": "Massimo Tentori et al.: On the Rationality of the Conjunction Fallacy (Cognition 2013)", "url": "https://www.sciencedirect.com/science/article/pii/S0010027712002167"},
            {"label": "Stanford Encyclopedia of Philosophy: The Conjunction Fallacy and Formal Epistemology", "url": "https://plato.stanford.edu/"}
        ]
    },
    {
        "id": "prospect-theory-and-loss-aversion",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "prospect-theory;loss-aversion;framing-effect;behavioral-economics;kahneman-tversky",
        "title": "Prospect Theory: Asymmetric Value Function & Loss Aversion",
        "description": "Daniel Kahneman and Amos Tversky's Nobel Prize-winning Prospect Theory showed that human choices under risk violate expected utility theory. Human valuation is reference-dependent and exhibits loss aversion: the psychological pain of losing an amount is approximately twice as intense as the pleasure of gaining an equivalent amount, creating risk-aversion for gains and risk-seeking for losses.",
        "resources": [
            {"label": "Daniel Kahneman & Amos Tversky: Prospect Theory: An Analysis of Decision under Risk (Econometrica 1979)", "url": "https://www.jstor.org/stable/1914185"},
            {"label": "Amos Tversky & Daniel Kahneman: Advances in Prospect Theory: Cumulative Representation of Uncertainty (Journal of Risk and Uncertainty 1992)", "url": "https://link.springer.com/article/10.1007/BF00122574"},
            {"label": "Nobel Prize Outreach: The Sveriges Riksbank Prize in Economic Sciences 2002", "url": "https://www.nobelprize.org/prizes/economic-sciences/2002/summary/"}
        ]
    },
    {
        "id": "status-quo-bias-and-default-effects",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "status-quo-bias;default-effect;behavioral-economics;nudge;decision-making",
        "title": "Status Quo Bias: Default Inertia & The Endowment Effect",
        "description": "William Samuelson and Richard Zeckhauser identified the Status Quo Bias: a disproportionate preference for the current state of affairs over alternatives. Reinforced by loss aversion, regret avoidance, and the endowment effect (overvaluing objects simply because one possesses them), people disproportionately stick with pre-selected defaults.",
        "resources": [
            {"label": "William Samuelson & Richard Zeckhauser: Status Quo Bias in Decision Making (Journal of Risk and Uncertainty 1988)", "url": "https://link.springer.com/article/10.1007/BF00055564"},
            {"label": "Richard H. Thaler: Toward a Positive Theory of Consumer Choice (Journal of Economic Behavior & Organization 1980)", "url": "https://www.sciencedirect.com/science/article/pii/0167268180900517"},
            {"label": "Eric J. Johnson & Daniel Goldstein: Do Defaults Save Lives? (Science 2003)", "url": "https://www.science.org/doi/10.1126/science.1091721"}
        ]
    },
    {
        "id": "peak-end-rule-and-duration-neglect",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "peak-end-rule;duration-neglect;experienced-utility;kahneman;memory-bias",
        "title": "The Peak-End Rule & Duration Neglect in Retrospective Evaluation",
        "description": "The Peak-End Rule demonstrates that people evaluate past experiences almost entirely based on how they felt at their most intense point (the peak) and at their final moments (the end), rather than the total sum or average of every moment. Concurrently, individuals exhibit Duration Neglect, ignoring how long an ordeal or pleasurable experience actually lasted.",
        "resources": [
            {"label": "Daniel Kahneman, Barbara L. Fredrickson, Charles A. Schreiber, Donald A. Redelmeier: When More Pain Is Preferred to Less: Adding a Better End (Psychological Science 1993)", "url": "https://journals.sagepub.com/doi/10.1111/j.1467-9280.1993.tb00589.x"},
            {"label": "Donald A. Redelmeier & Daniel Kahneman: Patients' Memories of Painful Medical Procedures: Real-Time and Retrospective Evaluations of Two Minimally Invasive Procedures (Pain 1996)", "url": "https://www.sciencedirect.com/science/article/pii/0304395996030933"},
            {"label": "Annual Review of Psychology: Experienced Utility and Objective Happiness", "url": "https://www.annualreviews.org/"}
        ]
    },
    {
        "id": "halo-effect-and-horns-effect-cognitive-generalization",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "halo-effect;horns-effect;edward-thorndike;social-cognition;cognitive-bias",
        "title": "The Halo Effect: Global Attractiveness & Trait Generalization",
        "description": "First documented experimentally by Edward Thorndike in 1920, the Halo Effect is a cognitive bias wherein an observer's overall positive impression of a person in one dimension (e.g. physical attractiveness, charisma) systematically biases ratings of their unrelated characteristics (e.g. intelligence, trustworthiness, competence). The reverse phenomenon is the Horns Effect.",
        "resources": [
            {"label": "Edward L. Thorndike: A Constant Error in Psychological Ratings (Journal of Applied Psychology 1920)", "url": "https://psycnet.apa.org/record/1920-03080-001"},
            {"label": "Richard E. Nisbett & Timothy D. Wilson: The Halo Effect: Evidence for Unconscious Alteration of Judgments (JPSP 1977)", "url": "https://psycnet.apa.org/record/1978-05048-001"},
            {"label": "American Psychological Association: Halo Effect Definition and Organizational Implications", "url": "https://dictionary.apa.org/halo-effect"}
        ]
    },
    {
        "id": "affect-heuristic-and-risk-perception-slovic",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "affect-heuristic;paul-slovic;risk-perception;emotion;decision-making",
        "title": "The Affect Heuristic: Intuitive Feelings in Risk and Benefit Judgments",
        "description": "Paul Slovic demonstrated that individuals rely on fast, automatic emotional reactions ('good' or 'bad' feelings) to assess complex hazards and investments. When individuals feel favorable toward an activity, they perceive its risks as low and its benefits as high, violating objective risk-return trade-offs through emotion-driven heuristics.",
        "resources": [
            {"label": "Paul Slovic et al.: The Affect Heuristic (European Journal of Operational Research 2007)", "url": "https://www.sciencedirect.com/science/article/pii/S0377221706004245"},
            {"label": "Paul Slovic: Perception of Risk (Science 1987)", "url": "https://www.science.org/doi/10.1126/science.3563507"},
            {"label": "Annual Review of Psychology: Risk as Feelings and Affective Decision Architecture", "url": "https://www.annualreviews.org/"}
        ]
    },
    {
        "id": "planning-fallacy-and-optimism-bias-kahneman",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "planning-fallacy;optimism-bias;kahneman-tversky;project-management;cognition",
        "title": "The Planning Fallacy & Inside vs Outside View in Estimation",
        "description": "Daniel Kahneman and Amos Tversky identified the Planning Fallacy: the universal tendency to underestimate the time, costs, and risks of future actions while overestimating their benefits. Driven by taking an 'inside view' focused on best-case scenario narratives, decision-makers systematically ignore distributional statistical base rates from similar past projects ('outside view').",
        "resources": [
            {"label": "Daniel Kahneman & Amos Tversky: Intuitive Prediction: Biases and Corrective Procedures (TIMS Studies in Management Science 1979)", "url": "https://www.worldcat.org/title/studies-in-the-management-sciences/oclc/1057790"},
            {"label": "Roger Buehler, Dale Griffin, Michael Ross: Exploring the 'Planning Fallacy': Why People Underestimate Their Task Completion Times (JPSP 1994)", "url": "https://psycnet.apa.org/record/1994-43685-001"},
            {"label": "Harvard Business Review: Delusions of Success: How Optimism Undermines Executives' Decisions", "url": "https://hbr.org/2003/07/delusions-of-success-how-optimism-undermines-executives-decisions"}
        ]
    },

    # =========================================================================
    # 2. Social Psychology & Interpersonal Dynamics
    # =========================================================================
    {
        "id": "asch-conformity-experiments-normative-vs-informational",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "social-psychology;conformity;solomon-asch;social-influence;peer-pressure",
        "title": "The Asch Conformity Experiments: Normative vs Informational Social Influence",
        "description": "Solomon Asch's landmark line-judgment studies demonstrated that 75% of participants conformed at least once to an obviously incorrect unanimous group consensus. Conformity operates through two mechanisms: Normative Social Influence (conforming to gain social approval and avoid rejection) and Informational Social Influence (relying on group consensus as genuine evidence of reality).",
        "resources": [
            {"label": "Solomon E. Asch: Studies of Independence and Conformity: A Minority of One Against a Unanimous Majority (Psychological Monographs 1956)", "url": "https://psycnet.apa.org/record/1957-04706-001"},
            {"label": "Morton Deutsch & Harold B. Gerard: A Study of Normative and Informational Social Influences Upon Individual Judgment (JASP 1955)", "url": "https://psycnet.apa.org/record/1957-01314-001"},
            {"label": "American Psychological Association: Asch Conformity Experiments Overview", "url": "https://www.apa.org/topics/social-influence"}
        ]
    },
    {
        "id": "milgram-obedience-studies-and-the-agentic-state",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "milgram;obedience;authority;social-psychology;ethics;agentic-state",
        "title": "The Milgram Obedience Experiments: Authority Compliance & The Agentic State",
        "description": "Stanley Milgram's Yale experiments found that 65% of ordinary participants complied with instructions to administer lethal 450-volt electric shocks to a screaming learner when commanded by an authoritative experimenter. Milgram proposed the 'Agentic State' theory: individuals surrender personal moral agency and view themselves purely as instruments executing an authority figure's will.",
        "resources": [
            {"label": "Stanley Milgram: Behavioral Study of Obedience (Journal of Abnormal and Social Psychology 1963)", "url": "https://psycnet.apa.org/record/1964-03472-001"},
            {"label": "Stanley Milgram: Obedience to Authority: An Experimental View (Harper & Row)", "url": "https://www.harpercollins.com/products/obedience-to-authority-stanley-milgram"},
            {"label": "American Psychologist: Replicating and Re-evaluating Milgram's Obedience Paradigms (Jerry Burger 2009)", "url": "https://psycnet.apa.org/record/2008-18540-001"}
        ]
    },
    {
        "id": "bystander-effect-and-diffusion-of-responsibility",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "bystander-effect;diffusion-of-responsibility;social-psychology;helping-behavior",
        "title": "The Bystander Effect: Pluralistic Ignorance & Diffusion of Responsibility",
        "description": "John Darley and Bibb Latané demonstrated that as the number of passive onlookers increases during an emergency, the likelihood that any single individual will intervene decreases significantly. The effect stems from two psychological hurdles: Diffusion of Responsibility (assuming someone else will act) and Pluralistic Ignorance (interpreting others' calm inaction as proof that no emergency exists).",
        "resources": [
            {"label": "John M. Darley & Bibb Latané: Bystander Intervention in Emergencies: Diffusion of Responsibility (JPSP 1968)", "url": "https://psycnet.apa.org/record/1968-08862-001"},
            {"label": "Bibb Latané & John M. Darley: The Unresponsive Bystander: Why Doesn't He Help? (Appleton-Century-Crofts)", "url": "https://www.worldcat.org/title/unresponsive-bystander-why-doesnt-he-help/oclc/95318"},
            {"label": "American Psychological Association: Research on Bystander Intervention Dynamics", "url": "https://www.apa.org/pubs/journals/psp"}
        ]
    },
    {
        "id": "social-identity-theory-and-in-group-favoritism",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "social-identity;in-group;out-group;henri-tajfel;prejudice;minimal-group",
        "title": "Social Identity Theory: Minimal Group Paradigms & In-Group Favoritism",
        "description": "Henri Tajfel's Minimal Group Experiments proved that categorizing humans into arbitrary, meaningless groups (e.g. coin tosses or painting preferences) instantly generates in-group favoritism and out-group discrimination. Social Identity Theory shows that self-esteem is derived partly from group membership, incentivizing individuals to maximize perceived superiority over out-groups.",
        "resources": [
            {"label": "Henri Tajfel et al.: Social Categorization and Intergroup Behaviour (European Journal of Social Psychology 1971)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.2420010202"},
            {"label": "Henri Tajfel & John C. Turner: An Integrative Theory of Intergroup Conflict (The Social Psychology of Intergroup Relations 1979)", "url": "https://www.taylorfrancis.com/chapters/edit/10.4324/9780203505984-16/integrative-theory-intergroup-conflict-henri-tajfel-john-turner"},
            {"label": "Stanford Encyclopedia of Philosophy: Social Identity and Intergroup Relations", "url": "https://plato.stanford.edu/"}
        ]
    },
    {
        "id": "cognitive-dissonance-theory-festinger",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "cognitive-dissonance;leon-festinger;attitude-change;self-justification;social-psychology",
        "title": "Cognitive Dissonance Theory: Aversive Inconsistency & Attitude Change",
        "description": "Leon Festinger's Cognitive Dissonance Theory posits that holding two contradictory cognitions (or acting contrary to one's values) creates an aversive state of psychological tension. Because humans are motivated to reduce dissonance, individuals frequently alter their internal attitudes, minimize the stakes, or rationalize their behaviors rather than change observable habits.",
        "resources": [
            {"label": "Leon Festinger: A Theory of Cognitive Dissonance (Stanford University Press 1957)", "url": "https://www.sup.org/books/title/?id=3850"},
            {"label": "Leon Festinger & James M. Carlsmith: Cognitive Consequences of Forced Compliance (Journal of Abnormal and Social Psychology 1959)", "url": "https://psycnet.apa.org/record/1960-01103-001"},
            {"label": "Carol Tavris & Elliot Aronson: Mistakes Were Made (But Not by Me) (Mariner Books)", "url": "https://www.harpercollins.com/products/mistakes-were-made-but-not-by-me-third-edition-carol-tavriselliot-aronson"}
        ]
    },
    {
        "id": "social-proof-and-informational-cascades",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "social-proof;cialdini;informational-cascades;herding;persuasion",
        "title": "Social Proof & Informational Cascades: Behavioral Validation via Others",
        "description": "Robert Cialdini's Social Proof principle describes the tendency to view a behavior as correct in a given situation to the degree that we see others performing it, especially under conditions of ambiguity or similarity. In economics and sociology, this compounds into Informational Cascades, where individuals abandon their private signals to follow public consensus.",
        "resources": [
            {"label": "Robert B. Cialdini: Influence: The Psychology of Persuasion (Harper Business)", "url": "https://www.harpercollins.com/products/influence-new-and-expanded-robert-b-cialdini"},
            {"label": "Sushil Bikhchandani, David Hirshleifer, Ivo Welch: A Theory of Fads, Fashion, Custom, and Cultural Change as Informational Cascades (JPE 1992)", "url": "https://www.journals.uchicago.edu/doi/abs/10.1086/261849"},
            {"label": "Journal of Consumer Research: Social Proof Mechanics in Decision Making", "url": "https://academic.oup.com/jcr"}
        ]
    },
    {
        "id": "realistic-conflict-theory-and-robbers-cave-experiment",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "realistic-conflict-theory;robbers-cave;muzafer-sherif;superordinate-goals;prejudice",
        "title": "Realistic Conflict Theory: Resource Scarcity & Superordinate Goals",
        "description": "Muzafer Sherif's Robbers Cave experiment showed that intergroup hostility, prejudice, and aggressive stereotypes arise spontaneously when groups compete for zero-sum scarce resources (Realistic Conflict Theory). Crucially, Sherif proved that prejudice could only be resolved by introducing 'superordinate goals' requiring interdependent cooperative collaboration.",
        "resources": [
            {"label": "Muzafer Sherif et al.: Intergroup Conflict and Cooperation: The Robbers Cave Experiment (University of Oklahoma Book Exchange 1961)", "url": "https://psychclassics.yorku.ca/Sherif/index.htm"},
            {"label": "Donald T. Campbell: Ethnocentric and Other Altruistic Motives (Nebraska Symposium on Motivation 1965)", "url": "https://www.worldcat.org/title/nebraska-symposium-on-motivation-1965/oclc/492582845"},
            {"label": "American Psychological Association: Intergroup Conflict and Superordinate Goals Overview", "url": "https://dictionary.apa.org/realistic-group-conflict-theory"}
        ]
    },
    {
        "id": "just-world-hypothesis-and-victim-blaming",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "just-world-hypothesis;social-psychology;melvin-lerner;cognitive-bias;ethics",
        "title": "The Just-World Hypothesis: Psychological Need for Order & Victim Blaming",
        "description": "Melvin Lerner formulated the Just-World Hypothesis to explain how the cognitive need to view the world as fair, predictable, and orderly causes people to assume that noble actions are rewarded and evil is punished ('people get what they deserve'). When confronted with tragic, unearned suffering that threatens this illusion, observers frequently resort to victim blaming to preserve their sense of security.",
        "resources": [
            {"label": "Melvin J. Lerner: The Belief in a Just World: A Fundamental Delusion (Plenum Press 1980)", "url": "https://link.springer.com/book/10.1007/978-1-4899-0448-5"},
            {"label": "Melvin J. Lerner & Carolyn H. Simmons: Observer's Reaction to the 'Innocent Victim': Compassion or Rejection? (JPSP 1966)", "url": "https://psycnet.apa.org/record/1966-10706-001"},
            {"label": "American Psychological Association: The Belief in a Just World and Defensive Attributions", "url": "https://dictionary.apa.org/just-world-hypothesis"}
        ]
    },
    {
        "id": "false-consensus-effect-and-egocentric-projection",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "false-consensus;social-cognition;lee-ross;egocentric-bias;social-psychology",
        "title": "The False Consensus Effect: Overestimating Shared Beliefs",
        "description": "Lee Ross, David Greene, and Pamela House proved that people systematically overestimate the degree to which their personal beliefs, values, habits, and preferences are shared by the broader population. Driven by egocentric availability and cognitive anchoring, individuals perceive alternative viewpoints as deviant, irrational, or statistically abnormal.",
        "resources": [
            {"label": "Lee Ross, David Greene, Pamela House: The 'False Consensus Effect': An Egocentric Bias in Social Perception and Attribution Processes (JESP 1977)", "url": "https://www.sciencedirect.com/science/article/pii/002210317790049X"},
            {"label": "Joachim Krueger & Russell W. Clement: The Truly False Consensus Effect: An Ineradicable and Egocentric Bias in Social Perception (JPSP 1994)", "url": "https://psycnet.apa.org/record/1995-07204-001"},
            {"label": "American Psychological Association: False Consensus Effect Overview", "url": "https://dictionary.apa.org/false-consensus-effect"}
        ]
    },
    {
        "id": "compliance-techniques-foot-in-the-door-vs-door-in-the-face",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "compliance;foot-in-the-door;door-in-the-face;reciprocity;self-perception;persuasion",
        "title": "Sequential Compliance: Foot-in-the-Door vs Door-in-the-Face Paradigms",
        "description": "Sequential request strategies exploit distinct cognitive mechanisms to maximize behavioral compliance. The Foot-in-the-Door technique secures agreement to a major commitment by first gaining consent to a trivial initial request (mediated by self-perception consistency), whereas the Door-in-the-Face technique follows an extreme, rejected request with a moderate target request (mediated by reciprocal concessions and contrast effects).",
        "resources": [
            {"label": "Jonathan L. Freedman & Scott C. Fraser: Compliance Without Pressure: The Foot-in-the-Door Technique (JPSP 1966)", "url": "https://psycnet.apa.org/record/1966-11885-001"},
            {"label": "Robert B. Cialdini et al.: Reciprocal Concessions Procedure for Inducing Compliance: The Door-in-the-Face Technique (JPSP 1975)", "url": "https://psycnet.apa.org/record/1975-23098-001"},
            {"label": "American Psychological Association: Social Influence and Compliance Mechanisms", "url": "https://dictionary.apa.org/compliance"}
        ]
    },

    # =========================================================================
    # 3. Memory & Learning Science
    # =========================================================================
    {
        "id": "ebbinghaus-forgetting-curve-and-spaced-repetition",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "memory;forgetting-curve;spaced-repetition;ebbinghaus;learning-science",
        "title": "The Ebbinghaus Forgetting Curve & Spaced Repetition Mechanics",
        "description": "Hermann Ebbinghaus discovered that memory retention decays exponentially over time following initial learning unless actively reinforced (R = e^(-t/S)). Spaced repetition counteracts this decay by scheduling reviews at strategically expanding intervals just as forgetting begins, consolidating short-term memory traces into durable long-term storage.",
        "resources": [
            {"label": "Hermann Ebbinghaus: Memory: A Contribution to Experimental Psychology (Translated by H. Ruger & C. Bussenius 1913)", "url": "https://psychclassics.yorku.ca/Ebbinghaus/index.htm"},
            {"label": "Nicholas J. Cepeda et al.: Spacing Effects in Learning: A Temporal Analysis (Psychological Bulletin 2006)", "url": "https://psycnet.apa.org/record/2006-03915-006"},
            {"label": "Piotr Wozniak: SuperMemo Theoretical Background: Optimization of Learning", "url": "https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method"}
        ]
    },
    {
        "id": "retrieval-practice-and-the-testing-effect",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "testing-effect;retrieval-practice;cognitive-psychology;learning;memory",
        "title": "Retrieval Practice: The Testing Effect & Desirable Difficulties in Learning",
        "description": "Henry Roediger and Jeffrey Karpicke proved that actively retrieving information from memory via self-testing produces substantially greater long-term retention than passive rereading or highlighting. Known as the Testing Effect, effortful retrieval strengthens neural retrieval pathways (a 'desirable difficulty') and highlights true knowledge gaps.",
        "resources": [
            {"label": "Henry L. Roediger III & Jeffrey D. Karpicke: The Power of Testing Memory: Basic Research and Implications for Practice (Perspectives on Psychological Science 2006)", "url": "https://journals.sagepub.com/doi/abs/10.1111/j.1745-6916.2006.00012.x"},
            {"label": "Robert A. Bjork: Memory and Metamemory Considerations in the Training of Human Beings (Desirable Difficulties)", "url": "https://bjorklab.psych.ucla.edu/research/"},
            {"label": "American Psychologist: Applying Cognitive Psychology to Enhance Educational Practice", "url": "https://www.apa.org/pubs/journals/amp"}
        ]
    },
    {
        "id": "working-memory-and-baddeley-multicomponent-model",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "working-memory;baddeley;cognitive-architecture;executive-function;memory",
        "title": "Working Memory Architecture: Baddeley's Multi-Component Model",
        "description": "Alan Baddeley and Graham Hitch replaced the concept of a single short-term memory store with a multi-component working memory model: the Central Executive (attentional control), the Phonological Loop (verbal rehearsal), the Visuospatial Sketchpad (visual imagery), and the Episodic Buffer (integrating multi-modal representations into unified episodes).",
        "resources": [
            {"label": "Alan D. Baddeley & Graham Hitch: Working Memory (Psychology of Learning and Motivation 1974)", "url": "https://www.sciencedirect.com/science/article/pii/S0079742108604521"},
            {"label": "Alan Baddeley: Working Memory: Theories, Models, and Controversies (Annual Review of Psychology 2012)", "url": "https://www.annualreviews.org/doi/abs/10.1146/annurev-psych-120710-100422"},
            {"label": "Nature Reviews Neuroscience: The Functional Architecture of Human Working Memory", "url": "https://www.nature.com/articles/nrn1201"}
        ]
    },
    {
        "id": "state-dependent-and-context-dependent-memory",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "memory;context-dependent;state-dependent;encoding-specificity;retrieval",
        "title": "Context & State-Dependent Memory: The Encoding Specificity Principle",
        "description": "Endel Tulving's Encoding Specificity Principle states that memory retrieval is maximized when internal physiological states (mood, caffeine level) or external environmental cues (physical room, sensory environment) match the conditions present during initial memory encoding. Godden and Baddeley's famous scuba diving study proved underwater learning is best recalled underwater.",
        "resources": [
            {"label": "Endel Tulving & Donald M. Thomson: Encoding Specificity and Retrieval Processes in Episodic Memory (Psychological Review 1973)", "url": "https://psycnet.apa.org/record/1974-03222-001"},
            {"label": "Duncan R. Godden & Alan D. Baddeley: Context-Dependent Memory in Two Natural Environments: On Land and Underwater (British Journal of Psychology 1975)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.2044-8295.1975.tb01468.x"},
            {"label": "American Psychological Association: Context-Dependent Memory Definition", "url": "https://dictionary.apa.org/context-dependent-memory"}
        ]
    },
    {
        "id": "memory-reconsolidation-and-misinformation-effect-loftus",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "memory-reconsolidation;elizabeth-loftus;misinformation-effect;eyewitness-testimony;memory",
        "title": "Memory Malleability: Elizabeth Loftus & The Misinformation Effect",
        "description": "Elizabeth Loftus' seminal experiments demonstrated that human memory does not function like a video recording; instead, memories are reconstructed dynamically during recall. Introducing misleading post-event information or suggestive phrasing ('smashed' vs 'hit') rewrites episodic memory traces through memory reconsolidation, implanting entirely false recollections with high subjective confidence.",
        "resources": [
            {"label": "Elizabeth F. Loftus & John C. Palmer: Reconstruction of Automobile Destruction: An Example of the Interaction Between Language and Memory (JVLVB 1974)", "url": "https://www.sciencedirect.com/science/article/pii/S0022537174800113"},
            {"label": "Elizabeth F. Loftus: Planting False Memories in the Human Mind: A 30-Year Investigation (Learning & Memory 2005)", "url": "https://learnmem.cshlp.org/content/12/4/361.short"},
            {"label": "American Psychologist: Eyewitness Memory and Legal System Reforms", "url": "https://www.apa.org/pubs/journals/amp"}
        ]
    },
    {
        "id": "dual-coding-theory-paivio",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "dual-coding;allan-paivio;cognitive-psychology;visual-memory;learning",
        "title": "Dual-Coding Theory: Verbal and Nonverbal Cognitive Subsystems",
        "description": "Allan Paivio's Dual-Coding Theory proposes that the human mind processes information through two separate but interconnected channels: a verbal system for linguistic text and auditory speech (logogens) and a nonverbal system for visual images and spatial mental maps (imagens). When information is encoded simultaneously through both channels, retrieval pathways are doubled.",
        "resources": [
            {"label": "Allan Paivio: Dual Coding Theory: Retrospect and Current Status (Canadian Journal of Psychology 1991)", "url": "https://psycnet.apa.org/record/1992-07011-001"},
            {"label": "Allan Paivio: Mental Representations: A Dual Coding Approach (Oxford University Press)", "url": "https://global.oup.com/academic/product/mental-representations-9780195066661"},
            {"label": "Educational Psychology Review: Multimedia Learning and Dual-Coding Foundations", "url": "https://link.springer.com/journal/10648"}
        ]
    },
    {
        "id": "levels-of-processing-framework-craik-lockhart",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "levels-of-processing;craik-lockhart;semantic-encoding;memory;cognitive-psychology",
        "title": "Levels of Processing: Structural, Phonemic & Deep Semantic Encoding",
        "description": "Fergus Craik and Robert Lockhart challenged structural store models of memory by showing that memory durability is a direct function of the depth of cognitive processing applied during encoding. Shallow processing (analyzing font case or rhyming sounds) yields fragile memory traces, whereas deep semantic processing (analyzing meaning, personal relevance, and conceptual linkages) produces resilient retention.",
        "resources": [
            {"label": "Fergus I. M. Craik & Robert S. Lockhart: Levels of Processing: A Framework for Memory Research (JVLVB 1972)", "url": "https://www.sciencedirect.com/science/article/pii/S002253717280001X"},
            {"label": "Fergus I. M. Craik & Endel Tulving: Depth of Processing and the Retention of Words in Episodic Memory (JEP: General 1975)", "url": "https://psycnet.apa.org/record/1975-23114-001"},
            {"label": "American Psychological Association: Depth of Processing Theory Overview", "url": "https://dictionary.apa.org/levels-of-processing"}
        ]
    },
    {
        "id": "interleaving-effect-vs-blocked-practice",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "interleaving;blocked-practice;learning-science;cognitive-psychology;skill-acquisition",
        "title": "The Interleaving Effect: Category Discrimination vs Blocked Practice",
        "description": "The interleaving effect occurs when learners alternate between different but related problem types or skills during a study session, rather than practicing one skill in a continuous block (blocked practice). While blocked practice feels easier during acquisition, interleaving forces the brain to practice identifying underlying problem categories and selecting the appropriate strategy, leading to superior long-term transfer.",
        "resources": [
            {"label": "Nate Kornell & Robert A. Bjork: Learning Concepts and Categories: Is Spacing the 'Enemy of Induction'? (Psychological Science 2008)", "url": "https://journals.sagepub.com/doi/10.1111/j.1467-9280.2008.02127.x"},
            {"label": "Doug Rohrer & Kelli Taylor: The Shuffling of Mathematics Problems Improves Learning (Instructional Science 2007)", "url": "https://link.springer.com/article/10.1007/s11251-007-9015-8"},
            {"label": "Scientific American: The Surprising Power of Interleaving", "url": "https://www.scientificamerican.com/"}
        ]
    },
    {
        "id": "schema-theory-and-constructive-memory-bartlett",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "schema-theory;constructive-memory;frederic-bartlett;war-of-the-ghosts;cognitive-psychology",
        "title": "Schema Theory & Constructive Memory: Frederic Bartlett's Cultural Schemas",
        "description": "Sir Frederic Bartlett's 'War of the Ghosts' studies demonstrated that human memory retrieval is inherently constructive rather than reproductive. When recalling unfamiliar narrative material, individuals unconsciously assimilate, level, and sharpen details to conform to their existing cultural schemas and worldview expectations.",
        "resources": [
            {"label": "Frederic C. Bartlett: Remembering: An Experimental and Social Study (Cambridge University Press 1932)", "url": "https://www.cambridge.org/core/books/remembering/FE3D133D1905E51860BDE406D70C92F3"},
            {"label": "Richard C. Anderson: Schema-Directed Processes in Language Comprehension (Cognitive Psychology 1977)", "url": "https://www.sciencedirect.com/"},
            {"label": "American Psychological Association: Schema Theory Definition & Cognitive Architecture", "url": "https://dictionary.apa.org/schema"}
        ]
    },
    {
        "id": "dual-process-theory-system-1-vs-system-2",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "dual-process;system-1;system-2;kahneman;stanovich;cognitive-architecture",
        "title": "Dual-Process Theory: System 1 Intuition vs System 2 Deliberation",
        "description": "Keith Stanovich, Richard West, and Daniel Kahneman conceptualized cognition through Dual-Process Theory: System 1 operates automatically, rapidly, effortlessly, and associatively with no sense of voluntary control, while System 2 allocates attention to effortful mental operations, complex computations, and rule-governed logic. Cognitive laziness (System 2 default endorsement) accounts for many reasoning errors.",
        "resources": [
            {"label": "Keith E. Stanovich & Richard F. West: Individual Differences in Reasoning: Implications for the Rationality Debate? (Behavioral and Brain Sciences 2000)", "url": "https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/individual-differences-in-reasoning-implications-for-the-rationality-debate/9991E3B83F3767C74FF6C2758252C322"},
            {"label": "Jonathan St. B. T. Evans & Keith E. Stanovich: Dual-Process Theories of Higher Cognition: Advancing the Debate (Perspectives on Psychological Science 2013)", "url": "https://journals.sagepub.com/doi/abs/10.1177/1745691612460685"},
            {"label": "Daniel Kahneman: Thinking, Fast and Slow (Farrar, Straus and Giroux)", "url": "https://us.macmillan.com/books/9780374533557/thinkingfastandslow"}
        ]
    },

    # =========================================================================
    # 4. Motivation Theory & Goal Mechanics
    # =========================================================================
    {
        "id": "self-determination-theory-autonomy-competence-relatedness",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "self-determination-theory;sdt;motivation;ryan-and-deci;intrinsic-motivation",
        "title": "Self-Determination Theory: Autonomy, Competence & Relatedness",
        "description": "Edward Deci and Richard Ryan's Self-Determination Theory (SDT) posits that human psychological flourishing and high-quality intrinsic motivation depend on the satisfaction of three basic psychological needs: Autonomy (the experience of volition and self-endorsement), Competence (feeling effective in interacting with the environment), and Relatedness (feeling connected and caring for others).",
        "resources": [
            {"label": "Richard M. Ryan & Edward L. Deci: Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being (American Psychologist 2000)", "url": "https://psycnet.apa.org/record/2000-13324-007"},
            {"label": "Self-Determination Theory Official Academic Research Center", "url": "https://selfdeterminationtheory.org/"},
            {"label": "Edward L. Deci: Why We Do What We Do: Understanding Self-Motivation (Penguin)", "url": "https://www.penguinrandomhouse.com/books/32338/why-we-do-what-we-do-by-edward-l-deci/"}
        ]
    },
    {
        "id": "overjustification-effect-and-extrinsic-incentives",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "overjustification;motivation;extrinsic-rewards;behavioral-psychology",
        "title": "The Overjustification Effect: How Extrinsic Rewards Erode Intrinsic Drive",
        "description": "The overjustification effect occurs when introducing contingent extrinsic incentives (money, prizes) for an activity that was previously performed for pure intrinsic enjoyment causes individuals to attribute their motivation entirely to the external reward. When the reward is removed, participation drops below pre-reward baseline levels.",
        "resources": [
            {"label": "Edward L. Deci: Effects of Externally Mediated Rewards on Intrinsic Motivation (JPSP 1971)", "url": "https://psycnet.apa.org/record/1971-10023-001"},
            {"label": "Mark R. Lepper, David Greene, Richard E. Nisbett: Undermining Children's Intrinsic Interest with Extrinsic Reward (JPSP 1973)", "url": "https://psycnet.apa.org/record/1974-05586-001"},
            {"label": "Harvard Business Review: Why Incentive Plans Cannot Work (Alfie Kohn)", "url": "https://hbr.org/1993/09/why-incentive-plans-cannot-work"}
        ]
    },
    {
        "id": "locke-and-latham-goal-setting-theory",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "goal-setting;motivation;locke-latham;performance;organizational-psychology",
        "title": "Locke & Latham's Goal-Setting Theory: Specificity, Challenge & Feedback",
        "description": "Edwin Locke and Gary Latham's extensive empirical research proved that specific, difficult goals ('stretch goals') produce significantly higher task performance than vague instructions to 'do your best'. High goal achievement relies on five core mechanisms: clarity, challenge, commitment, ongoing feedback loops, and task complexity management.",
        "resources": [
            {"label": "Edwin A. Locke & Gary P. Latham: Building a Practically Useful Theory of Goal Setting and Task Motivation: A 35-Year Odyssey (American Psychologist 2002)", "url": "https://psycnet.apa.org/record/2002-15790-003"},
            {"label": "Edwin A. Locke & Gary P. Latham: A Theory of Goal Setting & Task Performance (Prentice Hall 1990)", "url": "https://www.worldcat.org/title/theory-of-goal-setting-task-performance/oclc/20453303"},
            {"label": "CFA Institute: Goal Setting Mechanics and Performance Architecture", "url": "https://www.cfainstitute.org/"}
        ]
    },
    {
        "id": "regulatory-focus-theory-promotion-vs-prevention",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "regulatory-focus;higgins;motivation;decision-making;psychology",
        "title": "Regulatory Focus Theory: Promotion Focus vs Prevention Focus",
        "description": "E. Tory Higgins' Regulatory Focus Theory distinguishes two fundamental motivational orientations. A Promotion Focus concentrates on advancement, growth, ideals, and maximizing gains (sensitive to presence or absence of positive outcomes), while a Prevention Focus concentrates on security, duties, safety, and avoiding errors (sensitive to presence or absence of negative outcomes).",
        "resources": [
            {"label": "E. Tory Higgins: Beyond Pleasure and Pain (American Psychologist 1997)", "url": "https://psycnet.apa.org/record/1997-38600-001"},
            {"label": "E. Tory Higgins: Making a Good Decision: Value from Fit (American Psychologist 2000)", "url": "https://psycnet.apa.org/record/2000-16886-004"},
            {"label": "Harvard Business Review: Do You Play to Win or Not to Lose?", "url": "https://hbr.org/2013/03/do-you-play-to-win-or-not-to-lose"}
        ]
    },
    {
        "id": "self-efficacy-theory-albert-bandura",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "self-efficacy;albert-bandura;social-cognitive-theory;mastery;motivation",
        "title": "Bandura's Self-Efficacy Theory: Mastery Experiences & Agency",
        "description": "Albert Bandura defined self-efficacy as an individual's belief in their capacity to execute behaviors necessary to produce specific performance attainments. Self-efficacy determines goal choice, effort expenditure, and persistence under adversity, constructed through four sources: mastery experiences, vicarious modeling, social persuasion, and physiological state interpretation.",
        "resources": [
            {"label": "Albert Bandura: Self-Efficacy: Toward a Unifying Theory of Behavioral Change (Psychological Review 1977)", "url": "https://psycnet.apa.org/record/1977-25733-001"},
            {"label": "Albert Bandura: Self-Efficacy: The Exercise of Control (W. H. Freeman)", "url": "https://www.macmillanlearning.com/college/us/product/Self-Efficacy/p/0716728508"},
            {"label": "American Psychological Association: Self-Efficacy Research & Bandura Legacy", "url": "https://www.apa.org/pi/aids/resources/education/self-efficacy"}
        ]
    },
    {
        "id": "temporal-discounting-and-hyperbolic-discounting-function",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "temporal-discounting;hyperbolic-discounting;intertemporal-choice;delay-of-gratification;behavioral-economics",
        "title": "Temporal Discounting: Hyperbolic Preference Decay & Intertemporal Choice",
        "description": "Temporal discounting describes how the subjective value of a reward decreases as the delay until its receipt increases. Unlike standard exponential discounting models in neoclassical economics, human psychology follows a hyperbolic discounting curve, leading to dynamic inconsistency (preference reversals where immediate smaller rewards hijack long-term larger goals).",
        "resources": [
            {"label": "George Ainslie: Picoeconomics: The Strategic Interaction of Successive Motivational States Within the Person (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/picoeconomics/045C89F70D22F5F78DA39C4E5AC488CE"},
            {"label": "David Laibson: Golden Eggs and Hyperbolic Discounting (Quarterly Journal of Economics 1997)", "url": "https://academic.oup.com/qje/article/112/2/443/1873133"},
            {"label": "Annual Review of Psychology: Intertemporal Choice and Neuroeconomics of Self-Control", "url": "https://www.annualreviews.org/"}
        ]
    },
    {
        "id": "expectancy-value-theory-vroom-work-motivation",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "expectancy-theory;victor-vroom;work-motivation;valence;instrumentality",
        "title": "Expectancy-Value Theory: Victor Vroom's Motivation Calculus",
        "description": "Victor Vroom's Expectancy Theory models conscious motivation as a multiplicative function of three variables: Expectancy (belief that effort leads to performance), Instrumentality (belief that performance will be rewarded), and Valence (subjective value assigned to the reward). If any single component is zero, total motivational force collapses.",
        "resources": [
            {"label": "Victor H. Vroom: Work and Motivation (John Wiley & Sons 1964)", "url": "https://www.worldcat.org/title/work-and-motivation/oclc/186524"},
            {"label": "Allan D. Wigfield & Jacquelynne S. Eccles: Expectancy-Value Theory of Achievement Motivation (Contemporary Educational Psychology 2000)", "url": "https://www.sciencedirect.com/science/article/pii/S0361476X99910159"},
            {"label": "Academy of Management Review: Expectancy Theory Extensions in Organizational Design", "url": "https://journals.aom.org/journal/amr"}
        ]
    },

    # =========================================================================
    # 5. Personality Frameworks & Trait Theory
    # =========================================================================
    {
        "id": "big-five-personality-traits-ocean-model",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "big-five;ocean-model;personality-traits;psychometrics;costa-mccrae",
        "title": "The Big Five Personality Architecture: The OCEAN Factor Model",
        "description": "The Five-Factor Model (Big Five) is the gold standard of contemporary psychometrics, identifying five broad, cross-culturally replicated dimensional spectrums: Openness to experience, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (OCEAN). Unlike categorical typologies, the Big Five scores individuals along continuous bell curves.",
        "resources": [
            {"label": "Robert R. McCrae & Paul T. Costa Jr.: Personality in Adulthood: A Five-Factor Theory Perspective (Guilford Press)", "url": "https://www.guilford.com/books/Personality-in-Adulthood/McCrae-Costa/9781593854041"},
            {"label": "Lewis R. Goldberg: The Structure of Phenotypic Personality Traits (American Psychologist 1993)", "url": "https://psycnet.apa.org/record/1993-14407-001"},
            {"label": "Annual Review of Psychology: The Five-Factor Model of Personality Across Cultures", "url": "https://www.annualreviews.org/doi/abs/10.1146/annurev.psych.53.100901.135246"}
        ]
    },
    {
        "id": "psychometric-critiques-of-the-mbti",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "mbti;psychometrics;test-retest-reliability;bimodal-distribution;personality",
        "title": "Psychometric Critiques of the MBTI: Reliability, Validity & Bimodality Flaws",
        "description": "Academic personality psychology largely rejects the Myers-Briggs Type Indicator (MBTI) due to three severe psychometric deficiencies: poor test-retest reliability (up to 50% receive a different 4-letter type after 5 weeks), false bimodal categorizations that split normal bell-curve distributions down the middle, and negligible predictive validity for workplace performance compared to the Big Five.",
        "resources": [
            {"label": "David J. Pittenger: Measuring the MBTI... And Coming Up Short (Journal of Career Planning and Employment 1993)", "url": "https://www.semanticscholar.org/paper/Measuring-the-MBTI...-And-Coming-Up-Short-Pittenger/4588e228ecb345dc7187ee055b85a111a43a01ff"},
            {"label": "Robert R. McCrae & Paul T. Costa Jr.: Reinterpreting the Myers-Briggs Type Indicator From the Perspective of the Five-Factor Model of Personality (Journal of Personality 1989)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-6494.1989.tb00759.x"},
            {"label": "Adam Grant: Goodbye to MBTI, the Fad That Won't Die (Psychology Today)", "url": "https://www.psychologytoday.com/us/blog/give-and-take/201309/goodbye-mbti-the-fad-wont-die"}
        ]
    },
    {
        "id": "personality-trait-stability-and-the-maturity-principle",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "personality-development;maturity-principle;lifespan-psychology;trait-stability",
        "title": "Personality Across the Lifespan: Rank-Order Stability & The Maturity Principle",
        "description": "Longitudinal personality studies reveal high rank-order stability (relative standing among peers remains consistent over decades) alongside mean-level change known as the 'Maturity Principle'. As humans age from young adulthood into middle age, population averages show significant increases in Conscientiousness and Agreeableness and steady declines in Neuroticism.",
        "resources": [
            {"label": "Brent W. Roberts, Nathan R. Kuncel, Rebecca Shiner: The Power of Personality: The Comparative Validity of Personality Traits (Perspectives on Psychological Science 2007)", "url": "https://journals.sagepub.com/doi/10.1111/j.1745-6916.2007.00047.x"},
            {"label": "Brent W. Roberts et al.: Patterns of Mean-Level Change in Personality Traits Across the Life Course (Psychological Bulletin 2006)", "url": "https://psycnet.apa.org/record/2006-00043-001"},
            {"label": "American Psychological Association: Personality Stability and Plasticity Over Time", "url": "https://www.apa.org/pubs/journals/psp"}
        ]
    },
    {
        "id": "person-situation-debate-walter-mischel",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "person-situation;walter-mischel;situationism;behavioral-consistency;personality",
        "title": "The Person-Situation Debate: Walter Mischel's Cognitive-Affective Processing",
        "description": "Walter Mischel sparked the historic Person-Situation debate by demonstrating that individual behavior varies dramatically across differing environments (low cross-situational consistency), challenging rigid trait theories. Modern interactionism integrates both views via Mischel's Cognitive-Affective Processing System (CAPS), showing personality manifests as consistent 'if... then...' situational patterns.",
        "resources": [
            {"label": "Walter Mischel: Personality and Assessment (John Wiley & Sons 1968)", "url": "https://www.worldcat.org/title/personality-and-assessment/oclc/438782"},
            {"label": "Walter Mischel & Yuichi Shoda: A Cognitive-Affective System Theory of Personality: Reconceptualizing Situations, Dispositions, Dynamics, and Invariance in Personality Structure (Psychological Review 1995)", "url": "https://psycnet.apa.org/record/1995-28825-001"},
            {"label": "David C. Funder: The Personality Puzzle (W. W. Norton)", "url": "https://wwnorton.com/books/9780393421781"}
        ]
    },
    {
        "id": "dark-triad-personality-traits-paulhus-williams",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "dark-triad;machiavellianism;narcissism;psychopathy;personality-psychology",
        "title": "The Dark Triad: Machiavellianism, Narcissism & Subclinical Psychopathy",
        "description": "Delroy Paulhus and Kevin Williams identified the Dark Triad: three distinct but overlapping subclinical personality constellations characterized by callousness and interpersonal manipulation. Machiavellianism involves cynical pragmatism and strategic exploitation; Narcissism entails grandiosity, entitlement, and vanity; Subclinical Psychopathy features impulsivity, thrill-seeking, and low empathy.",
        "resources": [
            {"label": "Delroy L. Paulhus & Kevin M. Williams: The Dark Triad of Personality: Narcissism, Machiavellianism, and Psychopathy (Journal of Research in Personality 2002)", "url": "https://www.sciencedirect.com/science/article/pii/S0092656602005056"},
            {"label": "Peter K. Jonason & Gregory D. Webster: The Dirty Dozen: A Concise Measure of the Dark Triad (Psychological Assessment 2010)", "url": "https://psycnet.apa.org/record/2010-09689-012"},
            {"label": "Perspectives on Psychological Science: The Dark Triad and Evolutionary Behavioral Ecology", "url": "https://journals.sagepub.com/home/pps"}
        ]
    },
    {
        "id": "locus-of-control-internal-vs-external-rotter",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "locus-of-control;julian-rotter;social-learning-theory;attribution;personality",
        "title": "Locus of Control: Julian Rotter's Internal vs External Expectancy Spectrum",
        "description": "Julian Rotter formulated Locus of Control to describe individual generalized expectancies regarding the source of life reinforcements. Individuals with an Internal Locus believe life outcomes stem primarily from personal agency, effort, and decisions, whereas those with an External Locus attribute life events to chance, fate, luck, or powerful external forces.",
        "resources": [
            {"label": "Julian B. Rotter: Generalized Expectancies for Internal Versus External Control of Reinforcement (Psychological Monographs 1966)", "url": "https://psycnet.apa.org/record/1966-10707-001"},
            {"label": "Julian B. Rotter: Social Learning and Clinical Psychology (Prentice-Hall 1954)", "url": "https://www.worldcat.org/title/social-learning-and-clinical-psychology/oclc/492582845"},
            {"label": "American Psychological Association: Locus of Control Definition & Measurement Scale", "url": "https://dictionary.apa.org/locus-of-control"}
        ]
    },
    {
        "id": "hexaco-personality-inventory-honesty-humility",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "hexaco;honesty-humility;personality-traits;ashton-lee;psychometrics",
        "title": "The HEXACO Model of Personality: The Honesty-Humility Factor",
        "description": "Kibeom Lee and Michael Ashton developed the HEXACO model from cross-cultural lexical studies, expanding the Big Five to six dimensions by introducing 'Honesty-Humility' (H). Measuring sincerity, fairness, greed-avoidance, and modesty, the Honesty-Humility factor offers significantly superior predictive power over the Big Five for detecting unethical behaviors and workplace delinquency.",
        "resources": [
            {"label": "Michael C. Ashton & Kibeom Lee: Empirical, Theoretical, and Practical Advantages of the HEXACO Model of Personality Structure (Personality and Social Psychology Review 2007)", "url": "https://journals.sagepub.com/doi/abs/10.1177/1088868306294907"},
            {"label": "HEXACO Personality Inventory Official Academic Portal", "url": "https://hexaco.org/"},
            {"label": "Journal of Personality: The HEXACO Framework Across 12 Cultures", "url": "https://onlinelibrary.wiley.com/journal/14676494"}
        ]
    },

    # =========================================================================
    # 6. Emotion & Affective Science
    # =========================================================================
    {
        "id": "theories-of-emotion-james-lange-vs-cannon-bard",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "emotion-theories;james-lange;cannon-bard;schachter-singer;affective-science",
        "title": "Theories of Emotion: James-Lange, Cannon-Bard & Schachter-Singer Two-Factor",
        "description": "Classical affective psychology debates the causal sequence of emotion. The James-Lange theory argues that physiological arousal triggers subjective feeling (we feel afraid because we tremble); Cannon-Bard claims physiological arousal and conscious emotional feeling occur simultaneously in parallel; and Schachter-Singer's Two-Factor theory posits that physiological arousal is cognitively labeled based on environmental context.",
        "resources": [
            {"label": "William James: What is an Emotion? (Mind 1884)", "url": "https://psychclassics.yorku.ca/James/emotion.htm"},
            {"label": "Walter B. Cannon: The James-Lange Theory of Emotions: A Critical Examination and an Alternative Theory (AJPsych 1927)", "url": "https://www.jstor.org/stable/1415404"},
            {"label": "Stanley Schachter & Jerome E. Singer: Cognitive, Social, and Physiological Determinants of Emotional State (Psychological Review 1962)", "url": "https://psycnet.apa.org/record/1963-06046-001"}
        ]
    },
    {
        "id": "theory-of-constructed-emotion-lisa-feldman-barrett",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "constructed-emotion;lisa-feldman-barrett;emotional-granularity;neuroscience",
        "title": "The Theory of Constructed Emotion & Emotional Granularity",
        "description": "Lisa Feldman Barrett's Theory of Constructed Emotion upends classical views of dedicated emotional circuits in the brain. The brain acts as a predictive organ that constructs emotional instances by categorizing raw interoceptive sensations (affect) through learned cultural concepts. Cultivating high 'emotional granularity' (distinguishing frustration from despair or exhaustion) improves physiological regulation and cognitive resilience.",
        "resources": [
            {"label": "Lisa Feldman Barrett: How Emotions Are Made: The Secret Life of the Brain (Houghton Mifflin Harcourt)", "url": "https://lisafeldmanbarrett.com/books/how-emotions-are-made/"},
            {"label": "Lisa Feldman Barrett: The Theory of Constructed Emotion: An Active Inference Account of Interoception and Categorization (Social Cognitive and Affective Neuroscience 2017)", "url": "https://academic.oup.com/scan/article/12/1/1/2823712"},
            {"label": "Nature Reviews Neuroscience: Emotional Granularity and Cognitive Control Systems", "url": "https://www.nature.com/articles/nrn"}
        ]
    },
    {
        "id": "gross-process-model-of-emotion-regulation",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "emotion-regulation;james-gross;cognitive-reappraisal;expressive-suppression",
        "title": "James Gross's Process Model of Emotion Regulation: Reappraisal vs Suppression",
        "description": "James Gross's Process Model tracks emotion regulation across five temporal stages: Situation Selection, Situation Modification, Attentional Deployment, Cognitive Reappraisal, and Response Modulation (Suppression). Antecedent-focused strategies (cognitive reappraisal) reduce emotional distress and sympathetic arousal without cognitive cost, whereas response-focused strategies (expressive suppression) impair memory and elevate cardiovascular strain.",
        "resources": [
            {"label": "James J. Gross: The Emerging Field of Emotion Regulation: An Integrative Review (Review of General Psychology 1998)", "url": "https://journals.sagepub.com/doi/10.1037/1089-2680.2.3.271"},
            {"label": "James J. Gross: Emotion Regulation: Conceptual and Empirical Foundations (Handbook of Emotion Regulation, Guilford Press)", "url": "https://www.guilford.com/books/Handbook-of-Emotion-Regulation/James-Gross/9781462503506"},
            {"label": "Psychological Bulletin: Comparing Cognitive Reappraisal and Expressive Suppression Across Contexts", "url": "https://psycnet.apa.org/record/2003-05995-001"}
        ]
    },
    {
        "id": "somatic-marker-hypothesis-antonio-damasio",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "somatic-marker;antonio-damasio;ventromedial-prefrontal;decision-making;neuroscience",
        "title": "The Somatic Marker Hypothesis: Bodily Feedback in Decision-Making",
        "description": "Antonio Damasio's Somatic Marker Hypothesis posits that emotional processes and bodily physiological signals (somatic markers, such as heart rate fluctuations or gut arousal) guide and bias decision-making under uncertainty. Processed primarily in the ventromedial prefrontal cortex (vmPFC), somatic markers unconsciously filter options before conscious deliberation begins.",
        "resources": [
            {"label": "Antonio R. Damasio: Descartes' Error: Emotion, Reason, and the Human Brain (Putnam)", "url": "https://www.penguinrandomhouse.com/books/32386/descartes-error-by-antonio-damasio/"},
            {"label": "Antoine Bechara, Antonio R. Damasio, Daniel Tranel, Hanna Damasio: Deciding Advantageously Before Knowing the Advantageous Strategy (Science 1997)", "url": "https://www.science.org/doi/10.1126/science.275.5304.1293"},
            {"label": "Trends in Cognitive Sciences: The Somatic Marker Hypothesis and Neurobiology of Decision Making", "url": "https://www.cell.com/trends/cognitive-sciences/home"}
        ]
    },

    # =========================================================================
    # 7. Developmental Psychology
    # =========================================================================
    {
        "id": "attachment-theory-bowlby-and-ainsworth-strange-situation",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "attachment-theory;john-bowlby;mary-ainsworth;strange-situation;developmental-psychology",
        "title": "Attachment Theory: Strange Situation Classification & Internal Working Models",
        "description": "Pioneered by John Bowlby and experimentally operationalized by Mary Ainsworth's Strange Situation paradigm, Attachment Theory categorizes infant relational patterns as Secure, Anxious-Ambivalent (Insecure-Resistant), or Anxious-Avoidant (later joined by Disorganized). Early attachment bonds construct internal working models that influence adult relationship dynamics.",
        "resources": [
            {"label": "John Bowlby: Attachment and Loss: Vol. 1 Attachment (Basic Books)", "url": "https://www.basicbooks.com/titles/john-bowlby/attachment-and-loss-volume-1/9780465005437/"},
            {"label": "Mary D. Salter Ainsworth et al.: Patterns of Attachment: A Psychological Study of the Strange Situation (Lawrence Erlbaum Associates)", "url": "https://www.taylorfrancis.com/books/mono/10.4324/9781315802244/patterns-attachment-mary-ainsworth-blehar-waters-wall"},
            {"label": "Child Development: The Long-Term Trajectory of Infant Attachment Classifications", "url": "https://srcd.onlinelibrary.wiley.com/journal/14678624"}
        ]
    },
    {
        "id": "piaget-stages-of-cognitive-development",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "piaget;cognitive-development;developmental-psychology;object-permanence;conservation",
        "title": "Piaget's Stages of Cognitive Development: Assimilation, Accommodation & Equilibration",
        "description": "Jean Piaget proposed that children construct mental schemas of the world through four sequential developmental stages: Sensorimotor (object permanence, ages 0-2), Preoperational (egocentrism and symbolic thought, ages 2-7), Concrete Operational (conservation and logical operations on tangible objects, ages 7-11), and Formal Operational (abstract deductive reasoning, 12+).",
        "resources": [
            {"label": "Jean Piaget: The Origins of Intelligence in Children (International Universities Press 1952)", "url": "https://www.worldcat.org/title/origins-of-intelligence-in-children/oclc/191242"},
            {"label": "Jean Piaget: The Construction of Reality in the Child (Basic Books 1954)", "url": "https://www.worldcat.org/title/construction-of-reality-in-the-child/oclc/385848"},
            {"label": "Stanford Encyclopedia of Philosophy: Piaget's Cognitive Developmental Architecture", "url": "https://plato.stanford.edu/"}
        ]
    },
    {
        "id": "vygotsky-zone-of-proximal-development-and-scaffolding",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "vygotsky;zpd;scaffolding;sociocultural-theory;developmental-psychology",
        "title": "Vygotsky's Sociocultural Theory: The Zone of Proximal Development (ZPD)",
        "description": "Lev Vygotsky argued that cognitive development is fundamentally social and mediated through cultural language tools. The Zone of Proximal Development (ZPD) defines the distance between what a learner can achieve independently and what they can accomplish with guided assistance ('scaffolding') from a More Knowledgeable Other (MKO).",
        "resources": [
            {"label": "Lev S. Vygotsky: Mind in Society: The Development of Higher Psychological Processes (Harvard University Press 1978)", "url": "https://www.hup.harvard.edu/books/9780674576292"},
            {"label": "Jerome S. Bruner: The Role of Tutoring in Problem Solving (Scaffolding Concept)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.2044-8295.1976.tb01509.x"},
            {"label": "Educational Psychologist: Sociocultural Approaches to Learning and Development", "url": "https://www.tandfonline.com/journals/hedp20"}
        ]
    },
    {
        "id": "adolescent-brain-development-prefrontal-cortex-vs-limbic",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "neurodevelopment;adolescence;prefrontal-cortex;limbic-system;myelination",
        "title": "Adolescent Neurodevelopment: The Dual-Systems Model & Synaptic Pruning",
        "description": "Neuroimaging demonstrates that the adolescent brain undergoes asynchronous maturation: the limbic dopamine reward system develops early, while the prefrontal cortex (executive function, risk assessment, impulse control) continues synaptic pruning and myelination well into the mid-20s. This dual-systems gap explains heightened sensation-seeking and peer-sensitive risk-taking in adolescents.",
        "resources": [
            {"label": "Laurence Steinberg: A Social Neuroscience Perspective on Adolescent Risk-Taking (Developmental Review 2008)", "url": "https://www.sciencedirect.com/science/article/pii/S0273229707000473"},
            {"label": "B. J. Casey et al.: The Adolescent Brain (Annals of the New York Academy of Sciences 2008)", "url": "https://nyaspubs.onlinelibrary.wiley.com/doi/abs/10.1196/annals.1440.010"},
            {"label": "National Institute of Mental Health (NIMH): The Teen Brain: 7 Things to Know", "url": "https://www.nimh.nih.gov/health/publications/the-teen-brain-7-things-to-know"}
        ]
    },
    {
        "id": "theory-of-mind-and-false-belief-tasks",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "theory-of-mind;sally-anne-test;developmental-psychology;cognitive-development;social-cognition",
        "title": "Theory of Mind: False-Belief Tasks & Mental State Attribution",
        "description": "Theory of Mind (ToM) is the cognitive capacity to attribute mental states—beliefs, intents, desires, and emotions—to oneself and others, recognizing that others possess beliefs distinct from one's own. Demonstrated via the Sally-Anne False-Belief task, typically developing children achieve this milestone around age 4 to 5.",
        "resources": [
            {"label": "Simon Baron-Cohen, Alan M. Leslie, Uta Frith: Does the Autistic Child Have a 'Theory of Mind'? (Cognition 1985)", "url": "https://www.sciencedirect.com/science/article/pii/0010027785900228"},
            {"label": "Heinz Wimmer & Josef Perner: Beliefs About Beliefs: Representation and Constraining Function of Wrong Beliefs in Young Children (Cognition 1983)", "url": "https://www.sciencedirect.com/science/article/pii/0010027783900045"},
            {"label": "Trends in Cognitive Sciences: Neurodevelopmental Foundations of Theory of Mind", "url": "https://www.cell.com/trends/cognitive-sciences/home"}
        ]
    },
    {
        "id": "erikson-stages-of-psychosocial-development",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "erikson;psychosocial-development;identity-crisis;lifespan-psychology;development",
        "title": "Erikson's Psychosocial Stages: Eight Lifespan Crises & Identity Formation",
        "description": "Erik Erikson outlined an eight-stage epigenetic model of human psychosocial development spanning infancy to late adulthood. Each stage is characterized by a core psychosocial crisis (e.g. Trust vs Mistrust, Identity vs Role Confusion, Generativity vs Stagnation) whose resolution builds vital psychological virtues like fidelity and wisdom.",
        "resources": [
            {"label": "Erik H. Erikson: Childhood and Society (W. W. Norton 1950)", "url": "https://wwnorton.com/books/9780393310689"},
            {"label": "Erik H. Erikson: Identity: Youth and Crisis (W. W. Norton 1968)", "url": "https://wwnorton.com/books/9780393311440"},
            {"label": "American Psychological Association: Erikson's Epigenetic Principle Overview", "url": "https://dictionary.apa.org/epigenetic-principle"}
        ]
    },
    {
        "id": "kohlberg-moral-development-and-gilligan-critique",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "kohlberg;moral-development;heinz-dilemma;carol-gilligan;ethics;developmental-psychology",
        "title": "Kohlberg's Moral Stages & Carol Gilligan's Ethics of Care Critique",
        "description": "Lawrence Kohlberg established a six-stage hierarchical model of moral reasoning based on justice and rights (Pre-conventional, Conventional, Post-conventional), tested using moral paradoxes like the Heinz Dilemma. Carol Gilligan famously challenged Kohlberg's justice-centric paradigm, proving that moral maturity also encompasses an 'Ethics of Care' centered on interpersonal relational responsibility.",
        "resources": [
            {"label": "Lawrence Kohlberg: The Philosophy of Moral Development (Harper & Row 1981)", "url": "https://www.worldcat.org/title/philosophy-of-moral-development-moral-stages-and-the-idea-of-justice/oclc/7197170"},
            {"label": "Carol Gilligan: In a Different Voice: Psychological Theory and Women's Development (Harvard University Press 1982)", "url": "https://www.hup.harvard.edu/books/9780674445444"},
            {"label": "Stanford Encyclopedia of Philosophy: Moral Development and Moral Psychology", "url": "https://plato.stanford.edu/"}
        ]
    },

    # =========================================================================
    # 8. Group Dynamics & Collective Behavior
    # =========================================================================
    {
        "id": "groupthink-and-defective-decision-making-janis",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "groupthink;irving-janis;group-dynamics;decision-making;organizational-psychology",
        "title": "Groupthink: Structural Insulation & The Illusion of Invulnerability",
        "description": "Irving Janis identified Groupthink: a psychological phenomenon occurring in cohesive groups where the desire for consensus and harmony overrides realistic appraisal of alternative courses of action. Symptoms include structural insulation from outside experts, illusions of invulnerability, self-censorship of dissenting viewpoints, and self-appointed 'mindguards'.",
        "resources": [
            {"label": "Irving L. Janis: Victims of Groupthink: A Psychological Study of Foreign-Policy Decisions and Fiascoes (Houghton Mifflin 1972)", "url": "https://www.worldcat.org/title/victims-of-groupthink-a-psychological-study-of-foreign-policy-decisions-and-fiascoes/oclc/514101"},
            {"label": "Irving L. Janis: Groupthink: Psychological Studies of Policy Decisions and Fiascoes (Wadsworth)", "url": "https://www.cengage.com/"},
            {"label": "Harvard Business Review: Why Teams Don't Share Information and How to Fix Groupthink", "url": "https://hbr.org/2014/12/making-dumb-groups-smarter"}
        ]
    },
    {
        "id": "group-polarization-and-the-risky-shift-phenomenon",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "group-polarization;social-psychology;risky-shift;echo-chambers;collective-behavior",
        "title": "Group Polarization & The Risky Shift Phenomenon",
        "description": "Group polarization occurs when deliberation among like-minded individuals leads the group to adopt a more extreme stance than the average initial inclination of its individual members. Driven by persuasive arguments exposure (novel arguments favoring the dominant view) and social comparison processes, group discussion magnifies initial biases.",
        "resources": [
            {"label": "David G. Myers & Helmut Lamm: The Group Polarization Phenomenon (Psychological Bulletin 1976)", "url": "https://psycnet.apa.org/record/1976-25807-001"},
            {"label": "Cass R. Sunstein: The Law of Group Polarization (Journal of Political Philosophy 2002)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/1467-9760.00148"},
            {"label": "American Psychological Association: Group Polarization and Echo Chambers", "url": "https://www.apa.org/pubs/journals/psp"}
        ]
    },
    {
        "id": "deindividuation-and-the-ringelmann-social-loafing-effect",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "deindividuation;social-loafing;ringelmann-effect;group-dynamics;crowd-psychology",
        "title": "Collective Inaction: Deindividuation & The Ringelmann Social Loafing Effect",
        "description": "Max Ringelmann's rope-pulling experiments established Social Loafing: individual effort decreases systematically as group size increases due to obscured individual accountability. Paired with Deindividuation (loss of personal self-awareness in anonymous crowds), individuals in large groups experience lowered social evaluation apprehension.",
        "resources": [
            {"label": "Bibb Latané, Kipnis Williams, Stephen Harkins: Many Hands Make Light the Work: The Causes and Consequences of Social Loafing (JPSP 1979)", "url": "https://psycnet.apa.org/record/1980-08088-001"},
            {"label": "Philip G. Zimbardo: The Human Choice: Individuation, Reason, and Order Versus Deindividuation, Impulse, and Chaos (Nebraska Symposium on Motivation 1969)", "url": "https://www.worldcat.org/title/nebraska-symposium-on-motivation-1969/oclc/655551327"},
            {"label": "Annual Review of Psychology: Group Performance and Social Loafing Mitigation", "url": "https://www.annualreviews.org/doi/abs/10.1146/annurev.ps.44.020193.003105"}
        ]
    },
    {
        "id": "social-facilitation-vs-inhibition-zajonc-drive-theory",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "social-facilitation;social-inhibition;robert-zajonc;drive-theory;performance",
        "title": "Social Facilitation vs Social Inhibition: Robert Zajonc's Drive Theory",
        "description": "Robert Zajonc resolved contradictory findings on audience effects through Drive Theory: the mere presence of co-actors or observers elevates physiological arousal, which enhances an individual's dominant (well-learned, automatic) response. Consequently, an audience improves performance on simple, mastered tasks (social facilitation) but impairs performance on complex, novel tasks (social inhibition).",
        "resources": [
            {"label": "Robert B. Zajonc: Social Facilitation (Science 1965)", "url": "https://www.science.org/doi/10.1126/science.149.3681.269"},
            {"label": "Nickolas R. Cottrell: Social Facilitation: Evaluation Apprehension Model (Social Psychology 1972)", "url": "https://psycnet.apa.org/"},
            {"label": "American Psychological Association: Social Facilitation and Performance Dynamics", "url": "https://dictionary.apa.org/social-facilitation"}
        ]
    },
    {
        "id": "psychological-safety-in-teams-amy-edmondson",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "psychological-safety;amy-edmondson;team-learning;organizational-behavior;group-dynamics",
        "title": "Psychological Safety in Teams: Amy Edmondson's Learning Climate Model",
        "description": "Amy Edmondson defined team psychological safety as a shared belief that the team is safe for interpersonal risk-taking, where members will not be humiliated or penalized for speaking up with ideas, questions, concerns, or mistakes. Google's Project Aristotle confirmed psychological safety as the primary differentiator of high-performing engineering teams.",
        "resources": [
            {"label": "Amy C. Edmondson: Psychological Safety and Learning Behavior in Work Teams (Administrative Science Quarterly 1999)", "url": "https://journals.sagepub.com/doi/10.2307/2666999"},
            {"label": "Amy C. Edmondson: The Fearless Organization (John Wiley & Sons)", "url": "https://www.wiley.com/en-us/The+Fearless+Organization%3A+Creating+Psychological+Safety+in+the+Workplace+for+Learning%2C+Innovation%2C+and+Growth-p-9781119477242"},
            {"label": "Harvard Business Review: High-Performing Teams Need Psychological Safety", "url": "https://hbr.org/2017/08/high-performing-teams-need-psychological-safety-heres-how-to-build-it"}
        ]
    },
    {
        "id": "abilene-paradox-and-mismanaged-agreement-harvey",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "abilene-paradox;jerry-harvey;pluralistic-ignorance;group-dynamics;organizational-behavior",
        "title": "The Abilene Paradox: The Inability to Manage Collective Agreement",
        "description": "Jerry Harvey formulated the Abilene Paradox to explain scenarios where a group collectively decides on a course of action that is counter to the preferences of every individual member in the group. Unlike groupthink where genuine consensus is sought, the Abilene paradox occurs because individuals falsely assume others desire the action, failing to communicate their true disagreement.",
        "resources": [
            {"label": "Jerry B. Harvey: The Abilene Paradox: The Management of Agreement (Organizational Dynamics 1974)", "url": "https://www.sciencedirect.com/science/article/pii/0090261674900052"},
            {"label": "Jerry B. Harvey: The Abilene Paradox and Other Meditations on Management (Lexington Books)", "url": "https://www.worldcat.org/title/abilene-paradox-and-other-meditations-on-management/oclc/17412702"},
            {"label": "American Psychological Association: The Dynamics of Pluralistic Agreement and Miscommunication", "url": "https://dictionary.apa.org/pluralistic-ignorance"}
        ]
    },

    # =========================================================================
    # 9. Clinical & Neuropsychology Concepts (Educational Level)
    # =========================================================================
    {
        "id": "diathesis-stress-model-of-psychopathology",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "diathesis-stress;psychopathology;vulnerability;epigenetics;clinical-psychology",
        "title": "The Diathesis-Stress Framework: Genetic Vulnerability & Environmental Triggers",
        "description": "The Diathesis-Stress model explains psychological disorders as an interaction between an underlying predisposition (diathesis, such as genetic vulnerability or childhood trauma) and precipitating environmental stressors. Individuals with high biological vulnerability may manifest symptoms under mild stress, whereas resilient individuals require severe acute trauma.",
        "resources": [
            {"label": "Paul E. Meehl: Schizotaxia, Schizotypy, Schizophrenia (American Psychologist 1962)", "url": "https://psycnet.apa.org/record/1963-06680-001"},
            {"label": "Scott M. Monroe & Anne D. Simons: Diathesis-Stress Theories in the Context of Life Stress Research (Psychological Bulletin 1991)", "url": "https://psycnet.apa.org/record/1992-01452-001"},
            {"label": "National Institute of Mental Health (NIMH): Understanding Gene-Environment Interactions", "url": "https://www.nimh.nih.gov/health/topics"}
        ]
    },
    {
        "id": "cognitive-behavioral-model-and-the-cognitive-triad",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "cbt;aaron-beck;cognitive-triad;automatic-thoughts;clinical-psychology",
        "title": "The Cognitive-Behavioral Model: Aaron Beck's Cognitive Triad & Automatic Thoughts",
        "description": "Aaron Beck's cognitive model posits that psychological distress is maintained not directly by external events, but by the cognitive interpretations applied to them. Negative automatic thoughts stem from underlying maladaptive core schemas, exemplified in depression by the Cognitive Triad: negative views of the Self, the World, and the Future.",
        "resources": [
            {"label": "Aaron T. Beck: Cognitive Therapy of Depression (Guilford Press 1979)", "url": "https://www.guilford.com/books/Cognitive-Therapy-of-Depression/Beck-Rush-Shaw-Emery/9780898629194"},
            {"label": "Judith S. Beck: Cognitive Behavior Therapy: Basics and Beyond (Guilford Press)", "url": "https://www.guilford.com/books/Cognitive-Behavior-Therapy/Judith-Beck/9781462544196"},
            {"label": "Beck Institute for Cognitive Behavior Therapy: Core Principles of the CBT Model", "url": "https://beckinstitute.org/about/intro-to-cbt/"}
        ]
    },
    {
        "id": "exposure-therapy-mechanisms-and-inhibitory-learning",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "exposure-therapy;extinction;inhibitory-learning;classical-conditioning;neurobiology",
        "title": "Exposure Therapy Mechanics: Habituation vs Inhibitory Learning Theory",
        "description": "Exposure protocols address conditioned fear responses by presenting conditioned stimuli in the absence of expected negative outcomes. Contemporary clinical science explains extinction not as the erasure of the original fear memory, but through Inhibitory Learning: forming a new, competing safety association in the prefrontal cortex that actively inhibits amygdala fear expression.",
        "resources": [
            {"label": "Michelle G. Craske et al.: Maximizing Exposure Therapy: An Inhibitory Learning Approach (Behaviour Research and Therapy 2014)", "url": "https://www.sciencedirect.com/science/article/pii/S0005796714000548"},
            {"label": "Joseph Wolpe: Psychotherapy by Reciprocal Inhibition (Stanford University Press 1958)", "url": "https://www.worldcat.org/title/psychotherapy-by-reciprocal-inhibition/oclc/376288"},
            {"label": "American Psychological Association: What is Exposure Therapy?", "url": "https://www.apa.org/ptsd-guideline/patients-and-families/exposure"}
        ]
    },
    {
        "id": "hebbian-plasticity-and-neural-long-term-potentiation",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "neuroplasticity;hebbian-learning;ltp;synaptic-plasticity;neuroscience",
        "title": "Neuroplasticity & Hebbian Learning: 'Neurons That Fire Together, Wire Together'",
        "description": "Donald Hebb's 1949 neuropsychological postulate established that repeated co-activation of neighboring neurons strengthens the synaptic efficacy between them ('Hebbian plasticity'). Modern neurobiology confirmed this mechanism via Long-Term Potentiation (LTP) at NMDA receptor synapses, providing the biological foundation for all associative learning and skill acquisition.",
        "resources": [
            {"label": "Donald O. Hebb: The Organization of Behavior: A Neuropsychological Theory (John Wiley & Sons 1949)", "url": "https://www.worldcat.org/title/organization-of-behavior-a-neuropsychological-theory/oclc/467888"},
            {"label": "Terje Lømo: The Discovery of Long-Term Potentiation (Philosophical Transactions of the Royal Society B 2003)", "url": "https://royalsocietypublishing.org/doi/10.1098/rstb.2002.1226"},
            {"label": "Nature Reviews Neuroscience: Synaptic Plasticity and Memory Mechanisms", "url": "https://www.nature.com/articles/nrn"}
        ]
    },
    {
        "id": "cognitive-distortions-taxonomy-beck-and-burns",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "cognitive-distortions;catastrophizing;all-or-nothing-thinking;cbt;cognitive-psychology",
        "title": "Cognitive Distortions: Automatic Thought Biases in Cognitive Therapy",
        "description": "Cognitive distortions are systematic, biased patterns of thought that reinforce negative emotions and reinforce maladaptive schemas. Categorized by Aaron Beck and popularized by David Burns, common distortions include All-or-Nothing Thinking, Catastrophizing, Emotional Reasoning (treating feelings as factual proof), and Mind Reading.",
        "resources": [
            {"label": "David D. Burns: Feeling Good: The New Mood Therapy (William Morrow)", "url": "https://www.harpercollins.com/products/feeling-good-david-d-burns"},
            {"label": "Aaron T. Beck: Cognitive Therapy and the Emotional Disorders (International Universities Press 1976)", "url": "https://www.penguinrandomhouse.com/books/10636/cognitive-therapy-and-the-emotional-disorders-by-aaron-t-beck-md/"},
            {"label": "American Psychological Association: Cognitive Distortions Overview & Definitions", "url": "https://dictionary.apa.org/cognitive-distortion"}
        ]
    },
    {
        "id": "behavioral-activation-mechanisms-and-reinforcement-deprivation",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "behavioral-activation;operant-conditioning;reinforcement-deprivation;clinical-psychology",
        "title": "Behavioral Activation Mechanics: Breaking the Avoidance-Deprivation Loop",
        "description": "Behavioral Activation (BA) operates on empirical operant conditioning principles: low mood initiates avoidance and withdrawal behaviors that eliminate environmental sources of positive reinforcement, deepening fatigue and withdrawal. BA systematically re-introduces structured, values-aligned activities to restore environmental reward contingencies before motivation returns.",
        "resources": [
            {"label": "Christopher R. Martell, Sona Dimidjian, Ruth Herman-Dunn: Behavioral Activation for Depression: A Clinician's Guide (Guilford Press)", "url": "https://www.guilford.com/books/Behavioral-Activation-for-Depression/Martell-Dimidjian-Herman-Dunn/9781462510146"},
            {"label": "Neil S. Jacobson et al.: A Component Analysis of Cognitive-Behavioral Treatment for Depression (JCCP 1996)", "url": "https://psycnet.apa.org/record/1996-02206-004"},
            {"label": "Annual Review of Clinical Psychology: Behavioral Activation Mechanisms and Efficacy", "url": "https://www.annualreviews.org/journal/clinpsy"}
        ]
    },
    {
        "id": "biopsychosocial-model-of-health-george-engel",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "biopsychosocial-model;george-engel;health-psychology;psychosomatic;integrative-medicine",
        "title": "The Biopsychosocial Model: George Engel's Multi-System Health Framework",
        "description": "George Engel introduced the Biopsychosocial model to challenge reductionist biomedical approaches that viewed illness strictly as biological pathology. Engel demonstrated that health, disease, and recovery are dynamic emergent properties of complex interactions between Biological factors (genetics, biochemistry), Psychological factors (cognition, coping), and Social contexts (socioeconomic status, support systems).",
        "resources": [
            {"label": "George L. Engel: The Need for a New Medical Model: A Challenge for Biomedicine (Science 1977)", "url": "https://www.science.org/doi/10.1126/science.847460"},
            {"label": "George L. Engel: The Clinical Application of the Biopsychosocial Model (American Journal of Psychiatry 1980)", "url": "https://ajp.psychiatryonline.org/doi/abs/10.1176/ajp.137.5.535"},
            {"label": "American Psychological Association: Health Psychology and the Biopsychosocial Framework", "url": "https://www.apa.org/ed/graduate/specialize/health"}
        ]
    },
    {
        "id": "default-mode-network-and-cognitive-rumination",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "default-mode-network;dmn;neuroscience;rumination;task-positive-network;brain-networks",
        "title": "The Default Mode Network: Intrinsic Connectivity & Self-Referential Processing",
        "description": "Marcus Raichle identified the Default Mode Network (DMN), a set of interconnected brain regions (medial prefrontal cortex, posterior cingulate cortex, precuneus) that becomes active during passive rest, autobiographical memory retrieval, and self-referential thought. Dysfunctional hyperconnectivity in the DMN paired with reduced anti-correlation to the Task-Positive Network (TPN) characterizes repetitive cognitive rumination.",
        "resources": [
            {"label": "Marcus E. Raichle et al.: A Default Mode of Brain Function (PNAS 2001)", "url": "https://www.pnas.org/doi/10.1073/pnas.98.2.676"},
            {"label": "Michael D. Fox et al.: The Human Brain Is Intrinsically Organized into Dynamic, Anticorrelated Functional Networks (PNAS 2005)", "url": "https://www.pnas.org/doi/10.1073/pnas.0504136102"},
            {"label": "Nature Reviews Neuroscience: The Brain's Default Mode Network", "url": "https://www.nature.com/articles/nrn3043"}
        ]
    },

    # =========================================================================
    # 10. Positive Psychology & Well-Being Science
    # =========================================================================
    {
        "id": "flow-state-dynamics-csikszentmihalyi",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "flow-state;csikszentmihalyi;optimal-experience;intrinsic-motivation;focus",
        "title": "Flow State Architecture: The Challenge-Skill Balance & Autotelic Focus",
        "description": "Mihaly Csikszentmihalyi defined 'Flow' as an optimal psychological state of deep absorption where action and awareness merge, loss of self-consciousness occurs, and subjective time distorts. Entering flow requires three conditions: clear proximal goals, immediate unambiguous feedback, and a dynamic equilibrium where perceived challenge matches high personal skill.",
        "resources": [
            {"label": "Mihaly Csikszentmihalyi: Flow: The Psychology of Optimal Experience (Harper & Row)", "url": "https://www.harpercollins.com/products/flow-mihaly-csikszentmihalyi"},
            {"label": "Jeanne Nakamura & Mihaly Csikszentmihalyi: The Concept of Flow (Handbook of Positive Psychology 2002)", "url": "https://global.oup.com/academic/product/handbook-of-positive-psychology-9780195135336"},
            {"label": "American Psychologist: Optimal Experience and Positive Psychology", "url": "https://www.apa.org/pubs/journals/amp"}
        ]
    },
    {
        "id": "learned-helplessness-and-explanatory-styles-seligman",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "learned-helplessness;martin-seligman;explanatory-styles;optimism;resilience",
        "title": "Learned Helplessness vs Learned Optimism: The Role of Explanatory Styles",
        "description": "Martin Seligman discovered Learned Helplessness: when organisms experience uncontrollable adverse events, they learn that outcomes are independent of their responses, causing passive resignation even when control is subsequently restored. Cognitive reformulation revealed that resilience depends on Explanatory Style across three dimensions: Permanence (temporary vs stable), Pervasiveness (specific vs universal), and Personalization (external vs internal).",
        "resources": [
            {"label": "Martin E. P. Seligman & Steven F. Maier: Failure to Escape Traumatic Shock (Journal of Experimental Psychology 1967)", "url": "https://psycnet.apa.org/record/1967-09756-001"},
            {"label": "Lyn Y. Abramson, Martin E. P. Seligman, John D. Teasdale: Learned Helplessness in Humans: Critique and Reformulation (Journal of Abnormal Psychology 1978)", "url": "https://psycnet.apa.org/record/1978-23961-001"},
            {"label": "Martin E. P. Seligman: Learned Optimism: How to Change Your Mind and Your Life (Vintage Books)", "url": "https://www.penguinrandomhouse.com/books/164073/learned-optimism-by-martin-e-p-seligman-phd/"}
        ]
    },
    {
        "id": "hedonic-adaptation-and-the-happiness-set-point",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "hedonic-adaptation;hedonic-treadmill;happiness-set-point;positive-psychology;subjective-wellbeing",
        "title": "The Hedonic Treadmill: Hedonic Adaptation & Happiness Set-Point Drift",
        "description": "Philip Brickman and Donald Campbell's Hedonic Treadmill theory shows that individuals rapidly habituate to major life changes (both positive windfalls like lottery wins and severe negative events), returning to a stable baseline of subjective well-being over time. Modern research clarifies that set points are not entirely fixed, but vary across life domains based on purposeful engagement.",
        "resources": [
            {"label": "Philip Brickman, Dan Coates, Ronnie Janoff-Bulman: Lottery Winners and Accident Victims: Is Happiness Relative? (JPSP 1978)", "url": "https://psycnet.apa.org/record/1980-01001-001"},
            {"label": "Ed Diener, Richard E. Lucas, Christie Napa Scollon: Beyond the Hedonic Treadmill: Revising the Adaptation Theory of Well-Being (American Psychologist 2006)", "url": "https://psycnet.apa.org/record/2006-05459-002"},
            {"label": "Journal of Personality and Social Psychology: Subjective Well-Being and Adaptation Dynamics", "url": "https://www.apa.org/pubs/journals/psp"}
        ]
    },
    {
        "id": "broaden-and-build-theory-barbara-fredrickson",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "broaden-and-build;barbara-fredrickson;positive-emotions;cognitive-flexibility;resilience",
        "title": "The Broaden-and-Build Theory of Positive Emotions",
        "description": "Barbara Fredrickson's Broaden-and-Build theory demonstrates that while negative emotions narrow attentional focus to immediate survival actions (fight-or-flight), positive emotions (joy, curiosity, serenity) broaden an individual's momentary thought-action repertoire. Over time, this expanded cognitive flexibility builds enduring physical, intellectual, social, and psychological resources.",
        "resources": [
            {"label": "Barbara L. Fredrickson: What Good Are Positive Emotions? (Review of General Psychology 1998)", "url": "https://journals.sagepub.com/doi/10.1037/1089-2680.2.3.300"},
            {"label": "Barbara L. Fredrickson: The Role of Positive Emotions in Positive Psychology: The Broaden-and-Build Theory of Positive Emotions (American Psychologist 2001)", "url": "https://psycnet.apa.org/record/2001-06778-003"},
            {"label": "Barbara L. Fredrickson: Positivity: Top-Notch Research Reveals the 3-to-1 Ratio That Will Change Your Life (Crown)", "url": "https://www.penguinrandomhouse.com/books/57723/positivity-by-barbara-l-fredrickson-phd/"}
        ]
    },
    {
        "id": "perma-model-of-human-flourishing-seligman",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "perma;flourishing;martin-seligman;positive-psychology;well-being",
        "title": "The PERMA Model of Well-Being: Five Pillars of Human Flourishing",
        "description": "Martin Seligman's PERMA framework defines multidimensional well-being beyond fleeting happiness through five measurable pillars: Positive Emotion, Engagement (flow absorption), Relationships (meaningful social connections), Meaning (belonging to and serving something larger than the self), and Accomplishment (pursuit of mastery and achievement).",
        "resources": [
            {"label": "Martin E. P. Seligman: Flourish: A Visionary New Understanding of Happiness and Well-being (Free Press)", "url": "https://www.simonandschuster.com/books/Flourish/Martin-E-P-Seligman/9781439190761"},
            {"label": "University of Pennsylvania Positive Psychology Center: The PERMA Model", "url": "https://ppc.sas.upenn.edu/learn-more/perma-theory-well-being-and-perma-workshops"},
            {"label": "Journal of Positive Psychology: Evaluating the Construct Validity of the PERMA Framework", "url": "https://www.tandfonline.com/journals/rpos20"}
        ]
    },
    {
        "id": "self-compassion-framework-kristin-neff",
        "group_name": "mind-growth",
        "category": "psychology",
        "tags": "self-compassion;kristin-neff;self-esteem;mindfulness;resilience;positive-psychology",
        "title": "The Self-Compassion Architecture: Kristin Neff's Tripartite Model",
        "description": "Kristin Neff conceptualizes self-compassion as a resilient alternative to contingent self-esteem, composed of three interacting dyads: Self-Kindness vs Self-Judgment (treating oneself with warmth during failure), Common Humanity vs Isolation (recognizing suffering as universal), and Mindfulness vs Over-Identification (holding emotional pain in balanced awareness).",
        "resources": [
            {"label": "Kristin D. Neff: Self-Compassion: An Alternative Conceptualization of a Healthy Attitude Toward Oneself (Self and Identity 2003)", "url": "https://www.tandfonline.com/doi/abs/10.1080/15298860309032"},
            {"label": "Kristin D. Neff: The Development and Validation of a Scale to Measure Self-Compassion (Self and Identity 2003)", "url": "https://www.tandfonline.com/doi/abs/10.1080/15298860309027"},
            {"label": "Self-Compassion Academic Research Center & Scales (Dr. Kristin Neff)", "url": "https://self-compassion.org/"}
        ]
    }
]

# Write CSV & SQL files
os.makedirs('seeds', exist_ok=True)

csv_filepath = os.path.join('seeds', 'topics_mind_growth_psychology.csv')
sql_filepath = os.path.join('seeds', 'seed_topics_mind_growth_psychology.sql')

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
    f_sql.write(f'-- TOPICS SEED DATA: MIND-GROWTH -> PSYCHOLOGY ({len(topics)} Topics)\n')
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
        assert row['category'] == 'psychology', f"Row {row_idx}: invalid category {row['category']}"
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
