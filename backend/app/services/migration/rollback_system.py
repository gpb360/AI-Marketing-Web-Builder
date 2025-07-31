"""
Rollback System for Template Migration
Provides comprehensive rollback capabilities and error recovery
"""

import json
import shutil
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime
import os
import tempfile

logger = logging.getLogger(__name__)

class RollbackPoint:
    """Represents a rollback point in the migration process"""
    
    def __init__(self, migration_id: str, step: str, data: Dict[str, Any]):
        self.migration_id = migration_id
        self.step = step
        self.timestamp = datetime.utcnow().isoformat()
        self.data = data
        self.checksum = self._calculate_checksum(data)
    
    def _calculate_checksum(self, data: Dict[str, Any]) -> str:
        """Calculate checksum for data integrity"""
        import hashlib
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()

class RollbackManager:
    """Manages rollback operations for template migration"""
    
    def __init__(self, storage_path: str = "/tmp/migration_rollback"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.rollback_points = []
        self.current_migration = None
    
    def create_rollback_point(self, migration_id: str, step: str, 
                            data: Dict[str, Any]) -> str:
        """Create a new rollback point"""
        
        rollback_point = RollbackPoint(migration_id, step, data)
        
        # Create rollback directory for this migration
        migration_dir = self.storage_path / migration_id
        migration_dir.mkdir(exist_ok=True)
        
        # Save rollback point
        rollback_file = migration_dir / f"{step}_{rollback_point.timestamp}.json"
        with open(rollback_file, 'w') as f:
            json.dump({
                'migration_id': rollback_point.migration_id,
                'step': rollback_point.step,
                'timestamp': rollback_point.timestamp,
                'data': rollback_point.data,
                'checksum': rollback_point.checksum
            }, f, indent=2)
        
        # Create backup of critical files
        self._create_file_backup(migration_id, step, data)
        
        logger.info(f"Rollback point created: {migration_id}/{step}")
        return str(rollback_file)
    
    def _create_file_backup(self, migration_id: str, step: str, data: Dict[str, Any]):
        """Create backup of critical files"""
        
        backup_dir = self.storage_path / migration_id / "backups" / step
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Backup templates if they exist
        if 'templates' in data:
            templates_backup = backup_dir / "templates"
            templates_backup.mkdir(exist_ok=True)
            
            for template_name, template_content in data['templates'].items():
                template_file = templates_backup / f"{template_name}.html"
                with open(template_file, 'w', encoding='utf-8') as f:
                    f.write(template_content)
        
        # Backup CSS files
        if 'styles' in data:
            styles_backup = backup_dir / "styles"
            styles_backup.mkdir(exist_ok=True)
            
            for style_name, style_content in data['styles'].items():
                style_file = styles_backup / f"{style_name}.css"
                with open(style_file, 'w', encoding='utf-8') as f:
                    f.write(style_content)
    
    def rollback_to_step(self, migration_id: str, step: str) -> Dict[str, Any]:
        """Rollback to a specific step"""
        
        try:
            migration_dir = self.storage_path / migration_id
            
            # Find rollback point
            rollback_files = list(migration_dir.glob(f"{step}_*.json"))
            if not rollback_files:
                raise ValueError(f"No rollback point found for step: {step}")
            
            # Get the latest rollback point for this step
            rollback_file = max(rollback_files, key=lambda x: x.stat().st_mtime)
            
            # Load rollback data
            with open(rollback_file, 'r') as f:
                rollback_data = json.load(f)
            
            # Verify checksum
            if not self._verify_checksum(rollback_data):
                raise ValueError("Rollback data integrity check failed")
            
            # Perform rollback
            restored_data = self._perform_rollback(migration_id, rollback_data)
            
            logger.info(f"Rollback completed: {migration_id} -> {step}")
            
            return {
                'success': True,
                'migration_id': migration_id,
                'step': step,
                'restored_data': restored_data,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'migration_id': migration_id,
                'step': step
            }
    
    def rollback_to_previous(self, migration_id: str) -> Dict[str, Any]:
        """Rollback to the previous step"""
        
        try:
            migration_dir = self.storage_path / migration_id
            rollback_files = list(migration_dir.glob("*.json"))
            
            if len(rollback_files) < 2:
                raise ValueError("No previous rollback point available")
            
            # Sort by timestamp (descending)
            rollback_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # Get the second latest (previous step)
            previous_file = rollback_files[1]
            
            # Extract step name from filename
            step_name = previous_file.stem.split('_')[0]
            
            return self.rollback_to_step(migration_id, step_name)
            
        except Exception as e:
            logger.error(f"Rollback to previous failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'migration_id': migration_id
            }
    
    def complete_rollback(self, migration_id: str) -> Dict[str, Any]:
        """Complete rollback to initial state"""
        
        try:
            migration_dir = self.storage_path / migration_id
            
            # Find initial rollback point
            initial_files = list(migration_dir.glob("initial_*.json"))
            if not initial_files:
                raise ValueError("No initial rollback point found")
            
            initial_file = max(initial_files, key=lambda x: x.stat().st_mtime)
            
            with open(initial_file, 'r') as f:
                initial_data = json.load(f)
            
            # Verify checksum
            if not self._verify_checksum(initial_data):
                raise ValueError("Initial data integrity check failed")
            
            # Perform complete rollback
            restored_data = self._perform_rollback(migration_id, initial_data)
            
            # Clean up rollback files
            self._cleanup_rollback_files(migration_id)
            
            logger.info(f"Complete rollback completed: {migration_id}")
            
            return {
                'success': True,
                'migration_id': migration_id,
                'step': 'initial',
                'restored_data': restored_data,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Complete rollback failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'migration_id': migration_id
            }
    
    def _verify_checksum(self, data: Dict[str, Any]) -> bool:
        """Verify data integrity using checksum"""
        
        try:
            stored_checksum = data.get('checksum')
            if not stored_checksum:
                return False
            
            import hashlib
            calculated_checksum = hashlib.md5(
                json.dumps(data['data'], sort_keys=True).encode()
            ).hexdigest()
            
            return stored_checksum == calculated_checksum
            
        except Exception:
            return False
    
    def _perform_rollback(self, migration_id: str, rollback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform the actual rollback operations"""
        
        restored_data = {}
        
        # Restore templates
        if 'templates' in rollback_data['data']:
            restored_data['templates'] = rollback_data['data']['templates']
        
        # Restore styles
        if 'styles' in rollback_data['data']:
            restored_data['styles'] = rollback_data['data']['styles']
        
        # Restore configuration
        if 'config' in rollback_data['data']:
            restored_data['config'] = rollback_data['data']['config']
        
        return restored_data
    
    def _cleanup_rollback_files(self, migration_id: str):
        """Clean up rollback files for a migration"""
        
        migration_dir = self.storage_path / migration_id
        if migration_dir.exists():
            shutil.rmtree(migration_dir)
    
    def get_rollback_history(self, migration_id: str) -> List[Dict[str, Any]]:
        """Get rollback history for a migration"""
        
        try:
            migration_dir = self.storage_path / migration_id
            rollback_files = list(migration_dir.glob("*.json"))
            
            history = []
            for file in rollback_files:
                with open(file, 'r') as f:
                    data = json.load(f)
                    history.append({
                        'step': data['step'],
                        'timestamp': data['timestamp'],
                        'migration_id': data['migration_id']
                    })
            
            return sorted(history, key=lambda x: x['timestamp'])
            
        except Exception as e:
            logger.error(f"Failed to get rollback history: {e}")
            return []
    
    def get_migration_status(self, migration_id: str) -> Dict[str, Any]:
        """Get current migration status including rollback points"""
        
        try:
            history = self.get_rollback_history(migration_id)
            
            if not history:
                return {
                    'migration_id': migration_id,
                    'status': 'no_data',
                    'rollback_points': 0,
                    'current_step': None,
                    'can_rollback': False
                }
            
            current_step = history[-1]['step']
            
            return {
                'migration_id': migration_id,
                'status': 'active',
                'rollback_points': len(history),
                'current_step': current_step,
                'can_rollback': len(history) > 1,
                'history': history
            }
            
        except Exception as e:
            logger.error(f"Failed to get migration status: {e}")
            return {
                'migration_id': migration_id,
                'status': 'error',
                'error': str(e)
            }
    
    def schedule_cleanup(self, max_age_days: int = 7):
        """Schedule cleanup of old rollback files"""
        
        try:
            cutoff_date = datetime.utcnow().timestamp() - (max_age_days * 24 * 60 * 60)
            
            for migration_dir in self.storage_path.iterdir():
                if migration_dir.is_dir():
                    # Check if directory is older than cutoff
                    dir_mtime = migration_dir.stat().st_mtime
                    if dir_mtime < cutoff_date:
                        shutil.rmtree(migration_dir)
                        logger.info(f"Cleaned up old rollback data: {migration_dir.name}")
                        
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
    
    def export_rollback_data(self, migration_id: str, export_path: str) -> bool:
        """Export rollback data for backup"""
        
        try:
            migration_dir = self.storage_path / migration_id
            if not migration_dir.exists():
                return False
            
            export_file = Path(export_path) / f"rollback_{migration_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.zip"
            export_file.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.make_archive(
                str(export_file.with_suffix('')),
                'zip',
                str(migration_dir)
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return False

class ErrorRecovery:
    """Handles error recovery during migration"""
    
    def __init__(self):
        self.error_log = []
        self.recovery_strategies = {
            'network_error': self._handle_network_error,
            'parsing_error': self._handle_parsing_error,
            'validation_error': self._handle_validation_error,
            'storage_error': self._handle_storage_error
        }
    
    def log_error(self, error_type: str, error_details: Dict[str, Any]):
        """Log error for recovery analysis"""
        
        error_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'type': error_type,
            'details': error_details,
            'recovery_attempted': False,
            'recovery_successful': False
        }
        
        self.error_log.append(error_record)
        logger.error(f"Migration error: {error_type} - {error_details}")
    
    def recover_from_error(self, error_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Attempt to recover from a specific error"""
        
        if error_type in self.recovery_strategies:
            return self.recovery_strategies[error_type](context)
        
        return {
            'success': False,
            'error': f"No recovery strategy for error type: {error_type}",
            'fallback_action': 'manual_intervention_required'
        }
    
    def _handle_network_error(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle network-related errors"""
        
        return {
            'success': True,
            'action': 'retry_with_backoff',
            'retry_count': 3,
            'backoff_multiplier': 2,
            'fallback_action': 'skip_resource'
        }
    
    def _handle_parsing_error(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle content parsing errors"""
        
        return {
            'success': True,
            'action': 'use_fallback_parser',
            'fallback_parser': 'html5lib',
            'preserve_content': True,
            'mark_as_review_required': True
        }
    
    def _handle_validation_error(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle data validation errors"""
        
        return {
            'success': True,
            'action': 'apply_fixes',
            'auto_fixes': [
                'remove_invalid_characters',
                'normalize_urls',
                'validate_html_structure'
            ],
            'fallback_action': 'manual_review'
        }
    
    def _handle_storage_error(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle storage-related errors"""
        
        return {
            'success': True,
            'action': 'switch_storage',
            'fallback_storage': '/tmp/emergency_backup',
            'preserve_data': True,
            'notify_admin': True
        }
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get summary of all errors and recovery attempts"""
        
        if not self.error_log:
            return {
                'total_errors': 0,
                'recovery_rate': 100,
                'error_types': {},
                'recommendations': ['No errors found']
            }
        
        error_types = {}
        for error in self.error_log:
            error_type = error['type']
            error_types[error_type] = error_types.get(error_type, 0) + 1
        
        recovered_count = sum(1 for e in self.error_log if e['recovery_successful'])
        recovery_rate = (recovered_count / len(self.error_log)) * 100
        
        return {
            'total_errors': len(self.error_log),
            'recovery_rate': recovery_rate,
            'error_types': error_types,
            'recommendations': [
                f"Review {error_types.get('validation_error', 0)} validation errors",
                f"Check network configuration for {error_types.get('network_error', 0)} network errors",
                f"Review storage capacity for {error_types.get('storage_error', 0)} storage errors"
            ]
        }