import React from 'react';

interface FiszkaFeedbackProps {
  feedback: string | null;
  isVisible: boolean;
  onClose?: () => void;
}

const FiszkaFeedback: React.FC<FiszkaFeedbackProps> = ({ feedback, isVisible, onClose }) => {
  if (!isVisible || !feedback) return null;

  const [score, message] = feedback.split(';');
  const isCorrect = score === '1';

  return (
    <div className="fiszka-feedback">
      <div className="feedback-status">
        {isCorrect ? 'Poprawnie' : 'Niepoprawnie'}
      </div>
      <div className="feedback-message">
        {message || ''}
      </div>
      {onClose && (
        <button onClick={onClose} className="przycisk feedback-close">
          X
        </button>
      )}
    </div>
  );
};

export default FiszkaFeedback;
