-- ==============================================================================
-- TOPICS SEED DATA: MONEY-CAREER -> FINANCE (68 Topics)
-- ==============================================================================

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('discounted-cash-flow-dcf-valuation', 'money-career', 'finance', ARRAY['corporate-finance', 'valuation', 'dcf', 'financial-modeling', 'intrinsic-value']::TEXT[], 'Discounted Cash Flow (DCF) Valuation & Free Cash Flow Modeling', 'DCF valuation determines the intrinsic value of an enterprise by projecting Unlevered Free Cash Flows (FCFF) into the future and discounting them back to the present value using the Weighted Average Cost of Capital (WACC). Terminal value is estimated using either the Gordon Growth Model or an exit multiple approach.', '[{"label": "Aswath Damodaran: Discounted Cash Flow Valuation (NYU Stern Lecture Notes)", "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/valn2ed/ch12.pdf"}, {"label": "CFA Institute: Free Cash Flow Valuation Refresher Reading", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/free-cash-flow-valuation"}, {"label": "Corporate Finance Institute: DCF Model Training & Formula Guide", "url": "https://corporatefinanceinstitute.com/resources/valuation/dcf-formula-discounted-cash-flow/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('weighted-average-cost-of-capital-wacc', 'money-career', 'finance', ARRAY['corporate-finance', 'wacc', 'cost-of-capital', 'hurdle-rate', 'valuation']::TEXT[], 'Weighted Average Cost of Capital (WACC) & Hurdle Rate Determination', 'WACC represents a company''s blended cost of capital across all sources of funding, weighting the after-tax cost of debt and the cost of equity (derived via CAPM). It serves as the benchmark hurdle rate for evaluating corporate capital expenditures and internal investment projects.', '[{"label": "Aswath Damodaran: Estimating Hurdle Rates and Cost of Capital (NYU Stern)", "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/country/wacc.pdf"}, {"label": "CFA Institute: Cost of Capital and Capital Structure Analysis", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/cost-of-capital"}, {"label": "Harvard Business Review: A Refresher on Cost of Capital", "url": "https://hbr.org/2015/04/a-refresher-on-cost-of-capital"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('capital-structure-and-modigliani-miller-theorem', 'money-career', 'finance', ARRAY['capital-structure', 'modigliani-miller', 'corporate-finance', 'debt-equity', 'leverage']::TEXT[], 'Capital Structure & the Modigliani-Miller Theorem', 'The Modigliani-Miller theorem states that in a frictionless market without taxes or bankruptcy costs, enterprise value is independent of capital structure. In the real world, the trade-off theory balances the tax shield benefits of corporate debt against the rising expected costs of financial distress and bankruptcy.', '[{"label": "Franco Modigliani & Merton H. Miller: The Cost of Capital, Corporation Finance and the Theory of Investment (AER 1958)", "url": "https://www.jstor.org/stable/1809766"}, {"label": "Stewart C. Myers: The Capital Structure Puzzle (Journal of Finance 1984)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1984.tb03646.x"}, {"label": "CFA Institute: Capital Structure Decisions and Leverage Theory", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-structure"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('mergers-and-acquisitions-accretion-dilution', 'money-career', 'finance', ARRAY['m-and-a', 'corporate-finance', 'accretion-dilution', 'synergies', 'investment-banking']::TEXT[], 'M&A Mechanics: Accretion/Dilution Analysis & Deal Structuring', 'Accretion/dilution analysis evaluates whether a merger or acquisition increases or decreases the acquirer''s post-transaction Earnings Per Share (EPS). Transaction mechanics depend heavily on the consideration mix (all-cash, stock-for-stock, or debt-financed), cost synergies, goodwill creation, and transaction fees.', '[{"label": "Harvard Business Review: The Art of M&A Due Diligence", "url": "https://hbr.org/2010/06/the-art-of-ma-due-diligence"}, {"label": "Corporate Finance Institute: Accretion Dilution Model Guide", "url": "https://corporatefinanceinstitute.com/resources/valuation/accretion-dilution-analysis/"}, {"label": "Aswath Damodaran: The Value of Synergy in Mergers & Acquisitions", "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/synergy.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('dividend-policy-vs-share-buybacks', 'money-career', 'finance', ARRAY['capital-allocation', 'dividends', 'share-repurchases', 'corporate-finance']::TEXT[], 'Capital Allocation: Dividends vs Share Repurchases & Signaling Effects', 'Companies return excess cash to shareholders through either regular cash dividends or open-market share buybacks. Buybacks offer tax deferral advantages and signal managerial confidence in undervalued shares, while dividends provide predictable cash flow but establish rigid commitment expectations that markets penalize when cut.', '[{"label": "SEC Office of Investor Education: Share Repurchases and Equity Capital Allocation", "url": "https://www.sec.gov/investor/pubs/repurchases.htm"}, {"label": "Gustavo Grullon & David L. Ikenberry: What Do We Know About Stock Repurchases? (Journal of Applied Corporate Finance)", "url": "https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1745-6622.2000.tb00040.x"}, {"label": "Michael Mauboussin: Capital Allocation: Returns, Reinvestment, and Shareholder Value", "url": "https://www.morganstanley.com/im/publication/insights/articles/article_capitalallocation_us.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('working-capital-management-cash-conversion-cycle', 'money-career', 'finance', ARRAY['working-capital', 'liquidity', 'cash-conversion-cycle', 'operations', 'corporate-finance']::TEXT[], 'Working Capital Optimization & the Cash Conversion Cycle (CCC)', 'The Cash Conversion Cycle measures the net duration (in days) required for a company to convert raw inventory purchases into cash inflows from sales (CCC = DIO + DSO - DPO). Minimizing working capital requirements frees up operating liquidity and reduces reliance on short-term debt financing.', '[{"label": "CFA Institute: Working Capital Management & Operating Cycle Analysis", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/working-capital-management"}, {"label": "Harvard Business Review: How Fast Can Your Company Afford to Grow?", "url": "https://hbr.org/2001/05/how-fast-can-your-company-afford-to-grow"}, {"label": "Corporate Finance Institute: Cash Conversion Cycle Guide", "url": "https://corporatefinanceinstitute.com/resources/commercial-lending/cash-conversion-cycle-ccc/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('roic-vs-wacc-economic-value-added', 'money-career', 'finance', ARRAY['roic', 'wacc', 'eva', 'value-creation', 'corporate-finance', 'moats']::TEXT[], 'ROIC vs WACC: Economic Value Added (EVA) & Value Creation', 'A business creates genuine economic value only when its Return on Invested Capital (ROIC) exceeds its Weighted Average Cost of Capital (WACC). The spread (ROIC - WACC) multiplied by invested capital yields Economic Value Added (EVA), quantifying true economic profit beyond standard accounting net income.', '[{"label": "Michael Mauboussin: Calculating Return on Invested Capital (ROIC)", "url": "https://www.morganstanley.com/im/publication/insights/articles/article_calculatingreturnoninvestedcapital.pdf"}, {"label": "McKinsey & Company: Valuation: Measuring and Managing the Value of Companies (Chapter 2)", "url": "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/valuation-measuring-and-managing-the-value-of-companies"}, {"label": "CFA Institute: Measures of Value Added (EVA and MVA)", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/economic-value-added"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('enterprise-value-vs-equity-value-bridge', 'money-career', 'finance', ARRAY['enterprise-value', 'equity-value', 'valuation-bridge', 'corporate-finance', 'net-debt']::TEXT[], 'Enterprise Value vs Equity Value: The Valuation Bridge Mechanics', 'Enterprise Value (EV) measures the total operating value of a business attributable to all capital providers (EV = Equity Value + Total Debt + Preferred Stock + Minority Interest - Cash & Cash Equivalents). Equity Value isolates the residual market capitalization belonging strictly to common shareholders after resolving net debt claims.', '[{"label": "Aswath Damodaran: Enterprise Value and Equity Value: Bridges and Traps (NYU Stern)", "url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/country/EVvsEquity.pdf"}, {"label": "CFA Institute: Equity Valuation Multiples and Enterprise Value Definitions", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/equity-valuation-concepts-basic-tools"}, {"label": "Corporate Finance Institute: Enterprise Value vs Equity Value Guide", "url": "https://corporatefinanceinstitute.com/resources/valuation/enterprise-value-vs-equity-value/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('leveraged-buyouts-lbo-mechanics', 'money-career', 'finance', ARRAY['lbo', 'private-equity', 'corporate-finance', 'financial-modeling', 'debt']::TEXT[], 'Leveraged Buyouts (LBO): Private Equity Deal Structuring & Returns Modeling', 'In a Leveraged Buyout (LBO), a private equity sponsor acquires a target company using a substantial proportion of debt (60-80% senior secured loans and mezzanine notes) secured by the target''s assets and cash flows. Sponsor returns (IRR and MoIC) are driven by debt paydown from operating cash flows, operational margin expansion, and exit multiple expansion.', '[{"label": "Harvard Business Review: What Every Leader Should Know About Private Equity LBOs", "url": "https://hbr.org/2012/03/what-every-leader-should-know-about-private-equity"}, {"label": "Corporate Finance Institute: Leveraged Buyout (LBO) Model Structure & Mechanics", "url": "https://corporatefinanceinstitute.com/resources/valuation/leveraged-buyout-lbo/"}, {"label": "Steven N. Kaplan & Per Strömberg: Leveraged Buyouts and Private Equity (Journal of Economic Perspectives 2009)", "url": "https://www.aeaweb.org/articles?id=10.1257/jep.23.1.121"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('time-value-of-money-npv-and-irr', 'money-career', 'finance', ARRAY['tvm', 'npv', 'irr', 'corporate-finance', 'capital-budgeting', 'decision-making']::TEXT[], 'Capital Budgeting Decision Rules: Net Present Value (NPV) vs Internal Rate of Return (IRR)', 'Net Present Value (NPV) measures the total dollar value added by an investment discounted at the cost of capital, whereas Internal Rate of Return (IRR) identifies the discount rate where NPV equals zero. When evaluating mutually exclusive projects with non-standard cash flows or scale differences, NPV serves as the economically superior decision metric.', '[{"label": "CFA Institute: Capital Budgeting Principles and NPV/IRR Comparison", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-budgeting"}, {"label": "Harvard Business Review: A Refresher on Net Present Value", "url": "https://hbr.org/2014/11/a-refresher-on-net-present-value"}, {"label": "Corporate Finance Institute: NPV vs IRR Guide", "url": "https://corporatefinanceinstitute.com/resources/valuation/npv-vs-irr/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('compound-interest-mathematics-and-rule-of-72', 'money-career', 'finance', ARRAY['compound-interest', 'time-value-of-money', 'personal-finance', 'rule-of-72']::TEXT[], 'Compound Interest Mechanics, Exponential Growth & The Rule of 72', 'Compound interest generates exponential portfolio growth by calculating returns on both accumulated principal and previously reinvested earnings (A = P(1 + r/n)^(nt)). The Rule of 72 provides a quick mental approximation for calculating the years needed to double capital by dividing 72 by the annual nominal interest rate.', '[{"label": "SEC Investor.gov: Compound Interest Calculator and Mathematical Guide", "url": "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator"}, {"label": "Federal Reserve Bank of St. Louis: The Power of Compound Interest", "url": "https://www.stlouisfed.org/education/page-one-economics-classroom-edition/power-of-compound-interest"}, {"label": "FINRA: Smart Investing: Time Value of Money Fundamentals", "url": "https://www.finra.org/investors/investing/investing-basics/time-value-money"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('tax-advantaged-retirement-accounts-401k-ira-roth', 'money-career', 'finance', ARRAY['retirement', '401k', 'ira', 'roth-ira', 'tax-strategy', 'personal-finance']::TEXT[], 'Tax-Advantaged Accounts: Traditional vs Roth 401(k) and IRA Mechanics', 'Tax-advantaged accounts optimize long-term retirement savings through distinct tax timing mechanisms. Traditional contributions provide an immediate upfront tax deduction with deferred taxation upon withdrawal, whereas Roth contributions use after-tax dollars to provide 100% tax-free growth and qualified withdrawals.', '[{"label": "IRS Publication 590-A: Contributions to Individual Retirement Arrangements (IRAs)", "url": "https://www.irs.gov/publications/p590a"}, {"label": "IRS Retirement Plans FAQs regarding 401(k) and Roth Contributions", "url": "https://www.irs.gov/retirement-plans/401k-plans-deferrals-and-matching"}, {"label": "Consumer Financial Protection Bureau: Choosing a Retirement Account", "url": "https://www.consumerfinance.gov/consumer-tools/retirement/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('backdoor-roth-and-mega-backdoor-conversions', 'money-career', 'finance', ARRAY['backdoor-roth', 'mega-backdoor', 'pro-rata-rule', 'tax-strategy', 'retirement']::TEXT[], 'Advanced Retirement Strategies: Backdoor Roth & The IRS Pro-Rata Rule', 'High-income earners exceeding direct Roth IRA contribution limits utilize Backdoor Roth conversions by making non-deductible Traditional IRA contributions and immediately converting them to Roth. To avoid unexpected taxation under the IRS Pro-Rata Rule (Form 8606), investors must eliminate all pre-tax Traditional, SEP, and SIMPLE IRA balances via 401(k) roll-ins.', '[{"label": "IRS Form 8606 Instructions: Nondeductible IRAs and Pro-Rata Calculations", "url": "https://www.irs.gov/forms-pubs/about-form-8606"}, {"label": "Bogleheads Guide to Backdoor Roth IRA Conversions and Pitfalls", "url": "https://www.bogleheads.org/wiki/Backdoor_Roth"}, {"label": "Journal of Accountancy: Navigating Backdoor Roth IRAs and Tax Rules", "url": "https://www.journalofaccountancy.com/issues/2014/sep/roth-ira-conversions.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('health-savings-accounts-hsa-triple-tax-advantage', 'money-career', 'finance', ARRAY['hsa', 'triple-tax-advantage', 'health-savings-account', 'tax-strategy', 'personal-finance']::TEXT[], 'Health Savings Accounts (HSA): The Triple-Tax-Advantaged Wealth Vehicle', 'Paired with High-Deductible Health Plans (HDHP), HSAs offer a rare triple tax advantage: tax-deductible contributions, tax-free compound investment growth, and tax-free withdrawals for qualified medical expenses. Because there is no expiration deadline for reimbursing past medical receipts, investors use HSAs as stealth retirement vehicles.', '[{"label": "IRS Publication 969: Health Savings Accounts and Other Tax-Favored Health Plans", "url": "https://www.irs.gov/publications/p969"}, {"label": "US Department of the Treasury: Health Savings Accounts (HSA) Overview", "url": "https://home.treasury.gov/policy-issues/consumer-policy/health-savings-accounts"}, {"label": "Consumer Financial Protection Bureau: Understanding High-Deductible Plans and HSAs", "url": "https://www.consumerfinance.gov/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('debt-payoff-strategies-avalanche-vs-snowball', 'money-career', 'finance', ARRAY['debt', 'personal-finance', 'debt-snowball', 'debt-avalanche', 'interest-minimization']::TEXT[], 'Debt Payoff Frameworks: Debt Avalanche vs Debt Snowball Methodology', 'The Debt Avalanche strategy mathematically minimizes total interest paid by directing surplus payments to the highest-interest debt first. In contrast, the Debt Snowball strategy builds behavioral momentum by eliminating the smallest balance first, trading financial efficiency for psychological reinforcement.', '[{"label": "Consumer Financial Protection Bureau: Debt Management Strategies & Tools", "url": "https://www.consumerfinance.gov/ask-cfpb/what-is-the-best-way-to-pay-off-my-debts-en-1473/"}, {"label": "Federal Reserve Bank of Dallas: Building Wealth: Managing and Eliminating Debt", "url": "https://www.dallasfed.org/cd/wealth/manage"}, {"label": "Harvard Business Review: Research: The Best Strategy for Paying Off Debt", "url": "https://hbr.org/2016/10/research-the-best-strategy-for-paying-off-debt"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('emergency-fund-sizing-and-liquidity-tiers', 'money-career', 'finance', ARRAY['emergency-fund', 'liquidity', 'cash-management', 'personal-finance', 'risk']::TEXT[], 'Emergency Fund Sizing: Income Volatility, Runway & Liquidity Tiering', 'An emergency reserve insulates personal balance sheets from unanticipated income loss or capital expenditure shocks without forcing liquidation of volatile equity assets. Optimal fund sizing ranges from 3 to 12 months of non-discretionary living expenses, tiered across cash equivalents (HYSA) and short-term Treasuries.', '[{"label": "FINRA: Establishing an Emergency Savings Fund", "url": "https://www.finra.org/investors/military/smart-saving-basics/emergency-fund"}, {"label": "Consumer Financial Protection Bureau: An Essential Guide to Building an Emergency Fund", "url": "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/"}, {"label": "Vanguard Research: Emergency Savings: How Much Is Enough?", "url": "https://corporate.vanguard.com/content/dam/corp/research/pdf/emergency-savings-how-much-is-enough.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('insurance-fundamentals-life-disability-umbrella', 'money-career', 'finance', ARRAY['insurance', 'risk-management', 'term-life', 'disability', 'umbrella-policy', 'personal-finance']::TEXT[], 'Insurance as Risk Mitigation: Term Life, Disability & Umbrella Coverage', 'Insurance protects human capital against catastrophic, low-probability events rather than functioning as an investment vehicle. Core protection architectures prioritize level term life insurance for dependent replacement, own-occupation long-term disability for earnings continuity, and excess liability umbrella policies.', '[{"label": "National Association of Insurance Commissioners (NAIC): Life and Disability Insurance Buyer''s Guide", "url": "https://content.naic.org/consumer/life-insurance.htm"}, {"label": "Consumer Reports: Guide to Life and Umbrella Insurance Policies", "url": "https://www.consumerreports.org/cro/life-insurance/buying-guide/index.htm"}, {"label": "Social Security Administration: The Importance of Disability Coverage", "url": "https://www.ssa.gov/disability/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('estate-planning-wills-trusts-and-beneficiaries', 'money-career', 'finance', ARRAY['estate-planning', 'wills', 'trusts', 'probate', 'beneficiary-designations', 'personal-finance']::TEXT[], 'Estate Planning Essentials: Wills, Revocable Living Trusts & Probate Avoidance', 'Estate planning coordinates asset transfer, legal guardianship, and tax efficiency upon death or incapacitation. Revocable living trusts bypass lengthy and public probate proceedings, while direct beneficiary designations (TOD/POD) take legal precedence over will stipulations.', '[{"label": "American Bar Association: Guidelines to Estate Planning, Wills and Trusts", "url": "https://www.americanbar.org/groups/real_property_trust_estate/resources/estate_planning/"}, {"label": "IRS Estate and Gift Taxes Overview & Applicable Exclusion Limits", "url": "https://www.irs.gov/businesses/small-businesses-self-employed/estate-and-gift-taxes"}, {"label": "FINRA: Estate Planning Checklist and Asset Titling", "url": "https://www.finra.org/investors/learn-to-invest/types-investments/estate-planning"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('bond-pricing-yields-and-duration-convexity', 'money-career', 'finance', ARRAY['fixed-income', 'bonds', 'duration', 'convexity', 'interest-rates', 'yield-to-maturity']::TEXT[], 'Bond Valuation Mechanics: Yield to Maturity, Macaulay Duration & Convexity', 'Bond prices exhibit an inverse relationship with interest rates. Macaulay and Modified Duration measure the first-derivative price sensitivity of a bond to interest rate fluctuations, while Convexity captures the second-derivative curvature, reflecting how duration changes as market yields shift.', '[{"label": "CFA Institute: Fixed Income Valuation and Duration/Convexity Reading", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/introduction-fixed-income-valuation"}, {"label": "Federal Reserve Bank of New York: Understanding Treasury Yields and Duration", "url": "https://www.newyorkfed.org/research/educational_resources/yield_curve"}, {"label": "SEC: What Are Corporate Bonds and How Do Yields Work?", "url": "https://www.sec.gov/investor/alerts/ib_corporatebonds.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('yield-curve-mechanics-and-term-structure', 'money-career', 'finance', ARRAY['yield-curve', 'term-structure', 'treasuries', 'monetary-policy', 'fixed-income']::TEXT[], 'The Yield Curve: Term Structure of Interest Rates & Expectations Theory', 'The yield curve plots nominal bond yields against maturity terms. Its shape is driven by three main dynamics: Pure Expectations Theory (expectations of future policy rates), Liquidity Premium Theory (compensation for holding longer durations), and Market Segmentation/Preferred Habitat across investor bases.', '[{"label": "US Department of the Treasury: Daily Treasury Par Yield Curve Rates", "url": "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve"}, {"label": "Federal Reserve Bank of St. Louis: Explaining the Yield Curve", "url": "https://www.stlouisfed.org/education/page-one-economics-classroom-edition/yield-curve"}, {"label": "CFA Institute: The Term Structure and Interest Rate Dynamics", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/term-structure-interest-rate-dynamics"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('options-mechanics-black-scholes-and-the-greeks', 'money-career', 'finance', ARRAY['options', 'derivatives', 'black-scholes', 'the-greeks', 'volatility']::TEXT[], 'Options Pricing & The Greeks: Delta, Gamma, Theta, Vega & Rho', 'Options derivative contracts confer the right, but not the obligation, to buy (Call) or sell (Put) an underlying asset at a strike price before expiration. The Black-Scholes-Merton model computes theoretical prices using first- and second-order Greeks: Delta (price sensitivity), Gamma (Delta sensitivity), Theta (time decay), Vega (volatility sensitivity), and Rho (interest rate sensitivity).', '[{"label": "Fischer Black & Myron Scholes: The Pricing of Options and Corporate Liabilities (Journal of Political Economy 1973)", "url": "https://www.jstor.org/stable/1831029"}, {"label": "Chicago Board Options Exchange (CBOE): Options Fundamentals and Greeks Guide", "url": "https://www.cboe.com/tradable_products/equity_indices/options_product_specs/"}, {"label": "Options Clearing Corporation (OCC): Understanding The Greeks and Option Valuation", "url": "https://www.optionseducation.org/advancedconcepts/the-greeks"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('implied-volatility-surface-and-vix-index', 'money-career', 'finance', ARRAY['volatility', 'vix', 'implied-volatility', 'volatility-skew', 'derivatives']::TEXT[], 'Implied Volatility Dynamics: The Volatility Smile, Skew & The VIX Index', 'Implied volatility (IV) reflects the market''s forward-looking standard deviation priced into option premiums. Real-world options exhibit a Volatility Skew / Smile (higher IV for out-of-the-money puts due to crash fear), while the CBOE VIX Index aggregates SPX 30-day option strips to quantify expected 30-day annualized market volatility.', '[{"label": "CBOE VIX Whitepaper: The CBOE Volatility Index Methodology and Calculation", "url": "https://www.cboe.com/micro/vix/vixwhite.pdf"}, {"label": "Emanuel Derman & Iraj Kani: The Volatility Smile and Its Implied Tree (Quantitative Finance Classics)", "url": "https://www.ederman.com/pdf/smile.pdf"}, {"label": "CFA Institute: Option Valuation Concepts and Implied Volatility Analysis", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/valuation-contingent-claims"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('futures-contracts-contango-and-backwardation', 'money-career', 'finance', ARRAY['futures', 'commodities', 'derivatives', 'contango', 'backwardation', 'hedging']::TEXT[], 'Futures Markets: Margining, Contango vs Backwardation & Cost of Carry', 'Futures are standardized exchange-traded contracts requiring daily mark-to-market settlement. When distant contract prices trade above the current spot price due to storage and financing costs, the curve is in Contango (negative roll yield); when spot trades above futures due to immediate demand shortages, the curve is in Backwardation (positive roll yield).', '[{"label": "CME Group Education: Introduction to Futures Contracts and Margining", "url": "https://www.cmegroup.com/education/courses/introduction-to-futures.html"}, {"label": "Commodity Futures Trading Commission (CFTC): Futures Fundamentals & Contract Specifications", "url": "https://www.cftc.gov/LearnAndProtect/EducationCenter/futures.html"}, {"label": "CFA Institute: Principles of Forward and Futures Pricing", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/principles-forward-futures-pricing"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('etfs-vs-mutual-funds-creation-redemption', 'money-career', 'finance', ARRAY['etfs', 'mutual-funds', 'authorized-participants', 'creation-redemption', 'tax-efficiency']::TEXT[], 'ETFs vs Mutual Funds: In-Kind Creation/Redemption & Tax Efficiency', 'Unlike mutual funds that settle once daily at Net Asset Value (NAV), Exchange-Traded Funds (ETFs) trade continuously on secondary exchanges. Authorized Participants (APs) use the in-kind creation/redemption mechanism to arbitrage premiums/discounts to NAV and flush out embedded capital gains, avoiding taxable distributions to fund shareholders.', '[{"label": "SEC: Investor Bulletin: Exchange-Traded Funds (ETFs) and Creation Units", "url": "https://www.sec.gov/investor/alerts/etfs.pdf"}, {"label": "Investment Company Institute (ICI): Understanding Exchange-Traded Funds and Creation/Redemption", "url": "https://www.ici.org/etf-resources"}, {"label": "Vanguard Research: The Mechanics of ETF Creation and Redemption", "url": "https://corporate.vanguard.com/content/dam/corp/research/pdf/understanding-etf-creation-and-redemption-mechanism.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('margin-trading-leverage-and-liquidation-mechanics', 'money-career', 'finance', ARRAY['margin', 'leverage', 'reg-t', 'margin-calls', 'liquidation', 'risk']::TEXT[], 'Margin Trading Mechanics: Regulation T, Maintenance Margin & Forced Liquidation', 'Margin trading allows investors to borrow capital against portfolio securities, amplifying potential returns and downside losses. Under Federal Reserve Regulation T, initial margin requires at least 50% equity; if securities decline below the broker''s maintenance margin (minimum 25%), a margin call triggers forced liquidation without prior notice.', '[{"label": "FINRA Rule 4210: Margin Requirements and Maintenance Calculations", "url": "https://www.finra.org/rules-guidance/rulebooks/finra-rules/4210"}, {"label": "SEC: Margin Rules and Understanding Margin Accounts", "url": "https://www.sec.gov/reportspubs/investor-publications/investorpubsmarginhtm.html"}, {"label": "Federal Reserve Board: Regulation T (Credit by Brokers and Dealers)", "url": "https://www.federalreserve.gov/supervisionreg/regt.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('modern-portfolio-theory-efficient-frontier', 'money-career', 'finance', ARRAY['mpt', 'markowitz', 'efficient-frontier', 'diversification', 'asset-allocation']::TEXT[], 'Modern Portfolio Theory (MPT): The Efficient Frontier & Mean-Variance Optimization', 'Harry Markowitz''s Modern Portfolio Theory demonstrates that asset risk should not be assessed in isolation, but by how it contributes to overall portfolio variance. By combining non-perfectly correlated assets, mean-variance optimization constructs an Efficient Frontier offering the maximum expected return for a given level of portfolio risk.', '[{"label": "Harry Markowitz: Portfolio Selection (The Journal of Finance 1952)", "url": "https://www.jstor.org/stable/2975974"}, {"label": "CFA Institute: Portfolio Management and Modern Portfolio Theory Refresher", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/portfolio-management-an-overview"}, {"label": "William F. Sharpe: Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk (Journal of Finance 1964)", "url": "https://www.jstor.org/stable/2977928"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('capital-asset-pricing-model-capm-beta-alpha', 'money-career', 'finance', ARRAY['capm', 'beta', 'alpha', 'expected-return', 'risk-free-rate', 'asset-pricing']::TEXT[], 'Capital Asset Pricing Model (CAPM): Beta, Alpha & The Security Market Line', 'CAPM calculates the theoretical expected return of an asset based on its systematic risk (Beta) relative to the market portfolio: E(R) = Rf + Beta * (Rm - Rf). Idiosyncratic risk is assumed to be fully diversified away, meaning excess returns over CAPM expectation represent Alpha.', '[{"label": "William F. Sharpe: Capital Asset Prices (The Journal of Finance 1964)", "url": "https://www.jstor.org/stable/2977928"}, {"label": "Eugene F. Fama & Kenneth R. French: The Capital Asset Pricing Model: Theory and Evidence (Journal of Economic Perspectives 2004)", "url": "https://www.aeaweb.org/articles?id=10.1257/0895330042162430"}, {"label": "CFA Institute: Capital Market Theory and the Capital Asset Pricing Model", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-market-theory"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('fama-french-factor-investing-models', 'money-career', 'finance', ARRAY['factor-investing', 'fama-french', 'smart-beta', 'value-premium', 'size-premium']::TEXT[], 'Factor Investing: Fama-French Multi-Factor Models (Size, Value, Momentum)', 'The Fama-French Three-Factor and Five-Factor models expand CAPM by demonstrating that market beta alone cannot explain stock returns. Systematic premiums are harvested across persistent economic factors including Size (SMB - Small Minus Big), Value (HML - High Minus Low book-to-market), Profitability (RMW), and Investment (CMA).', '[{"label": "Eugene F. Fama & Kenneth R. French: Common Risk Factors in the Returns on Stocks and Bonds (JFE 1993)", "url": "https://www.sciencedirect.com/science/article/pii/0304405X93900235"}, {"label": "Eugene F. Fama & Kenneth R. French: A Five-Factor Asset Pricing Model (JFE 2015)", "url": "https://www.sciencedirect.com/science/article/pii/S0304405X1400234X"}, {"label": "Kenneth French Data Library: Factor Returns and Historical Benchmark Series", "url": "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('portfolio-rebalancing-and-tax-loss-harvesting', 'money-career', 'finance', ARRAY['rebalancing', 'tax-loss-harvesting', 'wash-sale', 'portfolio-management', 'taxes']::TEXT[], 'Portfolio Rebalancing Disciplines & Tax-Loss Harvesting Mechanics', 'Portfolio rebalancing maintains target risk allocations through periodic calendar intervals or tolerance band thresholds (e.g. 5/25 rule). In taxable accounts, tax-loss harvesting strategically realizes capital losses to offset capital gains and taxable income, requiring strict compliance with the 30-day IRS Wash-Sale Rule.', '[{"label": "Vanguard Research: Getting Back on Track: Analyzing Alternative Rebalancing Strategies", "url": "https://corporate.vanguard.com/content/dam/corp/research/pdf/analyzing-alternative-rebalancing-strategies.pdf"}, {"label": "IRS Publication 550: Investment Income and Expenses (Wash-Sale Rule)", "url": "https://www.irs.gov/publications/p550#en_US_2022_publink100010601"}, {"label": "MIT Sloan: An Analysis of the Tax-Loss Harvesting Alpha in Equity Portfolios", "url": "https://mitsloan.mit.edu/shared/ods/documents?publicationDocumentID=5878"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('correlation-matrices-and-diversification-math', 'money-career', 'finance', ARRAY['diversification', 'covariance', 'correlation', 'variance', 'portfolio-math']::TEXT[], 'Diversification Mathematics: Covariance Matrices & Volatility Reduction', 'Portfolio variance is calculated using the weighted sum of individual asset variances plus cross-asset covariances: Var(P) = w1^2*s1^2 + w2^2*s2^2 + 2*w1*w2*Cov(1,2). When correlation between two assets is less than 1, overall portfolio volatility drops below the weighted average of individual volatilities without a proportional sacrifice in expected return.', '[{"label": "CFA Institute: Portfolio Risk and Return: Part I (Covariance and Correlation)", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/portfolio-risk-return-part-i"}, {"label": "Yale School of Management: Diversification and the Limits of Arbitrage", "url": "https://som.yale.edu/"}, {"label": "Ray Dalio (Bridgewater Associates): The Holy Grail of Investing (Uncorrelated Return Streams)", "url": "https://www.bridgewater.com/research-and-insights/ray-dalio-on-the-holy-grail-of-investing"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('risk-parity-and-all-weather-asset-allocation', 'money-career', 'finance', ARRAY['risk-parity', 'all-weather', 'bridgewater', 'asset-allocation', 'macro-risk']::TEXT[], 'Risk Parity Frameworks & The All Weather Asset Allocation Model', 'Traditional 60/40 equity/bond portfolios derive over 90% of their total risk from volatile equity swings. Risk Parity (pioneered by Bridgewater''s All Weather fund) balances risk contributions equally across asset classes by leveraging lower-volatility assets (like long Treasuries and TIPS) to match equity volatility, neutralizing exposure across growth and inflation economic regimes.', '[{"label": "Bridgewater Associates: The All Weather Story and Risk Parity Philosophy", "url": "https://www.bridgewater.com/research-and-insights/the-all-weather-story"}, {"label": "Edward Qian: On the Financial Interpretation of Risk Contribution (PanAgora Asset Management)", "url": "https://www.panagora.com/assets/PanAgora-Risk-Contribution.pdf"}, {"label": "CFA Institute: Risk Budgeting and Risk Parity in Multi-Asset Portfolios", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/risk-budgeting"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('central-bank-monetary-policy-transmission', 'money-career', 'finance', ARRAY['federal-reserve', 'monetary-policy', 'interest-rates', 'macroeconomics', 'liquidity']::TEXT[], 'Federal Reserve Monetary Policy & The Transmission Mechanism', 'Central banks steer macroeconomic liquidity using the Federal Funds Rate, open market operations, and interest on reserve balances (IORB). Changes in policy rates transmit through bank lending rates, exchange rates, asset valuations, and aggregate demand to balance the dual mandate of maximum employment and price stability.', '[{"label": "Federal Reserve: The Fed Explained: What the Central Bank Does", "url": "https://www.federalreserve.gov/aboutthefed/the-fed-explained.htm"}, {"label": "Ben S. Bernanke & Alan S. Blinder: The Federal Funds Rate and the Channels of Monetary Transmission (AER 1992)", "url": "https://www.jstor.org/stable/2117929"}, {"label": "Federal Reserve Bank of New York: Monetary Policy Implementation Framework", "url": "https://www.newyorkfed.org/markets/domestic-market-operations/monetary-policy-implementation"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('inflation-mechanics-cpi-pce-and-money-supply', 'money-career', 'finance', ARRAY['inflation', 'cpi', 'pce', 'money-supply', 'macroeconomics', 'purchasing-power']::TEXT[], 'Inflation Dynamics: Demand-Pull, Cost-Push & CPI vs PCE Indices', 'Inflation erodes the purchasing power of money through demand-pull surges (excess demand over productive capacity) or cost-push shocks (supply disruptions). The Consumer Price Index (CPI) tracks a fixed urban consumer basket, while the Personal Consumption Expenditures (PCE) price index accommodates consumer substitution and serves as the Fed''s primary target.', '[{"label": "U.S. Bureau of Labor Statistics: Consumer Price Index Overview & Methodology", "url": "https://www.bls.gov/cpi/"}, {"label": "U.S. Bureau of Economic Analysis (BEA): PCE Price Index Overview", "url": "https://www.bea.gov/data/personal-consumption-expenditures-price-index"}, {"label": "Federal Reserve Bank of San Francisco: Comparing CPI and PCE Inflation Metrics", "url": "https://www.frbsf.org/research-and-insights/publications/economic-letter/2013/february/cpi-pce-inflation-comparison/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('yield-curve-inversion-and-recession-forecasting', 'money-career', 'finance', ARRAY['yield-curve-inversion', 'recession', 'treasuries', 'macroeconomics', 'leading-indicators']::TEXT[], 'Yield Curve Inversion: 10Y-2Y Spread & Recessionary Signals', 'Yield curve inversion occurs when short-term sovereign bond yields exceed long-term yields (such as the 10-Year vs 2-Year or 10-Year vs 3-Month Treasury spreads). Historically, inversion reflects market expectations of future economic deceleration and subsequent central bank rate cuts, serving as one of the most reliable leading indicators of recessions.', '[{"label": "Arturo Estrella & Frederic S. Mishkin: The Yield Curve as a Predictor of U.S. Recessions (Current Issues in Economics and Finance 1996)", "url": "https://www.newyorkfed.org/research/current_issues/ci2-7.html"}, {"label": "Federal Reserve Bank of St. Louis: 10-Year Treasury Constant Maturity Minus 2-Year Treasury Constant Maturity (FRED Data)", "url": "https://fred.stlouisfed.org/series/T10Y2Y"}, {"label": "Federal Reserve Bank of San Francisco: Economic Letter: Which Yield Curve Inversion Best Predicts Recessions?", "url": "https://www.frbsf.org/research-and-insights/publications/economic-letter/2018/august/economic-forecasts-with-yield-curve/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('quantitative-easing-vs-quantitative-tightening', 'money-career', 'finance', ARRAY['quantitative-easing', 'quantitative-tightening', 'central-banks', 'balance-sheet', 'liquidity']::TEXT[], 'Central Bank Balance Sheets: Quantitative Easing (QE) vs Quantitative Tightening (QT)', 'When policy rates hit the zero lower bound, central banks deploy Quantitative Easing (QE) by purchasing long-duration Treasuries and Mortgage-Backed Securities to compress risk premiums and inject market liquidity. Quantitative Tightening (QT) reverses this process via asset runoffs, draining bank reserves and tightening financial conditions.', '[{"label": "Federal Reserve: Central Bank Balance Sheet Trends and Assets", "url": "https://www.federalreserve.gov/monetarypolicy/bst_recenttrends.htm"}, {"label": "Ben S. Bernanke: What Tools Does the Fed Have Left? Part 1: Negative Interest Rates and QE", "url": "https://www.brookings.edu/articles/what-tools-does-the-fed-have-left-part-1-negative-interest-rates/"}, {"label": "Bank for International Settlements (BIS): Unconventional Monetary Policy Tools and Central Bank Reserves", "url": "https://www.bis.org/publ/bppdf/bispap73.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('foreign-exchange-and-purchasing-power-parity', 'money-career', 'finance', ARRAY['forex', 'fx', 'purchasing-power-parity', 'interest-rate-parity', 'currencies']::TEXT[], 'Foreign Exchange Mechanics: Covered Interest Parity & Purchasing Power Parity', 'Foreign exchange rates balance global trade and capital flows through two primary parity conditions. Covered Interest Parity (CIP) links spot FX rates, forward rates, and interest rate differentials to prevent currency arbitrage, while Purchasing Power Parity (PPP) models long-run exchange rates based on relative price baskets between nations.', '[{"label": "Bank for International Settlements: Triennial Central Bank Survey of Foreign Exchange Markets", "url": "https://www.bis.org/statistics/rpfx22.htm"}, {"label": "International Monetary Fund (IMF): Purchasing Power Parity: Weights and Country Comparisons", "url": "https://www.imf.org/en/Publications/fandd/issues/Series/Back-to-Basics/Purchasing-Power-Parity"}, {"label": "CFA Institute: Currency Exchange Rates and Covered/Uncovered Interest Rate Parity", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/currency-exchange-rates"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('fiscal-policy-multipliers-and-debt-to-gdp', 'money-career', 'finance', ARRAY['fiscal-policy', 'national-debt', 'debt-to-gdp', 'macroeconomics', 'keynesian']::TEXT[], 'Fiscal Policy Dynamics: Government Multipliers & Sovereign Debt-to-GDP Sustainability', 'Fiscal policy drives macroeconomic output through discretionary government expenditures and taxation policy. The fiscal multiplier measures the change in real GDP generated per dollar of deficit spending, while long-term debt sustainability depends on the differential between real economic growth rates and sovereign debt borrowing costs (r - g).', '[{"label": "Congressional Budget Office (CBO): The Budget and Economic Outlook Report", "url": "https://www.cbo.gov/publication/59710"}, {"label": "Olivier Blanchard: Public Debt and Low Interest Rates (American Economic Review 2019)", "url": "https://www.aeaweb.org/articles?id=10.1257/aer.109.4.1197"}, {"label": "International Monetary Fund (IMF): Fiscal Monitor: Policies to Guide Public Debt", "url": "https://www.imf.org/en/Publications/FM"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('balance-sheet-anatomy-and-working-capital', 'money-career', 'finance', ARRAY['accounting', 'balance-sheet', 'assets', 'liabilities', 'shareholders-equity']::TEXT[], 'Balance Sheet Analysis: Assets, Liabilities & Shareholders'' Equity', 'The balance sheet provides a snapshot of a firm''s financial position governed by the fundamental accounting equation: Assets = Liabilities + Shareholders'' Equity. Analyzing current assets versus current liabilities determines liquidity cushion, while fixed assets, intangible goodwill, and long-term leverage reveal capital deployment structure.', '[{"label": "SEC: Beginners'' Guide to Financial Statement Analysis (Balance Sheet)", "url": "https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_begfinanal"}, {"label": "FASB: Accounting Standards Codification (ASC 210: Balance Sheet)", "url": "https://asc.fasb.org/"}, {"label": "CFA Institute: Understanding the Balance Sheet", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/understanding-balance-sheets"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('income-statement-analysis-and-revenue-recognition', 'money-career', 'finance', ARRAY['accounting', 'income-statement', 'revenue-recognition', 'asc-606', 'margins']::TEXT[], 'Income Statement Mechanics: Revenue Recognition (ASC 606) & Margin Tiers', 'The income statement tracks operating performance across a period, moving from top-line Gross Revenue down to Net Income through Gross Margin, EBITDA, Operating Income (EBIT), and pretax income. Revenue recognition follows ASC 606 / IFRS 15, matching revenue to the satisfaction of specific contractual performance obligations.', '[{"label": "FASB ASC 606: Revenue from Contracts with Customers Overview", "url": "https://asc.fasb.org/topics/606"}, {"label": "SEC: Guide to Reading Corporate Income Statements and 10-K Filings", "url": "https://www.sec.gov/fast-answers/answers-reada10khtm.html"}, {"label": "CFA Institute: Understanding the Income Statement and Operating Leverage", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/understanding-income-statements"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('cash-flow-statement-direct-vs-indirect-methods', 'money-career', 'finance', ARRAY['accounting', 'cash-flow-statement', 'operating-cash-flow', 'capex', 'free-cash-flow']::TEXT[], 'Cash Flow Statement Analysis: Operating (CFO), Investing (CFI) & Financing (CFF)', 'The statement of cash flows reconciles accrual-based net income to actual cash generation across three sections: Cash from Operations (CFO), Cash from Investing (CFI), and Cash from Financing (CFF). Under the indirect method, non-cash expenses (D&A) and working capital balance sheet changes adjust net income to reveal genuine operating cash flow.', '[{"label": "SEC: Statement of Cash Flows: Direct vs Indirect Method Guide", "url": "https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_statementcashflows"}, {"label": "CFA Institute: Understanding the Statement of Cash Flows", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/understanding-cash-flow-statements"}, {"label": "Harvard Business School Online: How to Read a Cash Flow Statement", "url": "https://online.hbs.edu/blog/post/how-to-read-a-cash-flow-statement"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('financial-ratio-analysis-dupont-identity', 'money-career', 'finance', ARRAY['financial-ratios', 'dupont-analysis', 'roe', 'profitability', 'efficiency']::TEXT[], 'Financial Ratio Analysis & The DuPont Decomposition of ROE', 'Ratio analysis standardizes financial comparison across company sizes. The DuPont Framework breaks Return on Equity (ROE) into three distinct operating drivers: Profit Margin (Net Income / Revenue), Asset Turnover (Revenue / Assets), and Financial Leverage (Assets / Equity), isolating whether ROE growth stems from profitability, operational efficiency, or debt leverage.', '[{"label": "CFA Institute: Financial Analysis Techniques and DuPont Framework", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/financial-analysis-techniques"}, {"label": "Corporate Finance Institute: DuPont Analysis Formula and 3-Step / 5-Step Models", "url": "https://corporatefinanceinstitute.com/resources/accounting/dupont-analysis/"}, {"label": "Investopedia Academic / Financial Review: Deconstructing Return on Equity", "url": "https://www.investopedia.com/terms/d/dupontanalysis.asp"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('quality-of-earnings-and-accrual-anomalies', 'money-career', 'finance', ARRAY['quality-of-earnings', 'accruals', 'forensic-accounting', 'beneish-m-score', 'fraud']::TEXT[], 'Quality of Earnings: Accruals vs Cash Flow & The Beneish M-Score', 'High accounting earnings backed by weak operating cash flow frequently indicate aggressive revenue recognition, deferred maintenance, or earnings manipulation. The Sloan Accrual Anomaly and Beneish M-Score use quantitative balance sheet metrics (DSO surges, gross margin erosion, asset quality index) to detect earnings manipulation risks.', '[{"label": "Richard G. Sloan: Do Stock Prices Fully Reflect Information in Accruals and Cash Flows About Future Earnings? (The Accounting Review 1996)", "url": "https://www.jstor.org/stable/248290"}, {"label": "Messod D. Beneish: The Detection of Earnings Manipulation (Financial Analysts Journal 1999)", "url": "https://www.jstor.org/stable/4480199"}, {"label": "CFA Institute: Financial Reporting Quality and Red Flags", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/financial-reporting-quality"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('inventory-accounting-fifo-vs-lifo', 'money-career', 'finance', ARRAY['inventory', 'fifo', 'lifo', 'cogs', 'accounting-standards']::TEXT[], 'Inventory Accounting Methods: FIFO vs LIFO & Inflationary Distortions', 'Inventory costing methods dictate Cost of Goods Sold (COGS) and ending inventory carrying value. Under inflationary environments, First-In First-Out (FIFO) yields lower COGS and higher reported net income (with higher tax liability), while Last-In First-Out (LIFO) matches current higher replacement costs against revenues, reducing taxable income via the LIFO reserve.', '[{"label": "FASB ASC 330: Inventory Accounting Standards", "url": "https://asc.fasb.org/topics/330"}, {"label": "CFA Institute: Inventories: Cost Formulas and Valuation Methods", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/inventories"}, {"label": "IRS Publication 538: Accounting Periods and Methods (LIFO Conformity Rule)", "url": "https://www.irs.gov/publications/p538"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('capitalization-rates-and-net-operating-income', 'money-career', 'finance', ARRAY['real-estate', 'cap-rate', 'noi', 'commercial-real-estate', 'property-valuation']::TEXT[], 'Real Estate Valuation: Capitalization Rates (Cap Rates) & Net Operating Income (NOI)', 'Commercial real estate valuation centers on Net Operating Income (NOI = Potential Gross Income - Vacancy - Operating Expenses). The Capitalization Rate (Cap Rate = NOI / Property Value) expresses the unlevered annual yield of a property, compressing when capital is abundant or property risk is low, and expanding during market downturns.', '[{"label": "MIT Center for Real Estate: Real Estate Analysis and Valuation Fundamentals", "url": "https://cre.mit.edu/"}, {"label": "CFA Institute: Real Estate Investments & Valuation Methods", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/real-estate-investments"}, {"label": "National Association of Realtors (NAR): Commercial Real Estate Valuation & Cap Rates", "url": "https://www.nar.realtor/commercial-real-estate"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('mortgage-amortization-mathematics-and-points', 'money-career', 'finance', ARRAY['mortgage', 'amortization', 'real-estate', 'refinancing', 'interest-math']::TEXT[], 'Mortgage Amortization Mechanics: Principal Schedules & Refinancing Math', 'Fixed-rate mortgages utilize standard annuity formulas to generate level monthly payments where the interest component dominates early years and gradually transitions toward principal paydown as the balance diminishes. Refinancing decisions evaluate break-even horizons by dividing total upfront closing costs and discount points by monthly payment reductions.', '[{"label": "Consumer Financial Protection Bureau: Exploring Mortgage Loan Options & Amortization Tables", "url": "https://www.consumerfinance.gov/owning-a-home/loan-options/"}, {"label": "Federal Reserve Board: Consumer Handbook on Adjustable-Rate Mortgages (CHARM)", "url": "https://www.federalreserve.gov/pubs/arms/arms_english.htm"}, {"label": "Freddie Mac: Mortgage Refinance Calculator and Break-Even Rules", "url": "https://myhome.freddiemac.com/resources/calculators/refinance"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('reit-structures-and-funds-from-operations-ffo', 'money-career', 'finance', ARRAY['reits', 'ffo', 'affo', 'real-estate-investment-trusts', 'dividends']::TEXT[], 'Real Estate Investment Trusts (REITs): Tax Exemption & FFO/AFFO Metrics', 'REITs operate as tax-advantaged conduit entities exempt from corporate income tax provided they distribute at least 90% of taxable income to shareholders as dividends. Because GAAP depreciation artificially depresses real estate net income, REIT performance is evaluated via Funds From Operations (FFO = Net Income + Depreciation - Gains on Sale) and Adjusted FFO (AFFO).', '[{"label": "SEC: Investor Bulletin: Real Estate Investment Trusts (REITs)", "url": "https://www.sec.gov/investor/alerts/reits.pdf"}, {"label": "Nareit (National Association of REITs): Guide to FFO, AFFO, and REIT Valuation", "url": "https://www.reit.com/reit-basics/reit-terms-definitions"}, {"label": "IRS Section 856: Definition of Real Estate Investment Trusts", "url": "https://www.irs.gov/pub/irs-drop/rr-03-86.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('commercial-debt-service-coverage-ratio-dscr', 'money-career', 'finance', ARRAY['dscr', 'commercial-real-estate', 'underwriting', 'loan-to-value', 'banking']::TEXT[], 'Commercial Real Estate Underwriting: Debt Service Coverage Ratio (DSCR) & LTV', 'Commercial lenders underwrite property loans primarily through the Debt Service Coverage Ratio (DSCR = NOI / Annual Debt Service), typically requiring a minimum 1.20x to 1.35x coverage buffer against revenue volatility. Paired with Loan-to-Value (LTV) and Debt Yield thresholds, DSCR limits maximum loan proceeds regardless of optimistic appraisal valuations.', '[{"label": "Fannie Mae Multifamily Underwriting Guidelines: DSCR and LTV Standards", "url": "https://multifamily.fanniemae.com/originating-underwriting"}, {"label": "Federal Deposit Insurance Corporation (FDIC): Commercial Real Estate Lending Guidance", "url": "https://www.fdic.gov/resources/bankers/commercial-real-estate/"}, {"label": "Corporate Finance Institute: Debt Service Coverage Ratio (DSCR) Calculation", "url": "https://corporatefinanceinstitute.com/resources/commercial-lending/dscr-debt-service-coverage-ratio/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('section-1031-exchanges-and-depreciation-recapture', 'money-career', 'finance', ARRAY['1031-exchange', 'tax-deferral', 'real-estate', 'depreciation-recapture', 'taxes']::TEXT[], 'Section 1031 Like-Kind Exchanges & Depreciation Recapture Rules', 'Internal Revenue Code Section 1031 allows real estate investors to defer capital gains tax and unrecaptured Section 1250 depreciation upon selling an investment property by rolling all proceeds into a ''like-kind'' replacement property. Strict statutory rules mandate identifying replacement properties within 45 days and closing within 180 days via a Qualified Intermediary.', '[{"label": "IRS: Like-Kind Exchanges Under IRC Section 1031 (Fact Sheet FS-2008-18)", "url": "https://www.irs.gov/newsroom/like-kind-exchanges-under-irc-section-1031"}, {"label": "National Association of Realtors: Section 1031 Like-Kind Exchange Rules & Regulations", "url": "https://www.nar.realtor/1031-like-kind-exchange"}, {"label": "IRS Publication 544: Sales and Other Dispositions of Assets (Depreciation Recapture)", "url": "https://www.irs.gov/publications/p544"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('real-estate-pe-waterfalls-and-promote-structures', 'money-career', 'finance', ARRAY['real-estate-pe', 'waterfalls', 'promote', 'hurdle-rate', 'general-partner', 'limited-partner']::TEXT[], 'Real Estate Private Equity: Waterfall Distributions & The Sponsor Promote', 'Real estate joint venture waterfall models distribute cash flows between Limited Partners (LP capital providers) and General Partners (GP sponsors). Payout tiers typically progress from Return of Capital, to Preferred Return (e.g. 8% hurdle), to Tiered Promote splits (e.g. 80/20 LP/GP progressing to 60/40 above an IRR hurdle) to align operational execution with outperformance.', '[{"label": "Urban Land Institute (ULI): Real Estate Capital Markets & Waterfall Structuring", "url": "https://knowledge.uli.org/"}, {"label": "MIT Center for Real Estate: Real Estate Private Equity Financial Modeling", "url": "https://cre.mit.edu/"}, {"label": "Corporate Finance Institute: Real Estate Waterfall Distribution Framework", "url": "https://corporatefinanceinstitute.com/resources/commercial-real-estate/real-estate-waterfall-distribution/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('cap-table-modeling-and-dilution-math', 'money-career', 'finance', ARRAY['cap-table', 'dilution', 'startups', 'venture-capital', 'equity-modeling']::TEXT[], 'Capitalization Tables: Pre-Money vs Post-Money Valuation & Dilution Math', 'A capitalization (cap) table details ownership stakes, share classes, and option pools across funding rounds. In financing rounds, Post-Money Valuation = Pre-Money Valuation + New Investment Capital; existing investor ownership dilutes proportionally by (New Capital / Post-Money Valuation) unless protected by anti-dilution provisions.', '[{"label": "National Venture Capital Association (NVCA): Model Legal Documents & Cap Table Frameworks", "url": "https://nvca.org/model-legal-documents/"}, {"label": "Brad Feld & Jason Mendelson: Venture Deals: Be Smarter Than Your Lawyer and Venture Capitalist (Wiley)", "url": "https://www.venturedeals.com/"}, {"label": "Cooley GO: Understanding Pre-Money and Post-Money Valuation Dilution", "url": "https://www.cooleygo.com/pre-money-post-money-valuation/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('safe-notes-vs-convertible-debt', 'money-career', 'finance', ARRAY['safe-notes', 'convertible-debt', 'startups', 'fundraising', 'y-combinator']::TEXT[], 'Early-Stage Instruments: Post-Money SAFE Notes vs Convertible Promissory Notes', 'Simple Agreements for Future Equity (SAFE notes) and convertible promissory notes allow seed startups to raise bridge capital before establishing a priced equity round. While convertible notes carry interest rates and maturity dates, Y Combinator''s Post-Money SAFE fixes investor dilution immediately at conversion via Valuation Caps and Discount rates.', '[{"label": "Y Combinator: SAFE (Simple Agreement for Future Equity) Standard Primer & Templates", "url": "https://www.ycombinator.com/documents"}, {"label": "SEC: Investor Bulletin: Be Careful with SAFE (Simple Agreement for Future Equity) Securities", "url": "https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_safes"}, {"label": "Cooley GO: SAFE vs Convertible Note: Key Structural Differences", "url": "https://www.cooleygo.com/safe-vs-convertible-note/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('employee-equity-vesting-and-83b-election', 'money-career', 'finance', ARRAY['vesting', '83b-election', 'stock-options', 'iso', 'nso', 'startup-compensation']::TEXT[], 'Startup Equity Compensation: 4-Year Vesting Cliffs & The Section 83(b) Election', 'Startup equity typically vests over 4 years with a 1-year cliff, where 25% vests after 12 months and 1/48th monthly thereafter. Filing an IRS Section 83(b) election within 30 days of receiving unvested restricted stock allows employees to pay income tax on current nominal fair market value rather than future appreciated vesting prices.', '[{"label": "IRS Internal Revenue Code Section 83(b) Election Rules & Filing Requirements", "url": "https://www.irs.gov/businesses/small-businesses-self-employed/statutory-stock-options"}, {"label": "National Center for Employee Ownership (NCEO): Employee Stock Options & Vesting Overview", "url": "https://www.nceo.org/articles/stock-options-restricted-stock"}, {"label": "Cooley GO: What is an 83(b) Election and Why Should You File One?", "url": "https://www.cooleygo.com/what-is-an-83b-election/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('incentive-stock-options-vs-non-qualified-options', 'money-career', 'finance', ARRAY['iso', 'nso', 'stock-options', 'amt', 'tax-strategy', 'startup-equity']::TEXT[], 'Stock Options Taxation: Incentive Stock Options (ISO) vs NSOs & The AMT Trap', 'Incentive Stock Options (ISOs) provide tax advantages by deferring ordinary income taxes upon exercise until the underlying stock is sold as long-term capital gains, but the spread between strike price and Fair Market Value triggers the Alternative Minimum Tax (AMT). Non-Qualified Stock Options (NSOs) trigger immediate ordinary income tax on the spread upon exercise.', '[{"label": "IRS Topic No. 427: Stock Options (ISOs and Nonstatutory Stock Options)", "url": "https://www.irs.gov/taxtopics/tc427"}, {"label": "National Center for Employee Ownership (NCEO): Understanding ISOs, NSOs, and AMT Calculations", "url": "https://www.nceo.org/articles/incentive-stock-options-iso-taxation"}, {"label": "SEC: Employee Stock Option Plans and Shareholder Rights", "url": "https://www.sec.gov/reportspubs/investor-publications/investorpubsoptionsplanshtm.html"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('liquidation-preferences-participating-vs-non-participating', 'money-career', 'finance', ARRAY['liquidation-preference', 'venture-capital', 'term-sheets', 'preferred-stock', 'waterfall']::TEXT[], 'Venture Term Sheets: 1x Non-Participating vs Participating Liquidation Preferences', 'Liquidation preferences determine payout order when a company is acquired or liquidated. 1x Non-Participating Preferred stock guarantees preferred investors get their money back OR convert to common stock to share proceeds pro-rata, while Participating Preferred (''double-dipping'') allows investors to recoup their initial investment AND take their pro-rata share of remaining proceeds.', '[{"label": "Brad Feld & Jason Mendelson: Term Sheets: Liquidation Preferences (Venture Deals)", "url": "https://www.venturedeals.com/"}, {"label": "NVCA Model Term Sheet: Liquidation Preference Clauses & Participation Caps", "url": "https://nvca.org/model-legal-documents/"}, {"label": "Cooley GO: Liquidation Preferences: What Are They and How Do They Work?", "url": "https://www.cooleygo.com/liquidation-preferences/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('section-1202-qsbs-tax-exemption', 'money-career', 'finance', ARRAY['qsbs', 'section-1202', 'startup-tax', 'capital-gains', 'angel-investing']::TEXT[], 'Qualified Small Business Stock (QSBS): Section 1202 Capital Gains Exemption', 'Internal Revenue Code Section 1202 allows founders and early startup investors to exclude up to 100% of federal capital gains tax (up to the greater of $10 million or 10x cost basis) upon selling Qualified Small Business Stock (QSBS). Qualifying criteria mandate holding original-issue C-Corporation stock for at least 5 years where gross assets never exceeded $50 million prior to issuance.', '[{"label": "IRS Section 1202: Qualified Small Business Stock Exemption Guidance", "url": "https://www.irs.gov/businesses/small-businesses-self-employed"}, {"label": "National Venture Capital Association (NVCA): QSBS Policy Overview & Tax Impact", "url": "https://nvca.org/policy/tax/"}, {"label": "Cooley GO: Qualified Small Business Stock (QSBS): What Founders and Investors Need to Know", "url": "https://www.cooleygo.com/qualified-small-business-stock-qsbs/"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('value-at-risk-var-and-expected-shortfall', 'money-career', 'finance', ARRAY['risk-management', 'var', 'cvar', 'expected-shortfall', 'financial-risk']::TEXT[], 'Quantitative Risk Metrics: Value at Risk (VaR) & Expected Shortfall (CVaR)', 'Value at Risk (VaR) quantifies the maximum expected financial loss across a portfolio over a given time horizon at a specific confidence level (e.g. 99% 1-day VaR). Because VaR ignores tail risk beyond the threshold percentile, Conditional VaR (Expected Shortfall) measures the expected average loss given that the VaR threshold has been breached.', '[{"label": "Basel Committee on Banking Supervision (BIS): Fundamental Review of the Trading Book (FRTB: VaR to Expected Shortfall)", "url": "https://www.bis.org/bcbs/publ/d352.htm"}, {"label": "Philippe Jorion: Value at Risk: The New Benchmark for Managing Financial Risk (McGraw-Hill)", "url": "https://www.mheducation.com/highered/product/value-risk-new-benchmark-managing-financial-risk-jorion/9780071464956.html"}, {"label": "CFA Institute: Measuring and Managing Market Risk with VaR and CVaR", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/measuring-managing-market-risk"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('portfolio-hedging-protective-puts-and-collars', 'money-career', 'finance', ARRAY['hedging', 'options', 'protective-put', 'collar', 'downside-protection']::TEXT[], 'Downside Risk Hedging: Protective Puts, Collars & Delta Hedging', 'Portfolio hedging mitigates equity drawdowns without triggering outright stock sales. A Protective Put purchases downside insurance by capping max loss at the put strike, while a Collar strategy finances the put purchase by simultaneously selling an out-of-the-money Covered Call, capping upside in exchange for cost-neutral downside protection.', '[{"label": "CBOE: Options Strategies: Protective Put and Collar Construction", "url": "https://www.cboe.com/education/tools_and_resources/strategies/"}, {"label": "Options Clearing Corporation (OCC): Hedging Long Stock Positions with Options", "url": "https://www.optionseducation.org/strategies/all-strategies"}, {"label": "CFA Institute: Option Strategies and Risk Profile Modification", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/option-strategies"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('position-sizing-and-the-kelly-criterion', 'money-career', 'finance', ARRAY['position-sizing', 'kelly-criterion', 'risk-management', 'portfolio-allocation', 'bankroll']::TEXT[], 'Position Sizing Mathematics: The Kelly Criterion & Risk of Ruin', 'The Kelly Criterion calculates the mathematically optimal fraction of capital to allocate to an investment with positive expected edge (f* = (bp - q) / b) to maximize long-term geometric capital growth. To prevent catastrophic drawdowns and risk of ruin caused by estimation errors in real-world markets, practitioners employ fractional Kelly sizing (e.g. half-Kelly).', '[{"label": "J. L. Kelly Jr.: A New Interpretation of Information Rate (Bell System Technical Journal 1956)", "url": "https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf"}, {"label": "Edward O. Thorp: The Kelly Criterion in Investing and Gambling (Handbook of Asset and Liability Management)", "url": "https://www.edwardothorp.com/wp-content/uploads/2016/11/TheKellyCriterion2007.pdf"}, {"label": "William Poundstone: Fortune''s Formula: The Untold Story of the Scientific Betting System (Hill and Wang)", "url": "https://us.macmillan.com/books/9780865477506/fortunesformula"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('liquidity-risk-and-bid-ask-spread-slippage', 'money-career', 'finance', ARRAY['liquidity-risk', 'bid-ask-spread', 'market-impact', 'order-book', 'execution']::TEXT[], 'Market Microstructure: Bid-Ask Spreads, Market Impact & Slippage Costs', 'Liquidity risk measures the friction and cost incurred when entering or exiting an asset position. In shallow order books, large market orders exceed top-of-book depth, generating execution slippage and market impact costs that erode net portfolio returns.', '[{"label": "Maureen O''Hara: Market Microstructure Theory (Blackwell Publishers)", "url": "https://onlinelibrary.wiley.com/doi/book/10.1002/9781444307689"}, {"label": "CFA Institute: Market Microstructure, Order Types and Execution Costs", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/market-organization-structure"}, {"label": "SEC: Equity Market Structure Literature Review: Execution Quality and Spreads", "url": "https://www.sec.gov/marketresearch/research-reports"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('counterparty-risk-and-credit-default-swaps', 'money-career', 'finance', ARRAY['counterparty-risk', 'cds', 'credit-derivatives', 'isda', 'clearinghouse']::TEXT[], 'Counterparty Credit Risk & Credit Default Swaps (CDS)', 'Counterparty risk is the hazard that the other party to a bilateral financial contract defaults before fulfilling their contractual obligations. Credit Default Swaps (CDS) act as financial insurance against reference entity bond defaults, while central clearing counterparties (CCPs) mandate variation margin posting to neutralize bilateral exposure.', '[{"label": "International Swaps and Derivatives Association (ISDA): Over-the-Counter Derivatives & Master Agreement", "url": "https://www.isda.org/category/margin/"}, {"label": "Bank for International Settlements (BIS): Credit Default Swaps and Systemic Risk", "url": "https://www.bis.org/publ/qtrpdf/r_qt1012e.htm"}, {"label": "CFA Institute: Credit Default Swaps and Counterparty Risk Management", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/credit-default-swaps"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('stress-testing-and-scenario-analysis-dodd-frank', 'money-career', 'finance', ARRAY['stress-testing', 'ccar', 'dodd-frank', 'risk-management', 'banking-resilience']::TEXT[], 'Institutional Risk Governance: Stress Testing & Scenario Analysis (CCAR)', 'Under Dodd-Frank and Basel III frameworks, major financial institutions conduct Comprehensive Capital Analysis and Review (CCAR) stress tests against severely adverse macroeconomic scenarios (GDP collapse, unemployment spikes, equity market drops). Stress testing verifies that banks maintain regulatory Tier 1 Common Capital buffers to withstand prolonged economic distress without sovereign bailouts.', '[{"label": "Federal Reserve Board: Comprehensive Capital Analysis and Review (CCAR) Stress Test Rules", "url": "https://www.federalreserve.gov/supervisionreg/ccar.htm"}, {"label": "Bank for International Settlements (BIS): Principles for Sound Stress Testing Practices and Supervision", "url": "https://www.bis.org/publ/bcbs155.htm"}, {"label": "CFA Institute: Risk Management Applications: Stress Testing and Scenario Modeling", "url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/risk-management-applications"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('automated-market-makers-constant-product-formula', 'money-career', 'finance', ARRAY['defi', 'amm', 'liquidity-pools', 'constant-product', 'market-microstructure']::TEXT[], 'Automated Market Makers (AMM): Constant Product Invariant (x * y = k)', 'Automated Market Makers replace traditional order books with pooled liquidity algorithms governed by the constant product invariant x * y = k. Traders execute directly against liquidity pools, where token ratios automatically determine spot prices and trade sizes induce programmatic marginal price slippage.', '[{"label": "Hayden Adams: Uniswap v2 Core Whitepaper (Constant Product Formula)", "url": "https://uniswap.org/whitepaper.pdf"}, {"label": "Vitalik Buterin: Improving Front Running Resistance of x*y=k Market Makers", "url": "https://ethresear.ch/t/improving-front-running-resistance-of-x-y-k-market-makers/1281"}, {"label": "Bank for International Settlements (BIS): Decentralised Finance (DeFi) Automated Market Making Overview", "url": "https://www.bis.org/publ/bppdf/bispap123.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('impermanent-loss-mechanics-in-liquidity-pools', 'money-career', 'finance', ARRAY['impermanent-loss', 'amm', 'defi', 'liquidity-provision', 'yield-farming']::TEXT[], 'Impermanent Loss: Opportunity Cost & Convexity in AMM Liquidity Provision', 'Impermanent loss measures the valuation divergence between depositing token pairs into a constant-product AMM pool versus simply holding them in a wallet. When external market prices shift, arbitrageurs extract profit from the pool until pool ratios match external prices, leaving liquidity providers with a loss relative to simple HODLing unless trading fee yields compensate for the divergence.', '[{"label": "Pintail: Uniswap: A Good Deal on Liquidity? (Mathematical Analysis of Impermanent Loss)", "url": "https://pintail.medium.com/uniswap-a-good-deal-on-liquidity-7c2e0e4a36ac"}, {"label": "Uniswap Documentation: Understanding Returns and Impermanent Loss", "url": "https://docs.uniswap.org/contracts/v2/concepts/core-concepts/pools"}, {"label": "Dan Robinson: Concentrated Liquidity and Capital Efficiency in Uniswap v3", "url": "https://uniswap.org/whitepaper-v3.pdf"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('stablecoin-architectures-and-depegging-mechanics', 'money-career', 'finance', ARRAY['stablecoins', 'depegging', 'defi', 'monetary-economics', 'collateral']::TEXT[], 'Stablecoin Economics: Fiat-Backed, Crypto-Overcollateralized & Algorithmic Risks', 'Stablecoins peg digital assets to sovereign currencies through three core collateral models: fiat-backed reserve custodians (USDC/USDT), overcollateralized decentralized debt positions with automated liquidation engines (DAI/MakerDAO), and uncollateralized algorithmic seigniorage shares which remain prone to death-spiral run hazards.', '[{"label": "MakerDAO: The Maker Protocol Whitepaper (Multi-Collateral Dai Architecture)", "url": "https://makerdao.com/en/whitepaper"}, {"label": "Federal Reserve Board: Stablecoins: Growth Potential and Impact on Financial Stability", "url": "https://www.federalreserve.gov/econres/notes/feds-notes/stablecoins-growth-potential-and-impact-on-financial-stability-20220916.html"}, {"label": "Bank for International Settlements: Stablecoins: Risks, Potential and Regulation", "url": "https://www.bis.org/publ/work905.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('proof-of-stake-staking-yields-and-slashing-risk', 'money-career', 'finance', ARRAY['proof-of-stake', 'staking', 'slashing', 'ethereum', 'yield', 'risk']::TEXT[], 'Proof-of-Stake Economics: Staking Yields, Dilution & Slashing Risk', 'In Proof-of-Stake consensus, staking yields derive from a combination of programmatic token issuance inflation and transaction priority fees (MEV). Validators risk severe financial penalties (slashing) and loss of bonded principal if they engage in double-signing or extended equivocation downtime.', '[{"label": "Ethereum Foundation: Proof-of-Stake Staking and Reward Economics", "url": "https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/"}, {"label": "Vitalik Buterin: Proof of Stake FAQ & Economic Security Bounds", "url": "https://vitalik.eth.limo/general/2017/12/31/pos_faq.html"}, {"label": "Coinbase Institutional: Staking as a Financial Asset Class & Yield Mechanics", "url": "https://www.coinbase.com/institutional/research-insights/research/market-intelligence/guide-to-staking"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('defi-lending-protocols-and-liquidation-thresholds', 'money-career', 'finance', ARRAY['defi-lending', 'aave', 'compound', 'collateral', 'liquidation-threshold', 'interest-rate-models']::TEXT[], 'DeFi Money Markets: Overcollateralized Lending, Utilization Rates & Liquidation Thresholds', 'Decentralized lending protocols (Aave, Compound) manage liquidity pools where borrowing interest rates float dynamically based on capital utilization curves (U = Borrows / Total Liquidity). To protect protocol solvency without credit checks, loans require overcollateralization; if collateral value falls below the Liquidation Threshold, third-party liquidators seize collateral at a discount.', '[{"label": "Aave Protocol Whitepaper v2 & v3: Risk Parameters, Health Factor, and Liquidation Engine", "url": "https://aave.com/whitepaper.pdf"}, {"label": "Robert Leshner & Geoffrey Hayes: Compound: The Money Market Protocol", "url": "https://compound.finance/documents/Compound.Whitepaper.pdf"}, {"label": "Bank for International Settlements (BIS): Decentralised Lending and Financial Stability", "url": "https://www.bis.org/publ/work936.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('flash-loans-and-uncollateralized-arbitrage', 'money-career', 'finance', ARRAY['flash-loans', 'defi', 'arbitrage', 'mev', 'smart-contracts']::TEXT[], 'Flash Loans & Atomic Uncollateralized Arbitrage Economics', 'Flash loans allow market participants to borrow millions in uncollateralized capital for the duration of a single blockchain transaction, provided the full principal plus a micro-fee is returned before execution completes. If the loan is not repaid by transaction end, the entire state change reverts atomically, eliminating credit default risk for the protocol.', '[{"label": "Aave Documentation: Flash Loans Technical Specification and Use Cases", "url": "https://docs.aave.com/developers/guides/flash-loans"}, {"label": "Philip Daian et al.: Flash Boys 2.0: Frontrunning, Transaction Reordering, and Consensus Instability in Decentralized Exchanges", "url": "https://arxiv.org/abs/1904.05234"}, {"label": "Bank for International Settlements: Flash Loans and Financial Stability Implications", "url": "https://www.bis.org/publ/work936.htm"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

INSERT INTO public.topics (id, group_name, category, tags, title, description, resources)
VALUES ('real-world-assets-rwa-and-onchain-treasuries', 'money-career', 'finance', ARRAY['rwa', 'tokenization', 'treasuries', 'defi', 'capital-markets']::TEXT[], 'Real-World Asset (RWA) Tokenization & On-Chain Sovereign Debt Yields', 'Real-World Asset (RWA) tokenization bridges traditional capital market instruments (short-term US Treasuries, private credit, commercial real estate) onto public blockchains via bankruptcy-remote Special Purpose Vehicles (SPVs). Tokenized Treasuries import risk-free sovereign yields directly into decentralized financial protocols, compressing yield spread friction.', '[{"label": "Federal Reserve Board: Tokenization: Overview and Financial Stability Considerations", "url": "https://www.federalreserve.gov/econres/notes/feds-notes/tokenization-overview-and-financial-stability-considerations-20230908.html"}, {"label": "Bank for International Settlements (BIS): The Tokenisation of Assets and Financial Market Infrastructure", "url": "https://www.bis.org/cpmi/publ/d186.htm"}, {"label": "BlackRock: Institutional Tokenization and Digital Liquidity Funds (BUIDL Whitepaper)", "url": "https://www.blackrock.com/us/individual/education/digital-assets"}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    resources = EXCLUDED.resources;

