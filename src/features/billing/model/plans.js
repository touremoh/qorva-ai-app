/** Features shown on each plan card, by Stripe product name. */
export const PLAN_FEATURES = {
	Starter: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.starter.users', included: true },
		{ labelKey: 'pricing.starter.matchingActions', included: true },
		{ labelKey: 'pricing.starter.aiChat', included: true },
		{ labelKey: 'pricing.starter.queries', included: true },
		{ labelKey: 'pricing.starter.emailTemplates', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: false },
		{ labelKey: 'pricing.features.brandedMatchReport', included: false },
		{ labelKey: 'pricing.features.accountManager', included: false },
		{ labelKey: 'pricing.features.sla', included: false },
	],
	Pro: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.pro.users', included: true },
		{ labelKey: 'pricing.pro.matchingActions', included: true },
		{ labelKey: 'pricing.pro.aiChat', included: true },
		{ labelKey: 'pricing.pro.queries', included: true },
		{ labelKey: 'pricing.pro.emailTemplates', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: false },
		{ labelKey: 'pricing.features.brandedMatchReport', included: false },
		{ labelKey: 'pricing.features.accountManager', included: false },
		{ labelKey: 'pricing.features.sla', included: false },
	],
	Scale: [
		{ labelKey: 'pricing.features.freeTrial', included: true },
		{ labelKey: 'pricing.scale.users', included: true },
		{ labelKey: 'pricing.scale.matchingActions', included: true },
		{ labelKey: 'pricing.scale.aiChat', included: true },
		{ labelKey: 'pricing.scale.queries', included: true },
		{ labelKey: 'pricing.scale.emailTemplates', included: true },
		{ labelKey: 'pricing.features.brandedCvExport', included: true },
		{ labelKey: 'pricing.features.brandedMatchReport', included: true },
		{ labelKey: 'pricing.features.accountManager', included: true },
		{ labelKey: 'pricing.features.sla', included: true },
	],
};

/** Whole-unit price, e.g. $49, from a Stripe unit amount in cents. */
export const formatPrice = (unitAmount, currency) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: (currency || 'usd').toUpperCase(),
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(unitAmount / 100);
