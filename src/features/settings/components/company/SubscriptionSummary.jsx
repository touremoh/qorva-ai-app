import PropTypes from 'prop-types';
import FieldTile from '../../../../shared/ui/FieldTile.jsx';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Paper } from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import QorvaChip from '../../../../components/commons/QorvaChip.jsx';
import { useTranslation } from 'react-i18next';
import { formatLongDate } from '../../../../shared/lib/format.js';

/** Read-only subscription details: plan, status, price and renewal. */
const SubscriptionSummary = ({ billingCycleLabel, priceLabel, sub }) => {
    const { t } = useTranslation();
    return (
        <>
        {sub && (
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
                <SectionHeader icon={CreditCardOutlinedIcon} label={t('accountSettings.company.subscriptionSection')} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <FieldTile
                        icon={CreditCardOutlinedIcon}
                        label={t('accountSettings.subscriptionStatus')}
                    >
                        <QorvaChip statusCode={sub.subscriptionStatus} />
                    </FieldTile>
                    <FieldTile
                        icon={WorkspacePremiumOutlinedIcon}
                        label={t('accountSettings.company.subscriptionPlan')}
                        value={sub.subscriptionPlan}
                    />
                    <FieldTile
                        icon={RepeatOutlinedIcon}
                        label={t('accountSettings.company.billingCycle')}
                        value={billingCycleLabel}
                    />
                    <FieldTile
                        icon={PriceChangeOutlinedIcon}
                        label={t('accountSettings.company.subscriptionPrice')}
                        value={priceLabel}
                    />
                    <FieldTile
                        icon={EventOutlinedIcon}
                        label={t('accountSettings.company.subscriptionStart')}
                        value={formatLongDate(sub.currentPeriodStart)}
                    />
                    <FieldTile
                        icon={EventOutlinedIcon}
                        label={t('accountSettings.company.subscriptionRenewal')}
                        value={formatLongDate(sub.currentPeriodEnd)}
                    />
                </Box>
            </Paper>
        )}
        </>
    );
};

SubscriptionSummary.propTypes = {
    billingCycleLabel: PropTypes.any,
    priceLabel: PropTypes.any,
    sub: PropTypes.any,
};

export default SubscriptionSummary;
