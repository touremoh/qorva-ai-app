import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Typography,
	Button,
	Grid,
	Chip,
	Stack,
	CircularProgress,
	Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../auth/api/registrationService.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';
import BillingIntervalToggle from './pricing/BillingIntervalToggle.jsx';
import PlanFeatureList from './pricing/PlanFeatureList.jsx';
import { PLAN_FEATURES, formatPrice } from '../model/plans.js';

const PricingCard = styled(Box)(({ theme, recommended, selected }) => ({
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	borderRadius: '20px',
	padding: theme.spacing(3.5),
	background: recommended
		? `linear-gradient(145deg, ${tokens.ink.navyDeep} 0%, ${tokens.ink.navy} 55%, ${tokens.ink.slateDeep} 100%)`
		: `${tokens.surface.paper}`,
	border: recommended
		? 'none'
		: selected
			? `2px solid ${tokens.brand.main}`
			: '1px solid rgba(0,0,0,0.07)',
	boxShadow: recommended
		? selected
			? `0 0 0 2px ${tokens.brand.main}, 0 24px 48px -12px rgba(35,47,62,0.4)`
			: '0 24px 48px -12px rgba(35,47,62,0.35)'
		: selected
			? `0 8px 24px ${alpha(tokens.brand.main, 0.2)}`
			: '0 4px 16px rgba(0,0,0,0.06)',
	transition: 'transform 0.25s ease, box-shadow 0.25s ease',
	position: 'relative',
	cursor: 'pointer',
	'&:hover': {
		transform: 'translateY(-5px)',
		boxShadow: recommended
			? '0 32px 56px -12px rgba(35,47,62,0.45)'
			: '0 12px 28px rgba(0,0,0,0.1)',
	},
}));

const QorvaPricingTable = ({ selectedPriceId, onSelectPlan }) => {
	const { t } = useTranslation();
	const [yearly, setYearly] = useState(true);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		getProducts()
			.then((res) => {
				const sorted = (res.data?.data || []).sort((a, b) => {
					const aAmt = a.prices.find((p) => p.interval === 'month')?.unitAmount ?? 0;
					const bAmt = b.prices.find((p) => p.interval === 'month')?.unitAmount ?? 0;
					return aAmt - bAmt;
				});
				setProducts(sorted);
			})
			.catch(() => setError(t('pricing.loadError', 'Failed to load plans. Please try again.')))
			.finally(() => setLoading(false));
	// eslint-disable-next-line react-hooks/exhaustive-deps -- fetch plans once; t is only used for the error text
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress sx={{ color: tokens.brand.text }} />
			</Box>
		);
	}

	if (error) {
		return <Alert severity="error">{error}</Alert>;
	}

	return (
		<Box>
			{/* Billing toggle */}
			<BillingIntervalToggle yearly={yearly} onChange={setYearly} />

			{/* Plan cards */}
			<Grid container spacing={3} alignItems="stretch">
				{products.map((product) => {
					const isRecommended = product.name === 'Pro';
					const monthlyPrice = product.prices.find((p) => p.interval === 'month');
					const yearlyPrice = product.prices.find((p) => p.interval === 'year');
					const activePrice = yearly ? yearlyPrice : monthlyPrice;
					const priceId = activePrice?.stripePriceId;
					const isSelected = selectedPriceId === priceId;
					const features = PLAN_FEATURES[product.name] || [];
					const currency = activePrice?.currency || 'usd';
					const displayMonthly = yearly
						? Math.round((yearlyPrice?.unitAmount ?? 0) / 12)
						: (monthlyPrice?.unitAmount ?? 0);

					return (
						<Grid item xs={12} md={4} key={product.id}>
							<PricingCard
								recommended={isRecommended ? 1 : 0}
								selected={isSelected ? 1 : 0}
								onClick={() => onSelectPlan(priceId)}
							>
								{isRecommended && (
									<Chip
										label={t('pricing.mostPopular', 'Most Popular')}
										size="small"
										sx={{
											position: 'absolute',
											top: 16,
											right: 16,
											background: alpha(tokens.brand.main, 0.22),
											color: tokens.brand.pale,
											fontWeight: 700,
											fontSize: tokens.fontSize.caption,
											border: `1px solid ${alpha(tokens.brand.main, 0.4)}`,
										}}
									/>
								)}

								{isSelected && (
									<CheckCircleIcon
										sx={{ position: 'absolute', top: 16, left: 16, fontSize: tokens.iconSize.lg, color: tokens.brand.text }}
									/>
								)}

								<Typography
									variant="overline"
									sx={{
										fontWeight: 700,
										letterSpacing: 1.5,
										color: isRecommended ? 'rgba(255,255,255,0.7)' : 'text.secondary',
										mb: 1.5,
										display: 'block',
										mt: isSelected ? 2.5 : 0,
									}}
								>
									{product.name}
								</Typography>

								<Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ mb: 0.5 }}>
									<Typography
										component="span"
										sx={{
											fontWeight: 800,
											fontSize: { xs: tokens.fontSize.display, md: tokens.fontSize.display },
											color: isRecommended ? `${tokens.surface.paper}` : 'text.primary',
											lineHeight: 1,
										}}
									>
										{formatPrice(displayMonthly, currency)}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: isRecommended ? 'rgba(255,255,255,0.6)' : 'text.secondary',
											mb: 0.4,
										}}
									>
										{t('pricing.periodMonthly', '/mo')}
									</Typography>
								</Stack>

								{yearly && yearlyPrice && (
									<Typography
										variant="caption"
										sx={{
											color: isRecommended ? 'rgba(255,255,255,0.45)' : 'text.disabled',
											display: 'block',
											mb: 2,
										}}
									>
										{t('pricing.billedYearly', 'Billed {{price}}/year', {
											price: formatPrice(yearlyPrice.unitAmount, currency),
										})}
									</Typography>
								)}

								<Box
									sx={{
										height: '1px',
										background: isRecommended ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
										mb: 2.5,
									}}
								/>

								<PlanFeatureList features={features} inverted={isRecommended} />

								<Button
									fullWidth
									variant="contained"
									size="medium"
									onClick={(e) => { e.stopPropagation(); onSelectPlan(priceId); }}
									sx={{
										borderRadius: '10px',
										py: 1.2,
										fontWeight: 600,
										textTransform: 'none',
										fontSize: tokens.fontSize.body2,
										...(isSelected && {
											backgroundColor: tokens.brand.main,
											'&:hover': { backgroundColor: tokens.brand.hoverAlt },
										}),
										...(isRecommended && !isSelected && {
											backgroundColor: tokens.surface.paper,
											color: tokens.ink.navy,
											'&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
										}),
										...(!isRecommended && !isSelected && {
											backgroundColor: 'transparent',
											border: `1.5px solid ${alpha(tokens.brand.main, 0.6)}`,
											color: tokens.brand.text,
											boxShadow: 'none',
											'&:hover': {
												backgroundColor: alpha(tokens.brand.main, 0.06),
												borderColor: tokens.brand.main,
												boxShadow: 'none',
											},
										}),
									}}
								>
									{isSelected
										? t('pricing.selected', 'Selected')
										: t('pricing.selectPlan', 'Select Plan')}
								</Button>
							</PricingCard>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
};

QorvaPricingTable.propTypes = {
	selectedPriceId: PropTypes.string,
	onSelectPlan: PropTypes.func.isRequired,
};

export default QorvaPricingTable;
