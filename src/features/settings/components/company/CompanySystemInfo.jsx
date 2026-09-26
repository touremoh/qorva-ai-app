import PropTypes from 'prop-types';
import FieldTile from '../../../../shared/ui/FieldTile.jsx';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Paper } from '@mui/material';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Read-only identifiers of the company account. */
const CompanySystemInfo = ({ tenantReadOnly }) => {
    const { t } = useTranslation();
    return (
        <>
        <Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
            <SectionHeader icon={InfoOutlinedIcon} label={t('accountSettings.company.systemSection')} />
            <FieldTile
                icon={FingerprintOutlinedIcon}
                label={t('accountSettings.company.organizationId')}
                value={tenantReadOnly.organizationId}
            />
        </Paper>
        </>
    );
};

CompanySystemInfo.propTypes = {
    tenantReadOnly: PropTypes.any,
};

export default CompanySystemInfo;
