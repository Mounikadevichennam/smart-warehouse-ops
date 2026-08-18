import React from 'react';
import { Check } from 'lucide-react';

const STAGES = [
  { key: 'PICKED', label: 'Picked' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'QC_PASSED', label: 'QC Passed' },
  { key: 'DISPATCHED', label: 'Dispatched' },
];

const STAGE_ORDER = {
  CREATED: 0,
  DELIVERY_PLANNED: 0,
  PRIORITY_DETERMINED: 0,
  INVENTORY_CHECKED: 0,
  ALLOCATED: 0,
  PICKING_IN_PROGRESS: 0.5,
  PICKED: 1,
  PACKING_IN_PROGRESS: 1.5,
  PACKED: 2,
  QC_IN_PROGRESS: 2.5,
  QC_PASSED: 3,
  DISPATCH_IN_PROGRESS: 3.5,
  DISPATCHED: 4,
  EXCEPTION_PAUSED: -1,
  CANCELLED: -2,
};

export const PipelineVisualizer = ({ status, orderNumber }) => {
  const currentStep = STAGE_ORDER[status] ?? 0;
  const isPaused = status === 'EXCEPTION_PAUSED';
  const isCancelled = status === 'CANCELLED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
        <span style={{ color: '#fff' }}>Order {orderNumber}</span>
        {isPaused && <span style={{ color: '#ef4444' }}>PAUSED (Exception)</span>}
        {isCancelled && <span style={{ color: '#64748b' }}>CANCELLED</span>}
      </div>

      <div className="pipeline-container">
        {STAGES.map((stage, idx) => {
          const stepValue = idx + 1;
          const isCompleted = currentStep >= stepValue;
          const isActive = currentStep > stepValue - 1 && currentStep < stepValue;

          return (
            <React.Fragment key={stage.key}>
              <div className={`pipeline-step ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                <div className="pipeline-step-dot">
                  {isCompleted ? <Check size={12} /> : idx + 1}
                </div>
                <span>{stage.label}</span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`pipeline-line ${currentStep >= stepValue + 1 ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
