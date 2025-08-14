"""Add SLA optimization tables for Story 3.5

Revision ID: 006_sla_optimization_tables
Revises: 005_analytics_performance_tables
Create Date: 2025-01-13 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_sla_optimization_tables'
down_revision = '005_analytics_performance_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create SLA optimization tables."""
    
    # SLA Threshold History table
    op.create_table(
        'sla_threshold_history',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Threshold details
        sa.Column('service_type', sa.String(100), nullable=False, index=True),
        sa.Column('threshold_value', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('threshold_unit', sa.String(20), default='seconds', nullable=False),
        sa.Column('previous_value', sa.DECIMAL(10, 2), nullable=True),
        
        # Optimization details
        sa.Column('optimization_reason', sa.Text, nullable=True),
        sa.Column('optimization_confidence', sa.DECIMAL(5, 4), nullable=True),  # 0-1 confidence score
        sa.Column('business_justification', sa.Text, nullable=True),
        
        # Implementation tracking
        sa.Column('implemented_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('implemented_by', sa.String(100), nullable=True),
        sa.Column('rollback_criteria', sa.JSON(), nullable=True),
        sa.Column('performance_impact', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False)
    )
    
    # Performance Analysis Cache table
    op.create_table(
        'sla_performance_analysis',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Analysis details
        sa.Column('service_type', sa.String(100), nullable=False, index=True),
        sa.Column('analysis_period_days', sa.Integer, default=30, nullable=False),
        sa.Column('analysis_timestamp', sa.DateTime(timezone=True), nullable=False),
        
        # Performance statistics (JSON for flexibility)
        sa.Column('performance_statistics', sa.JSON(), nullable=False),
        sa.Column('trend_analysis', sa.JSON(), nullable=True),
        sa.Column('baseline_performance', sa.JSON(), nullable=True),
        
        # Data quality metrics
        sa.Column('data_quality_score', sa.DECIMAL(3, 2), nullable=True),  # 0-1 quality score
        sa.Column('sample_size', sa.Integer, nullable=True),
        sa.Column('confidence_level', sa.DECIMAL(3, 2), default=0.95, nullable=False)
    )
    
    # Threshold Optimization Experiments (A/B tests) table
    op.create_table(
        'sla_optimization_experiments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Experiment configuration
        sa.Column('experiment_name', sa.String(200), nullable=False),
        sa.Column('service_type', sa.String(100), nullable=False, index=True),
        sa.Column('control_threshold', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('test_threshold', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('hypothesis', sa.Text, nullable=True),
        sa.Column('expected_improvement', sa.DECIMAL(5, 2), nullable=True),  # Expected improvement percentage
        
        # Experiment timing
        sa.Column('experiment_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('experiment_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_days', sa.Integer, default=14, nullable=False),
        sa.Column('traffic_split', sa.DECIMAL(3, 2), default=0.5, nullable=False),  # 50% split
        sa.Column('significance_level', sa.DECIMAL(3, 2), default=0.05, nullable=False),  # 95% confidence
        
        # Results
        sa.Column('results', sa.JSON(), nullable=True),
        sa.Column('statistical_significance', sa.Boolean, nullable=True),
        sa.Column('p_value', sa.DECIMAL(10, 8), nullable=True),
        sa.Column('effect_size', sa.DECIMAL(10, 4), nullable=True),
        sa.Column('confidence_interval', sa.JSON(), nullable=True),
        
        # Status and control
        sa.Column('status', sa.String(20), default='planning', nullable=False),  # planning, running, completed, stopped
        sa.Column('early_stop_reason', sa.Text, nullable=True),
        sa.Column('recommendation', sa.String(20), nullable=True),  # adopt, reject, extend
        sa.Column('rollback_triggered', sa.Boolean, default=False, nullable=False)
    )
    
    # ML Model Performance Tracking table
    op.create_table(
        'sla_ml_model_performance',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Model details
        sa.Column('model_type', sa.String(50), nullable=False, index=True),  # threshold_optimizer, impact_predictor
        sa.Column('model_version', sa.String(20), nullable=False),
        sa.Column('training_timestamp', sa.DateTime(timezone=True), nullable=False),
        
        # Performance metrics
        sa.Column('accuracy_score', sa.DECIMAL(5, 4), nullable=True),
        sa.Column('precision_score', sa.DECIMAL(5, 4), nullable=True),
        sa.Column('recall_score', sa.DECIMAL(5, 4), nullable=True),
        sa.Column('f1_score', sa.DECIMAL(5, 4), nullable=True),
        sa.Column('mse', sa.DECIMAL(10, 6), nullable=True),  # Mean Squared Error for regression
        sa.Column('mae', sa.DECIMAL(10, 6), nullable=True),  # Mean Absolute Error
        
        # Training details
        sa.Column('training_data_size', sa.Integer, nullable=True),
        sa.Column('validation_data_size', sa.Integer, nullable=True),
        sa.Column('feature_count', sa.Integer, nullable=True),
        sa.Column('hyperparameters', sa.JSON(), nullable=True),
        sa.Column('cross_validation_scores', sa.JSON(), nullable=True),
        
        # Model artifacts
        sa.Column('model_path', sa.String(500), nullable=True),  # Path to saved model file
        sa.Column('feature_importance', sa.JSON(), nullable=True),
        
        sa.Column('is_active', sa.Boolean, default=True, nullable=False)
    )
    
    # Threshold Change Impact Predictions table
    op.create_table(
        'sla_threshold_impact_predictions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Threshold change details
        sa.Column('service_type', sa.String(100), nullable=False, index=True),
        sa.Column('current_threshold', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('proposed_threshold', sa.DECIMAL(10, 2), nullable=False),
        
        # Predictions
        sa.Column('predicted_violation_rate_change', sa.DECIMAL(5, 2), nullable=True),  # Percentage change
        sa.Column('predicted_reliability_impact', sa.DECIMAL(5, 2), nullable=True),
        sa.Column('predicted_team_stress_change', sa.DECIMAL(5, 2), nullable=True),
        sa.Column('confidence_score', sa.DECIMAL(3, 2), nullable=True),  # Model confidence 0-1
        
        # Risk assessment
        sa.Column('implementation_risk', sa.String(20), nullable=True),  # low, medium, high
        sa.Column('risk_factors', sa.JSON(), nullable=True),
        sa.Column('mitigation_strategies', sa.JSON(), nullable=True),
        
        # Actual outcomes (filled after implementation)
        sa.Column('actual_violation_rate_change', sa.DECIMAL(5, 2), nullable=True),
        sa.Column('actual_reliability_impact', sa.DECIMAL(5, 2), nullable=True),
        sa.Column('prediction_accuracy', sa.DECIMAL(5, 4), nullable=True),
        
        # Implementation tracking
        sa.Column('implemented_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=True)
    )
    
    # Create indexes for performance
    op.create_index(
        'idx_sla_threshold_service_time',
        'sla_threshold_history',
        ['service_type', 'created_at']
    )
    op.create_index(
        'idx_sla_analysis_service_time',
        'sla_performance_analysis',
        ['service_type', 'analysis_timestamp']
    )
    op.create_index(
        'idx_sla_experiments_service_status',
        'sla_optimization_experiments',
        ['service_type', 'status']
    )
    op.create_index(
        'idx_sla_model_type_version',
        'sla_ml_model_performance',
        ['model_type', 'model_version']
    )
    op.create_index(
        'idx_sla_predictions_service',
        'sla_threshold_impact_predictions',
        ['service_type', 'created_at']
    )
    
    # Add SLA optimization columns to existing SLA configurations table if it exists
    try:
        op.add_column('sla_configurations', sa.Column('optimization_enabled', sa.Boolean, default=True, nullable=False))
        op.add_column('sla_configurations', sa.Column('auto_adjust', sa.Boolean, default=False, nullable=False))
        op.add_column('sla_configurations', sa.Column('min_threshold', sa.DECIMAL(10, 2), nullable=True))
        op.add_column('sla_configurations', sa.Column('max_threshold', sa.DECIMAL(10, 2), nullable=True))
        op.add_column('sla_configurations', sa.Column('optimization_frequency', sa.String(20), default='weekly', nullable=False))
        op.add_column('sla_configurations', sa.Column('last_optimization_at', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        # If sla_configurations table doesn't exist, create a minimal version
        op.create_table(
            'sla_configurations',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            
            # Basic SLA configuration
            sa.Column('service_type', sa.String(100), nullable=False, unique=True, index=True),
            sa.Column('threshold_value', sa.DECIMAL(10, 2), nullable=False),
            sa.Column('threshold_unit', sa.String(20), default='seconds', nullable=False),
            sa.Column('violation_threshold', sa.DECIMAL(3, 2), default=0.05, nullable=False),  # 5% violation threshold
            
            # Optimization settings
            sa.Column('optimization_enabled', sa.Boolean, default=True, nullable=False),
            sa.Column('auto_adjust', sa.Boolean, default=False, nullable=False),
            sa.Column('min_threshold', sa.DECIMAL(10, 2), nullable=True),
            sa.Column('max_threshold', sa.DECIMAL(10, 2), nullable=True),
            sa.Column('optimization_frequency', sa.String(20), default='weekly', nullable=False),
            sa.Column('last_optimization_at', sa.DateTime(timezone=True), nullable=True),
            
            # Status
            sa.Column('is_active', sa.Boolean, default=True, nullable=False)
        )


def downgrade() -> None:
    """Drop SLA optimization tables."""
    
    # Drop indexes
    op.drop_index('idx_sla_predictions_service', 'sla_threshold_impact_predictions')
    op.drop_index('idx_sla_model_type_version', 'sla_ml_model_performance')
    op.drop_index('idx_sla_experiments_service_status', 'sla_optimization_experiments')
    op.drop_index('idx_sla_analysis_service_time', 'sla_performance_analysis')
    op.drop_index('idx_sla_threshold_service_time', 'sla_threshold_history')
    
    # Drop tables
    op.drop_table('sla_threshold_impact_predictions')
    op.drop_table('sla_ml_model_performance')
    op.drop_table('sla_optimization_experiments')
    op.drop_table('sla_performance_analysis')
    op.drop_table('sla_threshold_history')
    
    # Remove columns from sla_configurations if they exist
    try:
        op.drop_column('sla_configurations', 'last_optimization_at')
        op.drop_column('sla_configurations', 'optimization_frequency')
        op.drop_column('sla_configurations', 'max_threshold')
        op.drop_column('sla_configurations', 'min_threshold')
        op.drop_column('sla_configurations', 'auto_adjust')
        op.drop_column('sla_configurations', 'optimization_enabled')
    except Exception:
        # If we created the table, drop it entirely
        try:
            op.drop_table('sla_configurations')
        except Exception:
            pass