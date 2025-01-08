import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppScreeningReportDetails = ({ reportData }) => {
	const { t } = useTranslation();
	const [selectedResult, setSelectedResult] = useState(null);

	const handleListItemClick = (result) => {
		setSelectedResult(result);
	};

	// Sorting the analysis results in descending order based on the score
	const sortedResults = reportData?.reportDetails
		? [...reportData.reportDetails].sort((a, b) => parseFloat(b.overallSummary.score) - parseFloat(a.overallSummary.score))
		: [];

	return (
		<Box sx={{ display: 'flex', width: '76%', height: '75vh', overflow: 'hidden', padding: 2, boxShadow: 1, backgroundColor: 'white', marginLeft: 2, color: '#232F3E' }}>
			{/* Part 1: List of Analyzed Results (Tabs) */}
			<Box sx={{ width: '30%', borderRight: '1px solid lightgray' }}>
				<Typography variant="h6" sx={{ padding: 2, fontWeight: 'bold' }}>
					{t('appCVScreening.analyzedResults')}
				</Typography>
				<Divider />

				<List sx={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
					{sortedResults.map((result, index) => (
						<ListItem
							key={index}
							button={true}
							onClick={() => handleListItemClick(result)}
							divider={true}
							selected={selectedResult?.id === result.id}
							sx={{
								cursor: 'pointer',
								position: 'relative',
								'&:hover': { backgroundColor: '#f5f5f5' },
							}}
						>
							{/* Green Badge */}
							{selectedResult?.candidateName === result.candidateName && (
								<Chip
									sx={{
										position: 'absolute',
										left: 0,
										top: '50%',
										transform: 'translateY(-50%)',
										backgroundColor: 'green',
										width: '5px',
										height: '100%',
									}}
								/>
							)}
							<ListItemText
								primary={
									<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
										<span>{result.candidateName}</span>
										<span
											style={{
												color: parseFloat(result.overallSummary.score) >= 70
													? 'green'
													: parseFloat(result.overallSummary.score) >= 40
														? 'orange'
														: 'red',
											}}
										>
                                            {result.overallSummary.score}%
                                        </span>
									</Box>
								}
								secondary={`${result.jobTitle}`}
							/>
						</ListItem>
					))}
				</List>
			</Box>

			{/* Part 2: Detailed Analysis Results */}
			<Box sx={{ flex: 1, padding: 3, overflowY: 'scroll', height: '100%', textAlign: 'justify' }}>
				{selectedResult ? (
					<>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
							{t('appCVScreening.analysisDetails')}
						</Typography>
						<Divider sx={{ marginBottom: 2 }} />

						{/* Overall Summary */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.overallSummary')}
							</Typography>
							<Typography variant="body2">{selectedResult.overallSummary.summary}</Typography>
							<Typography variant="body2">{`${t('appCVScreening.score')}: ${selectedResult.overallSummary.score}`}</Typography>
							<Typography variant="body2">
								{t('appCVScreening.pointsForImprovement')}: {selectedResult.overallSummary.pointsForImprovement.join(', ')}
							</Typography>
						</Box>

						{/* Skills Match */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.skillsMatch')}
							</Typography>
							<Typography variant="body2">{selectedResult.skillsMatch.summary}</Typography>
						</Box>

						{/* Exceeds Requirements */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.exceedsRequirements')}
							</Typography>
							<Typography variant="body2">{selectedResult.exceedsRequirements.summary}</Typography>
						</Box>

						{/* Lacking Skills */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.lackingSkills')}
							</Typography>
							<Typography variant="body2">{selectedResult.lackingSkills.summary}</Typography>
						</Box>

						{/* Experience Alignment */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.experienceAlignment')}
							</Typography>
							<Typography variant="body2">{selectedResult.experienceAlignment.summary}</Typography>
						</Box>

						{/* Interview Questions */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.interviewQuestions')}
							</Typography>

							<Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
								{t('appCVScreening.skillsBasedQuestions')}
							</Typography>
							<ol>
								{selectedResult.interviewQuestions.skillsBasedQuestions.map((question, index) => (
									<li key={index}>
										<Typography variant="body2">{question}</Typography>
									</li>
								))}
							</ol>

							<Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
								{t('appCVScreening.strengthBasedQuestions')}
							</Typography>
							<ol>
								{selectedResult.interviewQuestions.strengthBasedQuestions.map((question, index) => (
									<li key={index}>
										<Typography variant="body2">{question}</Typography>
									</li>
								))}
							</ol>

							<Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
								{t('appCVScreening.gapExplorationQuestions')}
							</Typography>
							<ol>
								{selectedResult.interviewQuestions.gapExplorationQuestions.map((question, index) => (
									<li key={index}>
										<Typography variant="body2">{question}</Typography>
									</li>
								))}
							</ol>
						</Box>
					</>
				) : (
					<Typography variant="body1">
						{t('appCVScreening.noAnalysisResult')}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

AppScreeningReportDetails.propTypes = {
	reportData: PropTypes.shape({
		reportDetails: PropTypes.arrayOf(
			PropTypes.shape({
				jobTitle: PropTypes.string.isRequired,
				candidateName: PropTypes.string.isRequired,
				skillsMatch: PropTypes.shape({
					summary: PropTypes.string.isRequired,
					degreeOfMatch: PropTypes.number.isRequired,
				}).isRequired,
				exceedsRequirements: PropTypes.shape({
					summary: PropTypes.string.isRequired,
				}).isRequired,
				lackingSkills: PropTypes.shape({
					summary: PropTypes.string.isRequired,
				}).isRequired,
				experienceAlignment: PropTypes.shape({
					summary: PropTypes.string.isRequired,
				}).isRequired,
				overallSummary: PropTypes.shape({
					summary: PropTypes.string.isRequired,
					score: PropTypes.number.isRequired,
					pointsForImprovement: PropTypes.arrayOf(PropTypes.string).isRequired,
				}).isRequired,
				interviewQuestions: PropTypes.shape({
					skillsBasedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
					strengthBasedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
					gapExplorationQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
				}).isRequired,
			})
		)
	})
};

export default AppScreeningReportDetails;
