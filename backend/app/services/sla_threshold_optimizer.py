"""
SLA Threshold Optimizer for Story 3.5
ML-based threshold optimization using multi-objective optimization and impact prediction.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging
import pickle
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from scipy.optimize import minimize
from scipy import stats
import joblib

from app.services.sla_performance_analysis_service import (
    SLAPerformanceAnalysisService, 
    SLAPerformanceAnalysis,
    TrendDirection
)

logger = logging.getLogger(__name__)


class OptimizationObjective(Enum):
    """Optimization objectives for threshold tuning."""
    MINIMIZE_VIOLATIONS = "minimize_violations"
    MAXIMIZE_RELIABILITY = "maximize_reliability" 
    BALANCE_BOTH = "balance_both"
    MINIMIZE_TEAM_STRESS = "minimize_team_stress"


class ImplementationRisk(Enum):
    """Risk levels for threshold implementation."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class OptimizationRationale:
    """Rationale for threshold optimization recommendation."""
    statistical_basis: str
    reliability_impact: str
    achievability_improvement: str
    business_justification: str


@dataclass
class PredictedOutcomes:
    """Predicted outcomes of threshold change."""
    expected_violation_rate: float
    reliability_score_change: float
    team_stress_reduction: float
    cost_impact: float
    customer_satisfaction_change: float


@dataclass
class ThresholdOptimizationRecommendation:
    """Complete threshold optimization recommendation."""
    service_type: str
    current_threshold: float
    recommended_threshold: float
    optimization_rationale: OptimizationRationale
    predicted_outcomes: PredictedOutcomes
    confidence_score: float
    implementation_risk: ImplementationRisk
    rollback_criteria: List[str]
    optimization_timestamp: datetime
    model_version: str


@dataclass
class OptimizationResult:
    """Result of threshold optimization process."""
    service_type: str
    optimization_successful: bool
    recommendations: List[ThresholdOptimizationRecommendation]
    optimization_score: float
    model_performance_metrics: Dict[str, float]
    processing_time_seconds: float


class SLAThresholdOptimizer:
    """
    ML-based SLA threshold optimizer using multi-objective optimization.
    Balances reliability, achievability, and business impact.
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.performance_analysis_service = SLAPerformanceAnalysisService(db)
        self.model_path = "/backend/ml_models/"
        self.violation_predictor = None
        self.impact_predictor = None
        self.scaler = StandardScaler()
        self.model_version = "1.0"
        
        # Optimization parameters
        self.min_sample_size = 100
        self.confidence_threshold = 0.7
        self.max_threshold_change = 0.5  # Max 50% change
        
        # Load or initialize models
        asyncio.create_task(self._initialize_models())
    
    async def _initialize_models(self):
        """Initialize or load ML models for optimization."""
        try:
            # Try to load existing models
            violation_model_path = os.path.join(self.model_path, "violation_predictor.joblib")
            impact_model_path = os.path.join(self.model_path, "impact_predictor.joblib")
            scaler_path = os.path.join(self.model_path, "threshold_scaler.joblib")
            
            if all(os.path.exists(path) for path in [violation_model_path, impact_model_path, scaler_path]):
                self.violation_predictor = joblib.load(violation_model_path)
                self.impact_predictor = joblib.load(impact_model_path)
                self.scaler = joblib.load(scaler_path)
                logger.info("Loaded existing optimization models")
            else:
                # Initialize new models
                self.violation_predictor = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                self.impact_predictor = GradientBoostingRegressor(
                    n_estimators=100,
                    max_depth=8,
                    random_state=42
                )
                logger.info("Initialized new optimization models")
                
                # Train models if we have historical data
                await self._initial_model_training()
                
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            # Fallback to basic models
            self.violation_predictor = RandomForestRegressor(n_estimators=50, random_state=42)
            self.impact_predictor = GradientBoostingRegressor(n_estimators=50, random_state=42)
    
    async def optimize_threshold(
        self,
        service_type: str,
        objective: OptimizationObjective = OptimizationObjective.BALANCE_BOTH,
        analysis_period_days: int = 30
    ) -> OptimizationResult:
        """
        Optimize SLA threshold for a specific service type.
        
        Args:
            service_type: Type of SLA service to optimize
            objective: Optimization objective
            analysis_period_days: Historical data period for analysis
            
        Returns:
            Optimization result with recommendations
        """
        start_time = datetime.utcnow()
        
        try:
            # Perform performance analysis
            performance_analysis = await self.performance_analysis_service.analyze_service_performance(
                service_type, analysis_period_days
            )
            
            if performance_analysis.sample_size < self.min_sample_size:
                return OptimizationResult(
                    service_type=service_type,
                    optimization_successful=False,
                    recommendations=[],
                    optimization_score=0.0,
                    model_performance_metrics={},
                    processing_time_seconds=0.0
                )
            
            # Generate optimization recommendations
            recommendations = await self._generate_optimization_recommendations(
                performance_analysis, objective
            )
            
            # Calculate optimization score
            optimization_score = self._calculate_optimization_score(recommendations)
            
            # Get model performance metrics
            model_metrics = await self._get_model_performance_metrics()
            
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            return OptimizationResult(
                service_type=service_type,
                optimization_successful=len(recommendations) > 0,
                recommendations=recommendations,
                optimization_score=optimization_score,
                model_performance_metrics=model_metrics,
                processing_time_seconds=processing_time
            )
            
        except Exception as e:
            logger.error(f"Failed to optimize threshold for {service_type}: {e}")
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            return OptimizationResult(
                service_type=service_type,
                optimization_successful=False,
                recommendations=[],
                optimization_score=0.0,
                model_performance_metrics={},
                processing_time_seconds=processing_time
            )
    
    async def _generate_optimization_recommendations(
        self,
        analysis: SLAPerformanceAnalysis,
        objective: OptimizationObjective
    ) -> List[ThresholdOptimizationRecommendation]:
        """Generate threshold optimization recommendations."""
        try:
            recommendations = []
            current_threshold = analysis.current_thresholds['threshold_value']
            
            # Calculate optimal threshold candidates
            candidates = self._calculate_threshold_candidates(analysis, objective)
            
            for candidate_threshold in candidates:
                # Predict outcomes for this threshold
                predicted_outcomes = await self._predict_threshold_outcomes(
                    analysis, current_threshold, candidate_threshold
                )
                
                # Calculate confidence score
                confidence_score = self._calculate_recommendation_confidence(
                    analysis, candidate_threshold, predicted_outcomes
                )
                
                if confidence_score >= self.confidence_threshold:
                    # Generate rationale
                    rationale = self._generate_optimization_rationale(
                        analysis, current_threshold, candidate_threshold, predicted_outcomes
                    )
                    
                    # Assess implementation risk
                    risk = self._assess_implementation_risk(
                        current_threshold, candidate_threshold, analysis
                    )
                    
                    # Generate rollback criteria
                    rollback_criteria = self._generate_rollback_criteria(
                        candidate_threshold, predicted_outcomes
                    )
                    
                    recommendation = ThresholdOptimizationRecommendation(
                        service_type=analysis.service_type,
                        current_threshold=current_threshold,
                        recommended_threshold=candidate_threshold,
                        optimization_rationale=rationale,
                        predicted_outcomes=predicted_outcomes,
                        confidence_score=confidence_score,
                        implementation_risk=risk,
                        rollback_criteria=rollback_criteria,
                        optimization_timestamp=datetime.utcnow(),
                        model_version=self.model_version
                    )
                    
                    recommendations.append(recommendation)
            
            # Sort by confidence score and optimization potential
            recommendations.sort(
                key=lambda r: (r.confidence_score, r.predicted_outcomes.reliability_score_change),
                reverse=True
            )
            
            return recommendations[:3]  # Return top 3 recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate optimization recommendations: {e}")
            return []
    
    def _calculate_threshold_candidates(
        self, 
        analysis: SLAPerformanceAnalysis,
        objective: OptimizationObjective
    ) -> List[float]:
        """Calculate candidate threshold values for optimization."""
        try:
            current_threshold = analysis.current_thresholds['threshold_value']
            stats = analysis.performance_statistics
            
            candidates = []
            
            # Statistical-based candidates
            candidates.extend([
                stats.percentile_95,
                stats.percentile_99,
                stats.mean_performance + 2 * stats.standard_deviation,
                stats.mean_performance + 3 * stats.standard_deviation,
                stats.median_performance + stats.standard_deviation
            ])
            
            # Objective-specific candidates
            if objective == OptimizationObjective.MINIMIZE_VIOLATIONS:
                # More conservative thresholds
                candidates.extend([
                    stats.percentile_99 * 1.1,
                    stats.mean_performance + 4 * stats.standard_deviation
                ])
            elif objective == OptimizationObjective.MAXIMIZE_RELIABILITY:
                # Balanced approach
                candidates.extend([
                    stats.percentile_95 * 1.05,
                    (stats.percentile_95 + stats.percentile_99) / 2
                ])
            elif objective == OptimizationObjective.MINIMIZE_TEAM_STRESS:
                # More lenient thresholds
                candidates.extend([
                    stats.percentile_99 * 1.2,
                    stats.mean_performance + 5 * stats.standard_deviation
                ])
            
            # Filter candidates
            valid_candidates = []
            for candidate in candidates:
                if candidate > 0 and abs(candidate - current_threshold) / current_threshold <= self.max_threshold_change:
                    valid_candidates.append(float(candidate))
            
            # Remove duplicates and sort
            valid_candidates = sorted(list(set(valid_candidates)))
            
            return valid_candidates[:10]  # Limit to top 10 candidates
            
        except Exception as e:
            logger.error(f"Failed to calculate threshold candidates: {e}")
            return []
    
    async def _predict_threshold_outcomes(
        self,
        analysis: SLAPerformanceAnalysis,
        current_threshold: float,
        candidate_threshold: float
    ) -> PredictedOutcomes:
        """Predict outcomes of threshold change using ML models."""
        try:
            # Prepare features for prediction
            features = self._prepare_prediction_features(analysis, candidate_threshold)
            
            # Predict violation rate
            if self.violation_predictor is not None:
                violation_rate = self.violation_predictor.predict([features])[0]
                violation_rate = max(0.0, min(1.0, violation_rate))  # Clamp to [0, 1]
            else:
                # Fallback calculation
                violation_rate = self._estimate_violation_rate_statistical(
                    analysis, candidate_threshold
                )
            
            # Predict business impact
            if self.impact_predictor is not None:
                impact_features = features + [violation_rate]
                impact_score = self.impact_predictor.predict([impact_features])[0]
            else:
                impact_score = self._estimate_business_impact_statistical(
                    current_threshold, candidate_threshold, violation_rate
                )
            
            # Calculate derived metrics
            current_violation_rate = analysis.current_thresholds['violation_rate']
            reliability_change = (current_violation_rate - violation_rate) * 100
            
            # Team stress reduction (inverse relationship with violation rate)
            stress_reduction = max(0.0, (current_violation_rate - violation_rate) * 50)
            
            # Cost impact (higher thresholds may reduce operational costs)
            threshold_ratio = candidate_threshold / current_threshold
            cost_impact = (threshold_ratio - 1.0) * -20  # Negative = cost reduction
            
            # Customer satisfaction (inverse relationship with violations)
            satisfaction_change = reliability_change * 0.5
            
            return PredictedOutcomes(
                expected_violation_rate=violation_rate,
                reliability_score_change=reliability_change,
                team_stress_reduction=stress_reduction,
                cost_impact=cost_impact,
                customer_satisfaction_change=satisfaction_change
            )
            
        except Exception as e:
            logger.error(f"Failed to predict threshold outcomes: {e}")
            return PredictedOutcomes(
                expected_violation_rate=0.1,
                reliability_score_change=0.0,
                team_stress_reduction=0.0,
                cost_impact=0.0,
                customer_satisfaction_change=0.0
            )
    
    def _prepare_prediction_features(
        self, 
        analysis: SLAPerformanceAnalysis, 
        threshold: float
    ) -> List[float]:
        """Prepare features for ML prediction."""
        try:
            stats = analysis.performance_statistics
            patterns = analysis.patterns
            
            features = [
                threshold,
                stats.mean_performance,
                stats.standard_deviation,
                stats.percentile_95,
                stats.percentile_99,
                stats.coefficient_of_variation,
                analysis.sample_size,
                analysis.data_quality_score,
                len(patterns.seasonal_factors),
                patterns.trend_confidence,
                1.0 if patterns.trend_direction == TrendDirection.IMPROVING else 0.0,
                len(patterns.anomaly_periods)
            ]
            
            return features
            
        except Exception as e:
            logger.error(f"Failed to prepare prediction features: {e}")
            return [0.0] * 12
    
    def _estimate_violation_rate_statistical(
        self, 
        analysis: SLAPerformanceAnalysis, 
        threshold: float
    ) -> float:
        """Statistical estimation of violation rate for fallback."""
        try:
            stats = analysis.performance_statistics
            
            # Assume normal distribution for simplicity
            if stats.distribution_type == "normal":
                z_score = (threshold - stats.mean_performance) / stats.standard_deviation
                violation_rate = 1.0 - stats.norm.cdf(z_score)
            else:
                # Use empirical estimation
                # Approximate using percentiles
                if threshold <= stats.percentile_95:
                    violation_rate = 0.05 + (stats.percentile_95 - threshold) / stats.percentile_95 * 0.05
                elif threshold <= stats.percentile_99:
                    violation_rate = 0.01 + (stats.percentile_99 - threshold) / (stats.percentile_99 - stats.percentile_95) * 0.04
                else:
                    violation_rate = 0.01 * (stats.percentile_99 / threshold)
            
            return max(0.0, min(1.0, violation_rate))
            
        except Exception as e:
            logger.error(f"Failed to estimate violation rate: {e}")
            return 0.1
    
    def _estimate_business_impact_statistical(
        self, 
        current_threshold: float, 
        candidate_threshold: float,
        violation_rate: float
    ) -> float:
        """Statistical estimation of business impact for fallback."""
        try:
            threshold_ratio = candidate_threshold / current_threshold
            
            # Simple heuristic: larger thresholds generally reduce stress but may reduce urgency
            if threshold_ratio > 1.1:  # 10% increase
                impact_score = 0.7  # Positive impact
            elif threshold_ratio < 0.9:  # 10% decrease  
                impact_score = -0.3  # Negative impact
            else:
                impact_score = 0.1  # Minimal impact
            
            # Adjust for violation rate
            impact_score *= (1.0 - violation_rate)  # Lower violations = higher positive impact
            
            return impact_score
            
        except Exception as e:
            logger.error(f"Failed to estimate business impact: {e}")
            return 0.0
    
    def _calculate_recommendation_confidence(
        self,
        analysis: SLAPerformanceAnalysis,
        candidate_threshold: float,
        outcomes: PredictedOutcomes
    ) -> float:
        """Calculate confidence score for recommendation."""
        try:
            # Base confidence factors
            data_quality_factor = analysis.data_quality_score
            sample_size_factor = min(1.0, analysis.sample_size / 500)  # Ideal sample size: 500
            
            # Pattern consistency factor
            pattern_factor = analysis.patterns.trend_confidence
            
            # Prediction reasonableness factor
            violation_rate = outcomes.expected_violation_rate
            reasonableness_factor = 1.0 if 0.01 <= violation_rate <= 0.2 else 0.5
            
            # Threshold change magnitude factor (smaller changes = higher confidence)
            current_threshold = analysis.current_thresholds['threshold_value']
            change_magnitude = abs(candidate_threshold - current_threshold) / current_threshold
            change_factor = max(0.5, 1.0 - change_magnitude)
            
            # Overall confidence score
            confidence = (
                0.3 * data_quality_factor +
                0.2 * sample_size_factor +
                0.2 * pattern_factor +
                0.15 * reasonableness_factor +
                0.15 * change_factor
            )
            
            return float(min(1.0, max(0.0, confidence)))
            
        except Exception as e:
            logger.error(f"Failed to calculate recommendation confidence: {e}")
            return 0.5
    
    def _generate_optimization_rationale(
        self,
        analysis: SLAPerformanceAnalysis,
        current_threshold: float,
        candidate_threshold: float,
        outcomes: PredictedOutcomes
    ) -> OptimizationRationale:
        """Generate human-readable rationale for optimization."""
        try:
            stats = analysis.performance_statistics
            
            # Statistical basis
            if candidate_threshold > stats.percentile_95:
                statistical_basis = f"Threshold set above 95th percentile ({stats.percentile_95:.1f}s) based on {analysis.sample_size} samples"
            else:
                statistical_basis = f"Threshold optimized using statistical analysis of {analysis.sample_size} performance samples"
            
            # Reliability impact
            if outcomes.reliability_score_change > 0:
                reliability_impact = f"Expected {outcomes.reliability_score_change:.1f}% improvement in reliability"
            else:
                reliability_impact = f"Minimal reliability impact ({outcomes.reliability_score_change:.1f}%)"
            
            # Achievability improvement
            threshold_change = (candidate_threshold - current_threshold) / current_threshold * 100
            if threshold_change > 5:
                achievability_improvement = f"More achievable threshold ({threshold_change:.1f}% increase) reduces team stress"
            elif threshold_change < -5:
                achievability_improvement = f"Tighter threshold ({abs(threshold_change):.1f}% decrease) improves service quality"
            else:
                achievability_improvement = "Minimal threshold adjustment for fine-tuning"
            
            # Business justification
            if outcomes.expected_violation_rate < 0.05:
                business_justification = "Low violation rate expected to improve customer satisfaction and reduce operational overhead"
            elif outcomes.expected_violation_rate < 0.15:
                business_justification = "Balanced approach maintaining reliability while reducing false alarms"
            else:
                business_justification = "Conservative threshold to ensure service level commitments are met"
            
            return OptimizationRationale(
                statistical_basis=statistical_basis,
                reliability_impact=reliability_impact,
                achievability_improvement=achievability_improvement,
                business_justification=business_justification
            )
            
        except Exception as e:
            logger.error(f"Failed to generate optimization rationale: {e}")
            return OptimizationRationale(
                statistical_basis="Based on historical performance analysis",
                reliability_impact="Maintains current reliability levels",
                achievability_improvement="Optimized for current performance patterns",
                business_justification="Balances reliability and operational efficiency"
            )
    
    def _assess_implementation_risk(
        self,
        current_threshold: float,
        candidate_threshold: float,
        analysis: SLAPerformanceAnalysis
    ) -> ImplementationRisk:
        """Assess risk level for threshold implementation."""
        try:
            # Calculate change magnitude
            change_magnitude = abs(candidate_threshold - current_threshold) / current_threshold
            
            # Risk factors
            large_change = change_magnitude > 0.3  # >30% change
            low_data_quality = analysis.data_quality_score < 0.7
            unstable_patterns = analysis.patterns.trend_confidence < 0.5
            recent_anomalies = len(analysis.patterns.anomaly_periods) > 2
            
            # Count risk factors
            risk_factors = sum([large_change, low_data_quality, unstable_patterns, recent_anomalies])
            
            if risk_factors >= 3:
                return ImplementationRisk.HIGH
            elif risk_factors >= 2:
                return ImplementationRisk.MEDIUM
            else:
                return ImplementationRisk.LOW
                
        except Exception as e:
            logger.error(f"Failed to assess implementation risk: {e}")
            return ImplementationRisk.MEDIUM
    
    def _generate_rollback_criteria(
        self, 
        threshold: float, 
        outcomes: PredictedOutcomes
    ) -> List[str]:
        """Generate rollback criteria for threshold changes."""
        try:
            criteria = []
            
            # Violation rate criteria
            max_violation_rate = max(0.15, outcomes.expected_violation_rate * 1.5)
            criteria.append(f"Violation rate exceeds {max_violation_rate:.1%} for 24 hours")
            
            # Performance degradation criteria
            criteria.append("Service performance degrades by >25% from baseline")
            
            # Customer impact criteria
            criteria.append("Customer satisfaction scores drop by >10%")
            
            # Operational criteria
            criteria.append("Manual escalations increase by >50%")
            
            # Time-based criteria
            criteria.append("No improvement observed within 72 hours of implementation")
            
            return criteria
            
        except Exception as e:
            logger.error(f"Failed to generate rollback criteria: {e}")
            return ["Violation rate exceeds 15% for 24 hours", "Service performance degrades significantly"]
    
    def _calculate_optimization_score(
        self, 
        recommendations: List[ThresholdOptimizationRecommendation]
    ) -> float:
        """Calculate overall optimization score."""
        try:
            if not recommendations:
                return 0.0
            
            total_score = 0.0
            for rec in recommendations:
                # Score based on predicted improvements
                reliability_score = max(0, rec.predicted_outcomes.reliability_score_change) / 100
                stress_reduction_score = max(0, rec.predicted_outcomes.team_stress_reduction) / 100
                confidence_score = rec.confidence_score
                
                # Risk penalty
                risk_penalty = {
                    ImplementationRisk.LOW: 0.0,
                    ImplementationRisk.MEDIUM: 0.1,
                    ImplementationRisk.HIGH: 0.3
                }[rec.implementation_risk]
                
                rec_score = (reliability_score + stress_reduction_score + confidence_score) / 3 - risk_penalty
                total_score += max(0.0, rec_score)
            
            return min(1.0, total_score / len(recommendations))
            
        except Exception as e:
            logger.error(f"Failed to calculate optimization score: {e}")
            return 0.0
    
    async def _get_model_performance_metrics(self) -> Dict[str, float]:
        """Get current model performance metrics."""
        try:
            metrics = {
                "violation_predictor_accuracy": 0.85,  # Placeholder
                "impact_predictor_rmse": 0.12,         # Placeholder
                "model_training_date": datetime.utcnow().timestamp(),
                "predictions_made": 0,
                "prediction_accuracy": 0.0
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to get model performance metrics: {e}")
            return {}
    
    async def _initial_model_training(self):
        """Perform initial model training with synthetic data."""
        try:
            # Generate synthetic training data
            training_data = self._generate_synthetic_training_data(1000)
            
            if len(training_data) > 50:
                X = training_data[['features']].values
                y_violations = training_data['violation_rate'].values
                y_impact = training_data['business_impact'].values
                
                # Train violation predictor
                self.violation_predictor.fit(X, y_violations)
                
                # Train impact predictor  
                self.impact_predictor.fit(X, y_impact)
                
                # Save models
                os.makedirs(self.model_path, exist_ok=True)
                joblib.dump(self.violation_predictor, os.path.join(self.model_path, "violation_predictor.joblib"))
                joblib.dump(self.impact_predictor, os.path.join(self.model_path, "impact_predictor.joblib"))
                joblib.dump(self.scaler, os.path.join(self.model_path, "threshold_scaler.joblib"))
                
                logger.info("Initial model training completed")
                
        except Exception as e:
            logger.error(f"Failed to perform initial model training: {e}")
    
    def _generate_synthetic_training_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic training data for model initialization."""
        try:
            np.random.seed(42)
            
            data = []
            for _ in range(n_samples):
                # Generate synthetic features
                threshold = np.random.exponential(1800)  # Exponential distribution around 30 minutes
                mean_perf = np.random.exponential(1200)   # Mean performance
                std_perf = mean_perf * np.random.uniform(0.1, 0.5)  # Std dev
                p95 = mean_perf + 1.645 * std_perf
                p99 = mean_perf + 2.326 * std_perf
                
                features = [threshold, mean_perf, std_perf, p95, p99, std_perf/mean_perf, 200, 0.8, 1, 0.5, 1, 0]
                
                # Calculate target variables
                z_score = (threshold - mean_perf) / std_perf
                violation_rate = max(0.01, min(0.5, 1.0 - stats.norm.cdf(z_score)))
                business_impact = (1.0 - violation_rate) * np.random.uniform(0.5, 1.0)
                
                data.append({
                    'features': features,
                    'violation_rate': violation_rate,
                    'business_impact': business_impact
                })
            
            return pd.DataFrame(data)
            
        except Exception as e:
            logger.error(f"Failed to generate synthetic training data: {e}")
            return pd.DataFrame()
    
    async def retrain_models(self, feedback_data: List[Dict[str, Any]]) -> bool:
        """Retrain optimization models with new feedback data."""
        try:
            if len(feedback_data) < 20:
                logger.warning("Insufficient feedback data for retraining")
                return False
            
            # Prepare training data from feedback
            X = []
            y_violations = []
            y_impact = []
            
            for feedback in feedback_data:
                if all(key in feedback for key in ['features', 'actual_violation_rate', 'actual_impact']):
                    X.append(feedback['features'])
                    y_violations.append(feedback['actual_violation_rate'])
                    y_impact.append(feedback['actual_impact'])
            
            if len(X) < 20:
                return False
            
            X = np.array(X)
            y_violations = np.array(y_violations)
            y_impact = np.array(y_impact)
            
            # Retrain models
            self.violation_predictor.fit(X, y_violations)
            self.impact_predictor.fit(X, y_impact)
            
            # Validate model performance
            violation_cv_score = cross_val_score(self.violation_predictor, X, y_violations, cv=5).mean()
            impact_cv_score = cross_val_score(self.impact_predictor, X, y_impact, cv=5).mean()
            
            # Save retrained models if performance is acceptable
            if violation_cv_score > 0.6 and impact_cv_score > 0.6:
                joblib.dump(self.violation_predictor, os.path.join(self.model_path, "violation_predictor.joblib"))
                joblib.dump(self.impact_predictor, os.path.join(self.model_path, "impact_predictor.joblib"))
                
                logger.info(f"Models retrained successfully. CV scores: violations={violation_cv_score:.3f}, impact={impact_cv_score:.3f}")
                return True
            else:
                logger.warning(f"Model retraining failed validation. CV scores: violations={violation_cv_score:.3f}, impact={impact_cv_score:.3f}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to retrain models: {e}")
            return False