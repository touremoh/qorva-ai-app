import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppScreeningCVMatching = ({ analysisResults }) => {
	const { t } = useTranslation();
	const [selectedResult, setSelectedResult] = useState(null);

	const handleListItemClick = (result) => {
		setSelectedResult(result);
	};

	// Sorting the analysis results in descending order based on the score
	const sortedResults = analysisResults
		? [...analysisResults].sort((a, b) => parseFloat(b.overall_summary.score) - parseFloat(a.overall_summary.score))
		: [];

	return (
		<Box sx={{ display: 'flex', width: '76%', height: '70vh', overflow: 'hidden', padding: 2, boxShadow: 1, backgroundColor: 'white', marginLeft: 2 }}>
			{/* Part 1: List of Analyzed Results (Tabs) */}
			<Box sx={{ width: '30%', borderRight: '1px solid lightgray' }}>
				<Typography variant="h6" sx={{ padding: 2, fontWeight: 'bold' }}>
					{t('appCVScreening.analyzedResults')}
				</Typography>
				<Divider />

				<List sx={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
					{sortedResults &&
						sortedResults.map((result, index) => (
							<ListItem
								key={index}
								button
								onClick={() => handleListItemClick(result)}
								divider
								selected={selectedResult && selectedResult.candidate_name === result.candidate_name}
								sx={{
									cursor: 'pointer',
									position: 'relative',
									'&:hover': { backgroundColor: '#f5f5f5' },
								}}
							>
								{/* Green Badge */}
								{selectedResult && selectedResult.candidate_name === result.candidate_name && (
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
											<span>{result.candidate_name}</span>
											<span
												style={{
													color: parseFloat(result.overall_summary.score) >= 70
														? 'green'
														: parseFloat(result.overall_summary.score) >= 40
															? 'orange'
															: 'red',
												}}
											>
												{result.overall_summary.score}%
											</span>
										</Box>
									}
									secondary={`${result.job_title}`}
								/>
							</ListItem>
						))}
				</List>
			</Box>

			{/* Part 2: Detailed Analysis Results */}
			<Box sx={{ flex: 1, padding: 3, overflowY: 'scroll', height: '100%' }}>
				{selectedResult ? (
					<>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
							{t('appCVScreening.analysisDetails')}
						</Typography>
						<Divider sx={{ marginBottom: 2 }} />

						{/* Skills Match */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.skillsMatch')}
							</Typography>
							<Typography variant="body2">{selectedResult.skills_match.summary}</Typography>
						</Box>

						{/* Exceeds Requirements */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.exceedsRequirements')}
							</Typography>
							<Typography variant="body2">{selectedResult.exceeds_requirements.summary}</Typography>
						</Box>

						{/* Lacking Skills */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.lackingSkills')}
							</Typography>
							<Typography variant="body2">{selectedResult.lacking_skills.summary}</Typography>
						</Box>

						{/* Experience Alignment */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.experienceAlignment')}
							</Typography>
							<Typography variant="body2">{selectedResult.experience_alignment.summary}</Typography>
						</Box>

						{/* Overall Summary */}
						<Box sx={{ border: '1px solid lightgray', borderRadius: '8px', padding: 2, marginBottom: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
								{t('appCVScreening.overallSummary')}
							</Typography>
							<Typography variant="body2">{selectedResult.overall_summary.summary}</Typography>
							<Typography variant="body2">{`${t('appCVScreening.score')}: ${selectedResult.overall_summary.score}`}</Typography>
							<Typography variant="body2">
								{t('appCVScreening.pointsForImprovement')}: {selectedResult.overall_summary.points_for_improvement.join(', ')}
							</Typography>
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
								{selectedResult.interview_questions.skills_based_questions.map((question, index) => (
									<li key={index}>
										<Typography variant="body2">{question}</Typography>
									</li>
								))}
							</ol>

							<Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
								{t('appCVScreening.strengthBasedQuestions')}
							</Typography>
							<ol>
								{selectedResult.interview_questions.strength_based_questions.map((question, index) => (
									<li key={index}>
										<Typography variant="body2">{question}</Typography>
									</li>
								))}
							</ol>

							<Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginTop: 1 }}>
								{t('appCVScreening.gapExplorationQuestions')}
							</Typography>
							<ol>
								{selectedResult.interview_questions.gap_exploration_questions.map((question, index) => (
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

AppScreeningCVMatching.propTypes = {
	analysisResults: PropTypes.arrayOf(
		PropTypes.shape({
			job_title: PropTypes.string.isRequired,
			candidate_name: PropTypes.string.isRequired,
			skills_match: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				degree_of_match: PropTypes.string.isRequired,
			}).isRequired,
			exceeds_requirements: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			lacking_skills: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			experience_alignment: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			overall_summary: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				score: PropTypes.string.isRequired,
				points_for_improvement: PropTypes.arrayOf(PropTypes.string).isRequired,
			}).isRequired,
			interview_questions: PropTypes.shape({
				skills_based_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
				strength_based_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
				gap_exploration_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
			}).isRequired,
		})
	).isRequired,
};

export default AppScreeningCVMatching;
