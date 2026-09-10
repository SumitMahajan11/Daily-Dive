-- ==============================================================================
-- TOPICS SEED DATA: MIND-GROWTH -> PHILOSOPHY & CRITICAL THINKING (42 Topics)
-- ==============================================================================

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('gettier-problem-and-justified-true-belief', 'mind-growth', 'philosophy-critical-thinking', ARRAY['epistemology', 'gettier-problem', 'justified-true-belief', 'theory-of-knowledge', 'philosophy']::TEXT[], 'The Gettier Problem: Challenging Justified True Belief (JTB)', 'Edmund Gettier''s 1963 landmark paper demonstrated that having a justified true belief does not necessarily constitute knowledge, as epistemic luck can produce beliefs that are accidentally true despite flawed justification. This sparked modern epistemology''s quest for a fourth condition of knowledge, including no-false-lemmas, defeasibility, and causal theories.', '[{"label": "Edmund L. Gettier: Is Justified True Belief Knowledge? (Analysis 1963)", "url": "https://academic.oup.com/analysis/article/23/6/121/104192"}, {"label": "Stanford Encyclopedia of Philosophy: The Analysis of Knowledge", "url": "https://plato.stanford.edu/entries/knowledge-analysis/"}, {"label": "Internet Encyclopedia of Philosophy: The Gettier Problem", "url": "https://iep.utm.edu/gettier/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('agrippa-trilemma-and-epistemic-justification', 'mind-growth', 'philosophy-critical-thinking', ARRAY['epistemology', 'agrippas-trilemma', 'munchhausen-trilemma', 'foundationalism', 'skepticism']::TEXT[], 'Agrippa''s Trilemma: The Regress Problem of Justification', 'Agrippa''s Trilemma (or the Münchhausen Trilemma) posits that every attempt to prove a claim must terminate in one of three unsatisfactory options: circular reasoning, infinite regress, or an arbitrary foundational dogmatic assumption. Epistemological schools diverge on this foundation: foundationalism accepts basic beliefs, coherentism accepts circularity, and infinitism accepts infinite regress.', '[{"label": "Stanford Encyclopedia of Philosophy: Epistemic Justification and the Regress Problem", "url": "https://plato.stanford.edu/entries/justep-foundational/"}, {"label": "Internet Encyclopedia of Philosophy: Foundationalism & The Epistemic Regress Problem", "url": "https://iep.utm.edu/foundationalism-in-epistemology/"}, {"label": "Hans Albert: Treatise on Critical Reason (Princeton University Press)", "url": "https://press.princeton.edu/books/hardcover/9780691072951/treatise-on-critical-reason"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('radical-skepticism-and-cartesian-doubt', 'mind-growth', 'philosophy-critical-thinking', ARRAY['epistemology', 'descartes', 'cartesian-doubt', 'cogito-ergo-sum', 'skepticism']::TEXT[], 'Cartesian Doubt & Radical Skepticism: Finding the Archimedian Epistemic Point', 'René Descartes employed methodical doubt to dismantle all sensory beliefs susceptible to deception, introducing thought experiments like the dreaming argument and the evil demon. His search for an indubitable foundation yielded ''Cogito, ergo sum'' (I think, therefore I am), demonstrating that the act of doubting self-verifies conscious existence.', '[{"label": "René Descartes: Meditations on First Philosophy (Translated by John Cottingham, Cambridge)", "url": "https://www.cambridge.org/core/books/descartes-meditations-on-first-philosophy/0468E8E9FF5C1C8FFBAA5EAA47F35FA6"}, {"label": "Stanford Encyclopedia of Philosophy: Descartes'' Epistemology", "url": "https://plato.stanford.edu/entries/descartes-epistemology/"}, {"label": "Internet Encyclopedia of Philosophy: Rene Descartes: Scientific Method and Epistemology", "url": "https://iep.utm.edu/descartes-scientific-method/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('bayesian-epistemology-and-credence-updating', 'mind-growth', 'philosophy-critical-thinking', ARRAY['bayesian-epistemology', 'probability', 'credence', 'conditionalization', 'critical-thinking']::TEXT[], 'Bayesian Epistemology: Degrees of Belief & Rational Conditionalization', 'Bayesian epistemology models beliefs not as binary true/false states, but as continuous degrees of confidence (credences) governed by the axioms of probability. Rational agents update their credences when observing new evidence using Bayes'' Rule (P(H|E) = P(E|H) * P(H) / P(E)), ensuring calibrated resistance to dogmatism while updating proportionally to evidentiary strength.', '[{"label": "Stanford Encyclopedia of Philosophy: Bayesian Epistemology", "url": "https://plato.stanford.edu/entries/epistemology-bayesian/"}, {"label": "Colin Howson & Peter Urbach: Scientific Reasoning: The Bayesian Approach (Open Court)", "url": "https://www.worldcat.org/title/scientific-reasoning-the-bayesian-approach/oclc/26857416"}, {"label": "Richard Jeffrey: Subjective Probability: The Real Thing (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/subjective-probability/A8187FBE3D0B9C6FF75653C89B5F95AA"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('fallibilism-and-epistemic-humility-peirce', 'mind-growth', 'philosophy-critical-thinking', ARRAY['fallibilism', 'charles-sanders-peirce', 'epistemic-humility', 'pragmatism', 'epistemology']::TEXT[], 'Fallibilism & Epistemic Humility: Charles Sanders Peirce''s Inquiry Model', 'Formulated by Charles Sanders Peirce, Fallibilism holds that empirical knowledge cannot achieve absolute certainty, meaning any claim could conceivably be mistaken. Rather than descending into paralysis or skepticism, fallibilism motivates continuous open inquiry, self-correcting scientific communities, and rigorous truth-tracking.', '[{"label": "Charles Sanders Peirce: The Fixation of Belief (Popular Science Monthly 1877)", "url": "https://en.wikisource.org/wiki/The_Fixation_of_Belief"}, {"label": "Stanford Encyclopedia of Philosophy: Charles Sanders Peirce and Epistemology", "url": "https://plato.stanford.edu/entries/peirce/"}, {"label": "Internet Encyclopedia of Philosophy: Pragmatism and Fallibilism", "url": "https://iep.utm.edu/pragmati/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('propositional-logic-modus-ponens-and-modus-tollens', 'mind-growth', 'philosophy-critical-thinking', ARRAY['formal-logic', 'modus-ponens', 'modus-tollens', 'deductive-reasoning', 'validity']::TEXT[], 'Propositional Logic: Modus Ponens, Modus Tollens & Deductive Validity', 'Deductive validity ensures that if all premises are true, the conclusion must necessarily be true. The two core inference rules of propositional calculus are Modus Ponens (affirming the antecedent: if P then Q; P; therefore Q) and Modus Tollens (denying the consequent: if P then Q; not Q; therefore not P), forming the foundation of sound deductive proofs.', '[{"label": "Stanford Encyclopedia of Philosophy: Classical Logic", "url": "https://plato.stanford.edu/entries/logic-classical/"}, {"label": "Internet Encyclopedia of Philosophy: Propositional Logic", "url": "https://iep.utm.edu/prop-log/"}, {"label": "Irving M. Copi, Carl Cohen, Victor Rodych: Introduction to Logic (Routledge)", "url": "https://www.routledge.com/Introduction-to-Logic/Copi-Cohen-Rodych/p/book/9781138500860"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('formal-fallacies-affirming-consequent-denying-antecedent', 'mind-growth', 'philosophy-critical-thinking', ARRAY['formal-fallacies', 'deductive-logic', 'invalidity', 'affirming-consequent', 'critical-thinking']::TEXT[], 'Formal Fallacies: Affirming the Consequent & Denying the Antecedent', 'Formal fallacies are structural defects in deductive arguments that render them invalid regardless of premise truth. Affirming the Consequent erroneously infers P from (If P then Q) and Q; Denying the Antecedent erroneously infers Not-Q from (If P then Q) and Not-P, mistaking a sufficient condition for a necessary one.', '[{"label": "Stanford Encyclopedia of Philosophy: Fallacies", "url": "https://plato.stanford.edu/entries/fallacies/"}, {"label": "Internet Encyclopedia of Philosophy: Fallacies of Formal Logic", "url": "https://iep.utm.edu/fallacy/#Formal"}, {"label": "American Philosophical Association: Teaching Formal Logic Deductive Rules", "url": "https://www.apaonline.org/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('godel-incompleteness-theorems', 'mind-growth', 'philosophy-critical-thinking', ARRAY['godel', 'incompleteness-theorems', 'mathematical-logic', 'metamathematics', 'philosophy-of-math']::TEXT[], 'Gödel''s Incompleteness Theorems: The Limits of Formal Axiomatic Systems', 'Kurt Gödel proved that any consistent formal mathematical system capable of basic arithmetic contains true statements that cannot be proven within the system itself (First Incompleteness Theorem), and that such a system cannot prove its own consistency (Second Incompleteness Theorem). This dismantled David Hilbert''s formalist program to completely formalize mathematics.', '[{"label": "Kurt Gödel: On Formally Undecidable Propositions of Principia Mathematica (Monatshefte für Mathematik und Physik 1931)", "url": "https://link.springer.com/article/10.1007/BF01700692"}, {"label": "Stanford Encyclopedia of Philosophy: Gödel''s Incompleteness Theorems", "url": "https://plato.stanford.edu/entries/goedel-incompleteness/"}, {"label": "Douglas Hofstadter: Gödel, Escher, Bach: An Eternal Golden Braid (Basic Books)", "url": "https://www.basicbooks.com/titles/douglas-r-hofstadter/godel-escher-bach/9780465026562/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('reductio-ad-absurdum-and-proof-by-contradiction', 'mind-growth', 'philosophy-critical-thinking', ARRAY['reductio-ad-absurdum', 'proof-by-contradiction', 'formal-logic', 'argumentation', 'philosophy']::TEXT[], 'Reductio Ad Absurdum: The Logic of Proof by Contradiction', 'Reductio ad Absurdum establishes the truth of a proposition by temporarily assuming the opposite hypothesis and systematically demonstrating that it leads to a logical impossibility, self-contradiction, or absurd consequence. From Euclid''s proof of the infinitude of primes to philosophical paradoxes, it remains a pillar of rigorous debate.', '[{"label": "Stanford Encyclopedia of Philosophy: Reductio ad Absurdum and Classical Logic", "url": "https://plato.stanford.edu/entries/logic-classical/"}, {"label": "Internet Encyclopedia of Philosophy: Reductio ad Absurdum", "url": "https://iep.utm.edu/reductio/"}, {"label": "Nicholas Rescher: Reductio Ad Absurdum (American Philosophical Quarterly 2005)", "url": "https://www.jstor.org/stable/20010196"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('straw-man-fallacy-and-steel-manning-technique', 'mind-growth', 'philosophy-critical-thinking', ARRAY['critical-thinking', 'fallacies', 'straw-man', 'steelmanning', 'argumentation']::TEXT[], 'The Straw Man Fallacy & The Epistemic Power of Steelmanning', 'The Straw Man fallacy distorts an opponent''s argument into an exaggerated, weak caricature that is easy to refute. The counter-heuristic is ''Steelmanning'' (the Principle of Charity): formulating the strongest, most compelling version of an opponent''s position before attempting to critique it, ensuring intellectual honesty and robust truth-seeking.', '[{"label": "Stanford Encyclopedia of Philosophy: Informal Fallacies and Pragmatics", "url": "https://plato.stanford.edu/entries/fallacies/#InfFal"}, {"label": "Daniel Dennett: Intuition Pumps And Other Tools for Thinking (W. W. Norton)", "url": "https://wwnorton.com/books/9780393348781"}, {"label": "Internet Encyclopedia of Philosophy: Argumentation and Straw Man Analysis", "url": "https://iep.utm.edu/fallacy/#StrawMan"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('ad-hominem-and-tu-quoque-fallacies', 'mind-growth', 'philosophy-critical-thinking', ARRAY['ad-hominem', 'tu-quoque', 'informal-fallacies', 'critical-thinking', 'argumentation']::TEXT[], 'Ad Hominem & Tu Quoque: Separating Argument Validity from Speaker Identity', 'An Ad Hominem fallacy attacks the personal character, background, or motives of the arguer rather than evaluating the substantive validity of their claim. The Tu Quoque (''you too'') variant attempts to discredit an argument by pointing out hypocrisy in the speaker, ignoring that a hypocrite''s factual assertions can remain logically sound and empirically true.', '[{"label": "Douglas Walton: Ad Hominem Arguments (University of Alabama Press)", "url": "https://www.uapress.ua.edu/9780817309220/ad-hominem-arguments/"}, {"label": "Stanford Encyclopedia of Philosophy: Fallacies and Genetic Arguments", "url": "https://plato.stanford.edu/entries/fallacies/"}, {"label": "Internet Encyclopedia of Philosophy: Ad Hominem Fallacy Taxonomy", "url": "https://iep.utm.edu/fallacy/#AdHominem"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('begging-the-question-and-circular-reasoning', 'mind-growth', 'philosophy-critical-thinking', ARRAY['petitio-principii', 'begging-the-question', 'circular-reasoning', 'fallacies', 'logic']::TEXT[], 'Begging the Question (Petitio Principii): Hidden Circularity in Arguments', 'Begging the Question occurs when an argument''s premises assume the truth of the conclusion they are purporting to prove, creating a circular loop with zero evidentiary support. Unlike formal invalidity, circular arguments are technically valid (P implies P) but completely unpersuasive because they fail to provide external justification.', '[{"label": "Stanford Encyclopedia of Philosophy: Begging the Question / Petitio Principii", "url": "https://plato.stanford.edu/entries/fallacies/#BegQue"}, {"label": "Internet Encyclopedia of Philosophy: Begging the Question", "url": "https://iep.utm.edu/fallacy/#BeggingtheQuestion"}, {"label": "Douglas Walton: Circular Argumentation (Journal of Pragmatics 1985)", "url": "https://www.sciencedirect.com/science/article/pii/0378216685900222"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('false-dilemma-and-the-excluded-middle-misuse', 'mind-growth', 'philosophy-critical-thinking', ARRAY['false-dilemma', 'black-and-white-thinking', 'fallacies', 'critical-thinking', 'nuance']::TEXT[], 'The False Dilemma: Artificial Dichotomies & Nuance Erasure', 'A False Dilemma (bifurcation fallacy) artificially limits complex scenarios to two mutually exclusive extremes (''either you are with us or against us''), deliberately omitting intermediate possibilities, mixed models, or third alternatives. Critical thinkers dismantle false dilemmas by identifying unstated continuous spectrums and alternative possibilities.', '[{"label": "Internet Encyclopedia of Philosophy: False Dilemma Fallacy", "url": "https://iep.utm.edu/fallacy/#FalseDilemma"}, {"label": "Stanford Encyclopedia of Philosophy: Informal Logic and Argument Structure", "url": "https://plato.stanford.edu/entries/logic-informal/"}, {"label": "Purdue University Online Writing Lab (OWL): Fallacies in Argumentation", "url": "https://owl.purdue.edu/owl/general_writing/academic_writing/logic_in_argumentative_writing/fallacies.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('post-hoc-ergo-propter-hoc-and-causal-fallacies', 'mind-growth', 'philosophy-critical-thinking', ARRAY['post-hoc', 'causation-correlation', 'causal-inference', 'fallacies', 'critical-thinking']::TEXT[], 'Post Hoc Ergo Propter Hoc: Conflating Temporal Sequence with Causation', 'The Post Hoc fallacy (''after this, therefore because of this'') mistakenly concludes that because event Y occurred after event X, event X must have caused event Y. Robust critical thinking guards against confusing temporal succession or statistical correlation with causal mechanism by requiring controlled intervention and counterfactual verification.', '[{"label": "Judea Pearl & Dana Mackenzie: The Book of Why: The New Science of Cause and Effect (Basic Books)", "url": "https://www.basicbooks.com/titles/judea-pearl/the-book-of-why/9780465097609/"}, {"label": "Stanford Encyclopedia of Philosophy: Causal Models and Probabilistic Causation", "url": "https://plato.stanford.edu/entries/causal-models/"}, {"label": "Internet Encyclopedia of Philosophy: Post Hoc Ergo Propter Hoc", "url": "https://iep.utm.edu/fallacy/#PostHoc"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('appeal-to-ignorance-and-burden-of-proof', 'mind-growth', 'philosophy-critical-thinking', ARRAY['argumentum-ad-ignorantiam', 'burden-of-proof', 'hitchens-razor', 'russell-teapot', 'critical-thinking']::TEXT[], 'Argumentum Ad Ignorantiam & The Allocation of the Burden of Proof', 'The Appeal to Ignorance claims that a proposition is true simply because it has not yet been proven false (or false because it has not been proven true). Epistemology places the Burden of Proof on the party making the positive assertion, illustrated by Russell''s Teapot and Hitchens''s Razor: ''What can be asserted without evidence can also be dismissed without evidence.''', '[{"label": "Bertrand Russell: Is There a God? (Illustrated Magazine 1952)", "url": "https://www.marxists.org/reference/subject/philosophy/works/en/russell.htm"}, {"label": "Stanford Encyclopedia of Philosophy: Epistemic Burden of Proof", "url": "https://plato.stanford.edu/entries/fallacies/#AppIgn"}, {"label": "Internet Encyclopedia of Philosophy: Appeal to Ignorance", "url": "https://iep.utm.edu/fallacy/#AppealtoIgnorance"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('utilitarianism-and-consequentialist-ethics', 'mind-growth', 'philosophy-critical-thinking', ARRAY['ethics', 'utilitarianism', 'consequentialism', 'bentham', 'john-stuart-mill', 'moral-philosophy']::TEXT[], 'Utilitarianism: The Greatest Happiness Principle & Consequentialist Ethics', 'Formulated by Jeremy Bentham and refined by John Stuart Mill, Utilitarianism evaluates the moral worth of actions solely by their consequences, maximizing net aggregate well-being (''the greatest happiness for the greatest number''). Modern debates distinguish Act Utilitarianism (case-by-case utility calculus) from Rule Utilitarianism (adhering to general rules that maximize long-term utility).', '[{"label": "John Stuart Mill: Utilitarianism (Parker, Son, and Bourn 1863)", "url": "https://www.utilitarianism.com/mill1.htm"}, {"label": "Stanford Encyclopedia of Philosophy: The History of Utilitarianism", "url": "https://plato.stanford.edu/entries/utilitarianism-history/"}, {"label": "Peter Singer: Practical Ethics (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/practical-ethics/04F097A3B73CDFFCA22736C217EACCF1"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('kantian-deontology-and-the-categorical-imperative', 'mind-growth', 'philosophy-critical-thinking', ARRAY['ethics', 'kant', 'deontology', 'categorical-imperative', 'moral-duty', 'duty-ethics']::TEXT[], 'Kantian Deontology: The Categorical Imperative & Moral Duty', 'Immanuel Kant''s deontological ethics asserts that actions are intrinsically right or wrong regardless of consequences, grounded in pure rational duty. The Categorical Imperative provides two universal formulations: Universal Law (act only on maxims you can simultaneously will as universal laws) and the Formula of Humanity (treat rational agents always as ends in themselves, never merely as means).', '[{"label": "Immanuel Kant: Groundwork of the Metaphysics of Morals (Translated by Mary Gregor, Cambridge)", "url": "https://www.cambridge.org/core/books/kant-groundwork-of-the-metaphysics-of-morals/7872A478E6E3424CDA431BC9255D5BE0"}, {"label": "Stanford Encyclopedia of Philosophy: Kant''s Moral Philosophy", "url": "https://plato.stanford.edu/entries/kant-moral/"}, {"label": "Internet Encyclopedia of Philosophy: Immanuel Kant: Overview and Ethics", "url": "https://iep.utm.edu/kantview/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('aristotelian-virtue-ethics-and-eudaimonia', 'mind-growth', 'philosophy-critical-thinking', ARRAY['virtue-ethics', 'aristotle', 'eudaimonia', 'golden-mean', 'moral-character', 'ethics']::TEXT[], 'Aristotelian Virtue Ethics: Eudaimonia & The Doctrine of the Golden Mean', 'Aristotle''s Nicomachean Ethics focuses on character cultivation rather than rigid rules or consequence calculations, aiming for Eudaimonia (human flourishing). Virtues (arete) are habitual character dispositions situated as a ''Golden Mean'' between vices of deficiency and excess (e.g. Courage as the mean between Cowardice and Recklessness).', '[{"label": "Aristotle: Nicomachean Ethics (Translated by W. D. Ross, MIT Classics)", "url": "http://classics.mit.edu/Aristotle/nicomachaen.html"}, {"label": "Stanford Encyclopedia of Philosophy: Virtue Ethics", "url": "https://plato.stanford.edu/entries/ethics-virtue/"}, {"label": "Alasdair MacIntyre: After Virtue: A Study in Moral Theory (University of Notre Dame Press)", "url": "https://undpress.nd.edu/9780268035044/after-virtue/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('trolley-problem-and-the-doctrine-of-double-effect', 'mind-growth', 'philosophy-critical-thinking', ARRAY['trolley-problem', 'double-effect', 'philippa-foot', 'judith-jarvis-thomson', 'moral-intuition']::TEXT[], 'The Trolley Problem: Moral Dilemmas & The Doctrine of Double Effect', 'Introduced by Philippa Foot and expanded by Judith Jarvis Thomson, the Trolley Problem contrasts pulling a switch to redirect a train (killing one to save five) with pushing a heavy person onto the tracks. The Doctrine of Double Effect explains this ethical intuition: causing harm as an unintended but foreseen side-effect is morally distinct from using harm as an intended direct means.', '[{"label": "Philippa Foot: The Problem of Abortion and the Doctrine of the Double Effect (Oxford Review 1967)", "url": "https://philpapers.org/rec/FOOTPO"}, {"label": "Judith Jarvis Thomson: The Trolley Problem (Yale Law Journal 1985)", "url": "https://www.jstor.org/stable/796133"}, {"label": "Stanford Encyclopedia of Philosophy: Doctrine of Double Effect", "url": "https://plato.stanford.edu/entries/double-effect/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('rawls-veil-of-ignorance-and-justice-as-fairness', 'mind-growth', 'philosophy-critical-thinking', ARRAY['john-rawls', 'veil-of-ignorance', 'justice-as-fairness', 'political-philosophy', 'ethics']::TEXT[], 'Rawls'' Veil of Ignorance: Designing Just Social Contracts Behind the Original Position', 'John Rawls proposed the ''Veil of Ignorance'' thought experiment: designing a just society without knowing one''s own future socioeconomic status, race, gender, intelligence, or health. From this Original Position, rational individuals choose two principles of justice: equal basic liberties for all, and the Difference Principle (inequalities are justified only if they benefit the least-advantaged).', '[{"label": "John Rawls: A Theory of Justice (Harvard University Press 1971)", "url": "https://www.hup.harvard.edu/books/9780674000780"}, {"label": "Stanford Encyclopedia of Philosophy: John Rawls", "url": "https://plato.stanford.edu/entries/rawls/"}, {"label": "Internet Encyclopedia of Philosophy: Rawlsian Jurisprudence and Social Justice", "url": "https://iep.utm.edu/rawls/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('hume-is-ought-problem-and-the-naturalistic-fallacy', 'mind-growth', 'philosophy-critical-thinking', ARRAY['is-ought-problem', 'david-hume', 'naturalistic-fallacy', 'metaethics', 'moral-philosophy']::TEXT[], 'Hume''s Is-Ought Problem: The Divide Between Facts and Moral Values', 'David Hume famously observed in ''A Treatise of Human Nature'' that writers frequently transition from descriptive statements about what ''is'' (factual states of nature) to prescriptive claims about what ''ought'' to be without logical justification. G.E. Moore expanded this into the Naturalistic Fallacy, proving moral goodness cannot be reduced purely to natural physical properties.', '[{"label": "David Hume: A Treatise of Human Nature (Oxford World''s Classics)", "url": "https://global.oup.com/academic/product/a-treatise-of-human-nature-9780198245889"}, {"label": "Stanford Encyclopedia of Philosophy: Hume''s Moral Philosophy and the Is/Ought Gap", "url": "https://plato.stanford.edu/entries/hume-moral/"}, {"label": "Internet Encyclopedia of Philosophy: David Hume: Moral Philosophy", "url": "https://iep.utm.edu/humemora/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('karl-popper-falsificationism-and-demarcation', 'mind-growth', 'philosophy-critical-thinking', ARRAY['karl-popper', 'falsificationism', 'demarcation-problem', 'philosophy-of-science', 'scientific-method']::TEXT[], 'Popper''s Falsificationism: The Demarcation Problem in Scientific Theories', 'Karl Popper solved the Demarcation Problem (distinguishing science from pseudoscience) by arguing that scientific theories cannot be definitively verified by induction, but must be empirically falsifiable. A genuine scientific claim makes risky, testable predictions that, if observed to fail, lead to the theory''s rejection or revision.', '[{"label": "Karl Popper: The Logic of Scientific Discovery (Routledge 1959)", "url": "https://www.routledge.com/The-Logic-of-Scientific-Discovery/Popper/p/book/9780415278447"}, {"label": "Karl Popper: Conjectures and Refutations: The Growth of Scientific Knowledge (Routledge)", "url": "https://www.routledge.com/Conjectures-and-Refutations-The-Growth-of-Scientific-Knowledge/Popper/p/book/9780415285940"}, {"label": "Stanford Encyclopedia of Philosophy: Karl Popper", "url": "https://plato.stanford.edu/entries/popper/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('thomas-kuhn-paradigm-shifts-and-scientific-revolutions', 'mind-growth', 'philosophy-critical-thinking', ARRAY['thomas-kuhn', 'paradigm-shifts', 'scientific-revolutions', 'incommensurability', 'philosophy-of-science']::TEXT[], 'Thomas Kuhn: Paradigm Shifts & The Structure of Scientific Revolutions', 'Thomas Kuhn argued that scientific progress is not a smooth, linear accumulation of facts, but undergoes periodic discontinuous revolutions. Disciplines operate within a ''Normal Science'' paradigm until accumulating anomalies create a crisis, triggering a ''Paradigm Shift'' to an incommensurable new conceptual framework.', '[{"label": "Thomas S. Kuhn: The Structure of Scientific Revolutions (University of Chicago Press 1962)", "url": "https://press.uchicago.edu/ucp/books/book/chicago/S/bo13179781.html"}, {"label": "Stanford Encyclopedia of Philosophy: Thomas Kuhn", "url": "https://plato.stanford.edu/entries/thomas-kuhn/"}, {"label": "Nature: Celebrating Thomas Kuhn''s Legacy in Science Studies", "url": "https://www.nature.com/articles/484438a"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('duhem-quine-thesis-and-epistemological-holism', 'mind-growth', 'philosophy-critical-thinking', ARRAY['duhem-quine', 'epistemic-holism', 'philosophy-of-science', 'auxiliary-hypotheses', 'underdetermination']::TEXT[], 'The Duhem-Quine Thesis: Epistemological Holism & Underdetermination', 'The Duhem-Quine thesis states that an isolated scientific hypothesis cannot be tested in a vacuum because every empirical test relies on a web of auxiliary hypotheses, background assumptions, and instrument calibrations. When an experiment fails, logic alone cannot pinpoint which specific premise in the interconnected web is false.', '[{"label": "Willard Van Orman Quine: Two Dogmas of Empiricism (Philosophical Review 1951)", "url": "https://www.jstor.org/stable/2181906"}, {"label": "Pierre Duhem: The Aim and Structure of Physical Theory (JSTOR / Princeton University Press)", "url": "https://www.jstor.org/stable/j.ctt13x15v1"}, {"label": "Stanford Encyclopedia of Philosophy: Underdetermination of Scientific Theory", "url": "https://plato.stanford.edu/entries/scientific-underdetermination/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('hard-problem-of-consciousness-david-chalmers', 'mind-growth', 'philosophy-critical-thinking', ARRAY['consciousness', 'qualia', 'david-chalmers', 'philosophy-of-mind', 'hard-problem']::TEXT[], 'The Hard Problem of Consciousness: Explaining Subjective Qualia', 'David Chalmers distinguished the ''easy problems'' of cognitive neuroscience (explaining information processing, sensory integration, and verbal reportability) from the ''Hard Problem'': why and how physical brain processes give rise to subjective, first-person experiential qualia (what it is like to feel pain or perceive the redness of red).', '[{"label": "David J. Chalmers: Facing Up to the Problem of Consciousness (consc.net / JCS 1995)", "url": "https://consc.net/papers/facing.html"}, {"label": "David J. Chalmers: The Conscious Mind: In Search of a Fundamental Theory (Oxford University Press)", "url": "https://global.oup.com/academic/product/the-conscious-mind-9780195117899"}, {"label": "Stanford Encyclopedia of Philosophy: Consciousness and Qualia", "url": "https://plato.stanford.edu/entries/consciousness/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('ship-of-theseus-and-personal-identity-puzzles', 'mind-growth', 'philosophy-critical-thinking', ARRAY['ship-of-theseus', 'metaphysics', 'identity', 'personal-identity', 'mereology', 'philosophy']::TEXT[], 'The Ship of Theseus: Mereological Change & Personal Identity', 'The Ship of Theseus paradox asks whether an object whose component parts are gradually replaced one by one over time remains fundamentally the same object. When applied to human biology and personal identity (where cells continually regenerate), philosophers debate whether continuity rests on physical substance, psychological narrative memory, or four-dimensional spacetime worms.', '[{"label": "Stanford Encyclopedia of Philosophy: Identity Over Time and Relative Identity", "url": "https://plato.stanford.edu/entries/identity-time/"}, {"label": "Derek Parfit: Reasons and Persons (Oxford University Press)", "url": "https://global.oup.com/academic/product/reasons-and-persons-9780198249085"}, {"label": "Internet Encyclopedia of Philosophy: Personal Identity Theories", "url": "https://iep.utm.edu/person-i/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('free-will-determinism-and-compatibilism', 'mind-growth', 'philosophy-critical-thinking', ARRAY['free-will', 'determinism', 'compatibilism', 'moral-responsibility', 'metaphysics']::TEXT[], 'The Free Will Problem: Hard Determinism, Libertarianism & Compatibilism', 'The free will problem investigates whether moral responsibility and human agency are compatible with a deterministic physical universe governed by antecedent causal laws. Hard Determinists reject free will as illusory; Libertarians claim agent-causal autonomy; and Compatibilists (Dennett, Frankfurt) redefine free will as action aligned with second-order desires without external coercion.', '[{"label": "Stanford Encyclopedia of Philosophy: Free Will and Compatibilism", "url": "https://plato.stanford.edu/entries/compatibilism/"}, {"label": "Daniel C. Dennett: Elbow Room: The Varieties of Free Will Worth Wanting (MIT Press)", "url": "https://mitpress.mit.edu/9780262524421/elbow-room/"}, {"label": "Harry G. Frankfurt: Freedom of the Will and the Concept of a Person (Journal of Philosophy 1971)", "url": "https://www.jstor.org/stable/2024717"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('marys-room-knowledge-argument-against-physicalism', 'mind-growth', 'philosophy-critical-thinking', ARRAY['marys-room', 'frank-jackson', 'qualia', 'physicalism', 'epiphenomenalism', 'philosophy-of-mind']::TEXT[], 'Mary''s Room (The Knowledge Argument): Challenging Physicalism via Qualia', 'Frank Jackson proposed the Mary''s Room thought experiment: Mary is a brilliant neuroscientist who knows every physical and physiological fact about color vision but has lived in a black-and-white room. When she steps outside and sees red for the first time, does she learn something new? If so, complete physical facts do not capture all knowledge, challenging physicalism.', '[{"label": "Frank Jackson: Epiphenomenal Qualia (Philosophical Quarterly 1982)", "url": "https://academic.oup.com/pq/article-abstract/32/127/127/1529940"}, {"label": "Frank Jackson: What Mary Didn''t Know (Journal of Philosophy 1986)", "url": "https://www.jstor.org/stable/2026143"}, {"label": "Stanford Encyclopedia of Philosophy: Qualia: The Knowledge Argument", "url": "https://plato.stanford.edu/entries/qualia-knowledge/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('chinese-room-argument-and-strong-ai-searle', 'mind-growth', 'philosophy-critical-thinking', ARRAY['chinese-room', 'john-searle', 'artificial-intelligence', 'syntax-semantics', 'philosophy-of-mind']::TEXT[], 'The Chinese Room Argument: Syntax vs Semantics in Artificial Intelligence', 'John Searle formulated the Chinese Room thought experiment to challenge ''Strong AI'': a person inside a room manipulates Chinese symbols using an English rulebook without understanding a word of Chinese. Searle argued that formal syntactic program execution (computation) is never by itself sufficient for genuine semantic intentionality and conscious understanding.', '[{"label": "John R. Searle: Minds, Brains, and Programs (Behavioral and Brain Sciences 1980)", "url": "https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/minds-brains-and-programs/DC644B47A4299C637C895A0F3172CB26"}, {"label": "Stanford Encyclopedia of Philosophy: The Chinese Room Argument", "url": "https://plato.stanford.edu/entries/chinese-room/"}, {"label": "John R. Searle: The Rediscovery of the Mind (MIT Press)", "url": "https://mitpress.mit.edu/9780262691543/the-rediscovery-of-the-mind/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('camus-absurdism-and-the-myth-of-sisyphus', 'mind-growth', 'philosophy-critical-thinking', ARRAY['albert-camus', 'absurdism', 'myth-of-sisyphus', 'existentialism', 'meaning']::TEXT[], 'Camus'' Absurdism: Defiance, Freedom & The Myth of Sisyphus', 'Albert Camus defined the ''Absurd'' as the irreconcilable conflict between the human hunger for inherent meaning and the silent, indifferent universe. Rejecting philosophical suicide (escapist dogma) and physical suicide, Camus argues for lucid rebellion: embracing the absurd with passionate defiance, concluding that ''one must imagine Sisyphus happy.''', '[{"label": "Albert Camus: The Myth of Sisyphus and Other Essays (Vintage Books 1955)", "url": "https://www.penguinrandomhouse.com/books/23477/the-myth-of-sisyphus-and-other-essays-by-albert-camus/"}, {"label": "Stanford Encyclopedia of Philosophy: Albert Camus", "url": "https://plato.stanford.edu/entries/camus/"}, {"label": "Internet Encyclopedia of Philosophy: Albert Camus", "url": "https://iep.utm.edu/albert-camus/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('sartre-radical-freedom-and-bad-faith', 'mind-growth', 'philosophy-critical-thinking', ARRAY['sartre', 'bad-faith', 'existentialism', 'radical-freedom', 'authenticity']::TEXT[], 'Jean-Paul Sartre: Existence Precedes Essence & The Anatomy of Bad Faith', 'Jean-Paul Sartre proclaimed that ''existence precedes essence'': humans are not designed with predetermined purpose, but define themselves through conscious choices, making them ''condemned to be free.'' Inauthenticity arises as ''Bad Faith'' (mauvaise foi)—pretending one lacks freedom and adopting rigid societal roles to escape existential anguish.', '[{"label": "Jean-Paul Sartre: Being and Nothingness: An Essay on Phenomenological Ontology (Washington Square Press)", "url": "https://www.simonandschuster.com/books/Being-and-Nothingness/Jean-Paul-Sartre/9780671867805"}, {"label": "Jean-Paul Sartre: Existentialism Is a Humanism (Yale University Press)", "url": "https://yalebooks.yale.edu/book/9780300115468/existentialism-is-a-humanism/"}, {"label": "Stanford Encyclopedia of Philosophy: Jean-Paul Sartre", "url": "https://plato.stanford.edu/entries/sartre/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('nietzsche-genealogy-of-morality-and-will-to-power', 'mind-growth', 'philosophy-critical-thinking', ARRAY['nietzsche', 'genealogy-of-morality', 'will-to-power', 'master-slave-morality', 'nihilism']::TEXT[], 'Nietzsche''s Moral Genealogy: Master-Slave Morality & The Will to Power', 'Friedrich Nietzsche traced the historical emergence of moral systems in ''On the Genealogy of Morality'', distinguishing Master Morality (which values noble strength, excellence, and life-affirmation) from Slave Morality (born of ressentiment, re-evaluating weakness as holy virtue). Overcoming passive nihilism requires self-overcoming and crafting life-affirming values.', '[{"label": "Friedrich Nietzsche: On the Genealogy of Morality (Translated by Carol Diethe, Cambridge)", "url": "https://www.cambridge.org/core/books/nietzsche-on-the-genealogy-of-morality/A0F61E1689C82ECB6D36E767E24795CA"}, {"label": "Stanford Encyclopedia of Philosophy: Friedrich Nietzsche", "url": "https://plato.stanford.edu/entries/nietzsche/"}, {"label": "Walter Kaufmann: Nietzsche: Philosopher, Psychologist, Antichrist (Princeton University Press)", "url": "https://press.princeton.edu/books/paperback/9780691160269/nietzsche"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('kierkegaard-leap-of-faith-and-existential-dread', 'mind-growth', 'philosophy-critical-thinking', ARRAY['kierkegaard', 'leap-of-faith', 'existential-dread', 'anxiety', 'fear-and-trembling']::TEXT[], 'Søren Kierkegaard: The Leap of Faith & The Anxiety of Freedom', 'Considered the father of existentialism, Kierkegaard analyzed anxiety (Angst) as the ''dizziness of freedom'' when confronting limitless possibilities. In ''Fear and Trembling'', Kierkegaard explored the ''teleological suspension of the ethical'' through Abraham, arguing that authentic commitment requires a passionate ''Leap of Faith'' beyond objective rational certainty.', '[{"label": "Søren Kierkegaard: Fear and Trembling (Penguin Classics)", "url": "https://www.penguinrandomhouse.com/books/260773/fear-and-trembling-by-soren-kierkegaard/"}, {"label": "Stanford Encyclopedia of Philosophy: Søren Kierkegaard", "url": "https://plato.stanford.edu/entries/kierkegaard/"}, {"label": "Internet Encyclopedia of Philosophy: Soren Kierkegaard", "url": "https://iep.utm.edu/kierkega/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('social-contract-theories-hobbes-locke-rousseau', 'mind-growth', 'philosophy-critical-thinking', ARRAY['social-contract', 'hobbes', 'locke', 'rousseau', 'political-philosophy', 'state-of-nature']::TEXT[], 'The Social Contract Tradition: Hobbes, Locke & Rousseau''s State of Nature', 'Social Contract theory explains political legitimacy through thought experiments on the pre-political ''State of Nature''. Thomas Hobbes viewed it as ''nasty, brutish, and short,'' requiring an absolute sovereign Leviathan; John Locke viewed it as governed by natural rights (life, liberty, property), limiting government; and Jean-Jacques Rousseau saw society as corrupting natural goodness.', '[{"label": "Thomas Hobbes: Leviathan (Oxford World''s Classics)", "url": "https://global.oup.com/academic/product/leviathan-9780199537280"}, {"label": "John Locke: Two Treatises of Government (Cambridge University Press)", "url": "https://www.cambridge.org/core/books/locke-two-treatises-of-government/CA272A0EE553D0AF2353A818EF76461D"}, {"label": "Stanford Encyclopedia of Philosophy: Contemporary Approaches to the Social Contract", "url": "https://plato.stanford.edu/entries/contractarianism-contemporary/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('popper-paradox-of-tolerance-and-the-open-society', 'mind-growth', 'philosophy-critical-thinking', ARRAY['popper', 'paradox-of-tolerance', 'open-society', 'political-philosophy', 'democracy']::TEXT[], 'The Paradox of Tolerance: Defending Open Societies Against Dogmatic Totalitarianism', 'In ''The Open Society and Its Enemies'', Karl Popper articulated the Paradox of Tolerance: unlimited tolerance must lead to the disappearance of tolerance. If a society extends unconditional tolerance even to those who are openly intolerant and advocate violence or suppression of reason, the tolerant will be destroyed and tolerance with them.', '[{"label": "Karl Popper: The Open Society and Its Enemies (Princeton University Press 1945)", "url": "https://press.princeton.edu/books/paperback/9780691158136/the-open-society-and-its-enemies"}, {"label": "Stanford Encyclopedia of Philosophy: Karl Popper''s Political Philosophy", "url": "https://plato.stanford.edu/entries/popper/#SociPoliPhil"}, {"label": "Internet Encyclopedia of Philosophy: Karl Popper: Critical Rationalism", "url": "https://iep.utm.edu/karl-popper-critical-ratiotionalism/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('hannah-arendt-and-the-banality-of-evil', 'mind-growth', 'philosophy-critical-thinking', ARRAY['hannah-arendt', 'banality-of-evil', 'eichmann-in-jerusalem', 'totalitarianism', 'political-philosophy']::TEXT[], 'Hannah Arendt: The Banality of Evil & Thoughtlessness in Bureaucracy', 'Reporting on the Adolf Eichmann trial in Jerusalem, political philosopher Hannah Arendt formulated ''The Banality of Evil''. Arendt showed that catastrophic systemic crimes against humanity are frequently executed not by sociopathic monsters, but by ordinary, unthinking bureaucrats who abdicate critical reflective thought to follow procedural rules and institutional norms.', '[{"label": "Hannah Arendt: Eichmann in Jerusalem: A Report on the Banality of Evil (Viking Press / Penguin Classics)", "url": "https://www.penguinrandomhouse.com/books/293353/eichmann-in-jerusalem-by-hannah-arendt/"}, {"label": "Stanford Encyclopedia of Philosophy: Hannah Arendt", "url": "https://plato.stanford.edu/entries/arendt/"}, {"label": "Hannah Arendt Center for Politics and Humanities at Bard College", "url": "https://hac.bard.edu/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('nagarjuna-madhyamaka-and-the-two-truths-doctrine', 'mind-growth', 'philosophy-critical-thinking', ARRAY['nagarjuna', 'madhyamaka', 'shunyata', 'two-truths', 'eastern-philosophy', 'dialectics']::TEXT[], 'Nagarjuna''s Madhyamaka: Shunyata (Emptiness) & The Two Truths Doctrine', 'Nagarjuna founded the Madhyamaka (Middle Way) school of Buddhist philosophy, demonstrating that all phenomena are empty (shunyata) of intrinsic, independent existence because they exist purely in dependent origination (pratityasamutpada). Nagarjuna resolved practical coherence through the Two Truths Doctrine: Conventional Truth (empirical reality) and Ultimate Truth (emptiness).', '[{"label": "Jay L. Garfield: The Fundamental Wisdom of the Middle Way: Nagarjuna''s Mulamadhyamakakarika (Oxford University Press)", "url": "https://global.oup.com/academic/product/the-fundamental-wisdom-of-the-middle-way-9780195093360"}, {"label": "Stanford Encyclopedia of Philosophy: Nagarjuna", "url": "https://plato.stanford.edu/entries/nagarjuna/"}, {"label": "Internet Encyclopedia of Philosophy: Madhyamaka Buddhist Philosophy", "url": "https://iep.utm.edu/nagarjun/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('daoism-wu-wei-and-effortless-action', 'mind-growth', 'philosophy-critical-thinking', ARRAY['daoism', 'laozi', 'zhuangzi', 'wu-wei', 'eastern-philosophy', 'action-theory']::TEXT[], 'Daoism & Wu Wei: The Philosophy of Non-Coercive Effortless Action', 'Central to Laozi''s Daodejing and Zhuangzi, the concept of Wu Wei (''non-action'' or ''effortless action'') does not denote passive inertia, but acting in seamless alignment with the natural flow and affordances of reality (the Dao). Wu Wei opposes rigid dogmatic control and artificial contrivance in favor of spontaneous, highly attuned efficacy.', '[{"label": "Edward Slingerland: Effortless Action: Wu-wei as Conceptual Metaphor and Spiritual Ideal in Early China (Oxford University Press)", "url": "https://global.oup.com/academic/product/effortless-action-9780195138993"}, {"label": "Stanford Encyclopedia of Philosophy: Daoism", "url": "https://plato.stanford.edu/entries/daoism/"}, {"label": "Laozi: Daodejing (Translated by Philip J. Ivanhoe, Hackett Classics)", "url": "https://www.hackettpublishing.com/the-daodejing-of-laozi"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('advaita-vedanta-and-non-dual-epistemology', 'mind-growth', 'philosophy-critical-thinking', ARRAY['advaita-vedanta', 'shankara', 'non-dualism', 'brahman-atman', 'maya', 'eastern-philosophy']::TEXT[], 'Advaita Vedanta: Non-Dualism, Maya & The Epistemology of Self-Knowledge', 'Systematized by Adi Shankara, Advaita Vedanta asserts radical non-dualism (Advaita): the individual consciousness (Atman) is identical with the ultimate ground of reality (Brahman). Empirical multiplicity and subject-object separation are understood through Maya (epistemic superimposition), dissolved through self-inquiry and direct experiential realization.', '[{"label": "Stanford Encyclopedia of Philosophy: Shankara and Advaita Vedanta", "url": "https://plato.stanford.edu/entries/shankara/"}, {"label": "Internet Encyclopedia of Philosophy: Advaita Vedanta", "url": "https://iep.utm.edu/adv-veda/"}, {"label": "Eliot Deutsch: Advaita Vedanta: A Philosophical Reconstruction (University of Hawaii Press)", "url": "https://uhpress.hawaii.edu/title/advaita-vedanta-a-philosophical-reconstruction/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('pascals-wager-and-decision-under-infinite-payoffs', 'mind-growth', 'philosophy-critical-thinking', ARRAY['pascals-wager', 'decision-theory', 'expected-utility', 'infinite-payoff', 'philosophy-of-religion']::TEXT[], 'Pascal''s Wager: Decision Theory, Infinite Payoffs & Epistemic Duty', 'Blaise Pascal formulated the first formal application of expected utility theory to existential belief. Pascal argued that even if the probability of God''s existence is minuscule, the infinite expected payoff of eternal reward outweighs finite temporal costs, making belief the mathematically optimal wager. Modern critics critique its assumption of binary theology and forced doxastic voluntarism.', '[{"label": "Blaise Pascal: Pensées (Translated by A. J. Krailsheimer, Penguin Classics)", "url": "https://www.penguinrandomhouse.com/books/261053/pensees-by-blaise-pascal/"}, {"label": "Stanford Encyclopedia of Philosophy: Pascal''s Wager", "url": "https://plato.stanford.edu/entries/pascal-wager/"}, {"label": "Alan Hájek: Waging War on Pascal''s Wager (Philosophical Review 2003)", "url": "https://www.jstor.org/stable/3595532"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('newcombs-paradox-causal-vs-evidential-decision-theory', 'mind-growth', 'philosophy-critical-thinking', ARRAY['newcombs-paradox', 'decision-theory', 'causal-decision-theory', 'evidential-decision-theory', 'rationality']::TEXT[], 'Newcomb''s Paradox: Causal vs Evidential Decision Theory', 'William Newcomb''s paradox presents a choice between two boxes based on the prediction of a super-intelligent entity. The scenario splits decision theory down the middle: Evidential Decision Theory advocates one-boxing (choosing only the mysterious box to maximize news value), while Causal Decision Theory advocates two-boxing (taking both boxes because the predictor''s action is in the causal past).', '[{"label": "Robert Nozick: Newcomb''s Problem and Two Principles of Choice (Essays in Honor of Carl G. Hempel 1969)", "url": "https://link.springer.com/chapter/10.1007/978-94-010-3381-7_7"}, {"label": "Stanford Encyclopedia of Philosophy: Causal Decision Theory and Newcomb''s Problem", "url": "https://plato.stanford.edu/entries/decision-causal/"}, {"label": "David Lewis: Causal Decision Theory (Australasian Journal of Philosophy 1981)", "url": "https://www.tandfonline.com/doi/abs/10.1080/00048408112340011"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('epistemic-vs-instrumental-rationality-and-map-territory', 'mind-growth', 'philosophy-critical-thinking', ARRAY['rationality', 'epistemic-rationality', 'instrumental-rationality', 'map-and-territory', 'decision-making']::TEXT[], 'Epistemic vs Instrumental Rationality: The Map-and-Territory Relation', 'Rationality divides into Epistemic Rationality (systematically holding beliefs that accurately map the external territory of reality) and Instrumental Rationality (steering reality toward one''s goals and maximizing expected utility). As Alfred Korzybski emphasized, ''the map is not the territory'': confusing models with reality leads to brittle strategic failures.', '[{"label": "Keith E. Stanovich: What Intelligence Tests Miss: The Psychology of Rational Thought (Yale University Press)", "url": "https://yalebooks.yale.edu/book/9780300164626/what-intelligence-tests-miss/"}, {"label": "Alfred Korzybski: Science and Sanity: An Introduction to Non-Aristotelian Systems", "url": "https://www.worldcat.org/title/science-and-sanity-an-introduction-to-non-aristotelian-systems-and-general-semantics/oclc/514101"}, {"label": "Stanford Encyclopedia of Philosophy: Epistemic vs Practical Rationality", "url": "https://plato.stanford.edu/entries/rationality-normative-utility/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;
